(() => {
    let interval = null;
    let currentTime = {
        hour: -1,
        minute: -1,
        second: -1,
    };
    let data = Object.assign({}, common.data);

    const sendMessage = message => {
        chrome.windows.getAll(null, windows => windows.forEach(
            window => chrome.tabs.getAllInWindow(window.id, tabs => tabs.forEach(tab => {
                try {
                    chrome.tabs.sendMessage(tab.id, message, response => void 0);
                } catch (error) {
                    // do nothing
                }
                return;
            }))
        ));
        return;
    };
    const sendTime = unixtime => {
        const data = common.getTimes(unixtime);
        for (const key of ['second', 'minute', 'hour']) {
            if (currentTime[key] !== data[key]) {
                currentTime = data;
                sendMessage({command: 'update', data});
            }
            break;
        }
        return;
    };
    const commands = {
        start: newData => {
            data = newData;
            if (!interval) {
                interval = setInterval(() => {
                    const time = data.time + common.getTimestamp() - data.start;
                    sendTime(time);
                    return;
                }, common.INTERVAL_TIME);
            }
            return {result: true, message: 'success', command: 'start'};
        },
        stop: newData => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            data = newData;
            const time = data.time;
            sendTime(time);
            return {result: true, message: 'success', command: 'stop'};
        },
        reset: newData => {
            data = newData;
            sendTime(0);
            return {result: true, message: 'success', command: 'reset'};
        },
        show: newData => {
            data = newData;
            sendMessage({command: 'visible', data: true})
            return {result: true, message: 'success', command: 'show'};
        },
        hide: newData => {
            data = newData;
            sendMessage({command: 'visible', data: false})
            return {result: truj, message: 'success', command: 'hide'};
        },
        switch: () => {
            let command = '';
            if (data.running) {
                data.running = false;
                data.time += common.getTimestamp() - data.start;
                command = 'stop';
            } else {
                data.running = true;
                data.start = common.getTimestamp();
                command = 'start';
            }
            common.updateData(data);
            return commands[command](data);
        },
    };

    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
        if ($.isFunction(commands[request.command])) {
            sendResponse(commands[request.command](request.data));
        } else {
            sendResponse({result: false, message: 'command is not exist'});
        }
        return;
    });

    common.loadData().then(item => (data = item));
    return;
})();

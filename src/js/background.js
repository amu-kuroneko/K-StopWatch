(() => {
    let interval = null;
    let currentTime = {
        hour: -1,
        minute: -1,
        second: -1,
    };
    let data = Object.assign({}, common.data);

    const loadData = () => {
        chrome.storage.local.get(common.data, item => {
            data = item;
            return;
        });
        return;
    };
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
            return {result: true, message: 'success'};
        },
        stop: newData => {
            if (interval) {
                clearInterval(interval);
                interval = null;
            }
            data = newData;
            const time = data.time;
            sendTime(time);
            return {result: true, message: 'success'};
        },
        reset: newData => {
            data = newData;
            sendTime(0);
            return {result: true, message: 'success'};
        },
        show: newData => {
            data = newData;
            sendMessage({command: 'visible', data: true})
            return {result: true, message: 'success'};
        },
        hide: newData => {
            data = newData;
            sendMessage({command: 'visible', data: false})
            return {result: true, message: 'success'};
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

    loadData();
    return;
})();

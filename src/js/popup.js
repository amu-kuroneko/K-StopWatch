$(() => {
    let data = Object.assign({}, common.data);
    let interval;
    let currentTime = {
        hour: -1,
        minute: -1,
        second: -1,
    };

    const $times = {
        hour: {
            left: $('#left-hour'),
            right: $('#right-hour'),
        },
        minute: {
            left: $('#left-minute'),
            right: $('#right-minute'),
        },
        second: {
            left: $('#left-second'),
            right: $('#right-second'),
        },
    };

    const loadData = callback => {
        chrome.storage.local.get(common.data, item => {
            data = item;
            if ($.isFunction(callback)) {
                callback(item);
            }
            return;
        });
        return;
    };
    const updateData = callback => {
        chrome.storage.local.set(data, callback);
        return;
    };
    const sendMessage = message => {
        chrome.runtime.sendMessage(message, response => console.log(response));
        return;
    };
    const startCounter = () => {
        if (!interval) {
            interval = setInterval(() => {
                const time = data.time + common.getTimestamp() - data.start;
                updateTime(time);
                return;
            }, common.INTERVAL_TIME);
        }
        return;
    };
    const stopCounter = () => {
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        return;
    };
    const commands = {
        start: () => {
            if (!data.running) {
                data.running = true;
                data.start = common.getTimestamp();
                updateData();
            }
            startCounter();
            return;
        },
        stop: () => {
            if (data.running) {
                data.running = false;
                data.time += common.getTimestamp() - data.start;
                updateData();
            }
            stopCounter();
            return;
        },
        reset: () => {
            data.time = 0;
            data.start = common.getTimestamp();
            updateData();
            updateTime(0);
            return;
        },
        show: () => {
            data.visible = true;
            updateData();
            return;
        },
        hide: () => {
            data.visible = false;
            updateData();
            return;
        },
    };
    const execute = command => {
        if ($.isFunction(commands[command])) {
            commands[command]();
            sendMessage({data, command});
        }
        return;
    };
    const updateTime = unixtime => {
        const time = common.getTimes(unixtime);
        for (const key of ['second', 'minute', 'hour']) {
            if (currentTime[key] !== time[key]) {
                currentTime = time;
                $times.hour.left.text(parseInt(time.hour / 10));
                $times.hour.right.text(parseInt(time.hour % 10));
                $times.minute.left.text(parseInt(time.minute / 10));
                $times.minute.right.text(parseInt(time.minute % 10));
                $times.second.left.text(parseInt(time.second / 10));
                $times.second.right.text(parseInt(time.second % 10));
            }
            break;
        }
        return;
    };

    $('[name=visible]').on('change', function () {
        execute(parseInt($(this).val()) ? 'show' : 'hide');
        return;
    });
    $('.command').on('click', function () {
        execute($(this).attr('id'));
        return;
    });

    loadData(item => {
        $(`#${item.visible ? 'show' : 'hide'}`).prop('checked', true);
        updateTime(item.time);
        if (item.running) {
            startCounter();
        }
        return;
    });
    return;
});

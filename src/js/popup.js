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
    const $lapArea = $('#lap-area');
    const $temporaryTime = $('#temporary-time');
    const $commands = {
        start: $('#start'),
        stop: $('#stop'),
        reset: $('#reset'),
        copy: $('#copy'),
        show: $('#show'),
        hide: $('#hide'),
    };

    const startCounter = () => {
        $commands.start.text('ラップ');
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
        $commands.start.text('開始');
        if (interval) {
            clearInterval(interval);
            interval = null;
        }
        return;
    };
    /**
     * Functions for each commands.
     * @return Return true if send message to background, false otherwise.
     */
    const commands = {
        start: () => {
            if (data.running) {
                data.laps.push(data.time + common.getTimestamp() - data.start);
                updateLaps(data.laps);
            } else {
                data.running = true;
                data.start = common.getTimestamp();
            }
            common.updateData(data);
            startCounter();
            return true;
        },
        stop: () => {
            if (data.running) {
                data.running = false;
                data.time += common.getTimestamp() - data.start;
                common.updateData(data);
            }
            stopCounter();
            return true;
        },
        reset: () => {
            data.time = 0;
            data.start = common.getTimestamp();
            data.laps = [];
            common.updateData(data);
            updateTime(0);
            updateLaps(data.laps);
            return true;
        },
        copy: () => {
            const unixtime = data.running ? data.time + common.getTimestamp() - data.start : data.time;
            const time = common.getTimes(unixtime);
            for (const key in time) {
                if (time[key] < 10) {
                    time[key] = '0' + time[key];
                }
            }
            $temporaryTime.val(`${time.hour}:${time.minute}:${time.second}`);
            $temporaryTime.select();
            try {
                if (!document.execCommand('copy')) {
                    alert('Faild to copy.');
                }
            } catch (error) {
                alert('Faild to copy.');
            }
            return false;
        },
        show: () => {
            data.visible = true;
            common.updateData(data);
            return true;
        },
        hide: () => {
            data.visible = false;
            common.updateData(data);
            return true;
        },
    };
    const execute = command => {
        if ($.isFunction(commands[command]) && commands[command]()) {
            common.sendMessage({data, command})
                .catch(error => console.log(error.toString()));
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
    const updateLaps = laps => {
        $lapArea.empty();
        let previous = 0;
        for (const index in laps) {
            const $row = $('<div>').addClass('lap-row');
            $row.append(`<div class='lap-title'>ラップ${parseInt(index) + 1}</div>`);
            const $lapTime = $('<div>').addClass('lap-time');
            const time = common.getTimes(laps[index] - previous);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.hour / 10)}</span>`);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.hour % 10)}</span>`);
            $lapTime.append(`<span class='lap-time-area'>:</span>`);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.minute / 10)}</span>`);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.minute % 10)}</span>`);
            $lapTime.append(`<span class='lap-time-area'>:</span>`);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.second / 10)}</span>`);
            $lapTime.append(`<span class='lap-time-area lap-number'>${parseInt(time.second % 10)}</span>`);
            $row.append($lapTime);
            $lapArea.prepend($row);
            previous = laps[index];
        }
        return;
    }

    $('[name=visible]').on('change', function () {
        execute(parseInt($(this).val()) ? 'show' : 'hide');
        return;
    });
    $('.command:not(.disabled)').on('click', function () {
        execute($(this).attr('id'));
        return;
    });

    common.loadData().then(item => {
        data = item;
        $(`#${item.visible ? 'show' : 'hide'}`).prop('checked', true);
        updateTime(item.time);
        updateLaps(item.laps);
        if (item.running) {
            startCounter();
        }
        return;
    });
    return;
});

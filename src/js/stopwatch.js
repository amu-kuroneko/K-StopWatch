$(() => {
    $('body').prepend((() => {
        /*
        <div id='k-stopwatch'>
            <div id='k-stopwatch-times' >
                <span id='k-stopwatch-left-hour' class='k-stopwatch-time-area' >0</span>
                <span id='k-stopwatch-right-hour' class='k-stopwatch-time-area' >0</span>
                <span class='k-stopwatch-time-area'>:</span>
                <span id='k-stopwatch-left-minute' class='k-stopwatch-time-area' >0</span>
                <span id='k-stopwatch-right-minute' class='k-stopwatch-time-area' >0</span>
                <span class='k-stopwatch-time-area'>:</span>
                <span id='k-stopwatch-left-second' class='k-stopwatch-time-area' >0</span>
                <span id='k-stopwatch-right-second' class='k-stopwatch-time-area' >0</span>
            </div>
        </div>
        */
    }).toString().split('*')[1]);

    const CONTENT_MERGIN = 30;
    const $times = {
        hour: {
            left: $('#k-stopwatch-left-hour'),
            right: $('#k-stopwatch-right-hour'),
        },
        minute: {
            left: $('#k-stopwatch-left-minute'),
            right: $('#k-stopwatch-right-minute'),
        },
        second: {
            left: $('#k-stopwatch-left-second'),
            right: $('#k-stopwatch-right-second'),
        },
    };
    const $wrapper = $('#k-stopwatch');
    const $window = $(window);

    let position = {top: 0, left: 0};
    let dragging;
    let windowSize = {width: $window.width(), height: $window.height()};
    let contentSize = {width: $wrapper.width(), height: $wrapper.height()};
    let maximums = {
        top: windowSize.height - CONTENT_MERGIN,
        left: windowSize.width - CONTENT_MERGIN,
    };
    let minimums = {
        top: CONTENT_MERGIN - contentSize.height,
        left: CONTENT_MERGIN - contentSize.width,
    };

    const updateTime = time => {
        $times.hour.left.text(parseInt(time.hour / 10));
        $times.hour.right.text(parseInt(time.hour % 10));
        $times.minute.left.text(parseInt(time.minute / 10));
        $times.minute.right.text(parseInt(time.minute % 10));
        $times.second.left.text(parseInt(time.second / 10));
        $times.second.right.text(parseInt(time.second % 10));
        return;
    };
    const commands = {
        update: time => {
            updateTime(time);
            return;
        },
        visible: isVisible => {
            $wrapper[isVisible ? 'show' : 'hide']();
            return;
        },
    };
    const getPosition = (moveX, moveY, isCheck) => {
        let top = moveY - dragging.y + position.top;
        let left = moveX - dragging.x + position.left;
        if (isCheck) {
            if (top < minimums.top) {
                top = minimums.top;
            } else if (maximums.top < top) {
                top = maximums.top;
            }
            if (left < minimums.left) {
                left = minimums.left;
            } else if (maximums.left < left) {
                left = maximums.left;
            }
        }
        return {top, left};
    };

    $('#k-stopwatch').on('mousedown', event => {
        dragging = {x: event.screenX, y: event.screenY};
        return;
    });
    $('html, body').on('mousemove', event => {
        if (dragging) {
            position = getPosition(event.screenX, event.screenY, false);
            dragging = {x: event.screenX, y: event.screenY};
            $wrapper.css(position);
            event.preventDefault();
        }
        return;
    }).on('mouseup', event => {
        if (dragging) {
            position = getPosition(event.screenX, event.screenY, true);
            dragging = null;
            $wrapper.css(position);
            event.preventDefault();
        }
        return;
    });
    $window.on('load resize', () => {
        windowSize = {width: $window.width(), height: $window.height()};
        maximums = {
            top: windowSize.height - CONTENT_MERGIN,
            left: windowSize.width - CONTENT_MERGIN,
        };
        return;
    });
    chrome.extension.onMessage.addListener((request, sender, sendResponse) => {
        if ($.isFunction(commands[request.command])) {
            sendResponse(commands[request.command](request.data));
        } else {
            sendResponse({result: false, message: 'command is not exist'});
        }
        return;
    });
    chrome.storage.local.get(common.data, item => {
        updateTime(common.getTimes(item.time));
        $wrapper[item.visible ? 'show' : 'hide']();
        return;
    });
    return;
});

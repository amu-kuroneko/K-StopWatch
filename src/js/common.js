const common = {
    INTERVAL_TIME: 100,
    data: {
        visible: false,
        running: false,
        time: 0,
        start: 0,
        laps: [],
    },
    getTimestamp: () => new Date().getTime(),
    getTimes: unixtime => {
        let second = parseInt(unixtime / 1000);
        const hour = parseInt(second / 3600);
        if (99 < hour) {
            return {hour: 99, minute: 99, second: 99};
        }
        second %= 3600;
        const minute = parseInt(second / 60);
        second %= 60;
        return {hour, minute, second};
    },
};

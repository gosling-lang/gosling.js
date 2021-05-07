const LOG_KEY_TO_TIME: { [k: string]: Date } = {};

function recordTime(key: string) {
    LOG_KEY_TO_TIME[key] = new Date();
}

function printTime(key: string) {
    if (LOG_KEY_TO_TIME[key]) {
        console.warn(`[LOG] key: ${key}, duration: ${new Date().getTime() - LOG_KEY_TO_TIME[key].getTime()} ms`);
    } else {
        console.warn(`[LOG] key: ${key}, no time recorded`);
    }
}

const Logging = {
    recordTime,
    printTime
};

export default Logging;

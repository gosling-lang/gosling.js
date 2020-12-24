/**
 * Repeat elements in the array until its size becomes to `targetLength`.
 */
export function arrayRepeat(base: Array<any>, targetLength: number) {
    if (base.length === targetLength) return base;
    else if (base.length > targetLength) return base.slice(0, targetLength);
    else {
        const repeated = Array.from(base);
        do {
            repeated.push(...Array.from(base));
        } while (repeated.length < targetLength);
        return repeated.slice(0, targetLength);
    }
}

/**
 * Insert item to an array and return it.
 * @prop {array} array Array to be updated.
 * @prop {number} index Index of array to insert new item.
 * @prop {any} item Item to be inserted.
 * @returns Updated array.
 */
export function insertItemToArray(array: any[], index: number, item: any) {
    if (!array) array = [];
    return [...array.slice(0, index), item, ...array.slice(index)];
}

/**
 * Insert item to an array and return it.
 * @prop {array} array Array to be updated.
 * @prop {number} index Index of array to change item.
 * @prop {any} item Item to be inserted.
 * @returns Updated array.
 */
export function modifyItemInArray(array: any[], index: number, item: any) {
    return [...array.slice(0, index), item, ...array.slice(index + 1)];
}

/**
 * Remove item from an array stored in a certain index.
 * @prop {array} array Array to be updated.
 * @prop {number} index Index of an item to be removed.
 * @returns Updated array.
 */
export function removeItemFromArray(array: any[], index: number) {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

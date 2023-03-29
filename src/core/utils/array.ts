/**
 * Repeat elements in the array until its size becomes to `targetLength`.
 */
export function arrayRepeat<T>(base: T[], targetLength: number): T[] {
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
 * @param array Array to be updated.
 * @param index Index of array to insert new item.
 * @param item Item to be inserted.
 * @returns Updated array.
 */
export function insertItemToArray<T>(array: T[], index: number, item: T): T[] {
    return [...array.slice(0, index), item, ...array.slice(index)];
}

/**
 * Insert item to an array and return it.
 * @param array Array to be updated.
 * @param index Index of array to change item.
 * @param item Item to be inserted.
 * @returns Updated array.
 */
export function modifyItemInArray<T>(array: T[], index: number, item: T): T[] {
    return [...array.slice(0, index), item, ...array.slice(index + 1)];
}

/**
 * Remove item from an array stored in a certain index.
 * @param array Array to be updated.
 * @param index Index of an item to be removed.
 * @returns Updated array.
 */
export function removeItemFromArray<T>(array: T[], index: number): T[] {
    return [...array.slice(0, index), ...array.slice(index + 1)];
}

/**
 * Convert 1D array into 2D array where each pair of elements are grouped.
 * @param array Array to be used.
 * @returns Updated array.
 */
export function flatArrayToPairArray<T>(array: T[]): [T, T][] {
    const output: [T, T][] = [];
    for (let i = 0; i < array.length; i += 2) {
        output.push([array[i], array[i + 1]]);
    }
    return output;
}

/**
 * Check if all elements in an array satisfy a type guard.
 * @param array Array to check
 * @param is Type guard to check each element
 */
export function isEvery<T, Arr extends any[]>(array: any[], is: (x: Arr[number]) => x is T): array is T[] {
    return array.every(is);
}

/** Check if all elements in an array are numbers. */
export function isNumberArray(array: any[]): array is number[] {
    return isEvery(array, (x): x is number => typeof x === 'number');
}

/** Check if all elements in an array are strings. */
export function isStringArray(array: any[]): array is string[] {
    return isEvery(array, (x): x is string => typeof x === 'string');
}

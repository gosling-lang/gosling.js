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

/**
 * Make an assertion.
 *
 * Usage
 * @example
 * ```ts
 * const value: boolean = Math.random() <= 0.5;
 * assert(value, "value is greater than than 0.5!");
 * value // true
 * ```
 *
 * @copyright Trevor Manz 2025
 * @license MIT
 * @see {@link https://github.com/manzt/manzt/blob/f7faee/utils/assert.js}
 */
export function assert(expression: unknown, msg: string | undefined = ''): asserts expression {
    if (!expression) throw new Error(msg);
}

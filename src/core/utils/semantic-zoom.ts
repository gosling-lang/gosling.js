import type { LogicalOperation } from '@gosling-lang/gosling-schema';

export function getMaxZoomLevel() {
    // TODO: How to correctly calculate maxZoomLevel?
    const TILE_SIZE = 256;
    const totalLength = 4795370;
    return Math.ceil(Math.log(totalLength / TILE_SIZE) / Math.log(2));
}

/**
 * Perform logical operation between a target and a reference value.
 * If the condition is `true`, return `1`.
 */
export function logicalComparison(
    value: number,
    op: LogicalOperation,
    ref: number,
    transitionPadding?: number
): number {
    const padding = transitionPadding && transitionPadding !== 0 ? transitionPadding : undefined;
    let alpha = 0;
    switch (op) {
        case 'less-than':
        case 'LT':
        case 'lt':
            alpha = ref > value ? (padding ? (ref - value) / padding : 1) : 0;
            break;
        case 'less-than-or-equal-to':
        case 'LTET':
        case 'ltet':
            alpha = ref >= value ? (padding ? (ref - value) / padding : 1) : 0;
            break;
        case 'greater-than':
        case 'GT':
        case 'gt':
            alpha = ref < value ? (padding ? (value - ref) / padding : 1) : 0;
            break;
        case 'greater-than-or-equal-to':
        case 'GTET':
        case 'gtet':
            alpha = ref <= value ? (padding ? (value - ref) / padding : 1) : 0;
            break;
    }

    // make sure to return a value in [0, 1]
    return Math.max(Math.min(1, alpha), 0);
}

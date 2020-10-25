export type PIXIVisualProperty =
    /* common visual properties */
    | 'color' // color of visual marks to fill
    | 'stroke' // stroke color of visual marks
    | 'strokeWidth' // stroke width of visual marks
    | 'opacity' // transparent level of visual marks
    | 'x' // naive x value encoded
    | 'x1' // naive x1 value encoded
    | 'xe' // naive xe value encoded
    | 'y' // naive y value encoded
    | 'size' // size of visual marks, such as radius of points
    | 'text' // text annotations
    /* mark-specific visual properties */
    | 'x-center' // center x position of visual marks
    | 'y-center' // center y position of visual marks
    | 'x-start' // start x position of visual marks
    | 'height' // actual height of visual marks
    | 'width'; // actual width of visual marks

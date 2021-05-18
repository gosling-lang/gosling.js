export type PIXIVisualProperty =
    /* common visual properties */
    | 'color' // color of visual marks to fill
    | 'row' // row position of visual marks
    | 'stroke' // stroke color of visual marks
    | 'strokeWidth' // stroke width of visual marks
    | 'opacity' // transparent level of visual marks
    | 'x' // naive x value encoded
    | 'xe' // naive xe value encoded
    | 'x1' // naive x1 value encoded
    | 'x1e' // naive x1e value encoded
    | 'y' // naive y value encoded
    | 'size' // size of visual marks, such as radius of points
    | 'text' // text annotations
    /* mark-specific visual properties */
    | 'x-center' // center x position of visual marks
    | 'y-center' // center y position of visual marks
    | 'p-size' // radius of point marks
    | 'x-start' // start x position of visual marks
    | 'height' // actual height of visual marks
    | 'width'; // actual width of visual marks

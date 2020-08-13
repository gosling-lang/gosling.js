/*
 * Construct our own d3 object, with only the functions that we are using.
 * This should reduce the size of the final javascript bundle file.
 * See https://github.com/d3/d3/issues/3076
 */

import { scaleLinear, scaleOrdinal } from 'd3-scale';
import { schemeCategory10 } from 'd3-scale-chromatic';
import { min, max, extent } from 'd3-array';

export default {
    scaleLinear,
    scaleOrdinal,
    schemeCategory10,
    min,
    max,
    extent
}
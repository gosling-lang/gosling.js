import * as PIXI from 'pixi.js';
import { color } from 'd3-color';
import { DEFAULT_BACKUP_COLOR } from '../../compiler/defaults';

/**
 * Convert a regular color value (e.g. 'red', '#FF0000', 'rgb(255,0,0)') to a hex value which is legible by PIXI.
 */
const colorToHex = (colorStr: string) => {
    let c = color(colorStr) as any;

    if (!c) {
        c = color(DEFAULT_BACKUP_COLOR) as any;
    }

    const hex = PIXI.utils.rgb2hex([c.rgb().r / 255.0, c.rgb().g / 255.0, c.rgb().b / 255.0]);
    return hex;
};

export default colorToHex;

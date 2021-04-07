import { Datum } from '../core/gosling.schema';

export const TOOLTIP_MOUSEOVER_MARGIN = 1;

export type Tooltip = {
    datum: Datum;
    isMouseOver: (x: number, y: number) => boolean;
    markInfo: {
        x: number;
        y: number;
        width: number;
        height: number;
        type: 'rect' | 'point'; // ...
    };
};

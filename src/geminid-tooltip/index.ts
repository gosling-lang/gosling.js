import { Datum } from '../core/geminid.schema';

export type Tooltip = {
    datum: Datum;
    isMouseOver: (x: number, y: number) => boolean;
};

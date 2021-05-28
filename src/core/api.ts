import { Datum } from './gosling.schema';

export type EVENT_TYPE = 'mouseover';
// ...

export type CommonEventData = {
    data: Datum;
    genomicPosition: string;
};
export type MouseHoverCallback = (data: CommonEventData) => any;

export interface UserDefinedEvents {
    mouseover?: MouseHoverCallback;
}

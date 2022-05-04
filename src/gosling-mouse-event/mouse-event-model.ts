import { Datum } from '../core/gosling.schema';
import { isPointInPolygon, isPointNearLine, isPointNearPoint } from './polygon';

type MouseEventData = PointEventData | LineEventData | PolygonEventData;

interface CommonEventData {
    value: Datum;
}

interface PointEventData extends CommonEventData {
    type: 'point';
    polygon: [number, number, number]; // [x, y, radius]
}

interface LineEventData extends CommonEventData {
    type: 'line';
    polygon: number[]; // [x1, y1, x2, y2, ...]
}

interface PolygonEventData extends CommonEventData {
    type: 'polygon';
    polygon: number[]; // [x1, y1, x2, y2, ...]
}

/**
 * A model to manage mouse events.
 */
export class MouseEventModel {
    // main data that this model manage
    private data: MouseEventData[];

    constructor() {
        this.data = [];
    }

    /**
     * Access the number of mouse events stored.
     */
    public size() {
        return this.data.length;
    }

    /**
     * Add a new mouse event at the end.
     */
    public add(eventData: MouseEventData) {
        this.data.push(eventData);
    }

    /**
     * Add a new mouse event that is polygon-based.
     */
    public addPolygonBasedEvent(value: Datum, polygon: number[]) {
        this.data.push({ type: 'polygon', value, polygon });
    }

    /**
     * Add a new mouse event that is point-based.
     */
    public addPointBasedEvent(value: Datum, pointAndRadius: [number, number, number]) {
        this.data.push({ type: 'point', value, polygon: pointAndRadius });
    }

    /**
     * Add a new mouse event that is line-based.
     */
    public addLineBasedEvent(value: Datum, path: number[]) {
        this.data.push({ type: 'line', value, polygon: path });
    }

    /**
     * Make the data array empty.
     */
    public clear() {
        this.data = [];
    }

    /**
     * Find the first event data that is within the mouse position.
     */
    public find(x: number, y: number, reverse = false) {
        const _ = Array.from(this.data);
        if (reverse) _.reverse();
        return _.find(d => this.isMouseWithin(d, x, y));
    }

    /**
     * Find all event data that is within the mouse position.
     */
    public findAll(x: number, y: number, reverse = false) {
        const _ = Array.from(this.data);
        if (reverse) _.reverse();
        return _.filter(d => this.isMouseWithin(d, x, y));
    }

    /**
     * Test if a mouse position is within a given object.
     */
    public isMouseWithin(data: MouseEventData, x: number, y: number) {
        switch (data.type) {
            case 'point':
                return isPointNearPoint([x, y], data.polygon);
            case 'line':
                return isPointNearLine([x, y], data.polygon);
            case 'polygon':
            default:
                return isPointInPolygon([x, y], data.polygon);
        }
    }
}

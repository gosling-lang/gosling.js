import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import colorToHex from '../utils/color-to-hex';

export function drawCircularOutlines(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* circular parameters */
    const trackInnerRadius = spec._innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec._outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec._startAngle ?? 0;
    const endAngle = spec._endAngle ?? 360;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    const posStartInner = cartesianToPolar(0, trackWidth, trackInnerRadius, cx, cy, startAngle, endAngle);
    const startRad = valueToRadian(0, trackWidth, startAngle, endAngle);
    const endRad = valueToRadian(trackWidth, trackWidth, startAngle, endAngle);

    /* render */
    const g = tile.graphics;

    if (spec.style?.outlineWidth !== 0 && !(spec.layout === 'circular' && spec.mark === 'link')) {
        // circular link marks usually use entire inner space
        g.lineStyle(
            spec.style?.outlineWidth ? spec.style?.outlineWidth / 2.5 : 0,
            colorToHex(spec.style?.outline ?? '#DBDBDB'),
            1, // 0.4, // alpha
            1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex('lightgray'), 0.05);
        g.moveTo(posStartInner.x, posStartInner.y);
        g.arc(cx, cy, trackInnerRadius, startRad, endRad, true);
        g.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
        g.closePath();
    }

    if (IsChannelDeep(spec.x) && spec.x.axis === 'top') {
        // outer line
        g.lineStyle(
            0.5,
            colorToHex('black'),
            0, // 1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        g.beginFill(colorToHex('white'), 0);
        g.moveTo(posStartInner.x, posStartInner.y);
        g.arc(cx, cy, trackOuterRadius - 0.5, startRad, endRad, true);
        g.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
        g.closePath();
    }

    // inner line
    // graphics.lineStyle(
    //     0.5,
    //     colorToHex('black'),
    //     1, // alpha
    //     0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    // );
    // graphics.beginFill(colorToHex('white'), 0);
    // graphics.moveTo(xToPos(0, innerRadius - 0.5).x, xToPos(0, innerRadius - 0.5).y);
    // graphics.arc(cx, cy, innerRadius - 0.5, xToDt(0), xToDt(trackWidth), true);
    // graphics.arc(cx, cy, innerRadius, xToDt(trackWidth), xToDt(0), false);
    // graphics.closePath();

    // slice on the top
    g.lineStyle(
        0.5,
        colorToHex('black'),
        0, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    g.beginFill(colorToHex('white'), 0);
    g.moveTo(cx, cy);
    g.arc(cx, cy, trackOuterRadius + 3, startRad, endRad, false);
    g.closePath();

    // center white hole
    g.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    g.beginFill(colorToHex('white'), 0);
    g.drawCircle(cx, cy, trackInnerRadius - 1);
}

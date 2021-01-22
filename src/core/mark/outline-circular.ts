import { GoslingTrackModel } from '../gosling-track-model';
import { IsChannelDeep } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';

export function drawCircularOutlines(HGC: any, trackInfo: any, tile: any, tm: GoslingTrackModel) {
    /* track spec */
    const spec = tm.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;

    /* circular parameters */
    const trackInnerRadius = spec.innerRadius ?? 220; // TODO: should default values be filled already
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    const posStartInner = cartesianToPolar(0, trackWidth, trackInnerRadius, cx, cy, startAngle, endAngle);
    const startRad = valueToRadian(0, trackWidth, startAngle, endAngle);
    const endRad = valueToRadian(trackWidth, trackWidth, startAngle, endAngle);

    /* render */
    const graphics = tile.graphics;

    graphics.lineStyle(
        1,
        colorToHex(spec.style?.outline ?? '#DBDBDB'),
        0, // 0.4, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(posStartInner.x, posStartInner.y);
    graphics.arc(cx, cy, trackInnerRadius, startRad, endRad, true);
    graphics.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
    graphics.closePath();

    if (IsChannelDeep(spec.x) && spec.x.axis === 'outer') {
        // outer line
        graphics.lineStyle(
            0.5,
            colorToHex('black'),
            0, // 1, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );
        graphics.beginFill(colorToHex('white'), 0);
        graphics.moveTo(posStartInner.x, posStartInner.y);
        graphics.arc(cx, cy, trackOuterRadius - 0.5, startRad, endRad, true);
        graphics.arc(cx, cy, trackOuterRadius, endRad, startRad, false);
        graphics.closePath();
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
    graphics.lineStyle(
        0.5,
        colorToHex('black'),
        0, // alpha
        0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.moveTo(cx, cy);
    graphics.arc(cx, cy, trackOuterRadius + 3, startRad, endRad, false);
    graphics.closePath();

    // center white hole
    graphics.lineStyle(
        1,
        colorToHex('#DBDBDB'),
        0, // alpha
        0 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
    );
    graphics.beginFill(colorToHex('white'), 0);
    graphics.drawCircle(cx, cy, trackInnerRadius - 1);
}

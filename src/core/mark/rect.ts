import { Tooltip, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../geminid-tooltip';
import { GeminidTrackModel } from '../geminid-track-model';
import { Channel, Datum } from '../geminid.schema';
import { getValueUsingChannel } from '../geminid.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';

export function drawRect(HGC: any, trackInfo: any, tile: any, model: GeminidTrackModel) {
    /* track spec */
    const spec = model.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = model.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.bins_per_dimension || trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

    /* stacking */
    const stackY = spec.stackY;

    /* genomic scale */
    const xScale = trackInfo._xScale;
    const tileUnitWidth = xScale(tileX + tileWidth / tileSize) - xScale(tileX);

    /* row separation */
    const rowCategories: string[] = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = trackHeight / rowCategories.length;

    // TODO: what if quantitative Y field is used?
    const yCategories = (model.getChannelDomainArray('y') as string[]) ?? ['___SINGLE_Y_POSITION___'];
    const cellHeight = rowHeight / yCategories.length;

    /* render */
    const g = tile.graphics;
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        // factor to multiply size unless using constant value
        // sort by size and position

        // Use this array to collect stacking history and use this to find the spot to stack
        const pixiProps: {
            xs: number;
            xe: number;
            ys: number;
            ye: number;
            color: string;
            stroke: string;
            strokeWidth: number;
            opacity: number;
            datum: Datum;
        }[] = [];

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        )
            .sort((a, b) => model.encodedPIXIProperty('x', a) - model.encodedPIXIProperty('x', b))
            .forEach(d => {
                const x = model.encodedPIXIProperty('x', d);
                const color = model.encodedPIXIProperty('color', d);
                const stroke = model.encodedPIXIProperty('stroke', d);
                const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
                const opacity = model.encodedPIXIProperty('opacity', d);
                const rectWidth = model.encodedPIXIProperty('width', d, { markWidth: tileUnitWidth });
                const rectHeight = model.encodedPIXIProperty('height', d, { markHeight: cellHeight });
                let y = model.encodedPIXIProperty('y', d) - rectHeight / 2.0;

                const alphaTransition = model.markVisibility(d, { width: rectWidth });
                const actualOpacity = Math.min(alphaTransition, opacity);

                if (actualOpacity === 0 || rectHeight === 0 || rectWidth <= 0.0001) {
                    // No need to draw invisible objects
                    return;
                }

                if (stackY) {
                    // A `stack` option is being used, so let's further transform data to find the non-overlap area.
                    const xOverlapMarks = pixiProps.filter(
                        d =>
                            (d.xs < x && x < d.xe) ||
                            (d.xs < x + rectWidth && x + rectWidth < d.xe) ||
                            (d.xs === x && d.xe === x + rectWidth) // exact match
                    );

                    let newYStart = 0; // start from the top position
                    if (xOverlapMarks.length > 0) {
                        // This means, existing visual marks are being overlapped along x-axis.
                        let xyOverlapMarks;

                        do {
                            // a naive apporach to find a spot to position the current visul mark
                            xyOverlapMarks = xOverlapMarks.filter(
                                d =>
                                    (d.ys < newYStart && newYStart < d.ye) ||
                                    (d.ys < newYStart + rectHeight && newYStart + rectHeight < d.ye) ||
                                    (d.ys === newYStart && d.ye === newYStart + rectHeight) // exact match
                            );
                            if (xyOverlapMarks.length > 0) {
                                newYStart += rectHeight;
                            }
                        } while (xyOverlapMarks.length > 0);
                        y = newYStart;
                    }

                    y = newYStart;
                }

                pixiProps.push({
                    xs: x,
                    xe: x + rectWidth,
                    ys: y,
                    ye: y + rectHeight,
                    color,
                    stroke,
                    strokeWidth,
                    opacity: actualOpacity,
                    datum: d
                });
            });

        // this is being used to stretch the height of visual marks to the entire height of a track
        const yScaleFactor = stackY ? Math.max(...pixiProps.map(d => d.ye)) / rowHeight : 1;

        pixiProps.forEach(prop => {
            const { xs, xe, ys, ye, color, stroke, strokeWidth, opacity, datum } = prop;

            // stroke
            g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                opacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                if (xe < 0 || trackWidth < xs) {
                    // do not draw overflewed visual marks
                    return;
                }

                // TODO: Does a `row` channel affect here?
                const farR = trackOuterRadius - ((rowPosition + ys / yScaleFactor) / trackHeight) * trackRingSize;
                const nearR = trackOuterRadius - ((rowPosition + ye / yScaleFactor) / trackHeight) * trackRingSize;
                const sPos = cartesianToPolar(xs, trackWidth, nearR, cx, cy, startAngle, endAngle);
                const startRad = valueToRadian(xs, trackWidth, startAngle, endAngle);
                const endRad = valueToRadian(xe, trackWidth, startAngle, endAngle);

                g.beginFill(colorToHex(color), opacity);
                g.moveTo(sPos.x, sPos.y);
                g.arc(cx, cy, nearR, startRad, endRad, true);
                g.arc(cx, cy, farR, endRad, startRad, false);
                g.closePath();
            } else {
                g.beginFill(colorToHex(color), opacity);
                g.drawRect(xs, rowPosition + ys / yScaleFactor, xe - xs, (ye - ys) / yScaleFactor);

                /* SVG data */
                trackInfo.svgData.push({ type: 'rect', xs, xe, ys, ye, color, stroke, opacity });

                /* Tooltip data */
                trackInfo.tooltips.push({
                    datum,
                    isMouseOver: (x: number, y: number) =>
                        xs - G < x && x < xe + G && rowPosition + ys - G < y && y < rowPosition + ye + G,
                    markInfo: { x: xs, y: ys + rowPosition, width: xe - xs, height: ye - ys, type: 'rect' }
                } as Tooltip);
            }
        });
    });
}

export function rectProperty(
    gm: GeminidTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        markHeight?: number;
        markWidth?: number;
    }
) {
    switch (propertyKey) {
        case 'width':
            const width =
                // (1) size
                gm.visualPropertyByChannel('xe', datum)
                    ? gm.visualPropertyByChannel('xe', datum) - gm.visualPropertyByChannel('x', datum)
                    : // (2) unit mark height
                      additionalInfo?.markWidth;
            return width === 0 ? 0.1 : width; // TODO: not sure if this is necessary for all cases. Perhaps, we can have an option.
        case 'height':
            return (
                // (1) size
                gm.visualPropertyByChannel('size', datum) ??
                // (2) unit mark height
                additionalInfo?.markHeight
            );
        default:
            return undefined;
    }
}

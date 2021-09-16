import { TooltipData, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../gosling-tooltip';
import { GoslingTrackModel } from '../gosling-track-model';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';
import colorToHex from '../utils/color-to-hex';

export function drawRect(HGC: any, trackInfo: any, tile: any, model: GoslingTrackModel) {
    /* track spec */
    const spec = model.spec();

    /* data */
    const data = model.data();

    /* track size */
    const [trackWidth, trackHeight] = trackInfo.dimensions;
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(tile.gos.zoomLevel, tile.gos.tilePos, tileSize);

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300; // TODO: should be smaller than Math.min(width, height)
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const cx = trackWidth / 2.0;
    const cy = trackHeight / 2.0;

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
    data.forEach(d => {
        const rowPosition = model.encodedPIXIProperty('row', d);
        const x = model.encodedPIXIProperty('x', d);
        const color = model.encodedPIXIProperty('color', d);
        const stroke = model.encodedPIXIProperty('stroke', d);
        const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
        const opacity = model.encodedPIXIProperty('opacity', d);
        const rectWidth = model.encodedPIXIProperty('width', d, { markWidth: tileUnitWidth });
        const rectHeight = model.encodedPIXIProperty('height', d, { markHeight: cellHeight });
        const y = model.encodedPIXIProperty('y', d); // - rectHeight / 2.0; // It is top posiiton now

        const alphaTransition = model.markVisibility(d, {
            width: rectWidth,
            zoomLevel: trackInfo._xScale.invert(trackWidth) - trackInfo._xScale.invert(0)
        });
        const actualOpacity = Math.min(alphaTransition, opacity);

        if (actualOpacity === 0 || rectHeight === 0 || rectWidth <= 0.0001) {
            // No need to draw invisible objects
            return;
        }

        const xs = x;
        const xe = x + rectWidth;
        // const ys = y;
        // const ye = y + rectHeight;
        // y = y + rectHeight / 2.0;
        const absoluteHeight = model.visualPropertyByChannel('size', d) ?? undefined; // TODO: this is making it complicated, way to simplify this?

        // stroke
        g.lineStyle(
            strokeWidth,
            colorToHex(stroke),
            actualOpacity, // alpha
            0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
        );

        if (circular) {
            if (xe < 0 || trackWidth < xs) {
                // do not draw overflewed visual marks
                return;
            }

            // TODO: Does a `row` channel affect here?
            let farR =
                trackOuterRadius - ((rowPosition + rowHeight - y - rectHeight / 2.0) / trackHeight) * trackRingSize;
            let nearR =
                trackOuterRadius - ((rowPosition + rowHeight - y + rectHeight / 2.0) / trackHeight) * trackRingSize;

            if (absoluteHeight) {
                const midR = trackOuterRadius - ((rowPosition + y) / trackHeight) * trackRingSize;
                farR = midR - absoluteHeight / 2.0;
                nearR = midR + absoluteHeight / 2.0;
            }

            const sPos = cartesianToPolar(xs, trackWidth, nearR, cx, cy, startAngle, endAngle);
            const startRad = valueToRadian(xs, trackWidth, startAngle, endAngle);
            const endRad = valueToRadian(xe, trackWidth, startAngle, endAngle);

            g.beginFill(colorToHex(color === 'none' ? 'white' : color), color === 'none' ? 0 : actualOpacity);
            g.moveTo(sPos.x, sPos.y);
            g.arc(cx, cy, nearR, startRad, endRad, true);
            g.arc(cx, cy, farR, endRad, startRad, false);
            g.closePath();
        } else {
            g.beginFill(colorToHex(color === 'none' ? 'white' : color), color === 'none' ? 0 : actualOpacity);
            g.drawRect(xs, rowPosition + rowHeight - y - rectHeight / 2.0, xe - xs, rectHeight);

            /* SVG data */
            // We do not currently plan to support SVG elements.
            // trackInfo.svgData.push({ type: 'rect', xs, xe, ys, ye, color, stroke, actualOpacity });

            /* Tooltip data */
            if (spec.tooltip) {
                trackInfo.tooltips.push({
                    datum: d,
                    isMouseOver: (mouseX: number, mouseY: number) =>
                        xs - G < mouseX &&
                        mouseX < xe + G &&
                        rowPosition + rowHeight - y - rectHeight / 2.0 - G < mouseY &&
                        mouseY < rowPosition + rowHeight - y + rectHeight / 2.0 + G,
                    markInfo: {
                        x: xs,
                        y: rowPosition + rowHeight - y - rectHeight / 2.0,
                        width: xe - xs,
                        height: rectHeight,
                        type: 'rect'
                    }
                } as TooltipData);
            }
        }
    });
}

export function rectProperty(
    gm: GoslingTrackModel,
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

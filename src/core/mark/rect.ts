import { GeminiTrackModel } from '../gemini-track-model';
import { Channel } from '../gemini.schema';
import { getValueUsingChannel } from '../gemini.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';

export function drawRect(HGC: any, trackInfo: any, tile: any, model: GeminiTrackModel) {
    /* track spec */
    const spec = model.spec();

    /* helper */
    const { colorToHex } = HGC.utils;

    /* data */
    const data = model.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];
    const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        tileSize
    );

    /* circular parameters */
    const circular = spec.circularLayout;
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

    /* constant values */
    const strokeWidth = model.encodedPIXIProperty('strokeWidth');
    const stroke = model.encodedValue('stroke');

    /* render */
    const g = tile.graphics;
    rowCategories.forEach(rowCategory => {
        const rowPosition = model.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const x = model.encodedPIXIProperty('x', d);
            const y = model.encodedPIXIProperty('y', d);
            const color = model.encodedPIXIProperty('color', d);
            const opacity = model.encodedPIXIProperty('opacity', d);
            const rectWidth = model.encodedPIXIProperty('width', d, { markWidth: tileUnitWidth });
            const rectHeight = model.encodedPIXIProperty('height', d, { markHeight: cellHeight });

            const alphaTransition = model.markVisibility(d, { width: rectWidth });
            const actualOpacity = Math.min(alphaTransition, opacity);

            if (actualOpacity === 0 || rectHeight === 0 || rectWidth <= 0.01) {
                // do not need to draw invisible objects
                return;
            }

            // stroke
            g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity, // alpha
                0.5 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                if (x + rectWidth < 0 || trackWidth < x) {
                    // do not draw overflewed visual marks
                    return;
                }

                const farR = trackOuterRadius - (rowPosition / trackHeight) * trackRingSize;
                const nearR = trackOuterRadius - ((rowPosition + rectHeight) / trackHeight) * trackRingSize;
                const sPos = cartesianToPolar(x, trackWidth, nearR, cx, cy, startAngle, endAngle);
                const startRad = valueToRadian(x, trackWidth, startAngle, endAngle);
                const endRad = valueToRadian(x + rectWidth, trackWidth, startAngle, endAngle);

                g.beginFill(colorToHex(color), actualOpacity);
                g.moveTo(sPos.x, sPos.y);
                g.arc(cx, cy, nearR, startRad, endRad, true);
                g.arc(cx, cy, farR, endRad, startRad, false);
                g.closePath();
            } else {
                g.beginFill(colorToHex(color), actualOpacity);
                g.drawRect(x, rowPosition + y - rectHeight / 2.0, rectWidth, rectHeight);
            }
        });
    });
}

export function rectProperty(
    gm: GeminiTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number },
    additionalInfo?: {
        markHeight?: number;
        markWidth?: number;
    }
) {
    switch (propertyKey) {
        case 'width':
            return (
                // (1) size
                gm.visualPropertyByChannel('xe', datum)
                    ? gm.visualPropertyByChannel('xe', datum) - gm.visualPropertyByChannel('x', datum)
                    : // (2) unit mark height
                      additionalInfo?.markWidth
            );
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

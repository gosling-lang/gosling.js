import { GoslingTrackModel } from '../gosling-track-model';
import { Channel } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import colorToHex from '../utils/color-to-hex';
import { cartesianToPolar } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';

export function drawPoint(
    HGC: any,
    trackInfo: any,
    tile: any,
    g: PIXI.Graphics,
    model: GoslingTrackModel,
    width: number,
    height: number
) {
    /* track spec */
    const spec = model.spec();

    if (!width || !height) {
        console.warn('Size of a track is not properly determined, so visual mark cannot be rendered');
        return;
    }

    /* data */
    const data = model.data();

    // console.log(model, width, height);
    /* track size */
    const trackWidth = width;
    const trackHeight = height;
    const zoomLevel =
        (model.getChannelScale('x') as any).invert(trackWidth) - (model.getChannelScale('x') as any).invert(0);
    // const tileSize = trackInfo.tilesetInfo.tile_size;
    const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
        tile.tileData.zoomLevel,
        tile.tileData.tilePos,
        trackInfo.tilesetInfo.bins_per_dimension || trackInfo.tilesetInfo.tile_size
    );
    // const { tileX, tileWidth } = trackInfo.getTilePosAndDimensions(
    //     tile.tileData.zoomLevel,
    //     tile.tileData.tilePos,
    //     tileSize
    // );

    /* circular parameters */
    const circular = spec.layout === 'circular';
    const trackInnerRadius = spec.innerRadius ?? 220;
    const trackOuterRadius = spec.outerRadius ?? 300;
    const startAngle = spec.startAngle ?? 0;
    const endAngle = spec.endAngle ?? 360;
    const trackRingSize = trackOuterRadius - trackInnerRadius;
    const tcx = trackWidth / 2.0;
    const tcy = trackHeight / 2.0;

    /* row separation */
    const rowCategories = (model.getChannelDomainArray('row') as string[]) ?? ['___SINGLE_ROW___'];
    const rowHeight = height / rowCategories.length;

    const _g = new HGC.libraries.PIXI.Graphics();

    /* render */
    rowCategories.forEach(rowCategory => {
        const rowPosition = 0; //model.encodedValue('row', rowCategory);

        data.filter(
            d =>
                !getValueUsingChannel(d, spec.row as Channel) ||
                (getValueUsingChannel(d, spec.row as Channel) as string) === rowCategory
        ).forEach(d => {
            const cx = model.encodedPIXIProperty('x-center', d);
            const cy = model.encodedPIXIProperty('y-center', d);
            const color = model.encodedPIXIProperty('color', d);
            const size = model.encodedPIXIProperty('p-size', d);
            const strokeWidth = model.encodedPIXIProperty('strokeWidth', d);
            const stroke = model.encodedPIXIProperty('stroke', d);
            const opacity = model.encodedPIXIProperty('opacity', d);

            const alphaTransition = model.markVisibility(d, { width: size, zoomLevel });
            const actualOpacity = Math.min(alphaTransition, opacity);

            // if (size <= 0.1 || actualOpacity === 0 || cx + size < 0 || cx - size > trackWidth) {
            //     // Don't draw invisible marks
            //     return;
            // }

            // stroke
            _g.lineStyle(
                strokeWidth,
                colorToHex(stroke),
                actualOpacity, // alpha
                1 // alignment of the line to draw, (0 = inner, 0.5 = middle, 1 = outter)
            );

            if (circular) {
                const r = trackOuterRadius - ((rowPosition + rowHeight - cy) / trackHeight) * trackRingSize;
                const pos = cartesianToPolar(cx, trackWidth, r, tcx, tcy, startAngle, endAngle);

                g.beginFill(colorToHex(color), actualOpacity);
                g.drawCircle(pos.x, pos.y, size);
            } else {
                _g.beginFill(colorToHex(color), actualOpacity);
                // console.log(cx, rowPosition + rowHeight - cy, size);
                _g.drawCircle(cx, rowPosition + rowHeight - cy, size);
                // _g.drawCircle(15, 15, 100);
            }
        });
    });
    const texture = HGC.services.pixiRenderer.generateTexture(_g, HGC.libraries.PIXI.SCALE_MODES.NEAREST);
    const xScale = trackInfo._xScale;
    const sprite = new HGC.libraries.PIXI.Sprite(texture);
    // console.log(xScale.range())
    sprite.width = xScale(tileX + tileWidth) - xScale(tileX);
    sprite.height = trackHeight;
    sprite.x = xScale(tileX + 1);
    sprite.y = 0;
    // console.log(sprite.x, sprite.y, sprite.width, sprite.height);
    g.addChild(sprite);
}

export function pointProperty(
    model: GoslingTrackModel,
    propertyKey: PIXIVisualProperty,
    datum?: { [k: string]: string | number }
) {
    const xe = model.visualPropertyByChannel('xe', datum);
    const x = model.visualPropertyByChannel('x', datum);
    const size = model.visualPropertyByChannel('size', datum);

    // priority of channels
    switch (propertyKey) {
        case 'x-center':
            return xe ? (xe + x) / 2.0 : x;
        case 'y-center':
            const ye = model.visualPropertyByChannel('ye', datum);
            const y = model.visualPropertyByChannel('y', datum);
            return ye ? (ye + y) / 2.0 : y;
        case 'p-size':
            return xe && model.spec().stretch ? (xe - x) / 2.0 : size;
        default:
            return undefined;
    }
}

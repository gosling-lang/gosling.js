import { Tooltip, TOOLTIP_MOUSEOVER_MARGIN as G } from '../../gosling-tooltip';
import { GoslingTrackModel } from '../gosling-track-model';
import { Channel, Datum } from '../gosling.schema';
import { getValueUsingChannel } from '../gosling.schema.guards';
import { cartesianToPolar, valueToRadian } from '../utils/polar';
import { PIXIVisualProperty } from '../visual-property.schema';
import colorToHex from '../utils/color-to-hex';

export const PILEUP_COLORS = {
    BG: [0.89, 0.89, 0.89, 1], // gray for the read background
    BG2: [0.85, 0.85, 0.85, 1], // used as alternating color in the read counter band
    BG_MUTED: [0.92, 0.92, 0.92, 1], // covergae background, when it is not exact
    A: [0, 0, 1, 1], // blue for A
    C: [1, 0, 0, 1], // red for c
    G: [0, 1, 0, 1], // green for g
    T: [1, 1, 0, 1], // yellow for T
    S: [0, 0, 0, 0.5], // darker grey for soft clipping
    H: [0, 0, 0, 0.5], // darker grey for hard clipping
    X: [0, 0, 0, 0.7], // black for unknown
    I: [1, 0, 1, 0.5], // purple for insertions
    D: [1, 0.5, 0.5, 0.5], // pink-ish for deletions
    N: [1, 1, 1, 1],
    BLACK: [0, 0, 0, 1],
    BLACK_05: [0, 0, 0, 0.5],
    PLUS_STRAND: [0.75, 0.75, 1, 1],
    MINUS_STRAND: [1, 0.75, 0.75, 1]
};

function createColorTexture(PIXI: any, colors: any) {
    const colorTexRes = Math.max(2, Math.ceil(Math.sqrt(colors.length)));
    const rgba = new Float32Array(colorTexRes ** 2 * 4);
    colors.forEach((color: any, i: number) => {
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4] = color[0]; // r
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 1] = color[1]; // g
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 2] = color[2]; // b
        // eslint-disable-next-line prefer-destructuring
        rgba[i * 4 + 3] = color[3]; // a
    });

    return [PIXI.Texture.fromBuffer(rgba, colorTexRes, colorTexRes), colorTexRes];
}

function setUpShaderAndTextures(trackInfo: any, HGC: any) {
    const colorDict = PILEUP_COLORS;

    if (trackInfo.options && trackInfo.options.colorScale) {
        [
            colorDict.A,
            colorDict.T,
            colorDict.G,
            colorDict.C,
            colorDict.N,
            colorDict.X
        ] = trackInfo.options.colorScale.map((x: any) => trackInfo.colorToArray(x));
    }

    if (trackInfo.options && trackInfo.options.plusStrandColor) {
        colorDict.PLUS_STRAND = trackInfo.colorToArray(trackInfo.options.plusStrandColor);
    }

    if (trackInfo.options && trackInfo.options.minusStrandColor) {
        colorDict.MINUS_STRAND = trackInfo.colorToArray(trackInfo.options.minusStrandColor);
    }

    const colors = Object.values(colorDict);

    const [colorMapTex, colorMapTexRes] = createColorTexture(HGC.libraries.PIXI, colors);
    const uniforms = new HGC.libraries.PIXI.UniformGroup({
        uColorMapTex: colorMapTex,
        uColorMapTexRes: colorMapTexRes
    });
    trackInfo.shader = HGC.libraries.PIXI.Shader.from(
        `
  attribute vec2 position;
  attribute float aColorIdx;
  uniform mat3 projectionMatrix;
  uniform mat3 translationMatrix;
  uniform sampler2D uColorMapTex;
  uniform float uColorMapTexRes;
  varying vec4 vColor;
  void main(void)
  {
      // Half a texel (i.e., pixel in texture coordinates)
      float eps = 0.5 / uColorMapTexRes;
      float colorRowIndex = floor((aColorIdx + eps) / uColorMapTexRes);
      vec2 colorTexIndex = vec2(
        (aColorIdx / uColorMapTexRes) - colorRowIndex + eps,
        (colorRowIndex / uColorMapTexRes) + eps
      );
      vColor = texture2D(uColorMapTex, colorTexIndex);
      gl_Position = vec4((projectionMatrix * translationMatrix * vec3(position, 1.0)).xy, 0.0, 1.0);
  }
`,
        `
varying vec4 vColor;
  void main(void) {
      gl_FragColor = vColor;
  }
`,
        uniforms
    );
}

export function drawRect(HGC: any, trackInfo: any, tile: any, model: GoslingTrackModel) {
    /* track spec */
    const spec = model.spec();

    /* data */
    const data = model.data();

    /* track size */
    const trackWidth = trackInfo.dimensions[0];
    const trackHeight = trackInfo.dimensions[1];
    const [trackX, trackY] = trackInfo.position;
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

    const textures: { [color: number]: PIXI.Texture } = {};
    const getTexture = (color: number) => {
        if (textures[color]) {
            return textures[color];
        } else {
            const g = new PIXI.Graphics();
            g.beginFill(color);
            g.drawRect(0, 0, 1, 1);
            g.endFill();
            textures[color] = HGC.services.pixiRenderer.generateTexture(g);
            return;
        }
    };

    const positions: number[] = [];
    const ixs: number[] = [];
    const colorIdx: number[] = [];

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
        let y = model.encodedPIXIProperty('y', d) - rectHeight / 2.0; // It is top posiiton now

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
        const ys = y;
        const ye = y + rectHeight;
        y = y + rectHeight / 2.0;
        const absoluteHeight = model.visualPropertyByChannel('size', d) ?? undefined; // TODO: this is making it complicated, way to simplify this?

        if (circular) {
            if (xe < 0 || trackWidth < xs) {
                // do not draw overflewed visual marks
                return;
            }

            // TODO: Does a `row` channel affect here?
            let farR = trackOuterRadius - ((rowPosition + ys) / trackHeight) * trackRingSize;
            let nearR = trackOuterRadius - ((rowPosition + ye) / trackHeight) * trackRingSize;

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
            // Stroke
            {
                // LT
                positions.push(xs-1, rowPosition + ys-1);
                const LTI = positions.length / 2.0 - 1;

                // RT
                positions.push(xe+1, rowPosition + ys-1);
                const RTI = positions.length / 2.0 - 1;

                // LB
                positions.push(xs-1, rowPosition + ye+1);
                const LBI = positions.length / 2.0 - 1;

                // RB
                positions.push(xe+1, rowPosition + ye+1);
                const RBI = positions.length / 2.0 - 1;

                ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
                colorIdx.push(5, 5, 5, 5);
            }
            
            // LT
            positions.push(xs, rowPosition + ys);
            const LTI = positions.length / 2.0 - 1;

            // RT
            positions.push(xe, rowPosition + ys);
            const RTI = positions.length / 2.0 - 1;

            // LB
            positions.push(xs, rowPosition + ye);
            const LBI = positions.length / 2.0 - 1;

            // RB
            positions.push(xe, rowPosition + ye);
            const RBI = positions.length / 2.0 - 1;

            ixs.push(LTI, RTI, LBI, LBI, RBI, RTI);
            colorIdx.push(0, 0, 0, 0);

            // const colorHex = colorToHex(color === 'none' ? 'white' : color);
            // const s = new PIXI.Sprite(getTexture(colorHex));

            // //Change the sprite's position
            // s.x = xs;
            // s.y = rowPosition + ys;

            // s.width = xe - xs;
            // s.height = (ye - ys);

            // g.addChild(s);
            // entireG.addChild(s);

            // g.beginFill(colorToHex(color === 'none' ? 'white' : color), color === 'none' ? 0 : opacity);
            // g.drawRect(xs, rowPosition + ys, xe - xs, ye - ys);

            /* SVG data */
            trackInfo.svgData.push({ type: 'rect', xs, xe, ys, ye, color, stroke, opacity });

            /* Tooltip data */
            // TODO: Store only if needed
            trackInfo.tooltips.push({
                datum: d,
                isMouseOver: (x: number, y: number) =>
                    xs - G < x && x < xe + G && rowPosition + ys - G < y && y < rowPosition + ye + G,
                markInfo: { x: xs, y: ys + rowPosition, width: xe - xs, height: ye - ys, type: 'rect' }
            } as Tooltip);
        }
    });
    // });
    
    setUpShaderAndTextures(trackInfo, HGC);
    
    trackInfo.errorTextText = null;
    trackInfo.pBorder.clear();
    trackInfo.drawError();
    trackInfo.animate();

    trackInfo.positions = new Float32Array(positions);
    trackInfo.colors = new Float32Array(colorIdx);
    trackInfo.ixs = new Int32Array(ixs);

    const newGraphics = new HGC.libraries.PIXI.Graphics();

    // trackInfo.prevRows = toRender.rows;
    // trackInfo.coverage = toRender.coverage;
    // trackInfo.coverageSamplingDistance = toRender.coverageSamplingDistance;

    const geometry = new HGC.libraries.PIXI.Geometry().addAttribute('position', trackInfo.positions, 2); // x,y
    geometry.addAttribute('aColorIdx', trackInfo.colors, 1);
    geometry.addIndex(trackInfo.ixs);

    if (trackInfo.positions.length) {
        const state = new HGC.libraries.PIXI.State();
        const mesh = new HGC.libraries.PIXI.Mesh(geometry, trackInfo.shader, state);

        newGraphics.addChild(mesh);
    }

    trackInfo.pMain.x = trackInfo.position[0];

    if (trackInfo.segmentGraphics) {
        trackInfo.pMain.removeChild(trackInfo.segmentGraphics);
    }

    trackInfo.pMain.addChild(newGraphics);
    trackInfo.segmentGraphics = newGraphics;

    // remove and add again to place on top
    trackInfo.pMain.removeChild(trackInfo.mouseOverGraphics);
    trackInfo.pMain.addChild(trackInfo.mouseOverGraphics);

    trackInfo.yScaleBands = {};
    // for (let key in trackInfo.prevRows) {
    //   trackInfo.yScaleBands[key] = HGC.libraries.d3Scale
    //     .scaleBand()
    //     .domain(
    //       HGC.libraries.d3Array.range(
    //         0,
    //         trackInfo.prevRows[key].rows.length,
    //       ),
    //     )
    //     .range([trackInfo.prevRows[key].start, trackInfo.prevRows[key].end])
    //     .paddingInner(0.2);
    // }

    trackInfo.drawnAtScale = xScale.copy();
    //  HGC.libraries.d3Scale
    //   .scaleLinear()
    //   .domain(toRender.xScaleDomain)
    //   .range(toRender.xScaleRange);

    trackInfo.scaleScalableGraphics(trackInfo.segmentGraphics, trackInfo._xScale, trackInfo.drawnAtScale);

    // if somebody zoomed vertically, we want to readjust so that
    // they're still zoomed in vertically
    // trackInfo.segmentGraphics.scale.y = trackInfo.valueScaleTransform.k;
    // trackInfo.segmentGraphics.position.y = trackInfo.valueScaleTransform.y;

    console.log('Total # of Rect', trackInfo.tooltips.length);
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

// This plugin track is based on higlass/HorizontalChromosomeLabels
// https://github.com/higlass/higlass/blob/83dc4fddb33582ef3c26b608c04a81e8f33c7f5f/app/scripts/HorizontalChromosomeLabels.js

import type * as PIXI from 'pixi.js';
import RBush from 'rbush';
import { scaleLinear } from 'd3-scale';
import { format, precisionPrefix, formatPrefix } from 'd3-format';
import { GET_CHROM_SIZES } from '../core/utils/assembly';
import { cartesianToPolar } from '../core/utils/polar';
import { getTextStyle } from '../core/utils/text-style';

const TICK_WIDTH = 200;
const TICK_HEIGHT = 6;
const TICK_TEXT_SEPARATION = 2;
const TICK_COLOR = 0x777777;

type TickLabelInfo = {
    importance: number;
    text: PIXI.Text;
    rope: PIXI.SimpleRope;
};

function AxisTrack(HGC: typeof import('@higlass/available-for-plugins'), ...args: any[]): any {
    if (!new.target) {
        throw new Error('Uncaught TypeError: Class constructor cannot be invoked without "new"');
    }

    const { absToChr, colorToHex, pixiTextToSvg, svgLine, showMousePosition } = HGC.utils;

    class AxisTrackClass extends HGC.tracks.PixiTrack {
        allTexts: TickLabelInfo[];

        constructor(params: any[]) {
            super(...params); // context, options
            const [context, options] = params;
            const { dataConfig, animate, chromInfoPath, isShowGlobalMousePosition } = context;

            this.searchField = null;
            this.chromInfo = null;
            this.dataConfig = dataConfig;

            this.allTexts = [];

            this.pTicksCircular = new HGC.libraries.PIXI.Graphics();
            this.pTicks = new HGC.libraries.PIXI.Graphics();
            this.pMain.addChild(this.pTicks);
            this.pMain.addChild(this.pTicksCircular);

            this.gTicks = {};
            this.tickTexts = {};

            this.options = options;
            this.isShowGlobalMousePosition = isShowGlobalMousePosition;

            this.textFontSize = 12;
            this.textFontFamily = 'sans-serif'; //'Arial';
            this.textFontWeight = 'normal';
            this.textFontColor = '#808080';
            this.textStrokeColor = '#ffffff';
            this.pixiTextConfig = getTextStyle({
                size: +this.options.fontSize || this.textFontSize,
                fontFamily: this.options.fontFamily || this.textFontFamily,
                fontWeight: this.options.fontWeight || this.textFontWeight,
                color: this.options.color || this.textFontColor,
                stroke: this.options.stroke || this.textStrokeColor,
                strokeThickness: 2
            });
            this.stroke = colorToHex(this.pixiTextConfig.stroke);

            // text objects to use if the tick style is "bounds", meaning
            // we only draw two ticks on the left and the right of the screen

            this.tickWidth = TICK_WIDTH;
            this.tickHeight = TICK_HEIGHT;
            this.tickTextSeparation = TICK_TEXT_SEPARATION;
            this.tickColor = this.options.tickColor ? colorToHex(this.options.tickColor) : TICK_COLOR;

            this.animate = animate;

            this.pubSubs = [];

            if (this.options.showMousePosition && !this.hideMousePosition) {
                this.hideMousePosition = showMousePosition(this, this.is2d, this.isShowGlobalMousePosition());
            }

            let chromSizesPath = chromInfoPath;

            if (!chromSizesPath) {
                chromSizesPath = `${dataConfig.server}/chrom-sizes/?id=${dataConfig.tilesetUid}`;
            }

            // Example:
            // chrPositions: {
            //     chr1: { chr: "chr1", pos: 0 },
            //     chr2: { chr: "chr2", pos: 1000 },
            // },
            // chromLengths: {
            //     chr1: 1000,
            //     chr2: 1000
            // },
            // cumPositions: [
            //     { chr: "chr1", pos: 0 },
            //     { chr: "chr2", pos: 1000 },
            // ]

            const assembly = this.options.assembly;
            type ChrPosInfo = { chr: string; pos: number };

            const chrPositions: { [k: string]: ChrPosInfo } = {};
            const chromLengths: { [k: string]: number } = { ...GET_CHROM_SIZES(assembly).size };
            const cumPositions: ChrPosInfo[] = [];

            Object.keys(GET_CHROM_SIZES(assembly).size).forEach(k => {
                chrPositions[k] = { chr: k, pos: GET_CHROM_SIZES(assembly).size[k] };
            });

            Object.keys(GET_CHROM_SIZES(assembly).interval).forEach(k => {
                cumPositions.push({ chr: k, pos: GET_CHROM_SIZES(assembly).interval[k][0] });
            });

            this.chromInfo = { chrPositions, chromLengths, cumPositions };

            this.rerender(this.options, true);
            this.draw();
            this.animate();
        }

        initBoundsTicks() {
            if (this.pTicks) {
                this.pMain.removeChild(this.pTicks);
                this.pTicks = null;
            }

            if (!this.gBoundTicks) {
                this.gBoundTicks = new HGC.libraries.PIXI.Graphics();

                this.leftBoundTick = new HGC.libraries.PIXI.Text('', this.pixiTextConfig);
                this.rightBoundTick = new HGC.libraries.PIXI.Text('', this.pixiTextConfig);

                this.gBoundTicks.addChild(this.leftBoundTick);
                this.gBoundTicks.addChild(this.rightBoundTick);

                this.pMain.addChild(this.gBoundTicks);
            }

            this.texts = [];
        }

        initChromLabels() {
            if (!this.chromInfo) return;

            if (this.gBoundTicks) {
                this.pMain.removeChild(this.gBoundTicks);
                this.gBoundTicks = null;
            }

            if (!this.pTicks) {
                this.pTicks = new HGC.libraries.PIXI.Graphics();
                this.pMain.addChild(this.pTicks);
            }

            this.texts = [];
            this.pTicks.removeChildren();

            this.chromInfo.cumPositions.forEach((info: any) => {
                const chromName = info.chr;
                this.gTicks[chromName] = new HGC.libraries.PIXI.Graphics();

                // create the array that will store tick TEXT objects
                if (!this.tickTexts[chromName]) this.tickTexts[chromName] = [];

                const text = new HGC.libraries.PIXI.Text(chromName, this.pixiTextConfig);

                // give each string a random hash so that some get hidden when there's overlaps
                // @ts-expect-error invalid property?
                text.hashValue = Math.random();

                this.pTicks.addChild(text);
                this.pTicks.addChild(this.gTicks[chromName]);

                this.texts.push(text);
            });
        }

        rerender(options: any, force: boolean) {
            const strOptions = JSON.stringify(options);

            if (!force && strOptions === this.prevOptions) return;

            this.prevOptions = strOptions;
            this.options = options;

            this.pixiTextConfig.fontSize = +this.options.fontSize
                ? `${+this.options.fontSize}px`
                : this.pixiTextConfig.fontSize;
            this.pixiTextConfig.fill = this.options.color || this.pixiTextConfig.fill;
            this.pixiTextConfig.stroke = this.options.stroke || this.pixiTextConfig.stroke;
            this.stroke = colorToHex(this.pixiTextConfig.stroke);

            this.tickColor = this.options.tickColor ? colorToHex(this.options.tickColor) : TICK_COLOR;

            if (this.options.tickPositions === 'ends' && this.options.layout !== 'circular') {
                this.initBoundsTicks();
            } else {
                this.initChromLabels();
            }

            super.rerender(options, force);

            if (this.options.showMousePosition && !this.hideMousePosition) {
                this.hideMousePosition = showMousePosition(this, this.is2d, this.isShowGlobalMousePosition());
            }

            if (!this.options.showMousePosition && this.hideMousePosition) {
                this.hideMousePosition();
                this.hideMousePosition = undefined;
            }
        }

        formatTick(pos: number) {
            if (isNaN(pos)) {
                // the value is not proper, so early return
                return 'null';
            }

            const domain = this._xScale.domain();

            const viewWidth = domain[1] - domain[0];

            const p = precisionPrefix(pos, viewWidth);

            const fPlain = format(',');
            const fPrecision = formatPrefix(`,.${p}`, viewWidth);
            let f = fPlain;

            if (this.options.tickFormat === 'si') {
                f = fPrecision;
            } else if (this.options.tickFormat === 'plain') {
                f = fPlain;
            } else if (this.options.tickPositions === 'ends') {
                // if no format is specified but tickPositions are at 'ends'
                // then use precision format
                f = fPrecision;
            }

            return f(pos);
        }

        /**
         * Show two labels at the end of both left and right sides
         * @param x1
         * @param x2
         */
        drawBoundsTicks(x1: any, x2: any) {
            const graphics = this.gBoundTicks;
            graphics.clear();
            graphics.lineStyle(1, 0);

            // determine the stard and end positions of tick lines along the vertical axis
            const lineYStart = this.options.reverseOrientation ? 0 : this.dimensions[1];
            const lineYEnd = this.options.reverseOrientation ? this.tickHeight : this.dimensions[1] - this.tickHeight;

            // left tick
            // line is offset by one because it's right on the edge of the
            // visible region and we want to get the full width
            graphics.moveTo(1, lineYStart);
            graphics.lineTo(1, lineYEnd);

            // right tick
            graphics.moveTo(this.dimensions[0] - 1, lineYStart);
            graphics.lineTo(this.dimensions[0] - 1, lineYEnd);

            // we want to control the precision of the tick labels
            // so that we don't end up with labels like 15.123131M
            this.leftBoundTick.x = 0;
            this.leftBoundTick.y = this.options.reverseOrientation
                ? lineYEnd + this.tickTextSeparation
                : lineYEnd - this.tickTextSeparation;
            this.leftBoundTick.text =
                this.options.assembly === 'unknown'
                    ? `${this.formatTick(x1[1])}`
                    : `${x1[0]}: ${this.formatTick(x1[1])}`;
            this.leftBoundTick.anchor.y = this.options.reverseOrientation ? 0 : 1;

            this.rightBoundTick.x = this.dimensions[0];
            this.rightBoundTick.text =
                this.options.assembly === 'unknown'
                    ? `${this.formatTick(x2[1])}`
                    : `${x2[0]}: ${this.formatTick(x2[1])}`;
            this.rightBoundTick.y = this.options.reverseOrientation
                ? lineYEnd + this.tickTextSeparation
                : lineYEnd - this.tickTextSeparation;
            this.rightBoundTick.anchor.y = this.options.reverseOrientation ? 0 : 1;

            this.rightBoundTick.anchor.x = 1;

            if (this.flipText) {
                // this means this track is displayed vertically, so update the anchor and scale of labels to make them readable!
                this.leftBoundTick.scale.x = -1;
                this.leftBoundTick.anchor.x = 1;
                this.rightBoundTick.scale.x = -1;
                this.rightBoundTick.anchor.x = 0;
            }

            // line is offset by one because it's right on the edge of the visible region and we want to get the full width
            this.leftBoundTick.tickLine = [1, this.dimensions[1], 1, this.dimensions[1] - this.tickHeight];
            this.rightBoundTick.tickLine = [
                this.dimensions[0] - 1,
                this.dimensions[1],
                this.dimensions[0] - 1,
                this.dimensions[1] - this.tickHeight
            ];

            this.tickTexts = {};
            this.tickTexts.all = [this.leftBoundTick, this.rightBoundTick];
            // this.rightBoundTick
        }

        drawTicks(cumPos: { chr: string; pos: number }) {
            const graphics = this.gTicks[cumPos.chr];

            graphics.visible = true;

            // clear graphics *and* ticktexts otherwise the two are out of sync!
            graphics.clear();

            const chromLen = +this.chromInfo.chromLengths[cumPos.chr];

            const vpLeft = Math.max(this._xScale(cumPos.pos), 0);
            const vpRight = Math.min(this._xScale(cumPos.pos + chromLen), this.dimensions[0]);

            const numTicks = (vpRight - vpLeft) / this.tickWidth;

            // what is the domain of this chromosome that is visible?
            const xScale = scaleLinear()
                .domain([
                    Math.max(1, this._xScale.invert(0) - cumPos.pos),
                    Math.min(chromLen, this._xScale.invert(this.dimensions[0]) - cumPos.pos)
                ])
                .range([vpLeft, vpRight]);

            // calculate a certain number of ticks
            const ticks = xScale.ticks(numTicks).filter(tick => Number.isInteger(tick));

            // not sure why we're separating these out by chromosome, but ok
            const tickTexts = this.tickTexts[cumPos.chr];

            const tickHeight = this.tickHeight;

            const xPadding = 0;

            let yPadding = tickHeight + this.tickTextSeparation;

            if (this.options.reverseOrientation) {
                yPadding = this.dimensions[1] - yPadding;
            }

            // these two loops reuse existing text objects so that we're not constantly recreating texts that already exist
            while (tickTexts.length < ticks.length) {
                const newText = new HGC.libraries.PIXI.Text('', this.pixiTextConfig);
                tickTexts.push(newText);
                this.gTicks[cumPos.chr].addChild(newText);
            }

            while (tickTexts.length > ticks.length) {
                const text = tickTexts.pop();
                this.gTicks[cumPos.chr].removeChild(text);
            }

            let i = 0;
            while (i < ticks.length) {
                tickTexts[i].visible = true;

                tickTexts[i].anchor.x = 0.5;
                tickTexts[i].anchor.y =
                    this.options.layout === 'circular' ? 0 : this.options.reverseOrientation ? 0 : 1;

                if (this.flipText) tickTexts[i].scale.x = -1;

                const chrText = this.options.assembly === 'unknown' ? '' : `${cumPos.chr}: `;
                tickTexts[i].text = ticks[i] === 0 ? `${chrText}1` : `${chrText}${this.formatTick(ticks[i])}`;

                const x = this._xScale(cumPos.pos + ticks[i]);

                // show the tick text labels
                if (this.options.layout === 'circular') {
                    const rope = this.addCurvedText(tickTexts[i], x + xPadding);
                    this.pTicksCircular.addChild(rope);
                } else {
                    tickTexts[i].x = x + xPadding;
                    tickTexts[i].y = this.dimensions[1] - yPadding;

                    // store the position of the tick line so that it can be used in the export function
                    // TODO:
                    tickTexts[i].tickLine = [x - 1, this.dimensions[1], x - 1, this.dimensions[1] - tickHeight - 1];

                    // draw outline
                    const lineYStart = this.options.reverseOrientation ? 0 : this.dimensions[1];
                    const lineYEnd = this.options.reverseOrientation ? tickHeight : this.dimensions[1] - tickHeight;
                    // graphics.lineStyle(1, this.stroke);
                    // graphics.moveTo(x - 1, lineYStart);
                    // graphics.lineTo(x - 1, lineYEnd - 1);
                    // graphics.lineTo(x + 1, lineYEnd - 1);
                    // graphics.lineTo(x + 1, lineYStart);

                    // draw the vertical tick lines
                    graphics.lineStyle(1, this.tickColor);
                    graphics.moveTo(x, lineYStart);
                    graphics.lineTo(x, lineYEnd);
                }

                i += 1;
            }

            if (this.options.layout === 'circular') i = 0;
            while (i < tickTexts.length) {
                // we don't need this text so we'll turn it off for now
                tickTexts[i].visible = false;

                i += 1;
            }

            return ticks.length;
        }

        addCurvedText(textObj: any, cx: number) {
            const [width, height] = this.dimensions;
            const { startAngle, endAngle } = this.options;
            const factor = Math.min(width, height) / Math.min(this.options.width, this.options.height);
            const innerRadius = this.options.innerRadius * factor;
            const outerRadius = this.options.outerRadius * factor;

            const r = (outerRadius + innerRadius) / 2.0;
            const centerPos = cartesianToPolar(cx, width, r, width / 2.0, height / 2.0, startAngle, endAngle);
            textObj.x = centerPos.x;
            textObj.y = centerPos.y;

            textObj.resolution = 4;
            const txtStyle = new HGC.libraries.PIXI.TextStyle(this.pixiTextConfig);
            const metric = HGC.libraries.PIXI.TextMetrics.measureText(textObj.text, txtStyle);

            // scale the width of text label so that its width is the same when converted into circular form
            const tw = ((metric.width / (2 * r * Math.PI)) * width * 360) / (endAngle - startAngle);
            let [minX, maxX] = [cx - tw / 2.0, cx + tw / 2.0];

            // make sure not to place the label on the origin
            if (minX < 0) {
                const gap = -minX;
                minX = 0;
                maxX += gap;
            } else if (maxX > width) {
                const gap = maxX - width;
                maxX = width;
                minX -= gap;
            }

            const ropePoints: import('pixi.js').Point[] = [];
            const baseR = innerRadius + metric.height / 2.0 + 3;
            for (let i = maxX; i >= minX; i -= tw / 10.0) {
                const p = cartesianToPolar(i, width, baseR, width / 2.0, height / 2.0, startAngle, endAngle);
                ropePoints.push(new HGC.libraries.PIXI.Point(p.x, p.y));
            }

            if (ropePoints.length === 0) {
                return null;
            }

            textObj.updateText();
            const rope = new HGC.libraries.PIXI.SimpleRope(textObj.texture, ropePoints);
            return rope;
        }

        draw() {
            this.allTexts = [];

            if (!this.texts) return;

            const x1 = absToChr(this._xScale.domain()[0], this.chromInfo);
            const x2 = absToChr(this._xScale.domain()[1], this.chromInfo);

            if (!x1 || !x2) {
                console.warn('Empty chromInfo:', this.dataConfig, this.chromInfo);
                return;
            }

            if (this.options.tickPositions === 'ends' && this.options.layout !== 'circular') {
                // We only support linear layouts for this.
                if (!this.gBoundTicks) return;

                this.gBoundTicks.visible = true;

                this.drawBoundsTicks(x1, x2);

                return;
            }

            if (!this.pTicks) {
                // options.tickPositiosn was probably just changed to 'even' and initChromLabels hasn't been called yet
                return;
            }

            const circular = this.options.layout === 'circular';

            for (let i = 0; i < this.texts.length; i++) {
                this.texts[i].visible = false;
                this.gTicks[this.chromInfo.cumPositions[i].chr].visible = false;
            }

            let yPadding = this.tickHeight + this.tickTextSeparation;

            if (this.options.reverseOrientation) {
                yPadding = this.dimensions[1] - yPadding;
            }

            // hide all the chromosome labels in preparation for drawing new ones
            Object.keys(this.chromInfo.chrPositions).forEach(chrom => {
                if (this.tickTexts[chrom]) {
                    this.tickTexts[chrom].forEach((tick: any) => {
                        tick.visible = false;
                    });
                }
            });

            /* tslint:disable */
            this.pTicksCircular.removeChildren();

            // iterate over each chromosome
            for (let i = x1[3]; i <= x2[3]; i++) {
                const xCumPos = this.chromInfo.cumPositions[i];

                const midX = xCumPos.pos + this.chromInfo.chromLengths[xCumPos.chr] / 2;

                const viewportMidX = this._xScale(midX);

                // This is ONLY the bare chromosome name. Not the tick label!
                const chrText = this.texts[i];

                chrText.anchor.x = 0.5;
                chrText.anchor.y = circular ? 0.5 : this.options.reverseOrientation ? 0 : 1;

                let rope: import('pixi.js').SimpleRope | null | undefined;
                if (circular) {
                    rope = this.addCurvedText(chrText, viewportMidX);
                    if (rope) {
                        this.pTicksCircular.addChild(rope);
                    }
                } else {
                    chrText.x = viewportMidX;
                    chrText.y = this.dimensions[1] - yPadding;
                }

                chrText.updateTransform();

                if (this.flipText) chrText.scale.x = -1;

                const numTicksDrawn = this.drawTicks(xCumPos);

                // only show chromsome labels if there's no ticks drawn
                if (!circular) {
                    chrText.visible = numTicksDrawn <= 0;
                } else {
                    if (numTicksDrawn > 0) {
                        this.pTicksCircular.removeChild(rope);
                    }
                }

                this.allTexts.push({
                    importance: chrText.hashValue,
                    text: chrText,
                    // @ts-expect-error possibly null or undefined and should just be SimpleRope
                    rope
                });
            }
            /* tslint:enable */

            // define the edge chromosome which are visible
            this.hideOverlaps(this.allTexts);
        }

        hideOverlaps(allTexts: TickLabelInfo[]) {
            const tree = new RBush<{ minX: number; minY: number; maxX: number; maxY: number }>();

            // using bounding boxes of the text objects, calculate overlaps
            allTexts
                .sort((a, b) => b.importance - a.importance)
                .forEach(({ text, rope }: any) => {
                    text.updateTransform();
                    const b = text.getBounds();
                    const m = 5;
                    const boxWithMargin = {
                        minX: b.x - m,
                        minY: b.y - m,
                        maxX: b.x + b.width + m * 2,
                        maxY: b.y + b.height + m * 2
                    };
                    if (!tree.collides(boxWithMargin)) {
                        // if not overlapping, add a new boundingbox
                        tree.insert(boxWithMargin);
                    } else {
                        // if overlapping, hide text labels
                        text.visible = false;
                        if (this.options.layout === 'circular' && rope) {
                            this.pTicksCircular.removeChild(rope);
                        }
                    }
                });
        }

        setPosition(newPosition: [number, number]) {
            super.setPosition(newPosition);

            [this.pMain.position.x, this.pMain.position.y] = this.position;
        }

        zoomed(newXScale: any, newYScale: any) {
            const domainValues = [...newXScale.domain(), ...newYScale.domain()];
            if (domainValues.filter(d => isNaN(d)).length !== 0) {
                // we received an invalid scale somehow
                // console.warn('');
                return;
            }

            this.xScale(newXScale);
            this.yScale(newYScale);

            this.draw();
        }

        exportSVG() {
            let track = null;
            let base = null;

            if (super.exportSVG) {
                [base, track] = super.exportSVG();
            } else {
                base = document.createElement('g');
                track = base;
            }
            base.setAttribute('class', 'chromosome-labels');

            const output = document.createElement('g');
            track.appendChild(output);

            output.setAttribute('transform', `translate(${this.position[0]},${this.position[1]})`);

            this.allTexts
                .filter((text: any) => text.text.visible)
                .forEach((text: any) => {
                    const g = pixiTextToSvg(text.text);
                    output.appendChild(g);
                });

            Object.values(this.tickTexts).forEach((texts: any) => {
                texts
                    .filter((x: any) => x.visible)
                    .forEach((text: any) => {
                        let g = pixiTextToSvg(text);
                        output.appendChild(g);
                        g = svgLine(
                            text.x,
                            this.options.reverseOrientation ? 0 : this.dimensions[1],
                            text.x,
                            this.options.reverseOrientation ? this.tickHeight : this.dimensions[1] - this.tickHeight,
                            1,
                            this.tickColor
                        );

                        const line = document.createElement('line');

                        line.setAttribute('x1', text.tickLine[0]);
                        line.setAttribute('y1', text.tickLine[1]);
                        line.setAttribute('x2', text.tickLine[2]);
                        line.setAttribute('y2', text.tickLine[3]);
                        line.setAttribute('style', 'stroke: grey');

                        output.appendChild(g);
                        output.appendChild(line);
                    });
            });

            return [base, track];
        }
    }
    return new AxisTrackClass(args);
}

// TODO: Change the icon
const icon =
    '<svg version="1.0" xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 5640 5420" preserveAspectRatio="xMidYMid meet"> <g id="layer101" fill="#000000" stroke="none"> <path d="M0 2710 l0 -2710 2820 0 2820 0 0 2710 0 2710 -2820 0 -2820 0 0 -2710z"/> </g> <g id="layer102" fill="#750075" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> <path d="M4340 2710 l0 -2510 560 0 560 0 0 2510 0 2510 -560 0 -560 0 0 -2510z"/> <path d="M200 1870 l0 -1670 630 0 630 0 0 1670 0 1670 -630 0 -630 0 0 -1670z"/> <path d="M1660 1810 l0 -1610 570 0 570 0 0 1610 0 1610 -570 0 -570 0 0 -1610z"/> <path d="M3000 840 l0 -640 570 0 570 0 0 640 0 640 -570 0 -570 0 0 -640z"/> </g> <g id="layer103" fill="#ffff04" stroke="none"> <path d="M200 4480 l0 -740 630 0 630 0 0 740 0 740 -630 0 -630 0 0 -740z"/> <path d="M1660 4420 l0 -800 570 0 570 0 0 800 0 800 -570 0 -570 0 0 -800z"/> <path d="M3000 3450 l0 -1770 570 0 570 0 0 1770 0 1770 -570 0 -570 0 0 -1770z"/> </g> </svg>';

// default
AxisTrack.config = {
    type: 'axis-track',
    datatype: ['multivec', 'epilogos'],
    local: false,
    orientation: '1d-horizontal',
    thumbnail: new DOMParser().parseFromString(icon, 'text/xml').documentElement,
    availableOptions: [
        'innerRadius',
        'outerRadius',
        'startAngle',
        'endAngle',
        'width',
        'height',
        'layout',
        'labelPosition',
        'labelColor',
        'labelTextOpacity',
        'labelBackgroundOpacity',
        'trackBorderWidth',
        'trackBorderColor',
        'trackType',
        'tickPositions',
        'scaledHeight',
        'backgroundColor'
    ],
    defaultOptions: {
        innerRadius: 340,
        outerRadius: 310,
        startAngle: 0,
        endAngle: 360,
        width: 700,
        height: 700,
        layout: 'linear',
        labelPosition: 'none',
        labelColor: 'black',
        labelTextOpacity: 0.4,
        trackBorderWidth: 0,
        trackBorderColor: 'black',
        tickPositions: ['even', 'ends'][0],
        backgroundColor: 'transparent'
    }
};

export default AxisTrack;

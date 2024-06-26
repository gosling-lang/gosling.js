import { PixiManager } from '@pixi-manager';
import { signal } from '@preact/signals-core';
import { AxisTrack } from '@gosling-lang/genomic-axis';
import { LeftTrackModifier } from '../../src/tracks/utils';

export function addLeftAxisTrack(pixiManager: PixiManager) {
    const view1Domain = signal<[number, number]>([0, 3000000000]);
    // Axis track
    const posAxis = {
        x: 150,
        y: 300,
        width: 200,
        height: 800
    };
    const { pixiContainer, overlayDiv } = pixiManager.makeContainer(posAxis);
    overlayDiv.style.border = '1px solid black';
    const axis = new AxisTrack(axisTrack, view1Domain, { pixiContainer, overlayDiv }, 'vertical');
}

export const axisTrack = {
    id: '8fa0dea6-19df-4e06-85fc-09aea7700a29-right-axis',
    layout: 'linear',
    innerRadius: 340,
    outerRadius: null,
    startAngle: 0,
    endAngle: 360,
    theme: {
        base: 'light',
        root: {
            background: 'white',
            titleColor: 'black',
            titleBackgroundColor: 'transparent',
            titleFontSize: 18,
            titleFontFamily: 'Arial',
            titleAlign: 'left',
            titleFontWeight: 'bold',
            subtitleColor: 'gray',
            subtitleBackgroundColor: 'transparent',
            subtitleFontSize: 16,
            subtitleFontFamily: 'Arial',
            subtitleFontWeight: 'normal',
            subtitleAlign: 'left',
            showMousePosition: true,
            mousePositionColor: '#000000'
        },
        track: {
            background: 'transparent',
            alternatingBackground: 'transparent',
            titleColor: 'black',
            titleBackground: 'white',
            titleFontSize: 24,
            titleAlign: 'left',
            outline: 'black',
            outlineWidth: 1
        },
        legend: {
            position: 'top',
            background: 'white',
            backgroundOpacity: 0.7,
            labelColor: 'black',
            labelFontSize: 12,
            labelFontWeight: 'normal',
            labelFontFamily: 'Arial',
            backgroundStroke: '#DBDBDB',
            tickColor: 'black'
        },
        axis: {
            tickColor: 'black',
            labelColor: 'black',
            labelMargin: 5,
            labelExcludeChrPrefix: false,
            labelFontSize: 12,
            labelFontWeight: 'normal',
            labelFontFamily: 'Arial',
            baselineColor: 'black',
            gridColor: '#E3E3E3',
            gridStrokeWidth: 1,
            gridStrokeType: 'solid',
            gridStrokeDash: [4, 4]
        },
        markCommon: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        point: {
            color: '#E79F00',
            size: 3,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        rect: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        triangle: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        area: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        line: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        bar: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        rule: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 1,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        link: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 1,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        },
        text: {
            color: '#E79F00',
            size: 1,
            stroke: 'black',
            strokeWidth: 0,
            opacity: 1,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6],
            textAnchor: 'middle',
            textFontWeight: 'normal'
        },
        brush: {
            color: 'gray',
            size: 1,
            stroke: 'black',
            strokeWidth: 1,
            opacity: 0.3,
            nominalColorRange: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441'],
            quantitativeSizeRange: [2, 6]
        }
    },
    assembly: 'hg38',
    stroke: 'transparent',
    color: 'black',
    labelMargin: 5,
    excludeChrPrefix: false,
    fontSize: 12,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    tickColor: 'black',
    tickFormat: 'plain',
    tickPositions: 'even',
    reverseOrientation: true,
    labelPosition: 'none',
    labelColor: 'black',
    labelTextOpacity: 0.4,
    trackBorderWidth: 0,
    trackBorderColor: 'black',
    backgroundColor: 'transparent',
    showMousePosition: false
};

import { PixiManager } from '@pixi-manager';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '@higlass/utils';
import { signal } from '@preact/signals-core';
import { panZoom } from '@gosling-lang/interactors';

export function addGoslingVertical(pixiManager: PixiManager) {
    const circularDomain = signal<[number, number]>([0, 248956422]);
    // All tracks use this datafetcher
    const dataFetcher = new DataFetcher(
        {
            server: 'https://server.gosling-lang.org/api/v1',
            tilesetUid: 'cistrome-multivec'
        },
        fakePubSub
    );

    // Circular track
    const pos0 = { x: 10, y: 200, width: 150, height: 600 };
    new GoslingTrack(
        circularTrackOptions,
        dataFetcher,
        pixiManager.makeContainer(pos0),
        circularDomain,
        'vertical'
    ).addInteractor(plot => panZoom(plot, circularDomain));
}
export const circularTrackOptions = {
    id: '8a003683-9a57-4202-bf00-1c4d9b11f13d',
    siblingIds: ['8a003683-9a57-4202-bf00-1c4d9b11f13d'],
    showMousePosition: false,
    mousePositionColor: '#000000',
    name: ' ',
    labelPosition: 'none',
    labelShowResolution: false,
    labelColor: 'black',
    labelBackgroundColor: 'white',
    labelBackgroundOpacity: 0.5,
    labelTextOpacity: 1,
    labelLeftMargin: 1,
    labelTopMargin: 1,
    labelRightMargin: 0,
    labelBottomMargin: 0,
    backgroundColor: 'transparent',
    spec: {
        spacing: 5,
        static: true,
        layout: 'linear',
        xDomain: { chromosome: 'chr1' },
        data: {
            url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
            type: 'multivec',
            row: 'sample',
            column: 'position',
            value: 'peak',
            categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
        },
        x: {
            field: 'start',
            type: 'genomic',
            domain: { chromosome: 'chr1' },
            axis: 'top'
        },
        xe: { field: 'end', type: 'genomic' },
        y: { field: 'peak', type: 'quantitative' },
        row: { field: 'sample', type: 'nominal' },
        color: { field: 'sample', type: 'nominal' },
        width: 250,
        height: 250,
        assembly: 'hg38',
        orientation: 'horizontal',
        zoomLimits: [1, null],
        centerRadius: 0.4,
        xOffset: 0,
        yOffset: 0,
        style: {},
        id: '8a003683-9a57-4202-bf00-1c4d9b11f13d',
        _overlay: [
            { mark: 'bar', style: {} },
            { mark: 'brush', x: {}, style: {} }
        ],
        overlayOnPreviousTrack: false,
        outerRadius: 125,
        innerRadius: 50,
        startAngle: 7.2,
        endAngle: 352.8,
        _renderingId: '085fb2cf-83dd-4d47-b7da-7fc96bbde6a1'
    },
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
    }
};

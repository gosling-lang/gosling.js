import { PixiManager } from '@pixi-manager';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { DataFetcher } from '@higlass/datafetcher';
import { fakePubSub } from '@higlass/utils';
import { signal } from '@preact/signals-core';
import { panZoom } from '@gosling-lang/interactors';
import { CsvDataFetcher } from '@data-fetchers';

export function addCSVTrack(pixiManager: PixiManager) {
    const domain = signal<[number, number]>([2490980562, 2491580562]);
    const dataFetcher = new CsvDataFetcher(dataOptions);

    const pos0 = { x: 10, y: 10, width: 700, height: 70 };
    new GoslingTrack(goslingTrackOptions, dataFetcher, pixiManager.makeContainer(pos0)).addInteractor(plot =>
        panZoom(plot, domain)
    );
}

const dataOptions = {
    url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
    type: 'csv',
    headerNames: ['id', 'chr', 'p1', 'p2'],
    chromosomePrefix: 'hs',
    chromosomeField: 'chr',
    genomicFields: ['p1', 'p2'],
    separator: ' ',
    longToWideId: 'id',
    x: 'p1',
    xe: 'p2',
    urlFetchOptions: {},
    indexUrlFetchOptions: {}
};
export const goslingTrackOptions = {
    id: 'dcac90ed-3aab-4ab2-9f58-4978bfbca8a3',
    siblingIds: ['dcac90ed-3aab-4ab2-9f58-4978bfbca8a3'],
    showMousePosition: true,
    mousePositionColor: '#000000',
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
        layout: 'linear',
        xDomain: {
            chromosome: 'chr17',
            interval: [200000, 800000]
        },
        assembly: 'hg38',
        orientation: 'horizontal',
        static: false,
        zoomLimits: [1, null],
        centerRadius: 0.3,
        xOffset: 0,
        yOffset: 0,
        style: { outlineWidth: 0 },
        data: {
            url: 'https://raw.githubusercontent.com/vigsterkr/circos/master/data/5/segdup.txt',
            type: 'csv',
            headerNames: ['id', 'chr', 'p1', 'p2'],
            chromosomePrefix: 'hs',
            chromosomeField: 'chr',
            genomicFields: ['p1', 'p2'],
            separator: ' ',
            longToWideId: 'id'
        },
        dataTransform: [{ type: 'filter', field: 'chr', oneOf: ['hs17'] }],
        mark: 'rect',
        x: {
            field: 'p1',
            type: 'genomic',
            domain: {
                chromosome: 'chr17',
                interval: [200000, 800000]
            },
            axis: 'top'
        },
        xe: { field: 'p2', type: 'genomic' },
        color: {
            field: 'chr_2',
            type: 'nominal',
            domain: [
                'chr1',
                'chr2',
                'chr3',
                'chr4',
                'chr5',
                'chr6',
                'chr7',
                'chr8',
                'chr9',
                'chr10',
                'chr11',
                'chr12',
                'chr13',
                'chr14',
                'chr15',
                'chr16',
                'chr17',
                'chr18',
                'chr19',
                'chr20',
                'chr21',
                'chr22',
                'chrX',
                'chrY'
            ]
        },
        opacity: { value: 0.5 },
        size: { value: 14 },
        overlayOnPreviousTrack: false,
        width: 700,
        height: 70,
        id: 'dcac90ed-3aab-4ab2-9f58-4978bfbca8a3',
        _renderingId: '620ebc27-bc9f-45c5-b358-ea59bf89537f'
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

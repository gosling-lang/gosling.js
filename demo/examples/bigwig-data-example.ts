import { PixiManager } from '@pixi-manager';
import { GoslingTrack } from '@gosling-lang/gosling-track';
import { BigWigDataFetcher } from '@data-fetchers';
import { signal } from '@preact/signals-core';
import { panZoom, cursor } from '@gosling-lang/interactors';

export function addBigwig(pixiManager: PixiManager) {
    const view1Domain = signal<[number, number]>([543317951, 544039951]);
    const cursorPosition = signal<number>(0);

    const dataFetcher = new BigWigDataFetcher(excitatory_neurons.spec.data);
    // dataFetcher.config.cache = true; // turn on caching
    const pos1 = {
        x: 0,
        y: 300,
        width: 400,
        height: 40
    };
    new GoslingTrack(excitatory_neurons, dataFetcher, pixiManager.makeContainer(pos1))
        .addInteractor(plot => panZoom(plot, view1Domain))
        .addInteractor(plot => cursor(plot, cursorPosition));
}

// bigwig datafetcher
// bar mark
// orange color
const excitatory_neurons = {
    id: '3486b662-d79a-4c14-936b-b62d2d0e9205',
    siblingIds: ['3486b662-d79a-4c14-936b-b62d2d0e9205'],
    showMousePosition: false,
    mousePositionColor: '#000000',
    name: 'Excitatory neurons',
    labelPosition: 'topLeft',
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
        xDomain: {
            chromosome: 'chr3',
            interval: [52168000, 52890000]
        },
        linkingId: 'detail',
        x: {
            field: 'position',
            type: 'genomic',
            axis: 'none',
            domain: {
                chromosome: 'chr3',
                interval: [52168000, 52890000]
            }
        },
        y: {
            field: 'peak',
            type: 'quantitative',
            axis: 'right'
        },
        style: { outline: '#20102F' },
        width: 400,
        height: 40,
        assembly: 'hg38',
        layout: 'linear',
        orientation: 'horizontal',
        static: false,
        zoomLimits: [1, null],
        centerRadius: 0.3,
        xOffset: 0,
        yOffset: 0,
        data: {
            url: 'https://s3.amazonaws.com/gosling-lang.org/data/ExcitatoryNeurons-insertions_bin100_RIPnorm.bw',
            type: 'bigwig',
            column: 'position',
            value: 'peak'
        },
        title: 'Excitatory neurons',
        mark: 'bar',
        color: { value: '#F29B67' },
        id: '3486b662-d79a-4c14-936b-b62d2d0e9205',
        overlayOnPreviousTrack: false
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

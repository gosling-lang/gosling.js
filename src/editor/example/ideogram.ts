import { GeminiSpec, SuperposedTrack, Track } from '../../core/gemini.schema';
import { EXAMPLE_DATASETS } from './datasets';

export const EXAMPLE_IDEOGRAM_TRACK: SuperposedTrack = {
    data: {
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/cytogenetic_band.csv',
        type: 'csv',
        chromosomeField: 'Chr.',
        genomicFields: ['ISCN_start', 'ISCN_stop', 'Basepair_start', 'Basepair_stop'],
        quantitativeFields: ['Band', 'Density']
    },
    superpose: [
        {
            mark: 'text',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
            },
            text: { field: 'Band', type: 'nominal' },
            color: { value: 'black' },
            visibility: {
                operation: 'less-than',
                condition: { width: '|xe-x|', transitionPadding: 10 },
                target: 'mark'
            },
            style: {
                textStrokeWidth: 0
            }
        },
        {
            mark: 'rect',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1', 'acen-2'], not: true }]
            },
            color: {
                field: 'Density',
                type: 'nominal',
                domain: ['', '25', '50', '75', '100'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
            }
        },
        {
            mark: 'rect',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['gvar'], not: false }]
            },
            color: { value: '#A0A0F2' }
        },
        {
            mark: 'triangle-r',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-1'], not: false }]
            },
            color: { value: '#B40101' }
        },
        {
            mark: 'triangle-l',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen-2'], not: false }]
            },
            color: { value: '#B40101' }
        }
    ],
    x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' }, axis: 'top' },
    xe: { field: 'Basepair_stop', type: 'genomic' },
    visibility: {
        operation: 'greater-than',
        condition: { width: 3, transitionPadding: 5 },
        target: 'mark'
    },
    stroke: { value: 'gray' },
    strokeWidth: { value: 0.5 }
};

export const EXAMPLE_STACKED_AREA: Track = {
    data: {
        url: EXAMPLE_DATASETS.multivec,
        type: 'tileset'
    },
    metadata: {
        type: 'higlass-multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
    },
    mark: 'area',
    x: {
        field: 'position',
        type: 'genomic',
        domain: { chromosome: '1' },
        axis: 'top'
    },
    y: { field: 'peak', type: 'quantitative' },
    color: { field: 'sample', type: 'nominal' }
};

const ideogramTracks: Track[] = [];
[
    { chr: '1', width: 1000 },
    { chr: '2', width: 970 },
    { chr: '3', width: 850 },
    { chr: '4', width: 830 },
    { chr: '5', width: 820 },
    { chr: '9', width: 730 }
].map((d, i) => {
    ideogramTracks.push(
        {
            ...EXAMPLE_STACKED_AREA,
            x: { ...EXAMPLE_STACKED_AREA.x, domain: { chromosome: d.chr }, linker: `link-${i}` },
            width: d.width,
            zoomable: false
        },
        {
            ...EXAMPLE_IDEOGRAM_TRACK,
            x: { ...EXAMPLE_IDEOGRAM_TRACK.x, domain: { chromosome: d.chr }, axis: undefined, linker: `link-${i}` },
            height: 24,
            width: d.width,
            zoomable: false
        }
    );
});
export const EXAMPLE_IDEOGRAM: GeminiSpec = {
    layout: { direction: 'vertical', type: 'linear', rowSizes: [60, 20], columnSizes: 1000, rowGaps: [0, 30] },
    tracks: ideogramTracks
};

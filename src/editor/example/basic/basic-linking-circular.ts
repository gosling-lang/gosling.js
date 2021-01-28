import { GoslingSpec } from '../../../core/gosling.schema';
import { EXAMPLE_BASIC_AREA } from './basic-marks';
import { EXAMPLE_DATASETS } from './datasets';

export const EXMAPLE_BASIC_LINKING_CIRCULAR: GoslingSpec = {
    arrangement: {
        direction: 'horizontal',
        wrap: 2,
        columnSizes: [350, 350],
        rowSizes: [500, 150]
    },
    tracks: [
        {
            span: 2,
            outerRadius: 240,
            innerRadius: 150,
            static: true,
            layout: 'circular',
            data: {
                url: EXAMPLE_DATASETS.multivec,
                type: 'tileset'
            },
            metadata: {
                type: 'higlass-multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                bin: 4
            },
            mark: 'bar',
            x: {
                field: 'start',
                type: 'genomic',
                axis: 'top'
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            y: { field: 'peak', type: 'quantitative' },
            row: { field: 'sample', type: 'nominal' },
            color: { field: 'sample', type: 'nominal' },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.3 },
            superpose: [
                {},
                {
                    mark: 'brush',
                    x: { linkingID: 'linking-with-brush' },
                    color: { value: 'blue' }
                },
                {
                    mark: 'brush',
                    x: { linkingID: 'linking-with-brush-2' },
                    color: { value: 'red' }
                }
            ]
        },
        {
            span: 2,
            layout: 'circular',
            data: {
                type: 'csv',
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/rearrangements.bulk.1639.simple.filtered.pub',
                headerNames: [
                    'chr1',
                    'p1s',
                    'p1e',
                    'chr2',
                    'p2s',
                    'p2e',
                    'type',
                    'id',
                    'f1',
                    'f2',
                    'f3',
                    'f4',
                    'f5',
                    'f6'
                ],
                separator: '\t',
                genomicFieldsToConvert: [
                    { chromosomeField: 'chr1', genomicFields: ['p1s', 'p1e'] },
                    { chromosomeField: 'chr2', genomicFields: ['pes', 'pee'] }
                ]
            },
            dataTransform: {
                filter: [
                    { field: 'chr1', oneOf: ['16', '14', '9', '6', '5', '3'] },
                    { field: 'chr2', oneOf: ['16', '14', '9', '6', '5', '3'] }
                ]
            },
            mark: 'link',
            x: { field: 'p1s', type: 'genomic' },
            xe: { field: 'p1e', type: 'genomic' },
            x1: { field: 'p2s', type: 'genomic' },
            x1e: { field: 'p2e', type: 'genomic' },
            color: {
                field: 'type',
                type: 'nominal',
                legend: true,
                domain: ['deletion', 'inversion', 'translocation', 'tandem-duplication']
            },
            stroke: {
                field: 'type',
                type: 'nominal',
                domain: ['deletion', 'inversion', 'translocation', 'tandem-duplication']
            },
            strokeWidth: { value: 0.8 },
            opacity: { value: 0.15 },
            style: { circularLink: true },
            outerRadius: 150,
            innerRadius: 0,
            superposeOnPreviousTrack: true
        },
        {
            ...EXAMPLE_BASIC_AREA,
            mark: 'bar',
            x: {
                ...EXAMPLE_BASIC_AREA.x,
                domain: { chromosome: '5' },
                axis: 'top',
                linkingID: 'linking-with-brush'
            },
            color: { field: 'sample', type: 'nominal', legend: true },
            strokeWidth: { value: 0 },
            style: {
                background: 'blue',
                backgroundOpacity: 0.1
            }
        },
        {
            ...EXAMPLE_BASIC_AREA,
            mark: 'bar',
            x: {
                ...EXAMPLE_BASIC_AREA.x,
                domain: { chromosome: '16' },
                axis: 'top',
                linkingID: 'linking-with-brush-2'
            },
            color: { field: 'sample', type: 'nominal', legend: true },
            strokeWidth: { value: 0 },
            style: {
                background: 'red',
                backgroundOpacity: 0.1
            }
        }
    ]
} as GoslingSpec;

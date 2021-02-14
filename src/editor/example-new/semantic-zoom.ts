import { OverlaidTrack } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

const ScalableSequenceTrack: OverlaidTrack = {
    data: {
        url: GOSLING_PUBLIC_DATA.fasta,
        type: 'multivec',
        row: 'base',
        column: 'position',
        value: 'count',
        categories: ['A', 'T', 'G', 'C'],
        start: 'start',
        end: 'end'
    },
    overlay: [
        {
            mark: 'bar',
            y: { field: 'count', type: 'quantitative' }
        },
        {
            mark: 'bar',
            y: { field: 'count', type: 'quantitative' },
            strokeWidth: { value: 1 },
            stroke: { value: 'white' },
            visibility: [
                {
                    operation: 'gtet',
                    measure: 'width',
                    threshold: 20,
                    transitionPadding: 10,
                    target: 'mark'
                },
                {
                    operation: 'LT',
                    measure: 'zoomLevel',
                    threshold: 50,
                    target: 'track'
                }
            ]
        },
        {
            dataTransform: { filter: [{ field: 'count', oneOf: [0], not: true }] },
            mark: 'text',
            x: {
                field: 'start',
                type: 'genomic',
                domain: { chromosome: '1', interval: [3000000, 3000010] }
            },
            xe: {
                field: 'end',
                type: 'genomic'
            },
            color: { value: 'white' },
            visibility: [
                {
                    operation: 'less-than',
                    measure: 'width',
                    threshold: '|xe-x|',
                    transitionPadding: 30,
                    target: 'mark'
                },
                {
                    operation: 'LT',
                    measure: 'zoomLevel',
                    threshold: 50,
                    target: 'track'
                }
            ]
        }
    ],
    x: {
        field: 'position',
        type: 'genomic',
        domain: { chromosome: '1', interval: [3000000, 3000010] },
        axis: 'top'
    },
    color: {
        field: 'base',
        type: 'nominal',
        domain: ['A', 'T', 'G', 'C'],
        legend: true
    },
    text: {
        field: 'base',
        type: 'nominal'
    },
    style: {
        textFontSize: 24,
        textStrokeWidth: 0,
        textFontWeight: 'bold'
    },
    width: 400,
    height: 80
};

const ScalableCytoBand: OverlaidTrack = {
    data: {
        url:
            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
        type: 'csv',
        chromosomeField: 'Chromosome',
        genomicFields: ['chromStart', 'chromEnd']
    },
    overlay: [
        {
            mark: 'text',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
            },
            text: { field: 'Name', type: 'nominal' },
            color: {
                field: 'Stain',
                type: 'nominal',
                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                range: ['black', 'black', 'black', 'black', 'white', 'black']
            },
            visibility: [
                {
                    operation: 'less-than',
                    measure: 'width',
                    threshold: '|xe-x|',
                    transitionPadding: 10,
                    target: 'mark'
                }
            ],
            style: {
                textStrokeWidth: 0
            }
        },
        {
            mark: 'rect',
            dataTransform: {
                filter: [{ field: 'Stain', oneOf: ['acen'], not: true }]
            },
            color: {
                field: 'Stain',
                type: 'nominal',
                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#A0A0F2']
            }
        },
        {
            mark: 'triangle-r',
            dataTransform: {
                filter: [
                    { field: 'Stain', oneOf: ['acen'] },
                    { field: 'Name', include: 'q' }
                ]
            },
            color: { value: '#B40101' }
        },
        {
            mark: 'triangle-l',
            dataTransform: {
                filter: [
                    { field: 'Stain', oneOf: ['acen'] },
                    { field: 'Name', include: 'p' }
                ]
            },
            color: { value: '#B40101' }
        }
    ],
    x: { field: 'chromStart', type: 'genomic', domain: { chromosome: '1' } },
    xe: { field: 'chromEnd', type: 'genomic' },
    size: { value: 20 },
    stroke: { value: 'gray' },
    strokeWidth: { value: 0.5 },
    style: {
        outline: 'white'
    },
    width: 400,
    height: 25
};

export const EXAMPLE_TRACK_SEMANTIC_ZOOM = {
    sequence: ScalableSequenceTrack,
    cytoband: ScalableCytoBand
};

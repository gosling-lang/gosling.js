import { GoslingSpec } from '../../';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_CIRCOS: GoslingSpec = {
    title: 'Circos',
    description: 'http://circos.ca/intro/genomic_data/',
    layout: 'circular',
    static: true,
    spacing: 1,
    centerRadius: 0.3,
    alignment: 'stack',
    tracks: [
        {
            data: {
                type: 'vector',
                url: 'https://resgen.io/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA',
                column: 'position',
                value: 'peak'
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', axis: 'top' },
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#EEEDA1' },
            width: 700,
            height: 60
        },
        {
            data: {
                url: GOSLING_PUBLIC_DATA.multivec,
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: [
                    'sample 1',
                    'sample 2',
                    'sample 3',
                    'sample 4',
                    'sample 5',
                    'sample 6',
                    'sample 7',
                    'sample 8'
                ]
            },
            dataTransform: { filter: [{ field: 'peak', inRange: [0, 0.001] }] },
            mark: 'rect',
            x: { field: 'start', type: 'genomic' },
            xe: { field: 'end', type: 'genomic' },
            stackY: true,
            color: { value: '#FF6205' },
            stroke: { value: 'white' },
            strokeWidth: { value: 1 },
            width: 700,
            height: 40
        },
        {
            data: {
                url:
                    'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/UCSC.HG38.Human.CytoBandIdeogram.csv',
                type: 'csv',
                chromosomeField: 'Chromosome',
                genomicFields: ['chromStart', 'chromEnd']
            },
            mark: 'rect',
            color: {
                field: 'Stain',
                type: 'nominal',
                domain: ['gneg', 'gpos25', 'gpos50', 'gpos75', 'gpos100', 'gvar', 'acen'],
                range: ['white', '#D9D9D9', '#979797', '#636363', 'black', '#F0F0F0', '#8D8D8D']
            },
            x: { field: 'chromStart', type: 'genomic' },
            xe: { field: 'chromEnd', type: 'genomic' },
            stroke: { value: 'lightgray' },
            strokeWidth: { value: 0.5 },
            width: 700,
            height: 30
        },
        {
            alignment: 'overlay',
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
            opacity: { value: 0.4 },
            tracks: [
                {
                    dataTransform: {
                        filter: [{ field: 'chr', oneOf: ['hs1'], not: true }]
                    },
                    mark: 'link',
                    x: { field: 'p1', type: 'genomic' },
                    xe: { field: 'p1_2', type: 'genomic' },
                    x1: { field: 'p2', type: 'genomic' },
                    x1e: { field: 'P2_2', type: 'genomic' },
                    stroke: { value: 'lightgray' },
                    strokeWidth: { value: 1 }
                },
                {
                    dataTransform: { filter: [{ field: 'chr', oneOf: ['hs1'] }] },
                    mark: 'link',
                    x: { field: 'p1', type: 'genomic' },
                    xe: { field: 'p1_2', type: 'genomic' },
                    x1: { field: 'p2', type: 'genomic' },
                    x1e: { field: 'P2_2', type: 'genomic' },
                    stroke: {
                        field: 'chr_2',
                        type: 'nominal',
                        range: ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441']
                    },
                    strokeWidth: { value: 1.5 }
                }
            ],
            width: 700,
            height: 300
        }
    ]
};

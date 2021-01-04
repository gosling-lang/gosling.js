import { GeminidSpec } from '../../core/geminid.schema';
import { EXAMPLE_DATASETS } from './basic/datasets';

export const GENOCAT_CIRCOS: GeminidSpec = {
    title: 'Circos',
    subtitle: 'Reimplementation of GenoCAT examples',
    description: 'http://circos.ca/intro/genomic_data/',
    layout: 'circular',
    static: true,
    arrangement: { columnSizes: 700, rowSizes: 700 },
    tracks: [
        {
            data: { type: 'tileset', url: 'https://resgen.io/api/v1/tileset_info/?d=VLFaiSVjTjW6mkbjRjWREA' },
            metadata: { type: 'higlass-vector', column: 'position', value: 'peak' },
            mark: 'bar',
            x: { field: 'position', type: 'genomic' }, //, domain: { chromosome: '1' }},
            y: { field: 'peak', type: 'quantitative' },
            color: { value: '#EEEDA1' },
            outerRadius: 340,
            innerRadius: 320
        },
        {
            data: { url: EXAMPLE_DATASETS.multivec, type: 'tileset' },
            metadata: {
                type: 'higlass-multivec',
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
            dataTransform: { filter: [{ field: 'peak', inRange: [0, 0.001], not: false }] },
            mark: 'rect',
            x: { field: 'position', type: 'genomic' },
            row: { field: 'sample', type: 'nominal' },
            color: { value: '#FF6205' },
            stroke: { value: 'white' },
            strokeWidth: { value: 1 },
            outerRadius: 317,
            innerRadius: 297,
            superposeOnPreviousTrack: true
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
            size: { value: 620 },
            stroke: { value: 'lightgray' },
            strokeWidth: { value: 0.5 },
            outerRadius: 294,
            innerRadius: 274,
            superposeOnPreviousTrack: true
        },
        {
            data: {
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                type: 'csv',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'link',
            x: { field: 's1', type: 'genomic' },
            xe: { field: 'e1', type: 'genomic' },
            x1: { field: 's2', type: 'genomic' },
            x1e: { field: 'e2', type: 'genomic' },
            stroke: { field: 'c2', type: 'nominal' }, // use `color`?
            opacity: { value: 0.1 },
            style: { circularLink: true },
            outerRadius: 271,
            innerRadius: 0,
            superposeOnPreviousTrack: true
        }
    ]
};

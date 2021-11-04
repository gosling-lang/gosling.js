import type { GoslingSpec } from 'gosling.js';

export const EX_SPEC_BAND: GoslingSpec = {
    layout: 'linear',
    xDomain: { chromosome: '1', interval: [103900000, 104100000] },
    spacing: 0,
    tracks: [
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'rect',
            encoding: {
                x: { startField: 's1', endField: 'e1', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                color: { value: '#85B348' },
                opacity: { value: 0.15 }
            },
            tooltip: [
                { field: 's1', type: 'genomic', alt: '<b style="color:green">Start Position</b>' },
                { field: 'e1', type: 'genomic', alt: '<b style="color:green">End Position</b>' }
            ],
            width: 500,
            height: 16
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'betweenLink',
            encoding: {
                x: { startField: 's1', endField: 'e1', startField2: 's2', endField2: 'e2', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            style: { outlineWidth: 0 },
            width: 500,
            height: 100
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'rect',
            encoding: {
                x: { startField: 's2', endField: 'e2', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            tooltip: [
                { field: 's2', type: 'genomic', alt: '<b style="color:green">Start Position</b>' },
                { field: 'e2', type: 'genomic', alt: '<b style="color:green">End Position</b>' }
            ],
            width: 500,
            height: 16
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'betweenLink',
            encoding: {
                x: { startField: 's2', endField: 'e2', startField2: 's1', endField2: 'e1', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            style: { outlineWidth: 0 },
            width: 500,
            height: 100
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'rect',
            encoding: {
                x: { startField: 's1', endField: 'e1', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            tooltip: [
                { field: 's1', type: 'genomic', alt: '<b style="color:green">Start Position</b>' },
                { field: 'e1', type: 'genomic', alt: '<b style="color:green">End Position</b>' }
            ],
            width: 500,
            height: 16
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'betweenLink',
            encoding: {
                x: { startField: 's1', endField: 'e1', startField2: 's2', endField2: 'e2', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            style: { outlineWidth: 0 },
            width: 500,
            height: 100
        },
        {
            data: {
                type: 'csv',
                url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/circos-segdup-edited.txt',
                chromosomeField: 'c2',
                genomicFields: ['s1', 'e1', 's2', 'e2']
            },
            mark: 'rect',
            encoding: {
                x: { startField: 's2', endField: 'e2', type: 'genomic' },
                stroke: { value: '#4C6629' },
                strokeWidth: { value: 0.8 },
                opacity: { value: 0.15 },
                color: { value: '#85B348' }
            },
            tooltip: [
                { field: 's2', type: 'genomic', alt: '<b style="color:green">Start Position</b>' },
                { field: 'e2', type: 'genomic', alt: '<b style="color:green">End Position</b>' }
            ],
            width: 500,
            height: 16
        }
    ]
};

import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';

export const EX_SPEC_CIRCULAR_OVERVIEW_LINEAR_DETAIL: GoslingSpec = {
    arrangement: 'vertical',
    views: [
        {
            layout: 'circular',
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                        bin: 4
                    },
                    x: { field: 'start', type: 'genomic' },
                    xe: { field: 'end', type: 'genomic' },
                    y: { field: 'peak', type: 'quantitative' },
                    row: { field: 'sample', type: 'nominal' },
                    color: { field: 'sample', type: 'nominal' },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 0.3 },
                    overlay: [
                        {
                            mark: 'bar'
                        },
                        {
                            mark: 'brush',
                            x: { linkingID: 'detail-1' },
                            color: { value: 'blue' }
                        },
                        {
                            mark: 'brush',
                            x: { linkingID: 'detail-2' },
                            color: { value: 'red' }
                        }
                    ],
                    style: { outlineWidth: 0 },
                    width: 500,
                    height: 100
                },
                {
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
                            { chromosomeField: 'chr2', genomicFields: ['p2s', 'p2e'] }
                        ]
                    },
                    dataTransform: {
                        filter: [
                            { field: 'chr1', oneOf: ['1', '16', '14', '9', '6', '5', '3'] },
                            { field: 'chr2', oneOf: ['1', '16', '14', '9', '6', '5', '3'] }
                        ]
                    },
                    mark: 'link',
                    x: { field: 'p1s', type: 'genomic' },
                    xe: { field: 'p1e', type: 'genomic' },
                    x1: { field: 'p2s', type: 'genomic' },
                    x1e: { field: 'p2e', type: 'genomic' },
                    // color: {
                    //     field: 'type',
                    //     type: 'nominal',
                    //     legend: true,
                    //     domain: ['deletion', 'inversion', 'translocation', 'tandem-duplication']
                    // },
                    stroke: {
                        field: 'type',
                        type: 'nominal',
                        domain: ['deletion', 'inversion', 'translocation', 'tandem-duplication']
                    },
                    strokeWidth: { value: 0.8 },
                    opacity: { value: 0.15 },
                    style: { circularLink: true },
                    width: 500,
                    height: 100
                }
            ]
        },
        {
            spacing: 10,
            arrangement: 'horizontal',
            views: [
                {
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
                                row: 'sample',
                                column: 'position',
                                value: 'peak',
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                                bin: 4
                            },
                            mark: 'bar',
                            x: { field: 'start', type: 'genomic', linkingID: 'detail-1', domain: { chromosome: '5' } },
                            xe: { field: 'end', type: 'genomic' },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            color: { field: 'sample', type: 'nominal' },
                            stroke: { value: 'black' },
                            strokeWidth: { value: 0.3 },
                            style: {
                                background: 'blue',
                                backgroundOpacity: 0.1
                            },
                            width: 245,
                            height: 150
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.multivec,
                                type: 'multivec',
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
                                domain: { chromosome: '16' },
                                linkingID: 'detail-2'
                            },
                            xe: { field: 'end', type: 'genomic' },
                            y: { field: 'peak', type: 'quantitative' },
                            row: { field: 'sample', type: 'nominal' },
                            color: { field: 'sample', type: 'nominal', legend: true },
                            stroke: { value: 'black' },
                            strokeWidth: { value: 0.3 },
                            style: {
                                background: 'red',
                                backgroundOpacity: 0.1
                            },
                            width: 245,
                            height: 150
                        }
                    ]
                }
            ]
        }
    ]
};

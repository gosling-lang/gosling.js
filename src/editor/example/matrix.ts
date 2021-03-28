import { GoslingSpec } from '../../core/gosling.schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';
import { EX_TRACK_SEMANTIC_ZOOM } from './semantic-zoom';

export const EX_SPEC_MATRIX: GoslingSpec = {
    title: 'Matrix Visualization',
    subtitle: 'Matrix Heatmap for Hi-C Data',
    views: [
        {
            static: true,
            tracks: [
                {
                    data: {
                        url: GOSLING_PUBLIC_DATA.multivec,
                        type: 'multivec',
                        row: 'sample',
                        column: 'position',
                        value: 'peak',
                        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                    },
                    alignment: 'overlay',
                    tracks: [
                        {
                            mark: 'bar'
                        },
                        {
                            mark: 'brush',
                            x: { linkingId: 'all' },
                            color: { value: 'gray' }
                        }
                    ],
                    x: {
                        field: 'position',
                        type: 'genomic',
                        axis: 'top'
                    },
                    y: { field: 'peak', type: 'quantitative' },
                    color: { field: 'sample', type: 'nominal' },
                    width: 570,
                    height: 30
                },
                {
                    // ...CytoBands,
                    ...EX_TRACK_SEMANTIC_ZOOM.cytoband,
                    tracks: [
                        ...EX_TRACK_SEMANTIC_ZOOM.cytoband.tracks,
                        {
                            mark: 'brush',
                            x: { linkingId: 'all' },
                            color: { value: 'gray' }
                        }
                    ],
                    width: 570
                }
            ]
        },
        {
            xDomain: { chromosome: '5' },
            xLinkingId: 'all',
            spacing: 0,
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
                                categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4']
                            },
                            mark: 'bar',
                            x: {
                                field: 'position',
                                type: 'genomic',
                                axis: 'top'
                            },
                            y: { field: 'peak', type: 'quantitative' },
                            color: { field: 'sample', type: 'nominal' },
                            width: 570,
                            height: 50
                        }
                    ]
                },
                {
                    tracks: [
                        {
                            data: {
                                url: GOSLING_PUBLIC_DATA.matrix2,
                                type: 'matrix'
                            },
                            mark: 'rect',
                            x: { field: 'position1', type: 'genomic', axis: 'none' },
                            y: { field: 'position2', type: 'genomic', axis: 'right' },
                            color: { field: 'value', type: 'quantitative', legend: true },
                            width: 600,
                            height: 600
                        }
                    ]
                }
            ]
        }
    ]
};

import { GoslingSpec, SingleTrack } from '@gosling/schema';
import { GOSLING_PUBLIC_DATA } from './gosling-data';
import { CytoBands } from './ideograms';

export const BAR: SingleTrack = {
    data: {
        url: GOSLING_PUBLIC_DATA.multivec,
        type: 'multivec',
        row: 'sample',
        column: 'position',
        value: 'peak',
        categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
        binSize: 16
    },
    mark: 'bar',
    x: {
        field: 'start',
        type: 'genomic'
    },
    xe: {
        field: 'end',
        type: 'genomic'
    },
    color: { field: 'sample', type: 'nominal' },
    y: { field: 'peak', type: 'quantitative', axis: 'none' },
    tooltip: [
        { field: 'start', type: 'genomic', alt: 'Start Position' },
        { field: 'end', type: 'genomic', alt: 'End Position' },
        { field: 'peak', type: 'quantitative', alt: 'Value', format: '.2' },
        { field: 'sample', type: 'nominal', alt: 'Sample' }
    ],
    width: 600,
    height: 60
};

export const EX_SPEC_MOUSE_EVENT: GoslingSpec = {
    title: 'Mouse Hover Effects',
    subtitle: 'Customize mouse hovering events reflecting on your use cases!',
    xDomain: { chromosome: '1' },
    views: [
        {
            tracks: [
                {
                    title: 'Hover Individual Marks',
                    ...BAR,
                    experimental: {
                        hovering: {
                            color: 'blue',
                            opacity: 0.5,
                            strokeWidth: 0
                        }
                    }
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Group Hovering By Sample',
                    ...BAR,
                    experimental: {
                        hovering: {
                            enableGroupHovering: true,
                            searchGroupByField: 'sample',
                            color: 'blue',
                            opacity: 0.5,
                            strokeWidth: 0
                        }
                    }
                }
            ]
        },
        {
            tracks: [
                {
                    title: 'Group Hovering By Genomic Position',
                    ...BAR,
                    experimental: {
                        hovering: {
                            enableGroupHovering: true,
                            searchGroupByField: 'position',
                            color: 'blue',
                            opacity: 0.5,
                            strokeWidth: 0
                        }
                    }
                }
            ]
        },
        {
            xDomain: { chromosome: '3', interval: [52168000, 52890000] },
            tracks: [
                {
                    title: 'Group Hovering By Gene',
                    template: 'gene',
                    data: {
                        url: GOSLING_PUBLIC_DATA.geneAnnotation,
                        type: 'beddb',
                        genomicFields: [
                            { index: 1, name: 'start' },
                            { index: 2, name: 'end' }
                        ],
                        valueFields: [
                            { index: 5, name: 'strand', type: 'nominal' },
                            { index: 3, name: 'name', type: 'nominal' }
                        ],
                        exonIntervalFields: [
                            { index: 12, name: 'start' },
                            { index: 13, name: 'end' }
                        ]
                    },
                    encoding: {
                        startPosition: { field: 'start' },
                        endPosition: { field: 'end' },
                        strandColor: { field: 'strand', range: ['gray'] },
                        strandRow: { field: 'strand' },
                        opacity: { value: 0.4 },
                        geneHeight: { value: 20 },
                        geneLabel: { field: 'name' },
                        geneLabelFontSize: { value: 20 },
                        geneLabelColor: { field: 'strand', range: ['gray'] },
                        geneLabelStroke: { value: 'white' },
                        geneLabelStrokeThickness: { value: 4 },
                        geneLabelOpacity: { value: 1 },
                        type: { field: 'type' }
                    },
                    tooltip: [{ field: 'name', type: 'nominal' }],
                    width: BAR.width,
                    height: BAR.height,
                    experimental: {
                        hovering: {
                            enableGroupHovering: true,
                            showHoveringOnTheBack: true,
                            color: '#E0E0E0',
                            stroke: '#E0E0E0',
                            strokeWidth: 4
                        }
                    }
                }
            ]
        },
        {
            xDomain: { interval: [1, 1000000000] },
            tracks: [
                {
                    title: 'Group Hovering By Chromosome',
                    ...CytoBands,
                    size: { value: 20 },
                    height: 60,
                    tooltip: [{ field: 'Chr.', type: 'nominal' }],
                    experimental: {
                        hovering: {
                            enableGroupHovering: true,
                            searchGroupByField: 'Chr.',
                            color: 'blue',
                            opacity: 0.5,
                            strokeWidth: 0
                        }
                    }
                }
            ]
        }
    ]
};

import { GoslingSpec } from '../../core/gosling.schema';
import { EX_TRACK_SEMANTIC_ZOOM } from './semantic-zoom';

export const EX_SPEC_PILEUP: GoslingSpec = {
    title: 'Pileup Track Using BAM Data',
    subtitle: '',
    static: false,
    layout: 'linear',
    centerRadius: 0.05,
    xDomain: { chromosome: '1', interval: [136750, 139450] },
    spacing: 0.01,
    tracks: [
        {
            title: 'Coverage',
            // prerelease: { testUsingNewRectRenderingForBAM: true },
            data: {
                type: 'bam',
                // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
                url: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam'
            },
            dataTransform: [{ type: 'coverage', startField: 'from', endField: 'to' }],
            mark: 'bar',
            x: { field: 'from', type: 'genomic' },
            xe: { field: 'to', type: 'genomic' },
            y: { field: 'coverage', type: 'quantitative', axis: 'right', grid: true },
            color: { value: 'lightgray' },
            stroke: { value: 'gray' },
            width: 650,
            height: 80
        },
        {
            ...EX_TRACK_SEMANTIC_ZOOM.sequence,
            style: { inlineLegend: true, textStrokeWidth: 0, outline: 'white' },
            width: 800,
            height: 40
        },
        {
            alignment: 'overlay',
            title: 'Reads',
            // prerelease: { testUsingNewRectRenderingForBAM: true },
            data: {
                type: 'bam',
                // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
                url: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam'
            },
            mark: 'rect',
            tracks: [
                {
                    dataTransform: [
                        {
                            type: 'displace',
                            method: 'pile',
                            boundingBox: {
                                startField: 'from',
                                endField: 'to',
                                groupField: 'strand',
                                padding: 5,
                                isPaddingBP: true
                            },
                            newField: 'pileup-row'
                        }
                    ],
                    x: { field: 'from', type: 'genomic' },
                    xe: { field: 'to', type: 'genomic' },
                    stroke: { value: 'gray' },
                    strokeWidth: { value: 0.5 }
                },
                {
                    dataTransform: [
                        {
                            type: 'displace',
                            method: 'pile',
                            boundingBox: {
                                startField: 'from',
                                endField: 'to',
                                groupField: 'strand',
                                padding: 5,
                                isPaddingBP: true
                            },
                            newField: 'pileup-row'
                        },
                        {
                            type: 'subjson',
                            field: 'substitutions',
                            genomicField: 'pos',
                            baseGenomicField: 'from',
                            genomicLengthField: 'length'
                        },
                        { type: 'filter', field: 'type', oneOf: ['sub'] }
                    ],
                    x: { field: 'pos_start', type: 'genomic' },
                    xe: { field: 'pos_end', type: 'genomic' },
                    color: {
                        field: 'variant',
                        type: 'nominal',
                        domain: ['A', 'T', 'G', 'C', 'S', 'H', 'X', 'I', 'D'],
                        legend: true
                    }
                }
            ],
            y: { field: 'pileup-row', type: 'nominal', flip: true },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'], padding: 1 },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['#97A8B2', '#D4C6BA'] },
            style: { outlineWidth: 0.5 },
            width: 1250,
            height: 650
        }
    ]
};

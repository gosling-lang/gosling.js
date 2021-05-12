import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_PILEUP: GoslingSpec = {
    title: 'BAM Data',
    subtitle: 'BAM Data',
    static: false,
    layout: 'linear',
    centerRadius: 0.05,
    xDomain: { chromosome: '1', interval: [136750, 139450] },
    spacing: 0.01,
    // xDomain: { chromosome: '1', interval: [0, 200000] },
    tracks: [
        {
            title: 'Coverage',
            prerelease: {testUsingNewRectRenderingForBAM: true},
            data: {
                type: 'bam',
                // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
                url: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam'
            },
            dataTransform: [{ type: 'coverage', startField: 'from', endField: 'to', groupField: 'strand'}],
            mark: 'bar',
            x: { field: 'from', type: 'genomic' },
            xe: { field: 'to', type: 'genomic' },
            y: { field: 'coverage', type: 'quantitative' },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['steelblue', 'salmon'] },
            width: 650,
            height: 80
        },
        {
            title: 'Reads',
            prerelease: {testUsingNewRectRenderingForBAM: true},
            data: {
                type: 'bam',
                // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
                url: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam'
            },
            dataTransform: [
                { type: 'displace', method: 'pile', boundingBox: {startField: 'from', endField: 'to', groupField: 'strand' }, newField: 'pileup-row' }
            ],
            mark: 'rect',
            x: { field: 'from', type: 'genomic' },
            xe: { field: 'to', type: 'genomic' },
            // displacement: {
            //     type: 'pile'
            // },
            y: { field: 'pileup-row', type: 'nominal', "flip": true },
            row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
            color: { field: 'strand', type: 'nominal', domain: ['+', '-'], range: ['steelblue', 'salmon'] },
            stroke: { value: 'black' },
            strokeWidth: { value: 0.01 },
            style: { outlineWidth: 0.5 },
            width: 650,
            height: 450
        }
    ]
};

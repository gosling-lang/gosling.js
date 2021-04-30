import { GoslingSpec } from '../../core/gosling.schema';

export const EX_SPEC_PILEUP: GoslingSpec = {
    title: 'BAM Data',
    subtitle: 'BAM Data',
    static: false,
    layout: 'linear',
    centerRadius: 0.05,
    tracks: [
        {
            data: {
                type: 'bam',
                url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
            },
            mark: 'point',
            // x: { field: 'BP', type: 'genomic' },
            // y: { field: 'TRAIT', type: 'nominal' },
            // row: { field: 'CATEGORY', type: 'nominal', domain: colorDomain },
            // color: { field: 'CATEGORY', type: 'nominal', domain: colorDomain, range: colorRange },
            // size: { value: 3 },
            // stroke: { value: 'black' },
            // strokeWidth: { value: 0.5 },
            style: { outlineWidth: 0.5 },
            width: 550,
            height: 200
        }
    ]
};

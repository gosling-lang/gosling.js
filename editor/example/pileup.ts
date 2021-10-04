import type { Domain, DomainGene, GoslingSpec, View } from '@gosling.schema';
import { EX_TRACK_SEMANTIC_ZOOM } from './semantic-zoom';

export function EX_SPEC_VIEW_PILEUP(
    id: string,
    width: number,
    height: number,
    xDomain: Exclude<Domain, string[] | number[] | DomainGene>,
    strandColor?: [number, number]
): View {
    return {
        static: false,
        layout: 'linear',
        centerRadius: 0.05,
        xDomain: xDomain,
        spacing: 0.01,
        tracks: [
            {
                alignment: 'overlay',
                title: 'Reads',
                data: {
                    type: 'bam',
                    // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam'
                    url: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam',
                    indexUrl: 'https://aveit.s3.amazonaws.com/higlass/bam/example_higlass.bam.bai'
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
                                    padding: 5,
                                    isPaddingBP: true
                                },
                                newField: 'pileup-row'
                            }
                        ],
                        x: { field: 'from', type: 'genomic' },
                        xe: { field: 'to', type: 'genomic' },
                        stroke: { value: 'white' },
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
                                    padding: 5,
                                    isPaddingBP: true
                                },
                                newField: 'pileup-row'
                            },
                            {
                                type: 'filter',
                                field: 'name',
                                oneOf: ['SRR4435251::::1369431']
                            }
                        ],
                        x: { field: 'from', type: 'genomic' },
                        xe: { field: 'to', type: 'genomic' },
                        stroke: { value: 'white' },
                        strokeWidth: { value: 0.5 },
                        color: { value: 'red' }
                    }
                ],
                y: { field: 'pileup-row', type: 'nominal', flip: false },
                color: { value: 'lightgray' },
                style: { outlineWidth: 0.5 },
                width,
                height
            }
        ]
    };
}

export const EX_SPEC_PILEUP: GoslingSpec = {
    title: 'Pileup Track Using BAM Data',
    subtitle: '',
    ...EX_SPEC_VIEW_PILEUP('bam', 1250, 600, { chromosome: '1', interval: [136750, 139450] })
};

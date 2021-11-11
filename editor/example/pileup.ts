import type { Domain, DomainGene, GoslingSpec, View } from '@gosling.schema';
// import { EX_TRACK_SEMANTIC_ZOOM } from './semantic-zoom';

export function EX_SPEC_VIEW_PILEUP(
    id: string,
    width: number,
    height: number,
    xDomain: Exclude<Domain, string[] | number[] | DomainGene>
    // strandColor?: [number, number]
): View {
    const maxInsertSize = 300;
    return {
        static: false,
        layout: 'linear',
        centerRadius: 0.05,
        xDomain: xDomain,
        spacing: 0.01,
        tracks: [
            // {
            //     alignment: 'overlay',
            //     title: 'example_higlass.bam',
            //     data: {
            //         type: 'bam',
            //         url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam', // https://s3.amazonaws.com/gosling-lang.org/data/SV/PCAWG.c8e7bbdb-6d87-445f-bf43-dbf88805b1ed.bam',
            //         indexUrl: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam.bai', // https://s3.amazonaws.com/gosling-lang.org/data/SV/PCAWG.c8e7bbdb-6d87-445f-bf43-dbf88805b1ed.bam.bai',
            //         loadMates: true
            //     },
            //     mark: 'bar',
            //     tracks: [
            //         {
            //             dataTransform: [
            //                 {
            //                     type: 'coverage',
            //                     startField: 'from',
            //                     endField: 'to'
            //                 }
            //             ],
            //             x: { field: 'from', type: 'genomic' },
            //             xe: { field: 'to', type: 'genomic' },
            //             y: { field: 'coverage', type: 'quantitative', axis: 'right' },
            //             color: { value: '#C6C6C6' }
            //         }
            //     ],
            //     style: { outlineWidth: 0.5 },
            //     width,
            //     height: 80
            // },
            {
                alignment: 'overlay',
                // title: 'example_higlass.bam',
                data: {
                    type: 'bam',
                    // url: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam',
                    // indexUrl: 'https://s3.amazonaws.com/gosling-lang.org/data/example_higlass.bam.bai',
                    url: 'https://s3.amazonaws.com/gosling-lang.org/data/PCAWG.00e7f3bd-5c87-40c2-aeb6-4e4ca4a8e720.bam', // https://s3.amazonaws.com/gosling-lang.org/data/SV/PCAWG.c8e7bbdb-6d87-445f-bf43-dbf88805b1ed.bam',
                    indexUrl:
                        'https://s3.amazonaws.com/gosling-lang.org/data/PCAWG.00e7f3bd-5c87-40c2-aeb6-4e4ca4a8e720.bam.bai', //'https://s3.amazonaws.com/gosling-lang.org/data/SV/PCAWG.c8e7bbdb-6d87-445f-bf43-dbf88805b1ed.bam.bai',
                    loadMates: true,
                    maxInsertSize
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
                        color: [
                            {
                                field: 'svType',
                                type: 'nominal',
                                legend: true,
                                domain: [
                                    'normal read',
                                    'deletion (+-)',
                                    'inversion (++)',
                                    'inversion (--)',
                                    'duplication (-+)',
                                    'more than two mates',
                                    'mates not found within chromosome',
                                    'clipping'
                                ],
                                range: [
                                    '#C8C8C8',
                                    '#E79F00',
                                    '#029F73',
                                    '#0072B2',
                                    '#CB7AA7',
                                    '#57B4E9',
                                    '#D61E2E',
                                    '#414141'
                                ]
                            },
                            {
                                field: 'insertSize',
                                type: 'quantitative',
                                legend: true
                            }
                        ][0]
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
                                type: 'subjson',
                                field: 'substitutions',
                                genomicField: 'pos',
                                baseGenomicField: 'from',
                                genomicLengthField: 'length'
                            },
                            { type: 'filter', field: 'type', oneOf: ['S', 'H'] }
                        ],
                        x: { field: 'pos_start', type: 'genomic' },
                        xe: { field: 'pos_end', type: 'genomic' },
                        color: { value: '#414141' }
                    }
                ],
                tooltip: [
                    { field: 'from', type: 'genomic' },
                    { field: 'to', type: 'genomic' },
                    { field: 'insertSize', type: 'quantitative' },
                    { field: 'svType', type: 'nominal' },
                    { field: 'strand', type: 'nominal' },
                    { field: 'numMates', type: 'quantitative' },
                    { field: 'mateIds', type: 'nominal' }
                ],
                row: { field: 'pileup-row', type: 'nominal', padding: 0.2 },
                // stroke: { value: 'grey' },
                // strokeWidth: { value: 0.5 },
                style: { outlineWidth: 0.5, legendTitle: `Insert Size = ${maxInsertSize}bp` },
                width,
                height
            }
        ]
    };
}

export const EX_SPEC_PILEUP: GoslingSpec = {
    // title: 'Pileup Track Using BAM Data',
    // subtitle: '',
    // ...EX_SPEC_VIEW_PILEUP('bam', 1250, 600, { chromosome: '1', interval: [136750, 139450] })
    ...EX_SPEC_VIEW_PILEUP('bam', 1250, 600, { chromosome: '1', interval: [98000, 101000] })
};

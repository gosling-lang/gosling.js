import { GeminidSpec, Track } from '../../core/geminid.schema';

export const EXAMPLE_2019_WENGER_TRACK: Track = {
    description: 'https://www.ncbi.nlm.nih.gov/dbvar/browse/org/?assm=GCF_000001405.25&studies=nstd167',
    data: {
        type: 'csv',
        url: 'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/variants_for_nstd167.csv',
        chromosomeField: 'Chromosome',
        genomicFields: ['Start', 'End']
    },
    tooltip: [
        { field: 'Study ID', type: 'nominal' },
        { field: 'Variant ID', type: 'nominal' },
        { field: 'Chromosome', type: 'nominal' },
        { field: 'Start', type: 'genomic' },
        { field: 'End', type: 'genomic' },
        { field: 'Variant Region type', type: 'nominal' }
    ],
    mark: 'rect',
    x: { field: 'Start', type: 'genomic', axis: 'top', domain: { chromosome: '1' } },
    xe: { field: 'End', type: 'genomic' },
    color: {
        field: 'Variant Region type',
        type: 'nominal',
        domain: ['insertion', 'copy number variation'],
        range: ['blue', 'red'],
        legend: true
    },
    stackY: true,
    stroke: {
        field: 'Variant Region type',
        type: 'nominal',
        domain: ['insertion', 'copy number variation'],
        range: ['blue', 'red'],
        legend: true
    },
    strokeWidth: { value: 0.5 },
    opacity: { value: 0.6 },
    outerRadius: 130,
    innerRadius: 10
};

export const EXAMPLE_2019_WENGER: GeminidSpec = {
    title: 'Wenger et al. 2019 (nstd167)',
    subtitle: 'Data is from https://www.ncbi.nlm.nih.gov/dbvar/browse/org/?assm=GCF_000001405.25&studies=nstd167',
    layout: 'linear',
    arrangement: {
        direction: 'vertical',
        columnSizes: 800,
        rowSizes: [200, 300]
    },
    tracks: [
        EXAMPLE_2019_WENGER_TRACK,
        {
            ...EXAMPLE_2019_WENGER_TRACK,
            x: { ...EXAMPLE_2019_WENGER_TRACK.x, axis: undefined },
            layout: 'circular'
        }
    ]
};

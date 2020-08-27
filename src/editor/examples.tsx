import { GeminiSpec } from '../lib/gemini.schema';
import {
    GEMINI_TRACK_EXAMPLE,
    GEMINI_TRACK_EXAMPLE2,
    GEMINI_TRACK_EXAMPLE3,
    GEMINI_PLUGIN_TRACK_BASIC_MARKS,
    GEMINI_PLUGIN_TRACK_SUPERPOSE
} from '../lib/test/gemini/layout-examples';

interface Demo {
    name: string;
    spec: GeminiSpec;
    glyphWidth: number;
    glyphHeight: number;
}

export const demos: ReadonlyArray<Demo> = [
    {
        name: 'Basic Marks (HiGlass Gemini Plugin Track)',
        spec: GEMINI_PLUGIN_TRACK_BASIC_MARKS,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Superposed Tracks (HiGlass Gemini Plugin Track)',
        spec: GEMINI_PLUGIN_TRACK_SUPERPOSE,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Cytogenetic Band',
        spec: {
            tracks: [
                {
                    data: {
                        url:
                            'https://raw.githubusercontent.com/sehilyi/gemini-datasets/master/data/chr1_cytogenetic_band.glyph.csv',
                        type: 'csv',
                        quantitativeFields: [
                            'Band',
                            'ISCN_start',
                            'ISCN_stop',
                            'Basepair_start',
                            'Basepair_stop',
                            'Density'
                        ]
                    },
                    superpose: [
                        // {
                        //     mark: 'text',
                        //     text: { field: 'Band', type: 'nominal' }
                        // },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: { field: 'Band', oneOf: [11, 11.1], not: true }
                            },
                            color: {
                                field: 'Density',
                                type: 'nominal',
                                domain: ['', '25', '50', '75', '100'],
                                range: ['white', '#D9D9D9', '#979797', '#636363', 'black']
                            }
                        },
                        {
                            mark: 'rect',
                            dataTransform: {
                                filter: { field: 'Stain', oneOf: ['gvar'], not: false }
                            },
                            color: { value: '#A0A0F2' }
                        },
                        {
                            mark: 'triangle-l',
                            dataTransform: {
                                filter: { field: 'Band', oneOf: [11], not: false }
                            },
                            color: { value: '#B40101' }
                        },
                        {
                            mark: 'triangle-r',
                            dataTransform: {
                                filter: { field: 'Band', oneOf: [11.1], not: false }
                            },
                            color: { value: '#B40101' }
                        }
                    ],
                    x: { field: 'Basepair_start', type: 'genomic', domain: { chromosome: '1' } },
                    xe: { field: 'Basepair_stop', type: 'genomic' },
                    x1: { axis: true },
                    stroke: { value: 'black' },
                    strokeWidth: { value: 0.5 },
                    width: 1000,
                    height: 60
                }
            ]
        } as GeminiSpec,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 1)',
        spec: GEMINI_TRACK_EXAMPLE,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 2)',
        spec: GEMINI_TRACK_EXAMPLE2,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'HiGlass Gemini Track (zoom action example 3)',
        spec: GEMINI_TRACK_EXAMPLE3,
        glyphWidth: 0,
        glyphHeight: 0
    }
    /*
    // old demos that we will need to support again in the future
    {
        name: 'Gene Annotation Plot (Simple)',
        spec: GENE_ANNOTATION_PLOT_SIMPLE,
        glyphWidth: 300,
        glyphHeight: 150
    },
    {
        name: 'Gene Annotation Plot',
        spec: GENE_ANNOTATION_PLOT,
        glyphWidth: 600,
        glyphHeight: 150
    },
    {
        name: 'Cytogenetic Band',
        spec: CYTOGENETIC_BAND,
        glyphWidth: 900,
        glyphHeight: 150
    },
    {
        name: 'Six Different Between-Links',
        spec: LAYOUT_EXAMPLE_LINK,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Links (Combo)',
        spec: LAYOUT_EXAMPLE_COMBO,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Links (Combo, Horizontal)',
        spec: LAYOUT_EXAMPLE_COMBO_HORIZONTAL,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Stacked Multiple Tracks',
        spec: LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Stacked Multiple Tracks (Circular)',
        spec: LAYOUT_EXAMPLE_STACKED_MULTI_TRACKS_CIRCULAR,
        glyphWidth: 0,
        glyphHeight: 0
    },
    {
        name: 'Between-Bands (HiGlass Tracks)',
        spec: LAYOUT_EXAMPLE_COMBO_BAND,
        glyphWidth: 0,
        glyphHeight: 0
    }
    */
] as const;

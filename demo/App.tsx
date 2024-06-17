import React, { useState, useEffect } from 'react';
import { PixiManager } from '@pixi-manager';
import {
    addDummyTrack,
    addTextTrack,
    addCircularBrush,
    addGoslingTrack,
    addAxisTrack,
    addLinearBrush,
    addBigwig
} from './examples';
import { compile } from '../src/compiler/compile';
import { getTheme } from '../src/core/utils/theme';

import './App.css';
import type { HiGlassSpec } from '@gosling-lang/higlass-schema';
import { trackInfoToTracks } from './trackInfoToCanvas';
import type { TrackInfo } from 'src/compiler/bounding-box';

function App() {
    const [fps, setFps] = useState(120);

    useEffect(() => {
        // Create the new plot
        const plotElement = document.getElementById('plot') as HTMLDivElement;
        plotElement.innerHTML = '';
        // Initialize the PixiManager. This will be used to get containers and overlay divs for the plots
        const pixiManager = new PixiManager(1000, 600, plotElement, setFps);
        // addTextTrack(pixiManager);
        // addDummyTrack(pixiManager);
        // addCircularBrush(pixiManager);
        // addGoslingTrack(pixiManager);
        // addAxisTrack(pixiManager);
        // addLinearBrush(pixiManager);
        // addBigwig(pixiManager);

        const callback = (
            hg: HiGlassSpec,
            size,
            gs,
            tracksAndViews,
            idTable,
            trackInfos: TrackInfo[],
            theme: Require<ThemeDeep>
        ) => {
            // console.warn(hg);
            // console.warn(idTable);
            // console.warn(tracksAndViews);
            // drawFromHgSpec(hg, pixiManager);
            console.warn(trackInfos);
            // trackInfoToCanvas(trackInfos, pixiManager, theme);
            trackInfoToTracks(trackInfos, pixiManager, theme);
        };

        // Compile the spec
        compile(spec, callback, [], getTheme('light'), { containerSize: { width: 300, height: 300 } });
    }, []);

    return (
        <>
            <h1>HiGlass/Gosling tracks with new renderer</h1>

            <div className="card">
                <div className="card" id="plot"></div>
            </div>
        </>
    );
}

export default App;

const spec = {
    title: 'Basic Marks: line',
    subtitle: 'Tutorial Examples',
    layout: 'linear',
    tracks: [
        {
            layout: 'circular',
            width: 500,
            height: 180,
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'line',
            x: { field: 'position', type: 'genomic', axis: 'top' },
            y: { field: 'peak', type: 'quantitative', axis: 'right' },
            size: { value: 2 }
        },
        {
            layout: 'circular',
            width: 500,
            height: 180,
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', axis: 'top' },
            y: { field: 'peak', type: 'quantitative', axis: 'right' },
            size: { value: 2 }
        }
    ]
};
const spec2 = {
    layout: 'linear',
    xDomain: { chromosome: 'chr3', interval: [52168000, 52890000] },
    arrangement: 'horizontal',
    views: [
        {
            arrangement: 'vertical',
            views: [
                {
                    alignment: 'overlay',
                    title: 'HiGlass',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -15 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 15 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' },
                            style: { linePattern: { type: 'triangleRight', size: 5 } }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' },
                            style: { linePattern: { type: 'triangleLeft', size: 5 } }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['#7585FF', '#FF8A85']
                    },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    opacity: { value: 0.8 },
                    width: 350,
                    height: 100
                },
                {
                    alignment: 'overlay',
                    title: 'Corces et al.',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            size: { value: 8 },
                            style: { textFontSize: 8, dy: -12 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            size: { value: 8 },
                            style: { textFontSize: 8, dy: 10 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rect',
                            x: { field: 'end', type: 'genomic' },
                            size: { value: 7 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            size: { value: 7 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            size: { value: 14 }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            strokeWidth: { value: 3 }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['#012DB8', '#BE1E2C']
                    },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                },
                {
                    alignment: 'overlay',
                    title: 'IGV',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 15 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 0 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'white' },
                            opacity: { value: 0.6 },
                            style: { linePattern: { type: 'triangleLeft', size: 10 } }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 0 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'white' },
                            opacity: { value: 0.6 },
                            style: { linePattern: { type: 'triangleRight', size: 10 } }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: { value: '#0900B1' },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                }
            ]
        },
        {
            arrangement: 'vertical',
            views: [
                {
                    alignment: 'overlay',
                    title: 'Cyverse-QUBES',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'black' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            color: { value: '#999999' }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            color: { value: '#999999' },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'lightgray' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 5 },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: 'gray' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#E2A6F5' },
                            stroke: { value: '#BB57C9' },
                            strokeWidth: { value: 1 }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    size: { value: 15 },
                    width: 350,
                    height: 100
                },
                {
                    alignment: 'overlay',
                    title: 'GmGDV',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            style: { dy: -14 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['+'] }
                            ],
                            mark: 'triangleRight',
                            x: { field: 'end', type: 'genomic', axis: 'top' },
                            size: { value: 15 }
                        },
                        {
                            dataTransform: [
                                { type: 'filter', field: 'type', oneOf: ['gene'] },
                                { type: 'filter', field: 'strand', oneOf: ['-'] }
                            ],
                            mark: 'triangleLeft',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 15 },
                            style: { align: 'right' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            size: { value: 10 },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rule',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            strokeWidth: { value: 3 },
                            xe: { field: 'end', type: 'genomic' }
                        }
                    ],
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    color: {
                        field: 'strand',
                        type: 'nominal',
                        domain: ['+', '-'],
                        range: ['blue', 'red']
                    },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                },
                {
                    alignment: 'overlay',
                    data: {
                        url: 'https://server.gosling-lang.org/api/v1/tileset_info/?d=gene-annotation',
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
                    tracks: [
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'text',
                            text: { field: 'name', type: 'nominal' },
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            color: { value: 'black' },
                            xe: { field: 'end', type: 'genomic' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['gene'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#666666' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['exon'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#FF6666' }
                        },
                        {
                            dataTransform: [{ type: 'filter', field: 'type', oneOf: ['intron'] }],
                            mark: 'rect',
                            x: { field: 'start', type: 'genomic', axis: 'top' },
                            xe: { field: 'end', type: 'genomic' },
                            color: { value: '#99FEFF' }
                        }
                    ],
                    size: { value: 30 },
                    row: { field: 'strand', type: 'nominal', domain: ['+', '-'] },
                    stroke: { value: '#777777' },
                    strokeWidth: { value: 1 },
                    visibility: [
                        {
                            operation: 'less-than',
                            measure: 'width',
                            threshold: '|xe-x|',
                            transitionPadding: 10,
                            target: 'mark'
                        }
                    ],
                    width: 350,
                    height: 100
                }
            ]
        }
    ]
};
const spec3 = {
    title: 'Basic Marks: bar',
    subtitle: 'Tutorial Examples',
    orientation: 'horizontal',
    tracks: [
        {
            layout: 'linear',
            width: 180,
            height: 800,
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1'],
                binSize: 5
            },
            mark: 'bar',
            x: { field: 'start', type: 'genomic', axis: 'bottom' },
            xe: { field: 'end', type: 'genomic' },
            y: { field: 'peak', type: 'quantitative', axis: 'right' },
            size: { value: 5 }
        }
    ]
};

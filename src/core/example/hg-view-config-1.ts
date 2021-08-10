const example = {
    compactLayout: false,
    trackSourceServers: ['https://server.gosling-lang.org/api/v1/'],
    views: [
        {
            genomePositionSearchBoxVisible: false,
            genomePositionSearchBox: {
                autocompleteServer: 'https://higlass.io/api/v1',
                autocompleteId: 'P0PLbQMwTYGy-5uPIQid7A',
                chromInfoServer: 'https://higlass.io/api/v1',
                chromInfoId: 'hg38'
            },
            layout: { x: 0, y: 0, w: 6.4, h: 600 },
            tracks: {
                top: [],
                left: [
                    {
                        type: 'combined',
                        width: 130,
                        height: 600,
                        contents: [
                            {
                                type: 'gosling-track',
                                server: 'https://server.gosling-lang.org/api/v1/',
                                tilesetUid: 'cistrome-multivec',
                                width: 130,
                                height: 600,
                                options: {
                                    showMousePosition: true,
                                    mousePositionColor: '#000000',
                                    fontSize: 24,
                                    labelPosition: 'none',
                                    labelShowResolution: false,
                                    labelColor: 'black',
                                    labelBackgroundColor: 'white',
                                    labelTextOpacity: 1,
                                    labelLeftMargin: 1,
                                    labelTopMargin: 1,
                                    labelRightMargin: 0,
                                    labelBottomMargin: 0,
                                    backgroundColor: 'transparent',
                                    spec: {
                                        spacing: 10,
                                        orientation: 'vertical',
                                        assembly: 'hg38',
                                        layout: 'linear',
                                        static: false,
                                        xDomain: { interval: [0, 1000000000] },
                                        centerRadius: 0.3,
                                        xOffset: 0,
                                        yOffset: 0,
                                        style: { outlineWidth: 0.5 },
                                        data: {
                                            url:
                                                'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                                            type: 'multivec',
                                            row: 'sample',
                                            column: 'position',
                                            value: 'peak',
                                            categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                                            binSize: 4
                                        },
                                        mark: 'rect',
                                        x: {
                                            field: 'start',
                                            type: 'genomic',
                                            axis: 'left',
                                            domain: { interval: [0, 1000000000] },
                                            linkingId: '7f94b74e-25ec-4e67-8c75-3dc0f1b0d6bd'
                                        },
                                        xe: { field: 'end', type: 'genomic' },
                                        row: {
                                            field: 'sample',
                                            type: 'nominal',
                                            legend: true
                                        },
                                        color: {
                                            field: 'peak',
                                            type: 'quantitative',
                                            legend: true
                                        },
                                        tooltip: [
                                            {
                                                field: 'start',
                                                type: 'genomic',
                                                alt: 'Start Position'
                                            },
                                            {
                                                field: 'end',
                                                type: 'genomic',
                                                alt: 'End Position'
                                            },
                                            {
                                                field: 'peak',
                                                type: 'quantitative',
                                                alt: 'Value',
                                                format: '.2'
                                            },
                                            { field: 'sample', type: 'nominal', alt: 'Sample' }
                                        ],
                                        width: 160,
                                        height: 600,
                                        overlayOnPreviousTrack: false
                                    },
                                    theme: {
                                        base: 'light',
                                        root: {
                                            background: 'white',
                                            titleColor: 'black',
                                            titleBackgroundColor: 'transparent',
                                            titleFontSize: 18,
                                            titleFontFamily: 'Arial',
                                            titleAlign: 'left',
                                            titleFontWeight: 'bold',
                                            subtitleColor: 'gray',
                                            subtitleBackgroundColor: 'transparent',
                                            subtitleFontSize: 16,
                                            subtitleFontFamily: 'Arial',
                                            subtitleFontWeight: 'normal',
                                            subtitleAlign: 'left',
                                            mousePositionColor: '#000000'
                                        },
                                        track: {
                                            background: 'transparent',
                                            alternatingBackground: 'transparent',
                                            titleColor: 'black',
                                            titleBackground: 'white',
                                            titleFontSize: 24,
                                            titleAlign: 'left',
                                            outline: 'black',
                                            outlineWidth: 1
                                        },
                                        legend: {
                                            position: 'top',
                                            background: 'white',
                                            backgroundOpacity: 0.7,
                                            labelColor: 'black',
                                            labelFontSize: 12,
                                            labelFontWeight: 'normal',
                                            labelFontFamily: 'Arial',
                                            backgroundStroke: '#DBDBDB',
                                            tickColor: 'black'
                                        },
                                        axis: {
                                            tickColor: 'black',
                                            labelColor: 'black',
                                            labelFontSize: 12,
                                            labelFontWeight: 'normal',
                                            labelFontFamily: 'Arial',
                                            baselineColor: 'black',
                                            gridColor: '#E3E3E3',
                                            gridStrokeWidth: 1,
                                            gridStrokeType: 'solid',
                                            gridStrokeDash: [4, 4]
                                        },
                                        markCommon: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        point: {
                                            color: '#E79F00',
                                            size: 3,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        rect: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        triangle: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        area: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        line: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        bar: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        rule: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        link: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        text: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6],
                                            textAnchor: 'middle',
                                            textFontWeight: 'normal'
                                        },
                                        brush: {
                                            color: 'gray',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 0.3,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        }
                                    }
                                }
                            }
                        ]
                    },
                    {
                        uid: '15483511-f6fb-11eb-914b-976b6ecda162',
                        type: 'axis-track',
                        chromInfoPath: 'https://s3.amazonaws.com/gosling-lang.org/data/hg38.chrom.sizes',
                        options: {
                            layout: 'linear',
                            outerRadius: null,
                            width: 160,
                            height: 600,
                            theme: {
                                base: 'light',
                                root: {
                                    background: 'white',
                                    titleColor: 'black',
                                    titleBackgroundColor: 'transparent',
                                    titleFontSize: 18,
                                    titleFontFamily: 'Arial',
                                    titleAlign: 'left',
                                    titleFontWeight: 'bold',
                                    subtitleColor: 'gray',
                                    subtitleBackgroundColor: 'transparent',
                                    subtitleFontSize: 16,
                                    subtitleFontFamily: 'Arial',
                                    subtitleFontWeight: 'normal',
                                    subtitleAlign: 'left',
                                    mousePositionColor: '#000000'
                                },
                                track: {
                                    background: 'transparent',
                                    alternatingBackground: 'transparent',
                                    titleColor: 'black',
                                    titleBackground: 'white',
                                    titleFontSize: 24,
                                    titleAlign: 'left',
                                    outline: 'black',
                                    outlineWidth: 1
                                },
                                legend: {
                                    position: 'top',
                                    background: 'white',
                                    backgroundOpacity: 0.7,
                                    labelColor: 'black',
                                    labelFontSize: 12,
                                    labelFontWeight: 'normal',
                                    labelFontFamily: 'Arial',
                                    backgroundStroke: '#DBDBDB',
                                    tickColor: 'black'
                                },
                                axis: {
                                    tickColor: 'black',
                                    labelColor: 'black',
                                    labelFontSize: 12,
                                    labelFontWeight: 'normal',
                                    labelFontFamily: 'Arial',
                                    baselineColor: 'black',
                                    gridColor: '#E3E3E3',
                                    gridStrokeWidth: 1,
                                    gridStrokeType: 'solid',
                                    gridStrokeDash: [4, 4]
                                },
                                markCommon: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                point: {
                                    color: '#E79F00',
                                    size: 3,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                rect: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                triangle: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                area: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                line: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                bar: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                rule: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 1,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                link: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 1,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                },
                                text: {
                                    color: '#E79F00',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 0,
                                    opacity: 1,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6],
                                    textAnchor: 'middle',
                                    textFontWeight: 'normal'
                                },
                                brush: {
                                    color: 'gray',
                                    size: 1,
                                    stroke: 'black',
                                    strokeWidth: 1,
                                    opacity: 0.3,
                                    nominalColorRange: [
                                        '#E79F00',
                                        '#029F73',
                                        '#0072B2',
                                        '#CB7AA7',
                                        '#D45E00',
                                        '#57B4E9',
                                        '#EFE441'
                                    ],
                                    quantitativeSizeRange: [2, 6]
                                }
                            },
                            assembly: 'hg38',
                            stroke: 'transparent',
                            color: 'black',
                            fontSize: 12,
                            fontFamily: 'Arial',
                            fontWeight: 'normal',
                            tickColor: 'black',
                            tickFormat: 'plain',
                            tickPositions: 'even',
                            reverseOrientation: false
                        },
                        width: 30
                    }
                ],
                center: [],
                right: [],
                bottom: [],
                gallery: [],
                whole: []
            },
            initialXDomain: [0, 1000000000],
            initialYDomain: [0, 1000000000],
            zoomFixed: false,
            zoomLimits: [1, null],
            uid: '15483510-f6fb-11eb-914b-976b6ecda162',
            chromInfoPath: 'https://s3.amazonaws.com/gosling-lang.org/data/hg38.chrom.sizes'
        },
        {
            genomePositionSearchBoxVisible: false,
            genomePositionSearchBox: {
                autocompleteServer: 'https://higlass.io/api/v1',
                autocompleteId: 'P0PLbQMwTYGy-5uPIQid7A',
                chromInfoServer: 'https://higlass.io/api/v1',
                chromInfoId: 'hg38'
            },
            layout: { x: 6.8, y: 0, w: 5.2, h: 600 },
            tracks: {
                top: [],
                left: [
                    {
                        type: 'combined',
                        width: 130,
                        height: 600,
                        contents: [
                            {
                                type: 'gosling-track',
                                server: 'https://server.gosling-lang.org/api/v1/',
                                tilesetUid: 'cistrome-multivec',
                                width: 130,
                                height: 600,
                                options: {
                                    showMousePosition: true,
                                    mousePositionColor: '#000000',
                                    fontSize: 24,
                                    labelPosition: 'none',
                                    labelShowResolution: false,
                                    labelColor: 'black',
                                    labelBackgroundColor: 'white',
                                    labelTextOpacity: 1,
                                    labelLeftMargin: 1,
                                    labelTopMargin: 1,
                                    labelRightMargin: 0,
                                    labelBottomMargin: 0,
                                    backgroundColor: 'transparent',
                                    spec: {
                                        spacing: 10,
                                        orientation: 'vertical',
                                        assembly: 'hg38',
                                        layout: 'linear',
                                        static: false,
                                        xDomain: { interval: [0, 1000000000] },
                                        centerRadius: 0.3,
                                        xOffset: 0,
                                        yOffset: 0,
                                        style: { outlineWidth: 0.5 },
                                        data: {
                                            url:
                                                'https://server.gosling-lang.org/api/v1/tileset_info/?d=cistrome-multivec',
                                            type: 'multivec',
                                            row: 'sample',
                                            column: 'position',
                                            value: 'peak',
                                            categories: ['sample 1', 'sample 2', 'sample 3', 'sample 4'],
                                            binSize: 4
                                        },
                                        mark: 'rect',
                                        x: {
                                            field: 'start',
                                            type: 'genomic',
                                            domain: { interval: [0, 1000000000] },
                                            linkingId: '7f94b74e-25ec-4e67-8c75-3dc0f1b0d6bd'
                                        },
                                        xe: { field: 'end', type: 'genomic' },
                                        row: {
                                            field: 'sample',
                                            type: 'nominal',
                                            legend: true
                                        },
                                        color: {
                                            field: 'peak',
                                            type: 'quantitative',
                                            legend: true
                                        },
                                        tooltip: [
                                            {
                                                field: 'start',
                                                type: 'genomic',
                                                alt: 'Start Position'
                                            },
                                            {
                                                field: 'end',
                                                type: 'genomic',
                                                alt: 'End Position'
                                            },
                                            {
                                                field: 'peak',
                                                type: 'quantitative',
                                                alt: 'Value',
                                                format: '.2'
                                            },
                                            { field: 'sample', type: 'nominal', alt: 'Sample' }
                                        ],
                                        width: 130,
                                        height: 600
                                    },
                                    theme: {
                                        base: 'light',
                                        root: {
                                            background: 'white',
                                            titleColor: 'black',
                                            titleBackgroundColor: 'transparent',
                                            titleFontSize: 18,
                                            titleFontFamily: 'Arial',
                                            titleAlign: 'left',
                                            titleFontWeight: 'bold',
                                            subtitleColor: 'gray',
                                            subtitleBackgroundColor: 'transparent',
                                            subtitleFontSize: 16,
                                            subtitleFontFamily: 'Arial',
                                            subtitleFontWeight: 'normal',
                                            subtitleAlign: 'left',
                                            mousePositionColor: '#000000'
                                        },
                                        track: {
                                            background: 'transparent',
                                            alternatingBackground: 'transparent',
                                            titleColor: 'black',
                                            titleBackground: 'white',
                                            titleFontSize: 24,
                                            titleAlign: 'left',
                                            outline: 'black',
                                            outlineWidth: 1
                                        },
                                        legend: {
                                            position: 'top',
                                            background: 'white',
                                            backgroundOpacity: 0.7,
                                            labelColor: 'black',
                                            labelFontSize: 12,
                                            labelFontWeight: 'normal',
                                            labelFontFamily: 'Arial',
                                            backgroundStroke: '#DBDBDB',
                                            tickColor: 'black'
                                        },
                                        axis: {
                                            tickColor: 'black',
                                            labelColor: 'black',
                                            labelFontSize: 12,
                                            labelFontWeight: 'normal',
                                            labelFontFamily: 'Arial',
                                            baselineColor: 'black',
                                            gridColor: '#E3E3E3',
                                            gridStrokeWidth: 1,
                                            gridStrokeType: 'solid',
                                            gridStrokeDash: [4, 4]
                                        },
                                        markCommon: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        point: {
                                            color: '#E79F00',
                                            size: 3,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        rect: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        triangle: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        area: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        line: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        bar: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        rule: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        link: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        },
                                        text: {
                                            color: '#E79F00',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 0,
                                            opacity: 1,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6],
                                            textAnchor: 'middle',
                                            textFontWeight: 'normal'
                                        },
                                        brush: {
                                            color: 'gray',
                                            size: 1,
                                            stroke: 'black',
                                            strokeWidth: 1,
                                            opacity: 0.3,
                                            nominalColorRange: [
                                                '#E79F00',
                                                '#029F73',
                                                '#0072B2',
                                                '#CB7AA7',
                                                '#D45E00',
                                                '#57B4E9',
                                                '#EFE441'
                                            ],
                                            quantitativeSizeRange: [2, 6]
                                        }
                                    }
                                }
                            }
                        ]
                    }
                ],
                center: [],
                right: [],
                bottom: [],
                gallery: [],
                whole: []
            },
            initialXDomain: [0, 1000000000],
            initialYDomain: [0, 1000000000],
            zoomFixed: false,
            zoomLimits: [1, null],
            uid: '154b1b40-f6fb-11eb-914b-976b6ecda162'
        }
    ],
    zoomLocks: { locksByViewUid: {}, locksDict: {} },
    locationLocks: { locksByViewUid: {}, locksDict: {} },
    editable: false,
    chromInfoPath: 'https://s3.amazonaws.com/gosling-lang.org/data/hg38.chrom.sizes'
};

export default example;

const NOMINAL_COLOR = ['#CD9B1D', '#8A668B', '#40E0D0', '#FF6969', '#666666', '#FAC902','#FE0000','#CC96CD', '#D9D9D9' /*'#000000'*/];

const EnsemblThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const ensembl = {
    base: 'ensembl',

    root: {
        background: 'white',
        titleColor: '#494949',
        titleFontSize:24,
        titleFontFamily:'GGX88',
        titleAlign:'left',
        titleFontWeight:'bold',
        titleBackgroundColor:'white',
        subtitleColor: 'white',
        subtitleFontSize:19,
        subtitleFontFamily:'GGX88',
        subtitleAlign:'left',
        subtitleFontWeight:'normal',
        subtitleBackgroundColor:'#7B8BAF',
        mousePositionColor: '#FE0000',
        showMousePosition: true
    },

    track: {
        background:'white',
        alternatingBackground:'#fffdf7',
        titleColor: 'black',
        titleBackground: 'white',
        titleFontSize:'normal',
        titleAlign:'left',
        outline: '#7B8BAF',
        outlineWidth: 2
    },

    legend: {
        position:'middle',
        tickColor: 'black',
        labelColor: 'black',
        //labelFontSize: ,
        labelFontWeight: 'normal',
        labelFontFamily: 'GGX88',
        background: 'white',
        backgroundOpacity: 2,
        backgroundStroke: 'lightgray'
        
    },

    axis: {
        tickColor: 'black',
        labelColor: 'black',
        //labelFontSize: ,
        //labelFontWeight: '',
        labelFontFamily: 'GGX88',
        baselineColor: 'black',
        gridColor: '#7B8BAF',
        gridStrokeWidth: 2,
        //gridStrokeType: '',
        //gridStrokeDash: 
    },

    markCommon: {
        ...EnsemblThemeMarkCommonStyle
    },
    point: {
        ...EnsemblThemeMarkCommonStyle,
        /*color: NOMINAL_COLOR[0],
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
        size: 3
    },
    rect: {
        ...EnsemblThemeMarkCommonStyle
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
    },
    triangle: {
        ...EnsemblThemeMarkCommonStyle
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
    },
    area: {
        ...EnsemblThemeMarkCommonStyle
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
    },
    line: {
        ...EnsemblThemeMarkCommonStyle
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
    },
    bar: {
        ...EnsemblThemeMarkCommonStyle
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
    },
    rule: {
        ...EnsemblThemeMarkCommonStyle,
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
        strokeWidth: 1
    },
    link: {
        ...EnsemblThemeMarkCommonStyle,
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
        strokeWidth: 1
    },
    text: {
        ...EnsemblThemeMarkCommonStyle,
        /*color: NOMINAL_COLOR[0],
        size: 1,
        stroke: 'black',
        strokeWidth: 0,
        opacity: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...EnsemblThemeMarkCommonStyle,
        /*size: 1,
        nominalColorRange: NOMINAL_COLOR,
        quantitativeSizeRange: [2, 6]*/
        color: 'gray',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 1
    }
}

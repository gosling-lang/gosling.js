const NOMINAL_COLOR = ['#3A62FE', '#F85353', '#3A62FE', '#F85353','#DCA326', '#03BF06', '#BABABA'/*'#000000'*/];

const JBrowseThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const jbrowse = {
    base: 'jbrowse',

    root: {
        background: 'white',
        titleColor: 'white',
        titleFontSize:20,
        titleFontFamily:'Roboto',
        titleAlign:'middle',
        titleFontWeight:'normal',
        titleBackgroundColor:'#0b243f',
        subtitleColor: 'white',
        subtitleFontSize:18,
        subtitleFontFamily:'Roboto',
        subtitleAlign:'middle',
        subtitleFontWeight:'normal',
        subtitleBackgroundColor:'#732162',
        showMousePosition: true,
        mousePositionColor: '#000000'
    },

    track: {
        background:'white',
        alternatingBackground:'white',
        //titleFontSize:'',
        titleAlign:'middle',
        titleColor: 'white',
        titleBackground: '#0B243F',
        outline: 'black',
        outlineWidth: 1
    },

    legend: {
        position:'top',
        background: 'white',
        backgroundOpacity: 0.7,
        labelColor: '#DCA326',
        //labelFontSize: '',
        labelFontWeight: 'bold',
        labelFontFamily: 'Roboto',
        backgroundStroke: '#black',
        tickColor: 'black'
    },

    axis: {
        tickColor: 'black',
        labelColor: '#DCA326',
        //labelFontSize: '',
        labelFontWeight: 'bold',
        labelFontFamily: 'Roboto',
        baselineColor: 'black',
        gridColor: '#c5d5d9',
        gridStrokeWidth: 1//,
        //gridStrokeType: '',
        //gridStrokeDash: 

    },

    markCommon: {
        ...JBrowseThemeMarkCommonStyle
    },
    point: {
        ...JBrowseThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...JBrowseThemeMarkCommonStyle
    },
    triangle: {
        ...JBrowseThemeMarkCommonStyle
    },
    area: {
        ...JBrowseThemeMarkCommonStyle
    },
    line: {
        ...JBrowseThemeMarkCommonStyle
    },
    bar: {
        ...JBrowseThemeMarkCommonStyle
    },
    rule: {
        ...JBrowseThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...JBrowseThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...JBrowseThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...JBrowseThemeMarkCommonStyle,
        color: '#c5d5d9',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 1
    }
}

const NOMINAL_COLOR = ['#6E12AC', '#15C250', '#E70FB1', '#FF8E55', '#A3B8F3', '#DE5E59', '#77AAAA','#F5CCCA' /*'#000000'*/];

const WashUThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const washu = {
    base: 'washu',

    root: {
        background: 'white',
        titleColor: 'gray',
        //titleFontSize:16,
        //titleFontFamily:'',
        titleAlign:'left',
        titleFontWeight:'normal',
        titleBackgroundColor:'white',
        subtitleColor: 'lightgray',
        //subtitleFontSize:12,
        //subtitleFontFamily:'',
        subtitleAlign:'left',
        subtitleFontWeight:'light',
        subtitleBackgroundColor:'white',
        showMousePosition: true,
        mousePositionColor: '#000000'
    },

    track: {
        background:'white',
        //alternatingBackground:'',
        titleColor: 'gray',
        titleBackground: 'white',
        //titleFontSize:'',
        titleAlign:'left',
        outline: 'gray',
        outlineWidth: 1
    },

    legend: {
        position:'left',
        background: 'white',
        backgroundOpacity: 0.5,
        labelColor: 'gray',
        //labelFontSize: '',
        labelFontWeight: 'light',
        //labelFontFamily: '',
        backgroundStroke: '#DBDBDB',
        tickColor: 'gray'
    },

    axis: {
        tickColor: 'lightgray',
        labelColor: 'gray',
        //labelFontSize: '',
        labelFontWeight: 'light',
        //labelFontFamily: '',
        baselineColor: 'gray',
        gridColor: 'transparent',
        gridStrokeWidth: 0//,
        //gridStrokeType: '',
        //gridStrokeDash:

    },

    markCommon: {
        ...WashUThemeMarkCommonStyle
    },
    point: {
        ...WashUThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...WashUThemeMarkCommonStyle
    },
    triangle: {
        ...WashUThemeMarkCommonStyle
    },
    area: {
        ...WashUThemeMarkCommonStyle
    },
    line: {
        ...WashUThemeMarkCommonStyle
    },
    bar: {
        ...WashUThemeMarkCommonStyle
    },
    rule: {
        ...WashUThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...WashUThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...WashUThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...WashUThemeMarkCommonStyle,
        color: 'gray',
        opacity: 0.3,
        stroke: 'gray',
        strokeWidth: 1
    }
}

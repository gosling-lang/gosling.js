const NOMINAL_COLOR = ['#37E649','#ED2D44','#AEAFEA','#EBAEAE','#CE7B3D','#8743E0','#5233F0'];

const IGVThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const igv = {
    base: 'igv',

    root: {
        background: 'white',
        titleColor: 'white',
        //titleFontSize:'',
        //titleFontFamily:'',
        titleAlign:'left',
        titleFontWeight:'bold',
        titleBackgroundColor:'#5f5f5f',
        subtitleColor: '#3b3b3b',
        //subtitleFontSize:'',
        //subtitleFontFamily:'',
        subtitleAlign:'left',
        subtitleFontWeight:'bold',
        subtitleBackgroundColor:'#c4c4c4',
        showMousePosition: true,
        mousePositionColor: 'black'
    },

    track: {
        background:'white',
        alternatingBackground:'#e8e8e8',
        titleColor: 'white',
        titleBackground: '#5F5F5F',
        //titleFontSize:'',
        //titleAlign:'',
        outline: '#5F5F5F',
        outlineWidth: 1
    },

    legend: {
        position:'top',
        background: 'white',
        backgroundOpacity: 1,
        labelColor: 'black',
        //labelFontSize: '',
        //labelFontWeight: '',
        //labelFontFamily: '',
        backgroundStroke: 'black',
        tickColor: 'black'
    },

    axis: {
        tickColor: 'black',
        labelColor: 'black',
        //labelFontSize: '',
        //labelFontWeight: '',
        //labelFontFamily: '',
        //baselineColor: '#E6E6E6',
        baselineColor: 'white',
        gridColor: 'transparent',
        gridStrokeWidth: 0,
        //gridStrokeType: '',
        //gridStrokeDash: 

    },

    markCommon: {
        ...IGVThemeMarkCommonStyle
    },
    point: {
        ...IGVThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...IGVThemeMarkCommonStyle
    },
    triangle: {
        ...IGVThemeMarkCommonStyle
    },
    area: {
        ...IGVThemeMarkCommonStyle
    },
    line: {
        ...IGVThemeMarkCommonStyle
    },
    bar: {
        ...IGVThemeMarkCommonStyle
    },
    rule: {
        ...IGVThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...IGVThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...IGVThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'bold'
    },
    brush: {
        ...IGVThemeMarkCommonStyle,
        color: 'white',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 1
    }
}

const NOMINAL_COLOR = ['#F66A62','#05B230','#5692FF','#D764D6','#86E9D4','#6E6AD7','#FFFB00'];

const GgplotThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const ggplot = {
    base: 'ggplot',

    root: {
        background: 'white',
        titleColor: 'black',
        titleFontSize: 18,
        titleFontFamily:'Helvetica',
        titleAlign:'middle',
        titleFontWeight:'bold',
        titleBackgroundColor:'white',
        subtitleColor: 'gray',
        subtitleFontSize:14,
        subtitleFontFamily:'Helvetica',
        subtitleAlign:'middle',
        subtitleFontWeight:'light',
        subtitleBackgroundColor:'white',
        showMousePosition: true,
        mousePositionColor: 'black'
    },

    track: {
        background:'#e8e8e8',
        alternatingBackground:'#d1d1d1',
        titleColor: 'black',
        titleBackground: 'white',
        //titleFontSize:'',
        //titleAlign:'',
        outline: 'black',
        outlineWidth: 2
    },

    legend: {
        position:'right',
        background: '#e8e8e8',
        backgroundOpacity: 1,
        labelColor: 'black',
        backgroundStroke: '#e8e8e8',
        tickColor: 'white',
        //,labelFontSize: '',
        //labelFontWeight: '',
        //labelFontFamily: ''

    },

    axis: {
        tickColor: 'white',
        labelColor: 'black',
        //labelFontSize: '',
        //labelFontWeight: '',
        //labelFontFamily: '',
        baselineColor: '#e8e8e8',
        gridColor: 'white',
        gridStrokeWidth: 2
        //,gridStrokeType: '',
        //gridStrokeDash: 

    },

    markCommon: {
        ...GgplotThemeMarkCommonStyle
    },
    point: {
        ...GgplotThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...GgplotThemeMarkCommonStyle
    },
    triangle: {
        ...GgplotThemeMarkCommonStyle
    },
    area: {
        ...GgplotThemeMarkCommonStyle
    },
    line: {
        ...GgplotThemeMarkCommonStyle
    },
    bar: {
        ...GgplotThemeMarkCommonStyle
    },
    rule: {
        ...GgplotThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...GgplotThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...GgplotThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'bold'
    },
    brush: {
        ...GgplotThemeMarkCommonStyle,
        color: 'black',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 1
    }
}

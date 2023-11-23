const NOMINAL_COLOR = ['#4185f4', '#DB4437', '#F4B400', '#0D9D58', '#AA30C3', '#FF6E02', '#CBC74C' /*'#000000'*/];

const GoogleThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 2,
    stroke: 'black',
    strokeWidth: 0.3,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const google = {
    base: 'google',

    root: {
        background: 'white',
        titleColor: '#454545',
        titleFontSize: 20,
        titleFontFamily:'Arial',
        titleAlign:'left',
        titleFontWeight:'normal',
        titleBackgroundColor:'white',
        subtitleColor: '#7d7d7d',
        subtitleFontSize: 16,
        subtitleFontFamily:'Arial',
        subtitleAlign:'left',
        subtitleFontWeight:'light',
        subtitleBackgroundColor:'white',
        showMousePosition: true,
        mousePositionColor: '#000000'
    },

    track: {
        background:'white',
        alternatingBackground:'#f5f5f5',
        titleColor: '#e8e8e8',
        titleBackground: 'white',
        titleFontSize:12,
        titleAlign:'left',
        outline: 'black',
        outlineWidth: 1
    },

    legend: {
        position:'right',
        background: 'white',
        backgroundOpacity: 1,
        labelColor: 'black',
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelFontFamily: 'Arial',
        backgroundStroke: 'black',
        tickColor: 'black'
    },

    axis: {
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelFontFamily: 'Arial',
        tickColor: 'black',
        labelColor: 'black',
        baselineColor: 'black',
        gridColor: 'black',
        gridStrokeWidth: 1//,
        //gridStrokeType: '',
        //gridStrokeDash:

    },

    markCommon: {
        ...GoogleThemeMarkCommonStyle
    },
    point: {
        ...GoogleThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...GoogleThemeMarkCommonStyle
    },
    triangle: {
        ...GoogleThemeMarkCommonStyle
    },
    area: {
        ...GoogleThemeMarkCommonStyle
    },
    line: {
        ...GoogleThemeMarkCommonStyle
    },
    bar: {
        ...GoogleThemeMarkCommonStyle
    },
    rule: {
        ...GoogleThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...GoogleThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...GoogleThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...GoogleThemeMarkCommonStyle,
        color: '#999999',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 0.7
    }
}

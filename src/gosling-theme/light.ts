const NOMINAL_COLOR = ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441' /*'#000000'*/];

const LightThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const light = {
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
        showMousePosition: true,
        mousePositionColor: '#000000'
    },

    track: {
        background: 'transparent',
        alternatingBackground: 'transparent',
        titleColor: 'black',
        titleBackground: 'white',
        titleFontSize: 12,
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
        ...LightThemeMarkCommonStyle
    },
    point: {
        ...LightThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...LightThemeMarkCommonStyle
    },
    triangle: {
        ...LightThemeMarkCommonStyle
    },
    area: {
        ...LightThemeMarkCommonStyle
    },
    line: {
        ...LightThemeMarkCommonStyle
    },
    bar: {
        ...LightThemeMarkCommonStyle
    },
    rule: {
        ...LightThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...LightThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...LightThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...LightThemeMarkCommonStyle,
        color: 'gray',
        opacity: 0.3,
        stroke: 'black',
        strokeWidth: 1
    }
}
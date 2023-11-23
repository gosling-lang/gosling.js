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

const DarkThemeMarkCommonStyle = { ...LightThemeMarkCommonStyle, stroke: 'white' };

export const dark = {
    base: 'dark',

    root: {
        background: 'black',
        titleColor: 'white',
        subtitleColor: 'lightgray',
        mousePositionColor: '#FFFFFF',
        showMousePosition: true
    },

    track: {
        titleColor: 'white',
        titleBackground: 'black',
        outline: 'white',
        outlineWidth: 1
    },

    legend: {
        background: 'black',
        backgroundOpacity: 0.7,
        labelColor: 'white',
        backgroundStroke: '#DBDBDB',
        tickColor: 'white'
    },

    axis: {
        tickColor: 'white',
        labelColor: 'white',
        baselineColor: 'white',
        gridColor: 'gray',
        gridStrokeWidth: 1
    },

    markCommon: {
        ...DarkThemeMarkCommonStyle
    },
    point: {
        ...DarkThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...DarkThemeMarkCommonStyle
    },
    triangle: {
        ...DarkThemeMarkCommonStyle
    },
    area: {
        ...DarkThemeMarkCommonStyle
    },
    line: {
        ...DarkThemeMarkCommonStyle
    },
    bar: {
        ...DarkThemeMarkCommonStyle
    },
    rule: {
        ...DarkThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...DarkThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...DarkThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...DarkThemeMarkCommonStyle,
        color: 'lightgray',
        opacity: 0.3,
        stroke: 'white',
        strokeWidth: 1
    }
}
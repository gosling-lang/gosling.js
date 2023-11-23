const NOMINAL_COLOR = ['#D19000', '#008F67', '#005F96', '#B86E97', '#B55100', '#4793BF', '#C9C03'];

const WarmThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: '#3C3C3C',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

export const warm = {
    base: 'warm',

    root: {
        background: '#FFF8E8',
        titleColor: '#3C3C3C',
        subtitleColor: 'gray',
        showMousePosition: true,
        mousePositionColor: '#3C3C3C'
    },

    track: {
        titleColor: '#3C3C3C',
        titleBackground: '#FFF8E8',
        outline: '#3C3C3C',
        outlineWidth: 1
    },

    legend: {
        background: '#FFF8E8',
        backgroundOpacity: 0.7,
        labelColor: '#3C3C3C',
        backgroundStroke: '#3C3C3C',
        tickColor: '3C3C3C'
    },

    axis: {
        tickColor: '#3C3C3C',
        labelColor: '#3C3C3C',
        baselineColor: '#3C3C3C',
        gridColor: '#E3E3E3',
        gridStrokeWidth: 1
    },

    markCommon: {
        ...WarmThemeMarkCommonStyle
    },
    point: {
        ...WarmThemeMarkCommonStyle,
        size: 3
    },
    rect: {
        ...WarmThemeMarkCommonStyle
    },
    triangle: {
        ...WarmThemeMarkCommonStyle
    },
    area: {
        ...WarmThemeMarkCommonStyle
    },
    line: {
        ...WarmThemeMarkCommonStyle
    },
    bar: {
        ...WarmThemeMarkCommonStyle
    },
    rule: {
        ...WarmThemeMarkCommonStyle,
        strokeWidth: 1
    },
    link: {
        ...WarmThemeMarkCommonStyle,
        strokeWidth: 1
    },
    text: {
        ...WarmThemeMarkCommonStyle,
        textAnchor: 'middle',
        textFontWeight: 'normal'
    },
    brush: {
        ...WarmThemeMarkCommonStyle,
        color: 'lightgray',
        opacity: 0.3,
        stroke: '#3C3C3C',
        strokeWidth: 1
    }
}

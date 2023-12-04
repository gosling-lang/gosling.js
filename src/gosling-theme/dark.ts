import type { ThemeDeep } from 'src/core/utils/theme';

const NOMINAL_COLOR = ['#E79F00', '#029F73', '#0072B2', '#CB7AA7', '#D45E00', '#57B4E9', '#EFE441' /*'#000000'*/];

const LightThemeMarkCommonStyle = {
    color: NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6] as [number, number]
};

const DarkThemeMarkCommonStyle = { ...LightThemeMarkCommonStyle, stroke: 'white' };

export const dark: ThemeDeep = {
    base: 'dark',

    root: {
        background: 'black',
        titleColor: 'white',
        titleBackgroundColor: 'transparent',
        titleFontSize: 18,
        titleFontFamily: 'Arial',
        titleAlign: 'middle',
        titleFontWeight: 'bold',
        subtitleColor: 'lightgray',
        subtitleBackgroundColor: 'transparent',
        subtitleFontSize: 16,
        subtitleFontFamily: 'Arial',
        subtitleAlign: 'middle',
        subtitleFontWeight: 'normal',
        showMousePosition: true,
        mousePositionColor: '#FFFFFF'
    },

    track: {
        background: 'transparent',
        alternatingBackground: 'transparent',
        titleColor: 'white',
        titleBackground: 'black',
        titleFontSize: 18,
        titleAlign: 'left',
        outline: 'white',
        outlineWidth: 1
    },
    legend: {
        position: 'right',
        background: 'black',
        backgroundOpacity: 0.7,
        labelColor: 'white',
        labelFontSize: 12,
        labelFontWeight: 'normal',
        labelFontFamily: 'Arial',
        backgroundStroke: '#DBDBDB',
        tickColor: 'white'
    },
    axis: {
        tickColor: 'white',
        labelMargin: 5,
        labelExcludeChrPrefix: false,
        labelColor: 'white',
        labelFontSize: 10,
        labelFontWeight: 'normal',
        labelFontFamily: 'Arial',
        baselineColor: 'white',
        gridColor: 'gray',
        gridStrokeWidth: 1,
        gridStrokeType: 'solid',
        gridStrokeDash: [4, 4]
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
};

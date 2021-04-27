import { assign } from 'lodash';
import { CHANNEL_DEFAULTS } from '../channel';

/* ----------------------------- THEME ----------------------------- */
export type Theme = ThemeType | ThemeDeep;
export type ThemeType = 'light' | 'dark';
export enum Themes {
    light = 'light',
    dark = 'dark'
}

export interface ThemeDeep {
    base: ThemeType;

    root?: RootStyle;
    track?: TrackStyle;
    axis?: AxisStyle;

    // Mark-Specific Styles
    markCommon?: MarkStyle;
    point?: MarkStyle;
    rect?: MarkStyle;
    triangle?: MarkStyle;
    area?: MarkStyle;
    line?: MarkStyle;
    bar?: MarkStyle;
    rule?: MarkStyle;
    link?: MarkStyle;
    brush?: MarkStyle;
    text?: MarkStyle & {
        textFontWeight?: 'bold' | 'normal';
        textAnchor?: 'start' | 'middle' | 'end';
    };
}

// TODO: Better way to implement deep `Required` type instead of having two separate interfaces, i.e., CompleteThemeDeep and ThemeDeep
export interface CompleteThemeDeep {
    base: Required<ThemeType>;

    root: Required<RootStyle>;
    track: Required<TrackStyle>;
    axis: Required<AxisStyle>;

    // Mark-Specific
    markCommon: Required<MarkStyle>;
    point: Required<MarkStyle>;
    rect: Required<MarkStyle>;
    triangle: Required<MarkStyle>;
    area: Required<MarkStyle>;
    line: Required<MarkStyle>;
    bar: Required<MarkStyle>;
    rule: Required<MarkStyle>;
    link: Required<MarkStyle>;
    brush: Required<MarkStyle>;
    text: Required<MarkStyle> &
        Required<{
            textFontWeight?: 'bold' | 'normal';
            textAnchor?: 'start' | 'middle' | 'end';
        }>;
}

export interface RootStyle {
    background?: string;
    titleColor?: string;
    subtitleColor?: string;
}

export interface TrackStyle {
    titleColor?: string;
    titleBackground?: string;
    outline?: string;
    outlineWidth?: number;
    legendLabelColor?: string;
    legendBackground?: string;
    // ...
}

export interface AxisStyle {
    tickColor?: string;
    labelColor?: string;
    baselineColor?: string;
    // ...
}

export interface MarkStyle {
    color?: string;
    size?: number;
    stroke?: string;
    strokeWidth?: number;
    opacity?: number;

    nominalColorRange?: string[];
    quantitativeSizeRange?: [number, number];
    // ...
}

export function getTheme(theme: Theme = 'light'): Required<CompleteThemeDeep> {
    if (theme === 'dark' || theme === 'light') {
        return THEMES[theme];
    } else {
        return assign(JSON.parse(JSON.stringify(THEMES[theme.base])), JSON.parse(JSON.stringify(theme)));
    }
}

const LightThemeMarkCommonStyle: Required<MarkStyle> = {
    color: CHANNEL_DEFAULTS.NOMINAL_COLOR[0],
    size: 1,
    stroke: 'black',
    strokeWidth: 0,
    opacity: 1,
    nominalColorRange: CHANNEL_DEFAULTS.NOMINAL_COLOR,
    quantitativeSizeRange: [2, 6]
};

const DarkThemeMarkCommonStyle: Required<MarkStyle> = { ...LightThemeMarkCommonStyle, stroke: 'white' };

/* ----------------------------- THEME PRESETS ----------------------------- */
export const THEMES: { [key in Themes]: Required<CompleteThemeDeep> } = {
    light: {
        base: 'light',

        root: {
            background: 'white',
            titleColor: 'black',
            subtitleColor: 'gray'
        },

        track: {
            titleColor: 'black',
            titleBackground: 'white',
            outline: 'gray',
            outlineWidth: 1,
            legendBackground: 'white',
            legendLabelColor: 'black'
        },

        axis: {
            tickColor: 'black',
            labelColor: 'black',
            baselineColor: 'black'
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
            stroke: 'black',
            strokeWidth: 1
        }
    },
    dark: {
        base: 'dark',

        root: {
            background: 'black',
            titleColor: 'white',
            subtitleColor: 'lightgray'
        },

        track: {
            titleColor: 'white',
            titleBackground: 'black',
            outline: 'lightgray',
            outlineWidth: 1,
            legendBackground: 'black',
            legendLabelColor: 'white'
        },

        axis: {
            tickColor: 'white',
            labelColor: 'white',
            baselineColor: 'white'
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
            stroke: 'white',
            strokeWidth: 1
        }
    }
};

import { isThereTheme, getTheme as _getTheme } from '@gosling-lang/gosling-theme';

/* ----------------------------- THEME ----------------------------- */
export type Theme = ThemeType | ThemeDeep;
export type ThemeType =
    | 'light'
    | 'dark'
    | 'warm'
    | 'ggplot'
    | 'igv'
    | 'ensembl'
    | 'jbrowse'
    | 'ucsc'
    | 'washu'
    | 'excel'
    | 'google';
// export type ThemType = keyof typeof Themes;
// Above line leads to `TypeError: Invalid value used as weak map key` error, due to cyclic dependency.
// So, instead hard-coding the list as workaround
// Refer to https://github.com/vega/ts-json-schema-generator/issues/1727

export interface ThemeDeep {
    base: ThemeType;

    root?: RootStyle;
    track?: TrackStyle;
    legend?: LegendStyle;
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
    legend: Required<LegendStyle>;
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
    titleFontSize?: number;
    titleFontFamily?: string;
    titleAlign?: 'left' | 'middle' | 'right';
    titleFontWeight?: 'bold' | 'normal' | 'light';
    titleBackgroundColor?: string;
    subtitleColor?: string;
    subtitleFontSize?: number;
    subtitleFontFamily?: string;
    subtitleAlign?: 'left' | 'middle' | 'right';
    subtitleFontWeight?: 'bold' | 'normal' | 'light';
    subtitleBackgroundColor?: string;
    showMousePosition?: boolean;
    mousePositionColor?: string;
}

export interface TrackStyle {
    background?: string;
    alternatingBackground?: string; // used to fill all even rows
    titleColor?: string;
    titleBackground?: string;
    titleFontSize?: number;
    titleAlign?: 'left' | 'middle' | 'right';
    outline?: string;
    outlineWidth?: number;
    // ...
}

export interface LegendStyle {
    position?: 'top' | 'right'; // TODO: support bottom and left, and even all corners (e.g., top-left, bottom-right, etc)
    tickColor?: string;
    labelColor?: string;
    labelFontSize?: number;
    labelFontWeight?: 'bold' | 'normal' | 'light';
    labelFontFamily?: string;
    background?: string;
    backgroundOpacity?: number;
    backgroundStroke?: string;
    // ...
}

export interface AxisStyle {
    tickColor?: string;
    /**
     * The margin around labels for calculating visual overlaps between labels.
     * This is mainly used for determining the visibility of axis labels.
     * `0` if no margin to use. Negative values (`-1`) for showing all labels even if they overlap.
     */
    labelMargin?: number;
    /**
     * If `true`, labels of genomics axes excludes the chromosome prefix (e.g., `chr1` -> `1`).
     */
    labelExcludeChrPrefix?: boolean;
    labelColor?: string;
    labelFontSize?: number;
    labelFontWeight?: 'bold' | 'normal' | 'light';
    labelFontFamily?: string;
    baselineColor?: string;
    gridColor?: string;
    gridStrokeWidth?: number;
    gridStrokeType?: 'solid' | 'dashed';
    gridStrokeDash?: [number, number];
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

// TODO: Instead of calling this function everytime, create a JSON object and use it throughout the project.
export function getTheme(theme: Theme = 'light'): Required<CompleteThemeDeep> {
    if (typeof theme === 'string') {
        if (isThereTheme(theme)) {
            return _getTheme(theme);
        } else {
            return _getTheme('light');
        }
    } else {
        // Iterate all keys to override from base
        let baseSpec = JSON.parse(JSON.stringify(_getTheme('light')));
        if (isThereTheme(theme.base)) {
            baseSpec = _getTheme(theme.base);
        }
        // Override defaults from `base`
        Object.keys(baseSpec).forEach(k => {
            if ((theme as any)[k] && k !== 'base') {
                baseSpec[k] = Object.assign(
                    JSON.parse(JSON.stringify(baseSpec[k])),
                    JSON.parse(JSON.stringify((theme as any)[k]))
                );
            }
        });
        return baseSpec;
    }
}

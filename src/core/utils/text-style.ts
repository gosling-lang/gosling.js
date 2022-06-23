import type * as PIXI from 'pixi.js';

export type TextStyle = {
    color?: string;
    size?: number;
    fontFamily?: string;
    fontWeight?: 'bold' | 'normal' | 'light';
    stroke?: string;
    strokeThickness?: number;
};

export const DEFAULT_TEXT_STYLE: Required<TextStyle> = {
    color: 'black',
    size: 10,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    stroke: '#ffffff',
    strokeThickness: 0
};

export function getTextStyle(style: TextStyle = DEFAULT_TEXT_STYLE): Partial<PIXI.ITextStyle> {
    const fontWeight = style.fontWeight ?? DEFAULT_TEXT_STYLE.fontWeight;
    return {
        fontSize: `${style.size ?? DEFAULT_TEXT_STYLE.size}px`,
        fontFamily: style.fontFamily ?? DEFAULT_TEXT_STYLE.fontFamily,
        fontWeight: fontWeight === 'light' ? 'lighter' : fontWeight,
        fill: style.color ?? DEFAULT_TEXT_STYLE.color,
        lineJoin: 'round',
        stroke: style.stroke ?? DEFAULT_TEXT_STYLE.stroke,
        strokeThickness: style.strokeThickness ?? DEFAULT_TEXT_STYLE.strokeThickness
    };
}

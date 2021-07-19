export type TextStyle = {
    color?: string;
    size?: number;
    fontFamily?: string;
    fontWeight?: 'bold' | 'normal' | 'light';
    stroke?: string;
    strokeThickness?: number;
};

export const DEFAULT_TEXT_STYLE: TextStyle = {
    color: 'black',
    size: 10,
    fontFamily: 'Arial',
    fontWeight: 'normal',
    stroke: '#ffffff',
    strokeThickness: 0
};

export function getTextStyle(style: TextStyle = DEFAULT_TEXT_STYLE) {
    return {
        fontSize: `${style.size ?? DEFAULT_TEXT_STYLE.size}px`,
        fontFamily: style.fontFamily ?? DEFAULT_TEXT_STYLE.fontFamily,
        fontWeight: style.fontWeight ?? DEFAULT_TEXT_STYLE.fontWeight,
        fill: style.color ?? DEFAULT_TEXT_STYLE.color,
        background: 'white',
        lineJoin: 'round',
        stroke: style.stroke ?? DEFAULT_TEXT_STYLE.stroke,
        strokeThickness: style.strokeThickness ?? DEFAULT_TEXT_STYLE.strokeThickness
    };
}

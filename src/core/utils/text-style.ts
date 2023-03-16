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

export function getTextStyle(style: TextStyle = {}) {
    const merged: Required<TextStyle> = { ...DEFAULT_TEXT_STYLE, ...style };
    // Use `const` to get object literal which is compatible with `Partial<PIXI.ITextStyle>`
    const pixiTextStyle = {
        fontSize: `${merged.size}px`,
        fontFamily: merged.fontFamily,
        fontWeight: merged.fontWeight === 'light' ? 'lighter' : merged.fontWeight,
        fill: merged.color,
        lineJoin: 'round',
        stroke: merged.stroke,
        strokeThickness: merged.strokeThickness
    } as const;
    // Allow returned object to be mutable (strip `readonly` modifier from `const`)
    return pixiTextStyle as {
        -readonly [K in keyof typeof pixiTextStyle]: (typeof pixiTextStyle)[K];
    };
}

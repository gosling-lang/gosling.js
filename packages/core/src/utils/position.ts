export interface Dimension {
    top: number;
    left: number;
    width: number;
    height: number;
}
export type Padding = SurroundingSize;
export type Margin = SurroundingSize;
export interface SurroundingSize {
    top: number;
    bottom: number;
    left: number;
    right: number;
}
export interface Offset {
    top: number;
    left: number;
}

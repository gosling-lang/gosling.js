/**
 * All data stored in each BED file eventually gets put into this
 */
export interface BedTile {
    chrom: string;
    chromStart: number;
    chromEnd: number;
    name?: string;
    score?: number;
    strand?: string;
    thickStart?: number;
    thickEnd?: number;
    itemRgb?: string;
    blockCount?: number;
    blockSizes?: number[];
    blockStarts?: number[];
    [customField: string]: string | number | number[] | undefined;
};

export interface EmptyTile {
    tilePositionId: string;
};
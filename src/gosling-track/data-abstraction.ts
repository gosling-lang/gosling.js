import { Datum, SingleTrack } from '../core/gosling.schema';
import { IsDataDeepTileset } from '../core/gosling.schema.guards';
import Logging from '../core/utils/log';

/**
 * Convert genomic data formats to common tabular formats for given tile.
 */
export function getTabularData(
    spec: SingleTrack,
    data: {
        dense?: number[];
        raw?: Datum[];
        shape?: [number, number];
        tileX: number;
        tileY?: number; // Used for 2D tracks
        tileWidth: number;
        tileHeight?: number; // Used for 2D tracks
        tileSize: number;
    }
) {
    const tabularData: Datum[] = [];

    if (!IsDataDeepTileset(spec.data)) {
        console.warn('No data is specified');
        return;
    }

    if (spec.data.type === 'vector' || spec.data.type === 'bigwig') {
        if (!spec.data.column || !spec.data.value) {
            console.warn('Proper data configuration is not provided. Please specify the name of data fields.');
            return;
        }

        if (!data.dense) {
            // we did not get sufficient data.
            return;
        }

        const bin = spec.data.binSize ?? 1;

        const numericValues = data.dense;
        const numOfGenomicPositions = data.tileSize;
        const tileUnitSize = data.tileWidth / data.tileSize;

        const valueName = spec.data.value;
        const columnName = spec.data.column;
        const startName = spec.data.start ?? 'start';
        const endName = spec.data.end ?? 'end';

        // convert data to a visualization-friendly format
        let cumVal = 0;
        let binStart = Number.MIN_SAFE_INTEGER;
        let binEnd = Number.MAX_SAFE_INTEGER;
        Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
            // add individual rows
            if (bin === 1) {
                tabularData.push({
                    [valueName]: numericValues[j] / tileUnitSize,
                    [columnName]: data.tileX + (j + 0.5) * tileUnitSize,
                    [startName]: data.tileX + j * tileUnitSize,
                    [endName]: data.tileX + (j + 1) * tileUnitSize
                });
            } else {
                // EXPERIMENTAL: bin the data considering the `bin` options
                if (j % bin === 0) {
                    // Start storing information for this bin
                    cumVal = numericValues[j];
                    binStart = j;
                    binEnd = j + bin;
                } else if (j % bin === bin - 1) {
                    // Add a row using the cumulative value
                    tabularData.push({
                        [valueName]: cumVal / bin / tileUnitSize,
                        [columnName]: data.tileX + (binStart + bin / 2.0) * tileUnitSize,
                        [startName]: data.tileX + binStart * tileUnitSize,
                        [endName]: data.tileX + binEnd * tileUnitSize
                    });
                } else if (j === numOfGenomicPositions - 1) {
                    // Manage the remainders. Just add them as a single row.
                    const smallBin = numOfGenomicPositions % bin;
                    const correctedBinEnd = binStart + smallBin;
                    tabularData.push({
                        [valueName]: cumVal / smallBin / tileUnitSize,
                        [columnName]: data.tileX + (binStart + smallBin / 2.0) * tileUnitSize,
                        [startName]: data.tileX + binStart * tileUnitSize,
                        [endName]: data.tileX + correctedBinEnd * tileUnitSize
                    });
                } else {
                    // Add a current value
                    cumVal += numericValues[j];
                }
            }
        });
    } else if (spec.data.type === 'multivec') {
        if (!spec.data.row || !spec.data.column || !spec.data.value) {
            console.warn('Proper data configuration is not provided. Please specify the name of data fields.');
            return;
        }

        if (!data.dense || data.shape === undefined) {
            // we did not get sufficient data.
            return;
        }

        const bin = spec.data.binSize ?? 1;

        const numOfTotalCategories = data.shape[0];
        const numericValues = data.dense;
        const numOfGenomicPositions = data.shape[1];
        const tileUnitSize = data.tileWidth / data.tileSize;

        const rowName = spec.data.row;
        const valueName = spec.data.value;
        const columnName = spec.data.column;
        const startName = spec.data.start ?? 'start';
        const endName = spec.data.end ?? 'end';
        const categories: any = spec.data.categories ?? [...Array(numOfTotalCategories).keys()]; // TODO:

        // convert data to a visualization-friendly format
        categories.forEach((c: string, i: number) => {
            let cumVal = 0;
            let binStart = Number.MIN_SAFE_INTEGER;
            let binEnd = Number.MAX_SAFE_INTEGER;
            Array.from(Array(numOfGenomicPositions).keys()).forEach((g: number, j: number) => {
                // add individual rows
                if (bin === 1) {
                    tabularData.push({
                        [rowName]: c,
                        [valueName]: numericValues[numOfGenomicPositions * i + j] / tileUnitSize,
                        [columnName]: data.tileX + (j + 0.5) * tileUnitSize,
                        [startName]: data.tileX + j * tileUnitSize,
                        [endName]: data.tileX + (j + 1) * tileUnitSize
                    });
                } else {
                    // EXPERIMENTAL: bin the data considering the `bin` options
                    if (j % bin === 0) {
                        // Start storing information for this bin
                        cumVal = numericValues[numOfGenomicPositions * i + j];
                        binStart = j;
                        binEnd = j + bin;
                    } else if (j % bin === bin - 1) {
                        // Add a row using the cumulative value
                        tabularData.push({
                            [rowName]: c,
                            [valueName]: cumVal / bin / tileUnitSize,
                            [columnName]: data.tileX + (binStart + bin / 2.0) * tileUnitSize,
                            [startName]: data.tileX + binStart * tileUnitSize,
                            [endName]: data.tileX + binEnd * tileUnitSize
                        });
                    } else if (j === numOfGenomicPositions - 1) {
                        // Manage the remainders. Just add them as a single row.
                        const smallBin = numOfGenomicPositions % bin;
                        const correctedBinEnd = binStart + smallBin;
                        tabularData.push({
                            [rowName]: c,
                            [valueName]: cumVal / smallBin / tileUnitSize,
                            [columnName]: data.tileX + (binStart + smallBin / 2.0) * tileUnitSize,
                            [startName]: data.tileX + binStart * tileUnitSize,
                            [endName]: data.tileX + correctedBinEnd * tileUnitSize
                        });
                    } else {
                        // Add a current value
                        cumVal += numericValues[numOfGenomicPositions * i + j];
                    }
                }
            });
        });
    } else if (spec.data.type === 'matrix') {
        if (!data.dense || typeof data.tileY === 'undefined' || typeof data.tileHeight === 'undefined') {
            // we did not get sufficient data.
            return;
        }

        console.log(data);
        const binSize = Math.sqrt(data.dense.length);

        if (binSize !== 256) {
            console.warn('The bin size of the matrix tilesets is not 256');
        }

        const { tileX, tileY } = data;
        const tileSize = 256;
        const numericValues = data.dense;
        const tileXUnitSize = data.tileWidth / tileSize;
        const tileYUnitSize = data.tileHeight / tileSize;

        console.log(tileXUnitSize, tileYUnitSize, tileSize, data.tileWidth);

        Logging.recordTime('matrix-processing');

        numericValues.forEach((value, i) => {
            const xIndex = i % binSize;
            const yIndex = Math.floor(i / binSize);

            console.log(xIndex, yIndex, value);

            // add individual rows
            tabularData.push({
                value,
                x: tileX + (xIndex + 0.5) * tileXUnitSize,
                xs: tileX + xIndex * tileXUnitSize,
                xe: tileX + (xIndex + 1) * tileXUnitSize,
                y: tileY + (yIndex + 0.5) * tileYUnitSize,
                ys: tileY + yIndex * tileYUnitSize,
                ye: tileY + (yIndex + 1) * tileYUnitSize
            });
        });

        Logging.printTime('matrix-processing');

        console.log(tabularData);

        // // calculate the tile's position in bins
        // const tileXStartBin = Math.floor(data.tileX / data.tileRes);
        // const tileXEndBin = Math.floor((data.tileX + data.tileWidth) / data.tileRes);
        // const tileYStartBin = Math.floor(data.tileY / data.tileRes);
        // const tileYEndBin = Math.floor((data.tileY + data.tileHeight) / data.tileRes);

        // // calculate which part of this tile is present in the current window
        // let tileSliceXStart = Math.max(leftXBin, tileXStartBin) - tileXStartBin;
        // let tileSliceYStart = Math.max(leftYBin, tileYStartBin) - tileYStartBin;
        // const tileSliceXEnd =
        //     Math.min(leftXBin + binWidth, tileXEndBin) - tileXStartBin;
        // const tileSliceYEnd =
        //     Math.min(leftYBin + binHeight, tileYEndBin) - tileYStartBin;

        // // where in the output array will the portion of this tile which is in the visible window be placed?
        // const tileXOffset = Math.max(tileXStartBin - leftXBin, 0);
        // const tileYOffset = Math.max(tileYStartBin - leftYBin, 0);
        // const tileSliceWidth = tileSliceXEnd - tileSliceXStart;
        // const tileSliceHeight = tileSliceYEnd - tileSliceYStart;

        // // the region is outside of this tile
        // if (tileSliceWidth < 0 || tileSliceHeight < 0) {
        //     return;
        // }
    } else if (spec.data.type === 'beddb') {
        if (!data.raw) {
            // we did not get sufficient data.
            return;
        }

        const { genomicFields, exonIntervalFields, valueFields } = spec.data;

        data.raw.forEach((d: any) => {
            const { chrOffset, fields } = d;

            const datum: { [k: string]: number | string } = {};
            genomicFields.forEach(g => {
                datum[g.name] = +fields[g.index] + chrOffset;
            });

            // values
            valueFields?.forEach(v => {
                datum[v.name] = v.type === 'quantitative' ? +fields[v.index] : fields[v.index];
            });

            tabularData.push({
                ...datum,
                type: 'gene' // this should be described in the spec
            });

            if (exonIntervalFields) {
                const [exonStartField, exonEndField] = exonIntervalFields;
                const exonStartStrs = (fields[exonStartField.index] as string).split(',');
                const exonEndStrs = (fields[exonEndField.index] as string).split(',');

                exonStartStrs.forEach((es, i) => {
                    const ee = exonEndStrs[i];

                    // exon
                    tabularData.push({
                        ...datum,
                        [exonStartField.name]: +es + chrOffset,
                        [exonEndField.name]: +ee + chrOffset,
                        type: 'exon'
                    });

                    // intron
                    if (i + 1 < exonStartStrs.length) {
                        const nextEs = exonStartStrs[i + 1];
                        tabularData.push({
                            ...datum,
                            [exonStartField.name]: +ee + chrOffset,
                            [exonEndField.name]: +nextEs + chrOffset,
                            type: 'intron'
                        });
                    }
                });
            }
        });
    } else if (spec.data.type === 'bam') {
        // TODO: Do we need this?
    }

    /// DEBUG
    // console.log(tabularData);

    return tabularData;
}

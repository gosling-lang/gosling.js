//const _spec = models[0]?.spec(); _spec?.id
import type { AltGoslingSpec, AltTrackDataFields, AltDataStatistics } from './alt-gosling-schema';
import type { Datum } from '../core/gosling.schema';

export function altRetrieveDataStatistics(id: string, flatTileData: Datum[], dataFields: AltTrackDataFields): AltDataStatistics {

    const genomicValues = (flatTileData.map(d => d[dataFields.genomicField]) as unknown as number[]).filter(d => !isNaN(d));
    const genomicMin = Math.min(...genomicValues);
    const genomicMax = Math.max(...genomicValues);

    const valueValues = (flatTileData.map(d => d[dataFields.valueField]) as unknown as number[]).filter(d => !isNaN(d));
    const valueMin = Math.min(...valueValues);
    const valueMax = Math.max(...valueValues);

    const valueMinGenomic = (flatTileData.filter(d => d[dataFields.valueField] == valueMin).map(d => d[dataFields.genomicField]) as unknown as number[]);
    const valueMaxGenomic = (flatTileData.filter(d => d[dataFields.valueField] == valueMax).map(d => d[dataFields.genomicField]) as unknown as number[]);

    const valueMinGenomic = (flatTileData.filter(d => d[dataFields.valueField] == valueMin).map(d => d[dataFields.genomicField]) as unknown as number[])
    const valueMaxGenomic = (flatTileData.filter(d => d[dataFields.valueField] == valueMax).map(d => d[dataFields.genomicField]) as unknown as number[])

    const altDataStatistics: AltDataStatistics = {
        id: id,
        flatTileData: flatTileData,
        genomicMin: genomicMin,
        genomicMax: genomicMax,
        valueMin: valueMin,
        valueMax: valueMax,
        valueMinGenomic: valueMinGenomic,
        valueMaxGenomic: valueMaxGenomic
    }

    if (dataFields.categoryField !== 'unknown' && dataFields.categoryField !== '' && dataFields.categoryField !== undefined) {
        var categoryValues = flatTileData.map(d => d[dataFields.categoryField]);
        const categories = [... new Set(categoryValues)] as unknown as string[]
        //const categoryMinMax: { [key: string]: number[] } = {};
        const categoryMinMaxWG: { [key: string]: (number | number[])[] } = {};

        var highestCategory = {} as string[];

        for (let category of categories) {
            let dataCat = flatTileData.filter(d => d[dataFields.categoryField] === category);
            let valueValuesCat = (dataCat.map(d => d[dataFields.valueField]) as unknown as number[]).filter(d => !isNaN(d));
            let valueMinCat = Math.min(...valueValuesCat);
            let valueMaxCat = Math.max(...valueValuesCat);

            let valueMinCatGenomic = (dataCat.filter(d => d[dataFields.valueField] == valueMinCat).map(d => d[dataFields.genomicField]) as unknown as number[])
            let valueMaxCatGenomic = (dataCat.filter(d => d[dataFields.valueField] == valueMaxCat).map(d => d[dataFields.genomicField]) as unknown as number[])

            //categoryMinMax[category] = [valueMinCat, valueMaxCat];
            categoryMinMaxWG[category] = [valueMinCat, valueMinCatGenomic, valueMaxCat, valueMaxCatGenomic];

            if (valueMaxCat === valueMax) {
                highestCategory = [...highestCategory, category]
            }
        }

        altDataStatistics.categories = categories;
        altDataStatistics.categoryMinMaxWG = categoryMinMaxWG;
        altDataStatistics.highestCategory = highestCategory;
    }

    return(altDataStatistics);
}


export function altUpdateSpecWithData(
    altGoslingSpec: AltGoslingSpec, 
    id: string, 
    flatTileData: Datum[]
): AltGoslingSpec {
    // get correct track
    //const track = altGoslingSpec.tracks.filter(t => t.uid = id)[0];

    // assume only 1 track
    const trackIndex = 0;

    // get genomic field headers for that track, call
    const fields = altGoslingSpec.tracks[trackIndex].data.details.fields;
    const altDataStatistics = altRetrieveDataStatistics(id, flatTileData, fields);

    // fill in data
    altGoslingSpec.tracks[trackIndex].data.details.dataStatistics = altDataStatistics;

    // update description


    return(altGoslingSpec);
}
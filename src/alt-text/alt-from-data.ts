//const _spec = models[0]?.spec(); _spec?.id
import type { AltGoslingSpec, AltTrackDataFields, AltDataStatistics } from './alt-gosling-schema';
import type { Datum } from '@gosling-lang/gosling-schema';

export function altRetrieveDataStatistics(id: string, flatTileData: Datum[], dataFields: AltTrackDataFields): AltDataStatistics {

    var altDataStatistics: AltDataStatistics = { id: id, flatTileData: flatTileData}

    if (dataFields.genomicField !== undefined) {
        const genomicField = dataFields.genomicField as string;
        try {
            const genomicValues = (flatTileData.map(d => d[genomicField]) as unknown as number[]).filter(d => !isNaN(d));
            altDataStatistics.genomicMin  = Math.min(...genomicValues);
            altDataStatistics.genomicMax = Math.max(...genomicValues);
        } catch {}
    }

    if (dataFields.valueField !== undefined) {
        const valueField = dataFields.valueField as string;
        try {
            const valueValues = (flatTileData.map(d => d[valueField]) as unknown as number[]).filter(d => !isNaN(d));
            altDataStatistics.valueMin = Math.min(...valueValues);
            altDataStatistics.valueMax = Math.max(...valueValues);
        } catch {}
    }

    if (dataFields.genomicField !== undefined && dataFields.valueField !== undefined) {
        const genomicField = dataFields.genomicField as string;
        const valueField = dataFields.valueField as string;
        try {
            altDataStatistics.valueMinGenomic = (flatTileData.filter(d => d[valueField] == altDataStatistics.valueMin).map(d => d[genomicField]) as unknown as number[]);
            altDataStatistics.valueMaxGenomic = (flatTileData.filter(d => d[valueField] == altDataStatistics.valueMax).map(d => d[genomicField]) as unknown as number[]);
        } catch {}
    }
   
    if (dataFields.categoryField !== undefined) {
        const genomicField = dataFields.genomicField as string;
        const valueField = dataFields.valueField as string;
        const categoryField = dataFields.categoryField as string;

        try {
            var categoryValues = flatTileData.map(d => d[categoryField]);
            const categories = [... new Set(categoryValues)] as unknown as string[]

            const categoryMinMaxWG: { [key: string]: (number | number[])[] } = {};

            var highestCategory = [] as string[];

            for (let category of categories) {
                let dataCat = flatTileData.filter(d => d[categoryField] === category);
                let valueValuesCat = (dataCat.map(d => d[valueField]) as unknown as number[]).filter(d => !isNaN(d));
                let valueMinCat = Math.min(...valueValuesCat);
                let valueMaxCat = Math.max(...valueValuesCat);

                let valueMinCatGenomic = (dataCat.filter(d => d[valueField] == valueMinCat).map(d => d[genomicField]) as unknown as number[])
                let valueMaxCatGenomic = (dataCat.filter(d => d[valueField] == valueMaxCat).map(d => d[genomicField]) as unknown as number[])

                categoryMinMaxWG[category] = [valueMinCat, valueMinCatGenomic, valueMaxCat, valueMaxCatGenomic];

                if (valueMaxCat === altDataStatistics.valueMax) {
                    highestCategory.push(category);
                }
            }
            altDataStatistics.categories = categories;
            altDataStatistics.categoryMinMaxWG = categoryMinMaxWG;
            altDataStatistics.highestCategory = highestCategory;
        } catch {}
    }
    
    return(altDataStatistics);
}


export function altUpdateSpecWithData(
    altGoslingSpec: AltGoslingSpec, 
    id: string, 
    flatTileData: Datum[]
): AltGoslingSpec {

    // get correct track index
    for (let i = 0; i < Object.keys(altGoslingSpec.tracks).length; i++) {

        if(i === 3) {
            continue
        }

        if (altGoslingSpec.tracks[i].uid === id) {

            // get genomic field headers for that track
            const fields = altGoslingSpec.tracks[i].data.details.fields;

            // retrieve data statistics
            const altDataStatistics = altRetrieveDataStatistics(id, flatTileData, fields);

            // fill in data
            altGoslingSpec.tracks[i].data.details.dataStatistics = altDataStatistics;

            // update description            

        }
    }

    return(altGoslingSpec);
}
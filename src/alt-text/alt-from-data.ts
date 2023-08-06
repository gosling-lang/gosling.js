//const _spec = models[0]?.spec(); _spec?.id
import type { AltGoslingSpec, AltTrackDataFields, AltDataStatistics } from './alt-gosling-schema';
import type { Datum } from '../core/gosling.schema';

export function altRetrieveDataStatistics(id: string, flatTileData: Datum[], dataFields: AltTrackDataFields): AltDataStatistics {

    const genomicValues = (flatTileData.map(d => d[dataFields.genomicField]) as unknown as number[]).filter(d => !isNaN(d));
    const genomicMin = Math.min(...genomicValues)
    const genomicMax = Math.max(...genomicValues)
    
    console.log('genomic range: ', genomicMin, genomicMax)

    const valueValues = (flatTileData.map(d => d[dataFields.valueField]) as unknown as number[]).filter(d => !isNaN(d));
    const valueMin = Math.min(...valueValues)
    const valueMax = Math.max(...valueValues)

    const altDataStatistics: AltDataStatistics = {
        id: id,
        flatTileData: flatTileData,
        genomicMin: genomicMin,
        genomicMax: genomicMax,
        valueMin: valueMin,
        valueMax: valueMax
    }

    if (dataFields.categoryField !== '') {
        var categoryValues = flatTileData.map(d => d[dataFields.categoryField]);
        const categories = [... new Set(categoryValues)] as unknown as string[]
        //const categoryMinMax: { [key: string]: number[] } = {};
        const categoryMinMaxWG: { [key: string]: (number | number[])[] } = {};

        for (let category of categories) {
            let dataCat = flatTileData.filter(d => d[dataFields.categoryField] === category);
            let valueValuesCat = (dataCat.map(d => d[dataFields.valueField]) as unknown as number[]).filter(d => !isNaN(d));
            let valueMinCat = Math.min(...valueValuesCat);
            let valueMaxCat = Math.max(...valueValuesCat);

            let valueMinCatGenomic = (dataCat.filter(d => d[dataFields.valueField] == valueMinCat).map(d => d[dataFields.genomicField]) as unknown as number[])
            let valueMaxCatGenomic = (dataCat.filter(d => d[dataFields.valueField] == valueMaxCat).map(d => d[dataFields.genomicField]) as unknown as number[])

            //categoryMinMax[category] = [valueMinCat, valueMaxCat];
            categoryMinMaxWG[category] = [valueMinCat, valueMinCatGenomic, valueMaxCat, valueMaxCatGenomic];
        }

        altDataStatistics.categories = categories;
        altDataStatistics.categoryMinMaxWG = categoryMinMaxWG;
    }

    return(altDataStatistics);
}
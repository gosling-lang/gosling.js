import { BasicSingleTrack, Datum } from '../gemini.schema';
import { getChannelKeysByAggregateFnc, getChannelKeysByType, IsChannelDeep } from '../gemini.schema.guards';

export interface FilterSpec {
    field: string;
    oneOf: string[];
}

export function transformData(data: Datum[], filters: FilterSpec[]) {
    let filteredData = data.slice();
    filters.forEach(f => {
        filteredData = filteredData.filter(d => f.oneOf.indexOf(d[f.field] as string) !== -1);
    });
    return filteredData;
}

/**
 * Experimental! Only support one category supported yet.
 */
export function aggregateData(spec: BasicSingleTrack, data: Datum[]): Datum[] {
    if (getChannelKeysByAggregateFnc(spec).length === 0) {
        // we do not have aggregated fields
        return data;
    }

    const nChannelKeys = getChannelKeysByType(spec, 'nominal');

    if (nChannelKeys.length !== 1) {
        console.warn('Currently, we only support aggregating datasets with single nominal field.');
        return data;
    }

    const nFieldSpec = spec[nChannelKeys[0]];
    if (!IsChannelDeep(nFieldSpec)) {
        // this shouldn't be reached
        return data;
    }

    const nField = nFieldSpec.field;
    if (!nField) {
        // this shouldn't be reached
        return data;
    }

    const qChannelKeys = [...getChannelKeysByType(spec, 'quantitative'), ...getChannelKeysByType(spec, 'genomic')];
    const aggregated: { [k: string]: number | string }[] = [];

    const uniqueCategories = Array.from(new Set(data.map(d => d[nField])));

    let failed = false;
    uniqueCategories.forEach(c => {
        const datum: { [k: string]: string | number } = {};

        datum[nField] = c;

        // for each quantitative fields
        qChannelKeys.forEach(q => {
            const qFieldSpec = spec[q];
            if (!IsChannelDeep(qFieldSpec)) {
                // this shouldn't be reached
                failed = true;
                return;
            }

            const { field: qField, aggregate } = qFieldSpec;
            if (!qField || !aggregate) {
                // this shouldn't be reached
                failed = true;
                return;
            }

            datum[qField] =
                aggregate === 'max'
                    ? Math.max(...data.filter(d => d[nField] === c).map(d => +d[qField]))
                    : Math.min(...data.filter(d => d[nField] === c).map(d => +d[qField]));
        });

        aggregated.push(datum);
    });

    // set aggregated data only if we successfully generated it
    return !failed ? aggregated : data;
}

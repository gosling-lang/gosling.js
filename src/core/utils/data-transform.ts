import { SingleTrack, Datum, FilterTransform } from '../gosling.schema';
import {
    getChannelKeysByAggregateFnc,
    getChannelKeysByType,
    IsChannelDeep,
    IsIncludeFilter,
    IsOneOfFilter,
    IsRangeFilter
} from '../gosling.schema.guards';

/**
 * Apply data transformation and return the transformed.
 * This currently only consider `filter` specs.
 */
export function filterData(spec: FilterTransform[] | undefined, data: Datum[]): Datum[] {
    let output: Datum[] = Array.from(data);
    spec?.forEach(filter => {
        const { field, not } = filter;
        if (IsOneOfFilter(filter)) {
            const { oneOf } = filter;
            output = output.filter((d: Datum) => {
                return not ? (oneOf as any[]).indexOf(d[field]) === -1 : (oneOf as any[]).indexOf(d[field]) !== -1;
            });
        } else if (IsRangeFilter(filter)) {
            const { inRange } = filter;
            output = output.filter((d: Datum) => {
                return not
                    ? !(inRange[0] <= d[field] && d[field] <= inRange[1])
                    : inRange[0] <= d[field] && d[field] <= inRange[1];
            });
        } else if (IsIncludeFilter(filter)) {
            const { include } = filter;
            output = output.filter((d: Datum) => {
                return not ? `${d[field]}`.includes(include) : !`${d[field]}`.includes(include);
            });
        }
    });
    return output;
}

/**
 * Experimental! Only support one category supported yet.
 */
export function aggregateData(spec: SingleTrack, data: Datum[]): Datum[] {
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

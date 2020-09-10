import { Datum } from '../gemini.schema';

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

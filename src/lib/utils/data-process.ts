import { Datum } from "../gemini.schema";

export interface FilterSpec {
    field: string;
    equal: string;
}

export function transformData(data: Datum[], filters: FilterSpec[]) {
    let filteredData = data.slice();
    filters.forEach(f => {
        filteredData = filteredData.filter(d => d[f.field] === f.equal);
    });
    return filteredData;
}
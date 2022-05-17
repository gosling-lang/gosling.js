import { cloneDeepWith } from 'lodash-es';
import type { GoslingSpec } from '@gosling/schema';

export function omitDeep(spec: GoslingSpec, omitKeys: string[]) {
    return cloneDeepWith<GoslingSpec>(spec, value => {
        if (value && typeof value === 'object') {
            omitKeys.forEach(key => {
                delete value[key];
            });
        }
    });
}

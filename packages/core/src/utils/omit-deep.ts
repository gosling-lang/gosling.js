import { cloneDeepWith, CloneDeepWithCustomizer } from 'lodash';
import type { GoslingSpec } from '@gosling/schema';

export function omitDeep(spec: GoslingSpec, omitKeys: string[]) {
    return cloneDeepWith(spec, (value: CloneDeepWithCustomizer<GoslingSpec>) => {
        if (value && typeof value === 'object') {
            omitKeys.forEach(key => {
                delete value[key];
            });
        }
    });
}

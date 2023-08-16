import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { cloneDeepWith } from 'lodash-es';
import { isObject } from '@gosling-lang/gosling-schema';

export function omitDeep(spec: GoslingSpec, omitKeys: string[]) {
    return cloneDeepWith(spec, (value: unknown) => {
        if (isObject(value)) {
            omitKeys.forEach(key => {
                delete value[key];
            });
        }
    });
}

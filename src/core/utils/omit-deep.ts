import type { GoslingSpec } from '@gosling.schema';
import { cloneDeepWith } from 'lodash-es';
import { isObject } from '../gosling.schema.guards';

export function omitDeep(spec: GoslingSpec, omitKeys: string[]) {
    return cloneDeepWith(spec, (value: unknown) => {
        if (isObject(value)) {
            omitKeys.forEach(key => {
                delete value[key];
            });
        }
    });
}

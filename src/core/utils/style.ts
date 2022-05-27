import { assign } from 'lodash-es';
import type { Style } from '../gosling.schema';

export function getStyleOverridden(parent: Style | undefined, child: Style | undefined) {
    // Deep overriding instead of replacing.
    const base = parent ? JSON.parse(JSON.stringify(parent)) : {};
    return child ? assign(base, child) : base;
}

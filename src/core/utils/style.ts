import { assign } from 'lodash';
import { TrackStyle } from '../gosling.schema';

export function getStyleOverridden(parent: TrackStyle | undefined, child: TrackStyle | undefined) {
    // Deep overriding instead of replacing.
    const base = parent ? JSON.parse(JSON.stringify(parent)) : {};
    return child ? assign(base, child) : base;
}

import type { Style } from '@gosling-lang/gosling-schema';

export function getStyleOverridden(parent: Style | undefined, child: Style | undefined) {
    // Deep overriding instead of replacing.
    const base = parent ? JSON.parse(JSON.stringify(parent)) : {};
    return child ? Object.assign(base, child) : base;
}

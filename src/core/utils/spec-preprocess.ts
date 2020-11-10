import { GeminiSpec, GlyphElement } from '../gemini.schema';

/**
 * Update track-level specs considering the root-level specs (e.g., arrangements).
 * @param spec
 */
export function fixSpecDownstream(spec: GeminiSpec) {
    /**
     * Flag tracks to use circular marks
     */
    if (spec.layout?.type === 'circular') {
        // We need to let individual tracks know that they are rendered in a circular layout
        spec.tracks.forEach(t => {
            t._is_circular = true;
        });
    }
}

/**
 * Domains and ranges in conditional marks are moved into `select` option for the compiling simplicity.
 * @param elements
 */
export function deepToLongElements(elements: GlyphElement[]) {
    const longElements: GlyphElement[] = [];
    elements.forEach(element => {
        if (typeof element.mark === 'object') {
            const { bind } = element.mark;
            for (let i = 0; i < element.mark.domain.length; i++) {
                const domain = element.mark.domain[i];
                const range = element.mark.range[i];
                const select = element.select ? element.select : [];
                longElements.push({
                    ...element,
                    mark: range,
                    select: [...select, { channel: bind, oneOf: [domain] }]
                });
            }
        } else {
            longElements.push(element);
        }
    });
    return longElements;
}

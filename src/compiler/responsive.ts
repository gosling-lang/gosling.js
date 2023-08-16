import type { GoslingSpec, SelectivityCondition, SingleView } from '@gosling-lang/gosling-schema';
import { logicalComparison } from '../core/utils/semantic-zoom';

export function manageResponsiveSpecs(
    spec: GoslingSpec | SingleView,
    wFactor: number,
    hFactor: number,
    parentWidth: number,
    parentHeight: number
): boolean {
    if (typeof spec._assignedWidth === 'undefined' || typeof spec._assignedHeight === 'undefined') {
        console.warn('Responsive spec cannot be used when width and height of a view is not determined yet.');
        return false;
    }

    let replaced = false;

    const { responsiveSpec } = spec;

    const width = spec._assignedWidth * wFactor;
    const height = spec._assignedHeight * hFactor;
    const dimensions = { width, height, aspectRatio: width / height };
    const parentDimensions = { width: parentWidth, height: parentHeight, aspectRatio: parentWidth / parentHeight };

    // Check whether any alternative specs fullfil the condition
    if (responsiveSpec) {
        // TODO: Specify types for `specAndCondition`
        responsiveSpec.forEach((specAndCondition: any) => {
            const { spec: alternativeSpec, selectivity } = specAndCondition;

            if (isSelectResponsiveSpec(selectivity, dimensions, parentDimensions) && !replaced) {
                // Override this alternative spec in this view
                Object.keys(alternativeSpec).forEach(k => {
                    (spec as any)[k] = (alternativeSpec as any)[k];
                });
                delete spec.responsiveSpec;

                replaced = true;

                // now that we replaced a spec already, get out of this scope.
                return;
            }
        });
    }

    if ('views' in spec) {
        // This means we need to go deeper
        spec.views.forEach(view => {
            replaced = manageResponsiveSpecs(view, wFactor, hFactor, parentWidth, parentHeight) || replaced;
        });
    }

    return replaced;
}

/**
 * Test if given conditions are all `true`.
 * @param conditions
 * @param assignedDimensions
 * @returns
 */
function isSelectResponsiveSpec(
    conditions: SelectivityCondition[],
    assignedDimensions: { width: number; height: number; aspectRatio: number },
    parentDimensions: { width: number; height: number; aspectRatio: number }
): boolean {
    if (conditions.length === 0) return false;

    let isSelect = true;

    conditions.forEach(condition => {
        const { measure, operation, threshold, target } = condition;
        isSelect =
            isSelect &&
            logicalComparison(
                (target === 'container' ? parentDimensions : assignedDimensions)[measure],
                operation,
                threshold
            ) === 1;
    });

    return isSelect;
}

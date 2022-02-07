import { GoslingSpec, SelectivityCondition, SingleView } from '@gosling.schema';
import { logicalComparison } from './utils/semantic-zoom';

export function manageResponsiveSpecs(spec: GoslingSpec | SingleView, wFactor: number, hFactor: number): boolean {
    if (typeof spec._assignedWidth === 'undefined' || typeof spec._assignedHeight === 'undefined') {
        console.warn('Responsive spec cannot be used when width and height of a view is not determined yet.');
        return false;
    }

    let replaced = false;

    const { responsiveSpec } = spec;

    const size = { width: spec._assignedWidth * wFactor, height: spec._assignedHeight * hFactor };

    // Check whether any alternative specs fullfil the condition
    if (responsiveSpec) {
        // TODO: Specify types for `specAndCondition`
        responsiveSpec.forEach((specAndCondition: any) => {
            const { spec: alternativeSpec, selectivity } = specAndCondition;

            if (isSelectResponsiveSpec(selectivity, size) && !replaced) {
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
            replaced = manageResponsiveSpecs(view, wFactor, hFactor) || replaced;
        });
    }

    return replaced;
}

/**
 * Test if given conditions are all `true`.
 * @param conditions
 * @param assignedSize
 * @returns
 */
function isSelectResponsiveSpec(
    conditions: SelectivityCondition[],
    assignedSize: { width: number; height: number }
): boolean {
    if (conditions.length === 0) return false;

    let isSelect = true;

    conditions.forEach(condition => {
        const { measure, operation, threshold } = condition;
        isSelect = isSelect && logicalComparison(assignedSize[measure], operation, threshold) === 1;
    });

    return isSelect;
}
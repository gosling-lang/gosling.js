import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import { manageResponsiveSpecs } from './responsive';

describe('ResponsiveSpec', () => {
    it('Spec without sufficient information should not be replaced', () => {
        {
            const replaced = manageResponsiveSpecs({ views: [] }, 1, 1, 100, 100);
            expect(replaced).toBe(false);
        }
        {
            const replaced = manageResponsiveSpecs({ views: [], responsiveSpec: [] }, 1, 1, 100, 100);
            expect(replaced).toBe(false);
        }
        {
            const replaced = manageResponsiveSpecs(
                { views: [], responsiveSpec: [{ spec: {}, selectivity: [] }] },
                1,
                1,
                1000,
                1000
            );
            expect(replaced).toBe(false);
        }
        {
            const replaced = manageResponsiveSpecs(
                {
                    views: [],
                    responsiveSpec: [
                        { spec: {}, selectivity: [{ measure: 'width', threshold: 1000, operation: 'LT' }] }
                    ]
                },
                1,
                1,
                1000,
                1000
            );
            expect(replaced).toBe(false); // no `_assignedWidth`
        }
    });
    it('Spec should be replaced', () => {
        {
            const spec: GoslingSpec = {
                _assignedWidth: 100,
                _assignedHeight: 100,
                layout: 'circular',
                views: [],
                responsiveSpec: [
                    {
                        spec: { layout: 'linear' },
                        selectivity: [{ measure: 'width', threshold: 1000, operation: 'LT' }]
                    }
                ]
            };
            const replaced = manageResponsiveSpecs(spec, 1, 1, 100, 100);
            expect(replaced).toBe(true);
            expect(spec.layout).toBe('linear');
        }
        {
            const spec: GoslingSpec = {
                _assignedWidth: 100,
                _assignedHeight: 100,
                layout: 'circular',
                views: [],
                responsiveSpec: [
                    {
                        spec: { layout: 'linear' },
                        selectivity: [{ measure: 'width', threshold: 1000, operation: 'LT', target: 'container' }]
                    }
                ]
            };
            const replaced = manageResponsiveSpecs(spec, 1, 1, 100, 100);
            expect(replaced).toBe(true);
            expect(spec.layout).toBe('linear');
        }
    });
});

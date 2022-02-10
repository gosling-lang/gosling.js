import { GoslingSpec } from '@gosling.schema';
import { manageResponsiveSpecs } from './responsive';

describe('ResponsiveSpec', () => {
    it('Spec without sufficient information should not be replaced', () => {
        {
            const replaced = manageResponsiveSpecs({ views: [] }, 1, 1);
            expect(replaced).toBe(false);
        }
        {
            const replaced = manageResponsiveSpecs({ views: [], responsiveSpec: [] }, 1, 1);
            expect(replaced).toBe(false);
        }
        {
            const replaced = manageResponsiveSpecs(
                { views: [], responsiveSpec: [{ spec: {}, selectivity: [] }] },
                1,
                1
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
                1
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
            const replaced = manageResponsiveSpecs(spec, 1, 1);
            expect(replaced).toBe(true);
            expect(spec.layout).toBe('linear');
        }
    });
});

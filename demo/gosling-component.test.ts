import { describe, it, expect } from 'vitest';
import { createElement, createRef, act } from 'react';
import { createRoot } from 'react-dom/client';
import { GoslingComponent, type GoslingRef } from './gosling-component';

describe('GoslingComponent', () => {
    it('exposes the api through ref', () => {
        (globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
        const ref = createRef<GoslingRef>();
        const root = createRoot(document.createElement('div'));
        act(() => root.render(createElement(GoslingComponent, { ref })));
        expect(ref.current?.api.getTracks).toBeTypeOf('function');
        act(() => root.unmount());
    });
});

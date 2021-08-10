import React from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '..';
import { GoslingComponent, GoslingComponentApi } from './gosling-component';
import { GoslingSpec } from './gosling.schema';

const MAX_TRIES = 120;

/**
 * Embed a Gosling component to a given HTMLElement.
 * @param element
 * @param spec
 */
export function embed(
    element: HTMLElement,
    spec: GoslingSpec,
    options?: {
        padding?: number;
        margin?: number | string;
        border?: string;
        id?: string;
        className?: string;
        theme?: Theme;
    }
): Promise<GoslingComponentApi> {
    const ref = React.createRef<{ api: GoslingComponentApi }>();
    return new Promise((resolve, reject) => {
        ReactDOM.render(React.createElement(GoslingComponent, { ref, spec, ...options }), element, () => {
            let tries = 0;
            const poll = setInterval(() => {
                if (ref?.current?.api) {
                    resolve(ref.current.api);
                    clearInterval(poll);
                }
                if (tries === MAX_TRIES) {
                    reject(new Error('Could not resolve GoslingComponentAPI.'));
                }
                tries++;
            }, 500);
        });
    });
}

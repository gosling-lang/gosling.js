import React from 'react';
import ReactDOM from 'react-dom';

import { GoslingSpec } from './gosling.schema';
import { HiGlassSpec } from './higlass.schema';

import { validateGoslingSpec } from './utils/validate';
import { compile } from './compile';
import { getTheme } from './utils/theme';
import { GoslingTemplates } from './utils/template';
import { Api, createApi } from './api';

import { HiGlassApi, HiGlassComponentWrapper, HiGlassComponentWrapperProps } from './higlass-component-wrapper';

type EmbedOptions = HiGlassComponentWrapperProps['options'] & {
    id?: string;
    className?: string;
};

// https://github.com/higlass/higlass/blob/0299ae1229fb57e0ca8da31dff58003c3e5bf1cf/app/scripts/hglib.js#L37A
const launchHiglass = (
    element: HTMLElement,
    viewConfig: HiGlassSpec,
    size: { width: number; height: number },
    opts: EmbedOptions = {}
) => {
    const ref = React.createRef<HiGlassApi>();
    const { id, className, ...options } = opts;
    const props = { ref, viewConfig, size, id, className, options };
    ReactDOM.render(React.createElement(HiGlassComponentWrapper, props), element);
    return ref.current!;
};

/**
 * Embed a Gosling component to a given HTMLElement.
 * @param element
 * @param spec
 */
export function embed(element: HTMLElement, spec: GoslingSpec, options: EmbedOptions = {}) {
    return new Promise<Api>((resolve, reject) => {
        const valid = validateGoslingSpec(spec);

        if (valid.state === 'error') {
            reject(new Error('Gosling spec is not valid. Please refer to the console message.'));
        }
        const theme = getTheme(options.theme || 'light');
        compile(
            spec,
            (hsSpec, size) => {
                const hg = launchHiglass(element, hsSpec, size, options);
                const api = createApi(hg, hsSpec, theme);
                resolve(api);
            },
            [...GoslingTemplates],
            theme
        );
    });
}

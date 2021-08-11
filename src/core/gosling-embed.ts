import React from 'react';
import ReactDOM from 'react-dom';

import { GoslingSpec } from './gosling.schema';
import { HiGlassSpec } from './higlass.schema';

import { validateGoslingSpec } from './utils/validate';
import { compile } from './compile';
import { getTheme, Theme } from './utils/theme';
import { GoslingTemplates } from './utils/template';
import { Api, createApi } from './api';

import { HiGlassApi, HiGlassComponentWrapper, HiGlassComponentWrapperProps } from './higlass-component-wrapper';

export type GoslingEmbedOptions = Omit<HiGlassComponentWrapperProps['options'], 'background'> & {
    id?: string;
    className?: string;
    theme?: Theme;
};

// https://github.com/higlass/higlass/blob/0299ae1229fb57e0ca8da31dff58003c3e5bf1cf/app/scripts/hglib.js#L37A
const launchHiglass = (
    element: HTMLElement,
    viewConfig: HiGlassSpec,
    size: { width: number; height: number },
    opts: GoslingEmbedOptions & { background: string }
) => {
    const ref = React.createRef<HiGlassApi>();
    const component = React.createElement(HiGlassComponentWrapper, {
        ref,
        viewConfig,
        size,
        id: opts.id,
        className: opts.className,
        options: opts
    });
    ReactDOM.render(component, element);
    return ref.current!;
};

/**
 * Embed a Gosling component to a given HTMLElement.
 * @param element
 * @param spec
 */
export function embed(element: HTMLElement, spec: GoslingSpec, opts: GoslingEmbedOptions = {}) {
    return new Promise<Api>((resolve, reject) => {
        const valid = validateGoslingSpec(spec);

        if (valid.state === 'error') {
            reject(new Error('Gosling spec is not valid. Please refer to the console message.'));
        }

        const theme = getTheme(opts.theme || 'light');
        const options = { ...opts, background: theme.root.background };

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

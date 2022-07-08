import React from 'react';
import ReactDOM from 'react-dom';

import type { GoslingSpec } from './gosling.schema';
import type { HiGlassSpec } from './higlass.schema';

import { validateGoslingSpec } from './utils/validate';
import { compile } from './compile';
import { getTheme, Theme } from './utils/theme';
import { GoslingTemplates } from './utils/template';
import { GoslingApi, createApi } from './api';

import { HiGlassApi, HiGlassComponentWrapper, HiGlassComponentWrapperProps } from './higlass-component-wrapper';

export type GoslingEmbedOptions = Omit<HiGlassComponentWrapperProps['options'], 'background'> & {
    id?: string;
    className?: string;
    theme?: Theme;
};

const MAX_TRIES = 20;
const INTERVAL = 200; // ms

// https://github.com/higlass/higlass/blob/0299ae1229fb57e0ca8da31dff58003c3e5bf1cf/app/scripts/hglib.js#L37A
const launchHiglass = (
    element: HTMLElement,
    viewConfig: HiGlassSpec,
    size: { width: number; height: number },
    opts: GoslingEmbedOptions & { background: string }
): Promise<HiGlassApi> => {
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

    // For some reason our wrapper component fails to initialize the provided `ref`
    // immediately like `hglib.launch()`. This is a work-around to poll `ref`
    // until it is initialized by our wrapper. We return a promise for the API once
    // it is defined or raise an error.
    // https://github.com/gosling-lang/gosling.js/pull/456#discussion_r687861694
    return new Promise((resolve, reject) => {
        let tries = 0;
        const poll = setInterval(() => {
            if (ref && ref.current) {
                clearInterval(poll);
                resolve(ref.current);
            }
            if (tries >= MAX_TRIES) {
                reject(new Error('Failed to initialize HiGlassApi.'));
            }
            tries++;
        }, INTERVAL);
    });
};

/**
 * Embed a Gosling component to a given HTMLElement.
 * @param element
 * @param spec
 * @param opts
 */
function _embed(element: HTMLElement, spec: GoslingSpec, opts: GoslingEmbedOptions = {}) {
    return new Promise<GoslingApi>((resolve, reject) => {
        const valid = validateGoslingSpec(spec);

        if (valid.state === 'error') {
            reject(new Error('Gosling spec is not valid. Please refer to the console message.'));
        }

        const theme = getTheme(opts.theme || 'light');
        const options = {
            ...opts,
            background: theme.root.background,
            alt: opts.alt ?? spec.description ?? 'Gosling visualization'
        };

        compile(
            spec,
            async (hsSpec, size) => {
                const hg = await launchHiglass(element, hsSpec, size, options);
                const api = createApi(hg, hsSpec, theme);
                resolve(api);
            },
            [...GoslingTemplates],
            theme,
            {} // TODO: properly specify this
        );
    });
}

// https://github.com/vega/vega-embed/blob/master/src/container.ts
const container = async (spec: GoslingSpec, opt = {}) => {
    const wrapper = document.createElement('div');
    const div = document.createElement('div');
    wrapper.appendChild(div);
    const result = await _embed(div, spec, opt);
    return Object.assign(wrapper, { value: result });
};

const isElement = (x: unknown) => x instanceof HTMLElement;

const isString = (x: unknown) => typeof x === 'string';

function isURL(s: string): boolean {
    return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//');
}

/**
 * Embed a Gosling component in an HTML element.
 *
 * If no HTMLElement is provided, one will be created with instance API appended as the `value` property.
 * This is useful for running Gosling.js directly in Observable notebooks.
 */
export function embed(element: HTMLElement, spec: GoslingSpec, opts?: GoslingEmbedOptions): Promise<GoslingApi>;
export function embed(spec: GoslingSpec, opts?: GoslingEmbedOptions): Promise<HTMLDivElement & { value: GoslingApi }>;
export function embed(...args: any[]) {
    if (args.length > 1 && ((isString(args[0]) && !isURL(args[0])) || isElement(args[0]) || args.length === 3)) {
        return _embed(args[0], args[1], args[2]);
    }
    return container(args[0], args[1]);
}

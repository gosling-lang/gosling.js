import { embed as goslingEmbed } from 'gosling.js';
import type { GoslingSpec } from '@gosling-lang/gosling-schema';
import 'higlass/dist/hglib.css';

// https://github.com/vega/vega-embed/blob/master/src/container.ts
const container = async (spec: GoslingSpec, opt = {}) => {
    const wrapper = <any>document.createElement('div');
    const div = document.createElement('div');
    wrapper.appendChild(div);
    const result = await goslingEmbed(div, spec, opt);
    wrapper.value = result;
    return wrapper;
};

const isElement = (x: unknown) => x instanceof HTMLElement;
const isString = (x: unknown) => typeof x === 'string';
function isURL(s: string): boolean {
  return s.startsWith('http://') || s.startsWith('https://') || s.startsWith('//');
}

export function embed(...args: any[]) {
    if (
        args.length > 1 &&
        (
          (isString(args[0]) && !isURL(args[0])) ||
          isElement(args[0]) ||
          args.length === 3
        )
    ) {
        return goslingEmbed(args[0], args[1], args[2]);
    }
    return container(args[0], args[1]);
};

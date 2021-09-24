import { embed as goslingEmbed } from 'gosling.js';
import 'higlass/dist/hglib.css';

// https://github.com/vega/vega-embed/blob/master/src/container.ts
const container = async (spec, opt = {}) => {
    const wrapper = document.createElement('div');
    const div = document.createElement('div');
    wrapper.appendChild(div);
    const result = await goslingEmbed(div, spec, opt);
    wrapper.value = result;
    return wrapper;
};

const isElement = (x) => x instanceof HTMLElement;
const isString = (x) => typeof x === 'string';

export const embed = (...args) => {
    if (
        args.length > 1 &&
        ((isString(args[0]) && !isURL(args[0])) || isElement(args[0]) ||
            args.length === 3)
    ) {
        return goslingEmbed(args[0], args[1], args[2]);
    }
    return container(args[0], args[1]);
};

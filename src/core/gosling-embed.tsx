import React from 'react';
import ReactDOM from 'react-dom';
import { GoslingComponent } from './gosling-component';
import { GoslingSpec } from './gosling.schema';

/**
 * Embed a Gosling component to a given HTMLElement.
 * @param element
 * @param spec
 */
export function embed(element: HTMLElement, spec: GoslingSpec) {
    // const ref = React.createRef();
    ReactDOM.render(<GoslingComponent spec={spec} />, element);
    // return ref.current;
}

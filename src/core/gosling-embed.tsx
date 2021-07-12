import React from 'react';
import ReactDOM from 'react-dom';
import { Theme } from '..';
import { GoslingComponent } from './gosling-component';
import { GoslingSpec } from './gosling.schema';

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
) {
    // const ref = React.createRef();
    ReactDOM.render(
        <GoslingComponent
            spec={spec}
            padding={options?.padding}
            margin={options?.margin}
            border={options?.border}
            id={options?.id}
            className={options?.className}
            theme={options?.theme}
        />,
        element
    );
    // return ref.current;
}

import * as React from 'react';
import type { AltGoslingSpec, AltTrack } from 'src/alt-text/alt-gosling-schema';


// Will be replaced with @mui tree once merged with thomcsmits/alt-text-tree-mui
export function createTree(data: any) {

    return(
        <ul>
            {Object.keys(data).map(key => (
                <li>
                    {key}
                    {typeof(data[key]) === 'object' ? (
                        createTree(data[key])
                    ): null}
                </li>
            ))}
        </ul>
    )
}
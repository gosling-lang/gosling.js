import React, { useState, useEffect } from 'react';
import { PixiManager } from '@pixi-manager';
import {
    addDummyTrack,
    addTextTrack,
    addCircularBrush,
    addGoslingTrack,
    addAxisTrack,
    addLinearBrush,
    addBigwig
} from './examples';
import { compile } from '../src/compiler/compile';
import { getTheme } from '../src/core/utils/theme';

import './App.css';
function App() {
    const [fps, setFps] = useState(120);

    useEffect(() => {
        // Create the new plot
        const plotElement = document.getElementById('plot') as HTMLDivElement;
        plotElement.innerHTML = '';
        // Initialize the PixiManager. This will be used to get containers and overlay divs for the plots
        const pixiManager = new PixiManager(1000, 600, plotElement, setFps);
        addTextTrack(pixiManager);
        addDummyTrack(pixiManager);
        addCircularBrush(pixiManager);
        addGoslingTrack(pixiManager);
        addAxisTrack(pixiManager);
        addLinearBrush(pixiManager);
        addBigwig(pixiManager);

        const callback = (hg, size, gs, tracksAndViews, idTable) => {
            console.warn(hg);
            console.warn(size);
            console.warn(gs);
            console.warn(tracksAndViews);
            console.warn(idTable);
        };

        // Compile the spec
        compile(spec, callback, [], getTheme('light'), { containerSize: { width: 600, height: 600 } });
    }, []);

    return (
        <>
            <h1>HiGlass/Gosling tracks with new renderer</h1>

            <div className="card">
                <div className="card" id="plot"></div>
            </div>
        </>
    );
}

export default App;

const spec = {
    title: 'Basic Marks: line',
    subtitle: 'Tutorial Examples',
    tracks: [
        {
            layout: 'linear',
            width: 800,
            height: 180,
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'line',
            x: { field: 'position', type: 'genomic', axis: 'bottom' },
            y: { field: 'peak', type: 'quantitative', axis: 'right' },
            size: { value: 2 }
        },
        {
            layout: 'linear',
            width: 800,
            height: 180,
            data: {
                url: 'https://resgen.io/api/v1/tileset_info/?d=UvVPeLHuRDiYA3qwFlm7xQ',
                type: 'multivec',
                row: 'sample',
                column: 'position',
                value: 'peak',
                categories: ['sample 1']
            },
            mark: 'bar',
            x: { field: 'position', type: 'genomic', axis: 'bottom' },
            y: { field: 'peak', type: 'quantitative', axis: 'right' },
            size: { value: 2 }
        }
    ]
};

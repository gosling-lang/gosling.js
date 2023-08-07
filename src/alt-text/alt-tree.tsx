import * as React from 'react';
import type { AltGoslingSpec, AltTrack } from 'src/alt-text/alt-gosling-schema';


export function createTree(data: AltGoslingSpec) {

    return(
        <div>
            <ul className = 'alt-tree'>
                <li className = 'alt-single'>
                    Alt text: {data.alt}
                </li>

                <li className = 'alt-single'>
                    Long description: {data.longDescription}
                </li>

                {data.title ? (
                    <li className = 'alt-single'>
                        Title: '{data.title}'
                    </li>
                ): null}
                
                {data.subtitle ? (
                    <li className = 'alt-single'>
                     Subtitle: '{data.subtitle}'
                    </li>
                ): null}

                <li className = 'alt-parent'>
                    Composition
                    <ul>
                        <li className = 'alt-single'>
                            Description: {data.composition.description}
                        </li>
                        <li className = 'alt-single'>
                            Number of tracks: {data.composition.nTracks}
                        </li>             
                    </ul>
                </li>

                <li>
                    Tracks
                    <ul>
                        <li>
                            0
                            {createTreeTrack(data.tracks[0])}
                        </li>
                    </ul>
                    
                     {/* {Object.keys(data.tracks).map(t => 
                    <li>
                        {data.tracks[t]}
                        {createTreeTrack(t)}
                    </li>
                    )} */}
                </li>

            </ul>
        </div>
    )
}


function createTreeTrack(t: AltTrack) {

    return(
        <ul>
            <li>
                Track description: {t.description}
            </li>
            <li>
                Track position: {t.position.description}
            </li>
        </ul>
    )
}
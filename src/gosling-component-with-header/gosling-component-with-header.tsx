import React, { createContext, useContext, useRef, type ComponentPropsWithRef, useLayoutEffect, useState, forwardRef, useMemo, useEffect } from 'react';
import { GoslingComponent, type GoslingRef } from '../core/gosling-component';
import type { TrackApiData } from '@gosling-lang/gosling-schema'
import './gosling-component-with-header.css';

const ZOOM_DURATION = 300;

type goslingCompoProps = ComponentPropsWithRef<typeof GoslingComponent>;
const GoslingContext = createContext<goslingCompoProps>({});

type GoslingComponentWithHeaderProps = goslingCompoProps & {
    // ... anything to add?
};

export const GoslingComponentWithHeader = forwardRef<GoslingRef, GoslingComponentWithHeaderProps>((props) => {
    const ref = useRef<GoslingRef>(null);

    const [isKeyboardMode, setIsKeyboardMode] = useState(false);
    const [tracks, setTracks] = useState<TrackApiData[]>([]);
    const [selectedTrackIndex, setSelectedTrackIndex] = useState<number>(0);

    type NavigationType = '<' | '>' | '+' | '-' | string;
    const navigationFn = (type: NavigationType) => {
        const trackId = tracks[selectedTrackIndex].id;

        let [start, end] = ref.current?.hgApi.api.getLocation(trackId).xDomain;
        const delta = (end - start) / 3.0;
        if(type === '+') {
            start += delta;
            end -= delta;
        } else if(type === '-') {
            start -= delta;
            end += delta;
        } else if(type === '<') {
            start -= delta;
            end -= delta;
        } else if(type === '>') {
            start += delta;
            end += delta;
        } else {
            if(type.includes('chr')) {
                // chr1:100-200
                ref?.current?.api.zoomTo(trackId, type, 0, ZOOM_DURATION);
            } else {
                // MYC
                ref?.current?.api.suggestGene(trackId, type, (genes) => {
                    if(genes.length > 0) {
                        ref?.current?.api.zoomToGene(trackId, genes[0].geneName, 0, ZOOM_DURATION);
                    }
                });
            }
        }
        ref?.current?.api.zoomTo(trackId, `chr1:${start}-${end}`, 1, ZOOM_DURATION);
    };

    const Header = useMemo(() => {
        return (
            <div id='gosling-component-header' style={{ border: "1px solid grey" }}>
                {'Experimental! '}
                <select value={tracks[selectedTrackIndex]?.id}>{tracks.map((d, i) => <option value={d.id} onSelect={() => setSelectedTrackIndex(i)}>{d.id}</option>)}</select>
                <button 
                    className={isKeyboardMode ? 'sel-btn-activated' : 'sel-btn'}
                    onClick={() => setIsKeyboardMode(!isKeyboardMode)}
                >🕹️</button>
                <input type='text' placeholder='chr1:100-200' 
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') navigationFn(e.currentTarget.value);
                    }}
                ></input>
                {['<', '>', '+', '-'].map(d => <button onClick={() => navigationFn(d)}>{d}</button>)}
                <button onClick={() => ref?.current?.api.exportPng()}>Save PNG</button>
                <button onClick={() => ref?.current?.api.exportPdf()}>Save PDF</button>
            </div>
        );
    }, [tracks, isKeyboardMode, selectedTrackIndex]);

    const SelectedOutline = useMemo(() => { 
        if(!isKeyboardMode || !tracks[selectedTrackIndex]) return;
        // console.log(tracks[selectedTrackIndex]);
        const selectedTrack = tracks[selectedTrackIndex];
        let circularPadding = 0;
        if('outerRadius' in selectedTrack.shape) {
            circularPadding = (selectedTrack.shape.width - selectedTrack.shape.outerRadius * 2) / 2.0;
        }
        return (
            <div style={{
                left: selectedTrack.shape.x + 60 + 4 + circularPadding / 2.0,
                top: selectedTrack.shape.y + 60 + 30 + 4 + circularPadding / 2.0,
                width: `${selectedTrack.shape.width - circularPadding}px`,
                height: `${selectedTrack.shape.height - circularPadding}px`,
                border: '2px solid blue',
                position: 'absolute',
            }}></div>
        );
    }, [isKeyboardMode, selectedTrackIndex, tracks]);

    return (
        <GoslingContext.Provider value={{ ...props, ref }}>
            <div onKeyDown={(e) => {
                if(!isKeyboardMode) return;
                switch(e.key) {
                    case 'ArrowDown':
                        setSelectedTrackIndex((selectedTrackIndex + 1) % tracks.length);
                        event?.preventDefault(); // disable scroll
                        break;
                    case 'ArrowUp':
                        setSelectedTrackIndex((selectedTrackIndex - 1 + tracks.length) % tracks.length);
                        event?.preventDefault(); // disable scroll
                        break;
                }
            }}>
                {/* XXX: Handle the sizing of Gosling Component */}
                {Header}
                <GoslingComponent {...props} ref={ref} compiled={(...args) => {
                    setTimeout(() => {
                        const tracks = ref.current?.api.getTracks() ?? [];
                        const tracksWithoutTitle = tracks.filter(d => d.spec.mark !== 'header'); // header is the title
                        setTracks(tracksWithoutTitle);
                    }, 100);
                    
                    // Call this function for the user-defined callback
                    props.compiled?.(...args);
                }}/>
                {SelectedOutline}
            </div>
        </GoslingContext.Provider>
    );
});

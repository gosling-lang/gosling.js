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

// forwardRef<GoslingRef, GoslingCompProps>((props, ref) => {
    // (props: GoslingComponentWithHeaderProps) {
export const GoslingComponentWithHeader = forwardRef<GoslingRef, GoslingComponentWithHeaderProps>((props) => {
    const ref = useRef<GoslingRef>(null);

    const [selection, setSelection] = useState(false);
    const [tracks, setTracks] = useState<TrackApiData[]>([]);
    const [selectedTrackIdx, setSelectedTrackIdx] = useState<number>(0);

    useEffect(() => {
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    setSelectedTrackIdx((selectedTrackIdx + 1) % tracks.length);
                    event?.preventDefault();
                    break;
                case 'ArrowUp':
                    setSelectedTrackIdx((selectedTrackIdx - 1) % tracks.length);
                    event?.preventDefault();
                    break;
            }
        });
        return document.removeEventListener('keydown', () => {});
    }, []);

    type NavigationType = '<' | '>' | '+' | '-' | string;
    const navigationFn = (type: NavigationType) => {
        const trackIds = ref.current?.api.getTrackIds();
        
        if(!trackIds || trackIds.length === 0) {
            return;
        }

        const trackId = trackIds[selectedTrackIdx ?? 1];

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
        ref?.current?.api.zoomTo(trackId, `chr1:${start}-${end}`, 0, ZOOM_DURATION);
    };

    const Header = useMemo(() => {
        // const { ref } = useContext(GoslingContext);
        return (
            <div id='gosling-component-header' style={{ border: "1px solid grey" }}>
                {'Experimental! '}
                <select>{tracks.map((d, i) => <option onSelect={() => setSelectedTrackIdx(i)}>{d.id}</option>)}</select>
                <button 
                    className={selection ? 'sel-btn-activated' : 'sel-btn'}
                    onClick={() => setSelection(!selection)}
                >🕹️</button>
                <input type='text' placeholder='chr1:100-200' 
                    onKeyDown={(e) => {
                        if(e.key === 'Enter') navigationFn(e.currentTarget.value);
                    }}
                ></input>
                {['<', '>', '+', '-'].map((d: NavigationType) => <button onClick={() => navigationFn(d)}>{d}</button>)}
                <button onClick={() => ref?.current?.api.exportPng()}>Save PNG</button>
                <button onClick={() => ref?.current?.api.exportPng()}>Save PNG</button>
            </div>
        );
    }, [tracks, selection]);

    const Selection = useMemo(() => { 
        if(!selection || !tracks[selectedTrackIdx]) return;
        return (
            <div style={{
                left: tracks[selectedTrackIdx].shape.x + 60 + 4,
                top: tracks[selectedTrackIdx].shape.y + 60 + 30 + 4,
                width: `${tracks[selectedTrackIdx].shape.width}px`,
                height: `${tracks[selectedTrackIdx].shape.height}px`,
                border: '2px solid blue',
                position: 'absolute',
            }}></div>
        );
    }, [selection, selectedTrackIdx, tracks]);

    return (
        <GoslingContext.Provider value={{ ...props, ref }}>
            {/* XXX: Handle the sizing of Gosling Component */}
            {Header}
            <GoslingComponent {...props} ref={ref} compiled={(...args) => {
                // XXX: Update of track info is one React rendering cycle behind
                // Update Track information for API calls from <Header/>
                const _tracks = ref.current?.api.getTracks() ?? [];
                setTracks(_tracks.filter(d => d.spec.mark !== 'header'));
                console.error('compiled');
                // Call this function for the user-defined callback
                props.compiled?.(...args);
            }}/>
            {Selection}
        </GoslingContext.Provider>
    );
});

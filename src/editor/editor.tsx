import React, { useState, useEffect, useRef } from 'react';
import * as d3 from "d3"; // TODO: performance
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec, MarkDeep, Track, Datum } from '../lib/gemini.schema';
import { debounce } from "lodash";
import { demos } from './examples';
import './editor.css';
import { renderGlyphPreview } from '../lib/visualizations/glyph-preview';

const DEBUG_INIT_DEMO_INDEX = 0;

function Editor() {

    const glyphSvg = useRef<SVGSVGElement>(null);
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [demo, setDemo] = useState(demos[DEBUG_INIT_DEMO_INDEX]);
    const [gm, setGm] = useState(stringify(demos[DEBUG_INIT_DEMO_INDEX].spec as GeminiSpec));

    useEffect(() => {
        setGm(stringify(demo.spec as GeminiSpec));
    }, [demo]);

    useEffect(() => {
        let editedGm;
        try {
            editedGm = JSON.parse(gm);
        } catch (e) {
            console.warn("Cannnot parse the edited code.");
        }
        if (!editedGm) return;

        const track = (editedGm as GeminiSpec)?.tracks?.find(
            d => (d.mark as MarkDeep)?.type === "glyph"
        );
        if (!track) return;

        // TODO: Faster way of this?
        // TODO: Move this inside of a model
        d3.csv(track.data as string).then(data =>
            renderGlyphPreview(
                glyphSvg.current as SVGSVGElement,
                { ...track, data } as Track
            )
        );
    }, [gm]);

    return (
        <>
            <div className="demo-navbar">
                Gemini <code>Editor</code>
                <select
                    onChange={e => {
                        setDemo(demos.find(d => d.name === e.target.value) as any);
                    }}
                    defaultValue={demo.name}>
                    {demos.map(d => (
                        <option key={d.name} value={d.name}>
                            {d.name}
                        </option>
                    ))}
                </select>
            </div>
            <div className="editor">
                <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
                    {/* Gemini Editor */}
                    <EditorPanel
                        code={gm}
                        readOnly={false}
                        onChange={debounce(code => {
                            setGm(code);
                        }, 1000)}
                    />
                    {/* D3 Visualizations */}
                    <SplitPane split="horizontal" defaultSize="35%" onChange={() => { }}>
                        <div className="preview-container">
                            <b>Glyph Preview</b>
                            <div><svg ref={glyphSvg} /></div>
                        </div>
                        <div className="preview-container">
                            <b>Layout Preview</b>
                            <div><svg ref={layoutSvg} /></div>
                        </div>
                    </SplitPane>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;
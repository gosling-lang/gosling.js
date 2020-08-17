// @ts-ignore
import { GeminiTrack } from '../gemini-track/index';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import * as d3 from 'd3';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec, Track, IsDataDeep, IsMarkDeep, IsNotEmptyTrack } from '../lib/gemini.schema';
import { debounce } from 'lodash';
import { demos } from './examples';
import { renderGlyphPreview } from '../lib/visualizations/glyph-preview';
import { replaceGlyphs } from '../lib/utils';
import { renderLayoutPreview } from '../lib/visualizations/layout-preview';
import { calculateSize } from '../lib/utils/bounding-box';
import { HiGlassTrack } from '../lib/visualizations/higlass';
import './editor.css';

higlassRegister({
    name: 'GeminiTrack',
    track: GeminiTrack,
    config: GeminiTrack.config
});

const DEBUG_INIT_DEMO_INDEX = demos.length - 1;

function Editor() {
    const glyphSvg = useRef<SVGSVGElement>(null);
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [higlassTrackOptions, setHiGlassTrackOptions] = useState<HiGlassTrack[]>([
        // Debug
        // { viewConfig: testViewConfig, boundingBox: { x: 60, y: 60, width: 60, height: 500 } }
    ]);
    const [demo, setDemo] = useState(demos[DEBUG_INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Full Glyph Definition' | 'Predefined Glyph'>('Full Glyph Definition');
    const [gm, setGm] = useState(stringify(demos[DEBUG_INIT_DEMO_INDEX].spec as GeminiSpec));
    const [glyphWidth, setGlyphWidth] = useState(demos[DEBUG_INIT_DEMO_INDEX].glyphWidth);
    const [glyphHeight, setGlyphHeight] = useState(demos[DEBUG_INIT_DEMO_INDEX].glyphHeight);

    useEffect(() => {
        if (editorMode === 'Full Glyph Definition') {
            setGm(stringify(replaceGlyphs(JSON.parse(stringify(demo.spec)) as GeminiSpec)));
        } else {
            setGm(stringify(demo.spec as GeminiSpec));
        }
        setGlyphWidth(demo.glyphWidth);
        setGlyphHeight(demo.glyphHeight);
        setHiGlassTrackOptions([]);
    }, [demo, editorMode]);

    useEffect(() => {
        let editedGm;
        try {
            editedGm = replaceGlyphs(JSON.parse(gm));
        } catch (e) {
            console.warn('Cannnot parse the edited code.');
        }
        if (!editedGm) return;

        // Render layout preview
        renderLayoutPreview(
            layoutSvg.current as SVGSVGElement,
            editedGm as GeminiSpec,
            {
                x: 60,
                y: 60,
                width: calculateSize(editedGm).width,
                height: calculateSize(editedGm).height
            },
            (higlassInfo: HiGlassTrack[]) => {
                setHiGlassTrackOptions(higlassInfo);
            }
        );

        // Render glyph preview
        d3.select(glyphSvg.current).selectAll('*').remove();
        const track = (editedGm as GeminiSpec)?.tracks?.find(d =>
            IsNotEmptyTrack(d) && IsMarkDeep(d.mark) ? d.mark.type === 'compositeMark' : false
        );
        if (!track) return;

        if (IsNotEmptyTrack(track) && IsDataDeep(track.data)) {
            d3.csv(track.data.url).then(data =>
                renderGlyphPreview(
                    glyphSvg.current as SVGSVGElement,
                    { ...track, data } as Track,
                    glyphWidth,
                    glyphHeight
                )
            );
        }
    }, [gm, glyphWidth, glyphHeight]);

    const hglass = useMemo(() => {
        return higlassTrackOptions.map(op => (
            <div
                key={stringify(op.viewConfig)}
                style={{
                    position: 'absolute',
                    display: 'block',
                    left: op.boundingBox.x,
                    top: op.boundingBox.y,
                    width: op.boundingBox.width,
                    height: op.boundingBox.height
                }}
            >
                <HiGlassComponent
                    options={{
                        bounded: true,
                        containerPaddingX: 0,
                        containerPaddingY: 0,
                        viewMarginTop: 0,
                        viewMarginBottom: 0,
                        viewMarginLeft: 0,
                        viewMarginRight: 0,
                        viewPaddingTop: 0,
                        viewPaddingBottom: 0,
                        viewPaddingLeft: 0,
                        viewPaddingRight: 0,
                        sizeMode: 'bounded'
                    }}
                    viewConfig={op.viewConfig}
                />
            </div>
        ));
    }, [higlassTrackOptions]);

    return (
        <>
            <div className="demo-navbar">
                🧬 Gemini <code>Editor</code>
                <select
                    onChange={e => {
                        setDemo(demos.find(d => d.name === e.target.value) as any);
                    }}
                    defaultValue={demo.name}
                >
                    {demos.map(d => (
                        <option key={d.name} value={d.name}>
                            {d.name}
                        </option>
                    ))}
                </select>
                <select
                    onChange={e => {
                        setEditorMode(e.target.value as any);
                    }}
                    defaultValue={'Full Glyph Definition'}
                >
                    {['Full Glyph Definition', 'Predefined Glyph'].map(d => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
            </div>
            <div className="editor">
                <SplitPane className="split-pane-root" split="vertical" defaultSize="35%" onChange={undefined}>
                    <SplitPane split="horizontal" defaultSize="50%" onChange={undefined}>
                        {/* Gemini Editor */}
                        <EditorPanel
                            code={gm}
                            readOnly={false}
                            onChange={debounce(code => {
                                setGm(code);
                            }, 1000)}
                        />
                        {/* HiGlass View Config */}
                        <SplitPane split="vertical" defaultSize="100%" onChange={undefined}>
                            <>
                                <div className="editor-header">
                                    <b>Compiled HiGlass ViewConfigs</b>
                                </div>
                                <EditorPanel
                                    code={stringify(higlassTrackOptions.map(d => d.viewConfig))}
                                    readOnly={true}
                                    onChange={undefined}
                                />
                            </>
                            {/* 
                TODO: This is only for showing a scroll view for the higlass view config editor 
                Remove the below line and the nearest SplitPane after figuring out a better way 
                of showing the scroll view.
              */}
                            <></>
                        </SplitPane>
                    </SplitPane>
                    {/* D3 Visualizations */}
                    <SplitPane split="horizontal" defaultSize="0%" onChange={undefined}>
                        <div className="preview-container" hidden>
                            <b>Composite Mark Preview</b>
                            <div>
                                <svg ref={glyphSvg} />
                            </div>
                        </div>
                        <div className="preview-container">
                            <b>Layout Preview</b>
                            <div style={{ position: 'relative' }}>
                                <svg ref={layoutSvg} />
                                {hglass}
                            </div>
                        </div>
                    </SplitPane>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;

// @ts-ignore
import { GeminiTrack } from '../higlass-gemini-track/index';
import { CSVDataFetcher } from '../higlass-gemini-datafetcher/index';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
import React, { useState, useEffect, useRef, useMemo } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec } from '../core/gemini.schema';
import { debounce } from 'lodash';
import { examples } from './example';
import { replaceGlyphs } from '../core/utils';
import { renderLayoutPreview } from '../core/visualizations/layout-preview';
import { calculateSize } from '../core/utils/bounding-box';
import { HiGlassTrack } from '../core/visualizations/higlass';
import './editor.css';

higlassRegister({
    name: 'GeminiTrack',
    track: GeminiTrack,
    config: GeminiTrack.config
});

higlassRegister({ dataFetcher: CSVDataFetcher, config: CSVDataFetcher.config }, { pluginType: 'dataFetcher' });

const DEBUG_INIT_DEMO_INDEX = 1;

function Editor() {
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [higlassTrackOptions, setHiGlassTrackOptions] = useState<HiGlassTrack[]>([
        // Debug
        // { viewConfig: testViewConfig, boundingBox: { x: 60, y: 60, width: 60, height: 500 } }
    ]);
    const [demo, setDemo] = useState(examples[DEBUG_INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Full Glyph Definition' | 'Predefined Glyph'>('Full Glyph Definition');
    const [gm, setGm] = useState(stringify(examples[DEBUG_INIT_DEMO_INDEX].spec as GeminiSpec));

    useEffect(() => {
        if (editorMode === 'Full Glyph Definition') {
            setGm(stringify(replaceGlyphs(JSON.parse(stringify(demo.spec)) as GeminiSpec)));
        } else {
            setGm(stringify(demo.spec as GeminiSpec));
        }
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
    }, [gm]);

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
                        setDemo(examples.find(d => d.name === e.target.value) as any);
                    }}
                    defaultValue={demo.name}
                >
                    {examples.map(d => (
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
                    disabled
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
                                    <b>Compiled HiGlass ViewConfigs</b> (Read Only)
                                </div>
                                <EditorPanel
                                    code={stringify(higlassTrackOptions.map(d => d.viewConfig))}
                                    readOnly={true}
                                    onChange={undefined}
                                />
                            </>
                            {/**
                             * TODO: This is only for showing a scroll view for the higlass view config editor
                             * Remove the below line and the nearest SplitPane after figuring out a better way
                             * of showing the scroll view.
                             */}
                            <></>
                        </SplitPane>
                    </SplitPane>
                    <div className="preview-container">
                        <div style={{ position: 'relative' }}>
                            <svg ref={layoutSvg} />
                            {hglass}
                        </div>
                    </div>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;

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
import { replaceTemplate } from '../core/utils';
import { renderLayoutPreview } from '../core/layout/layout-preview';
import { getBoundingBox } from '../core/utils/bounding-box';
import './editor.css';
import { HiGlassSpec } from '../core/higlass.schema';

/**
 * Register a Gemini plugin track to HiGlassComponent
 */
higlassRegister({
    name: 'GeminiTrack',
    track: GeminiTrack,
    config: GeminiTrack.config
});

/**
 * Register a Gemini data fetcher to HiGlassComponent
 */
higlassRegister({ dataFetcher: CSVDataFetcher, config: CSVDataFetcher.config }, { pluginType: 'dataFetcher' });

const INIT_DEMO_INDEX = examples.length - 3;

/**
 * React component for editing Gemini specs
 */
function Editor() {
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Normal Mode' | 'Template-based Mode'>('Normal Mode');
    const [hg, setHg] = useState<HiGlassSpec>();
    const [gm, setGm] = useState(stringify(examples[INIT_DEMO_INDEX].spec as GeminiSpec));

    /**
     * Editor moode
     */
    useEffect(() => {
        if (editorMode === 'Normal Mode') {
            setGm(stringify(replaceTemplate(JSON.parse(stringify(demo.spec)) as GeminiSpec)));
        } else {
            setGm(stringify(demo.spec as GeminiSpec));
        }
        setHg(undefined);
    }, [demo, editorMode]);

    /**
     * Render background of tracks.
     */
    useEffect(() => {
        let editedGm;
        try {
            editedGm = replaceTemplate(JSON.parse(gm));
        } catch (e) {
            console.warn('Cannnot parse the edited code.');
        }
        if (!editedGm) return;

        renderLayoutPreview(
            layoutSvg.current as SVGSVGElement,
            editedGm as GeminiSpec,
            {
                x: 60,
                y: 60,
                width: getBoundingBox(editedGm)?.width,
                height: getBoundingBox(editedGm)?.height
            },
            (newHg: HiGlassSpec) => {
                setHg(newHg);
            }
        );
    }, [gm]);

    /**
     * HiGlass components to render Gemini Tracks.
     */
    const hglass = useMemo(() => {
        const editedGm = replaceTemplate(JSON.parse(gm));
        return hg ? (
            <div
                key={stringify(hg.views[0].uid)}
                style={{
                    position: 'absolute',
                    display: 'block',
                    left: 60,
                    top: 60,
                    width: getBoundingBox(editedGm)?.width,
                    height: getBoundingBox(editedGm)?.height
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
                    viewConfig={hg}
                />
            </div>
        ) : null;
    }, [hg]);

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
                            {d.name + (d.underDevelopment ? ' (under development)' : '')}
                        </option>
                    ))}
                </select>
                <select
                    onChange={e => {
                        setEditorMode(e.target.value as any);
                    }}
                    defaultValue={'Normal Mode'}
                    disabled
                >
                    {['Normal Mode', 'Template-based Mode'].map(d => (
                        <option key={d} value={d}>
                            {d}
                        </option>
                    ))}
                </select>
                {demo.underDevelopment ? (
                    <span
                        style={{
                            paddingLeft: 12,
                            fontStyle: 'normal',
                            fontSize: 13
                        }}
                    >
                        🚧 This example is under development 🚧
                    </span>
                ) : null}
            </div>
            <div className="editor">
                <SplitPane className="split-pane-root" split="vertical" defaultSize="35%" onChange={undefined}>
                    <SplitPane split="horizontal" defaultSize="80%" onChange={undefined}>
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
                                <EditorPanel code={stringify(hg)} readOnly={true} onChange={undefined} />
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

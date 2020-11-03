// @ts-ignore
import { GeminiTrack } from '../higlass-gemini-track/index';
import { CSVDataFetcher } from '../higlass-gemini-datafetcher/index';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
import React, { useState, useEffect, useMemo } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec } from '../core/gemini.schema';
import { debounce } from 'lodash';
import { examples } from './example';
import { replaceTemplate } from '../core/utils';
import { BoundingBox, getTrackArrangementInfo } from '../core/utils/bounding-box';
import { HiGlassSpec } from '../core/higlass.schema';
import GeminiSchema from '../../build/gemini.schema.json';
import { validateSpec, Validity } from '../core/utils/validate';
import './editor.css';
import { renderView } from '../core/layout/view';
import stripJsonComments from 'strip-json-comments';

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

const INIT_DEMO_INDEX = examples.findIndex(d => d.forceShow) !== -1 ? examples.findIndex(d => d.forceShow) : 0;

/**
 * React component for editing Gemini specs
 */
function Editor() {
    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Normal Mode' | 'Template-based Mode'>('Normal Mode');
    const [hg, setHg] = useState<HiGlassSpec>();
    const [gm, setGm] = useState(stringify(examples[INIT_DEMO_INDEX].spec as GeminiSpec));
    const [log, setLog] = useState<Validity>({ message: '', state: 'success' });

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
            editedGm = replaceTemplate(JSON.parse(stripJsonComments(gm)));
            setLog(validateSpec(GeminiSchema, editedGm));
        } catch (e) {
            const message = '✘ Cannnot parse the code.';
            console.warn(message);
            setLog({ message, state: 'error' });
        }
        if (!editedGm) return;

        renderView(editedGm as GeminiSpec, (newHg: HiGlassSpec) => {
            setHg(newHg);
        });
    }, [gm]);

    /**
     * HiGlass components to render Gemini Tracks.
     */
    const hglass = useMemo(() => {
        const editedGm = replaceTemplate(JSON.parse(stripJsonComments(gm)));
        const bb = getTrackArrangementInfo(editedGm) as BoundingBox;
        return hg && bb ? (
            <>
                <div
                    style={{
                        position: 'relative',
                        padding: 60,
                        background: 'white',
                        width: bb.width + 120,
                        height: bb.height + 120
                    }}
                >
                    <div
                        key={stringify(hg.views[0].uid)}
                        style={{
                            position: 'relative',
                            display: 'block',
                            background: 'white',
                            margin: 10,
                            padding: 0, // non-zero padding act unexpectedly with HiGlass components
                            width: bb.width,
                            height: bb.height
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
                </div>
                {editedGm.description ? (
                    <div
                        style={{
                            width: bb.width + 120,
                            margin: 20,
                            color: 'black'
                        }}
                    >
                        {editedGm.description}
                    </div>
                ) : null}
            </>
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
                <SplitPane className="split-pane-root" split="vertical" defaultSize="40%" onChange={undefined}>
                    <SplitPane split="horizontal" defaultSize="calc(100% - 48px)" onChange={undefined}>
                        {/* Gemini Editor */}
                        <>
                            <EditorPanel
                                code={gm}
                                readOnly={false}
                                onChange={debounce(code => {
                                    setGm(code);
                                }, 1000)}
                            />
                            <div className={`compile-message compile-message-${log.state}`}>{log.message}</div>
                        </>
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
                    <div className="preview-container">{hglass}</div>
                </SplitPane>
            </div>
        </>
    );
}
export default Editor;

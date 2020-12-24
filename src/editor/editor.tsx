// @ts-ignore
import { GeminidTrack } from '../higlass-geminid-track/index';
import { CSVDataFetcher } from '../higlass-csv-datafetcher/index';
import { RawDataFetcher } from '../higlass-raw-datafetcher/index';
// @ts-ignore
import { TextTrack } from 'higlass-text';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminidSpec } from '../core/geminid.schema';
import { debounce } from 'lodash';
import { examples } from './example';
import { replaceTemplate } from '../core/utils';
import { Size } from '../core/utils/bounding-box';
import { HiGlassSpec } from '../core/higlass.schema';
import GeminidSchema from '../../schema/geminid.schema.json';
import { validateSpec, Validity } from '../core/utils/validate';
import { compile } from '../core/compile';
import stripJsonComments from 'strip-json-comments';
import './editor.css';
import * as qs from 'qs';

/**
 * Register a Gemini plugin track to HiGlassComponent
 */
higlassRegister({
    name: 'GeminidTrack',
    track: GeminidTrack,
    config: GeminidTrack.config
});

/**
 * Register a higlass-text plugin track to HiGlassComponent
 */
higlassRegister({
    name: 'TextTrack',
    track: TextTrack,
    config: TextTrack.config
});

/**
 * Register a Gemini data fetcher to HiGlassComponent
 */
higlassRegister({ dataFetcher: CSVDataFetcher, config: CSVDataFetcher.config }, { pluginType: 'dataFetcher' });
higlassRegister({ dataFetcher: RawDataFetcher, config: RawDataFetcher.config }, { pluginType: 'dataFetcher' });

const INIT_DEMO_INDEX = examples.findIndex(d => d.forceShow) !== -1 ? examples.findIndex(d => d.forceShow) : 0;

// TODO: what is the type of prop?
/**
 * React component for editing Gemini specs
 */
function Editor(props: any) {
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const urlSpec = urlParams?.spec ? (urlParams.spec as string) : null;

    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Normal Mode' | 'Template-based Mode'>('Normal Mode');
    const [hg, setHg] = useState<HiGlassSpec>();
    const [size, setSize] = useState<{ width: number; height: number }>();
    const [gm, setGm] = useState(stringify(urlSpec ?? (examples[INIT_DEMO_INDEX].spec as GeminidSpec)));
    const [log, setLog] = useState<Validity>({ message: '', state: 'success' });

    const hgRef = useRef<any>();

    /**
     * Editor moode
     */
    useEffect(() => {
        if (editorMode === 'Normal Mode') {
            setGm(urlSpec ?? stringify(replaceTemplate(JSON.parse(stringify(demo.spec)) as GeminidSpec)));
        } else {
            setGm(urlSpec ?? stringify(demo.spec as GeminidSpec));
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
            setLog(validateSpec(GeminidSchema, editedGm));
        } catch (e) {
            const message = '✘ Cannnot parse the code.';
            console.warn(message);
            setLog({ message, state: 'error' });
        }
        if (!editedGm) return;

        compile(editedGm as GeminidSpec, (newHg: HiGlassSpec, newSize: Size) => {
            setHg(newHg);
            setSize(newSize);
        });
    }, [gm]);

    // Uncommnet below to use HiGlass APIs
    // useEffect(() => {
    //     if(hgRef.current) {
    //         hgRef.current.api.activateTool('select');
    //     }
    // }, [hg, hgRef]); // TODO: should `hg` be here?

    /**
     * HiGlass components to render Gemini Tracks.
     */
    const hglass = useMemo(() => {
        const editedGm = JSON.parse(stripJsonComments(gm));
        return hg && size ? (
            <>
                <div
                    style={{
                        position: 'relative',
                        padding: 60,
                        background: 'white',
                        width: size.width + 120,
                        height: size.height + 120
                    }}
                >
                    <div
                        key={stringify(hg.views[0].uid)}
                        style={{
                            position: 'relative',
                            display: 'block',
                            background: 'white',
                            margin: 10,
                            padding: 0, // non-zero padding acts unexpectedly w/ HiGlassComponent
                            width: size.width,
                            height: size.height
                        }}
                    >
                        <HiGlassComponent
                            ref={hgRef}
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
                                sizeMode: 'bounded',
                                rangeSelectionOnAlt: true // this allows switching between `selection` and `zoom&pan` mode
                            }}
                            viewConfig={hg}
                        />
                    </div>
                </div>
                {editedGm.description ? (
                    <div
                        style={{
                            width: size.width + 120,
                            padding: 20,
                            color: 'gray'
                        }}
                    >
                        {editedGm.description}
                    </div>
                ) : null}
            </>
        ) : null;
    }, [hg, gm, size]);

    return (
        <>
            <div className="demo-navbar">
                🌌 Geminid <code>Editor</code>
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
                <span
                    style={{ color: 'white' }}
                    onClick={() => {
                        if (hgRef.current) {
                            console.warn('Exporting SVG', hgRef.current.api.exportAsSvg());
                            // TODO: save as a html file
                        }
                    }}
                >
                    {' Click here to export svg '}
                </span>
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

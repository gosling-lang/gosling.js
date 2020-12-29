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
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
import * as qs from 'qs';
import { JSONCrush, JSONUncrush } from '../core/utils/json-crush';
import './editor.css';

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

// Limit of the character length to allow copy to clipboard
const LIMIT_CLIPBOARD_LEN = 4096;

// ! these should be updated upon change in css files
const EDITOR_HEADER_HEIGHT = 40;
const VIEWCONFIG_HEADER_HEIGHT = 30;

// TODO: what is the type of prop?
/**
 * React component for editing Gemini specs
 */
function Editor(props: any) {
    // custom spec contained in the URL
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const urlSpec = urlParams?.spec ? JSONUncrush(urlParams.spec as string) : null;

    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Normal Mode' | 'Template-based Mode'>('Normal Mode');
    const [hg, setHg] = useState<HiGlassSpec>();
    const [size, setSize] = useState<{ width: number; height: number }>();
    const [gm, setGm] = useState(stringify(urlSpec ?? (examples[INIT_DEMO_INDEX].spec as GeminidSpec)));
    const [log, setLog] = useState<Validity>({ message: '', state: 'success' });
    const [autoRun, setAutoRun] = useState(true);

    // whether to show HiGlass' viewConfig on the left-bottom
    const [showVC, setShowVC] = useState<boolean>(false);

    // whether to hide source code on the left
    const [isMaximizeVis, setIsMaximizeVis] = useState<boolean>((urlParams?.full as string) === 'true' || false);

    // for using HiGlass JS API
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

    const runSpecUpdateVis = useCallback(
        (run?: boolean) => {
            let editedGm;
            try {
                editedGm = replaceTemplate(JSON.parse(stripJsonComments(gm)));
                setLog(validateSpec(GeminidSchema, editedGm));
            } catch (e) {
                const message = '✘ Cannnot parse the code.';
                console.warn(message);
                setLog({ message, state: 'error' });
            }
            if (!editedGm || (!autoRun && !run)) return;

            compile(editedGm as GeminidSpec, (newHg: HiGlassSpec, newSize: Size) => {
                setHg(newHg);
                setSize(newSize);
            });
        },
        [gm, autoRun]
    );

    /**
     * Render background of tracks.
     */
    useEffect(() => {
        runSpecUpdateVis();
    }, [gm, autoRun]);

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
                            margin: 0,
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
            </>
        ) : null;
    }, [hg, size]);

    return (
        <>
            <div className="demo-navbar">
                🌌 Geminid <code>Editor</code>
                {urlSpec ? <small> Displaying a custom spec contained in URL</small> : null}
                <select
                    onChange={e => {
                        setDemo(examples.find(d => d.name === e.target.value) as any);
                    }}
                    defaultValue={demo.name}
                    hidden={urlSpec !== null}
                >
                    {examples.map(d => (
                        <option key={d.name} value={d.name}>
                            {d.name + (d.underDevelopment ? ' (under development)' : '')}
                        </option>
                    ))}
                </select>
                <small style={{ marginLeft: '10px' }}>{' Auto Update'}</small>
                {autoRun ? (
                    <span
                        title="Automatically update visualization upon editing spec"
                        className="editor-nav-button"
                        style={{
                            marginLeft: 0,
                            color: '#0072B2'
                        }}
                        onClick={() => setAutoRun(false)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 2048 1792"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path
                                fill="currentColor"
                                d="M0 896q0-130 51-248.5t136.5-204 204-136.5 248.5-51h768q130 0 248.5 51t204 136.5 136.5 204 51 248.5-51 248.5-136.5 204-204 136.5-248.5 51h-768q-130 0-248.5-51t-204-136.5-136.5-204-51-248.5zm1408 512q104 0 198.5-40.5t163.5-109.5 109.5-163.5 40.5-198.5-40.5-198.5-109.5-163.5-163.5-109.5-198.5-40.5-198.5 40.5-163.5 109.5-109.5 163.5-40.5 198.5 40.5 198.5 109.5 163.5 163.5 109.5 198.5 40.5z"
                            />
                        </svg>
                    </span>
                ) : (
                    <span
                        title="Pause updating visualization"
                        className="editor-nav-button"
                        style={{
                            marginLeft: 0
                        }}
                        onClick={() => setAutoRun(true)}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="22"
                            height="22"
                            viewBox="0 0 2048 1792"
                            strokeWidth="2"
                            stroke="currentColor"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path
                                fill="currentColor"
                                d="M1152 896q0-104-40.5-198.5t-109.5-163.5-163.5-109.5-198.5-40.5-198.5 40.5-163.5 109.5-109.5 163.5-40.5 198.5 40.5 198.5 109.5 163.5 163.5 109.5 198.5 40.5 198.5-40.5 163.5-109.5 109.5-163.5 40.5-198.5zm768 0q0-104-40.5-198.5t-109.5-163.5-163.5-109.5-198.5-40.5h-386q119 90 188.5 224t69.5 288-69.5 288-188.5 224h386q104 0 198.5-40.5t163.5-109.5 109.5-163.5 40.5-198.5zm128 0q0 130-51 248.5t-136.5 204-204 136.5-248.5 51h-768q-130 0-248.5-51t-204-136.5-136.5-204-51-248.5 51-248.5 136.5-204 204-136.5 248.5-51h768q130 0 248.5 51t204 136.5 136.5 204 51 248.5z"
                            />
                        </svg>
                    </span>
                )}
                <small style={{ marginLeft: '10px' }}>{' Run'}</small>
                <span
                    title="Run"
                    className="editor-nav-button"
                    style={{
                        marginLeft: '0px',
                        paddingTop: '10px'
                    }}
                    onClick={() => runSpecUpdateVis(true)}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="none"
                        fill="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="M7 4v16l13 -8z" />
                    </svg>
                </span>
                <select
                    onChange={e => {
                        setEditorMode(e.target.value as any);
                    }}
                    defaultValue={'Normal Mode'}
                    disabled
                    hidden={true}
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
                <input type="hidden" id="spec-url-exporter" />
                <span
                    title={
                        gm.length <= LIMIT_CLIPBOARD_LEN
                            ? `Copy unique URL of current view to clipboard (limit: ${LIMIT_CLIPBOARD_LEN} characters)`
                            : `The current code contains characters more than ${LIMIT_CLIPBOARD_LEN}`
                    }
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        height: '100%',
                        paddingTop: '9px',
                        float: 'right',
                        marginRight: '10px',
                        color: gm.length <= LIMIT_CLIPBOARD_LEN ? 'black' : 'lightgray',
                        cursor: gm.length <= LIMIT_CLIPBOARD_LEN ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => {
                        if (gm.length <= LIMIT_CLIPBOARD_LEN) {
                            // copy the unique url to clipboard using `<input/>`
                            const url = `https://sehilyi.github.io/geminid/?full=${isMaximizeVis}&spec=${JSONCrush(
                                gm
                            )}`;
                            const element = document.getElementById('spec-url-exporter');
                            (element as any).type = 'text';
                            (element as any).value = url;
                            (element as any).select();
                            document.execCommand('copy');
                            (element as any).type = 'hidden';
                        }
                    }}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                        <path d="M10 14a3.5 3.5 0 0 0 5 0l4 -4a3.5 3.5 0 0 0 -5 -5l-.5 .5" />
                        <path d="M14 10a3.5 3.5 0 0 0 -5 0l-4 4a3.5 3.5 0 0 0 5 5l.5 -.5" />
                    </svg>
                </span>
            </div>
            {/* ------------ main view ------------ */}
            <div className="editor">
                <SplitPane
                    className="split-pane-root"
                    split="vertical"
                    defaultSize={'40%'}
                    size={isMaximizeVis ? '0px' : '40%'}
                    minSize="0px"
                >
                    <SplitPane
                        split="horizontal"
                        defaultSize={`calc(100% - ${VIEWCONFIG_HEADER_HEIGHT}px)`}
                        maxSize={window.innerHeight - EDITOR_HEADER_HEIGHT - VIEWCONFIG_HEADER_HEIGHT}
                        onChange={(size: number) => {
                            const secondSize = window.innerHeight - EDITOR_HEADER_HEIGHT - size;
                            if (secondSize > VIEWCONFIG_HEADER_HEIGHT && !showVC) {
                                setShowVC(true);
                            } else if (secondSize <= VIEWCONFIG_HEADER_HEIGHT && showVC) {
                                // hide the viewConfig view when no enough space assigned
                                setShowVC(false);
                            }
                        }}
                    >
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
                        <SplitPane split="vertical" defaultSize="100%">
                            <>
                                <div className="editor-header">
                                    <b>Compiled HiGlass ViewConfig</b> (Read Only)
                                </div>
                                <div style={{ height: '100%', visibility: showVC ? 'visible' : 'hidden' }}>
                                    <EditorPanel code={stringify(hg)} readOnly={true} />
                                </div>
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
            {/* ------------ floating buttons ------------ */}
            <span
                title={isMaximizeVis ? 'Show Geminid code' : 'Maximize a visualization panel'}
                style={{
                    position: 'fixed',
                    right: '10px',
                    top: `${EDITOR_HEADER_HEIGHT + 10}px`,
                    color: 'black',
                    cursor: 'pointer'
                }}
                onClick={() => {
                    setIsMaximizeVis(!isMaximizeVis);
                }}
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    strokeWidth="2"
                    stroke="currentColor"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    {isMaximizeVis ? (
                        <>
                            <path d="M5 9h2a2 2 0 0 0 2 -2v-2" />
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M15 19v-2a2 2 0 0 1 2 -2h2" />
                            <path d="M15 5v2a2 2 0 0 0 2 2h2" />
                            <path d="M5 15h2a2 2 0 0 1 2 2v2" />
                        </>
                    ) : (
                        <>
                            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                            <path d="M4 8v-2a2 2 0 0 1 2 -2h2" />
                            <path d="M4 16v2a2 2 0 0 0 2 2h2" />
                            <path d="M16 4h2a2 2 0 0 1 2 2v2" />
                            <path d="M16 20h2a2 2 0 0 0 2 -2v-2" />
                        </>
                    )}
                </svg>
            </span>
        </>
    );
}
export default Editor;

import * as gosling from '../';
import React, { useState, useEffect, useCallback } from 'react';
import PubSub from 'pubsub-js';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { Datum, GoslingSpec } from '../core/gosling.schema';
import { debounce, delay } from 'lodash';
import { examples } from './example';
import { replaceTemplate } from '../core/utils';
import { HiGlassSpec } from '../core/higlass.schema';
import GoslingSchema from '../../schema/gosling.schema.json';
import { validateSpec, Validity } from '../core/utils/validate';
import stripJsonComments from 'strip-json-comments';
import * as qs from 'qs';
import { JSONCrush, JSONUncrush } from '../core/utils/json-crush';
import './editor.css';
import { ICONS, ICON_INFO } from './icon';

const INIT_DEMO_INDEX = examples.findIndex(d => d.forceShow) !== -1 ? examples.findIndex(d => d.forceShow) : 0;

// Limit of the character length to allow copy to clipboard
const LIMIT_CLIPBOARD_LEN = 4096;

// ! these should be updated upon change in css files
const EDITOR_HEADER_HEIGHT = 40;
const VIEWCONFIG_HEADER_HEIGHT = 30;

const getIconSVG = (d: ICON_INFO) => (
    <svg
        key={stringify(d)}
        xmlns="http://www.w3.org/2000/svg"
        width={d.width}
        height={d.height}
        viewBox={d.viewBox}
        strokeWidth="2"
        stroke={d.stroke}
        fill={d.fill}
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        {d.path.map(path => (
            <path key={path} d={path} />
        ))}
    </svg>
);

interface PreviewData {
    id: string;
    dataConfig: string;
    data: Datum[];
}

/**
 * React component for editing Gosling specs
 */
function Editor(props: any) {
    // custom spec contained in the URL
    const urlParams = qs.parse(props.location.search, { ignoreQueryPrefix: true });
    const urlSpec = urlParams?.spec ? JSONUncrush(urlParams.spec as string) : null;

    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [hg, setHg] = useState<HiGlassSpec>();
    const [code, setCode] = useState(stringify(urlSpec ?? (examples[INIT_DEMO_INDEX].spec as GoslingSpec)));
    const [goslingSpec, setGoslingSpec] = useState<gosling.GoslingSpec>();
    const [log, setLog] = useState<Validity>({ message: '', state: 'success' });
    const [autoRun, setAutoRun] = useState(true);
    const [previewData, setPreviewData] = useState<PreviewData[]>([]);
    const [selectedPreviewData, setSelectedPreviewData] = useState<number>(0);
    const [dataLoading, setDataLoading] = useState<boolean>(false);

    // whether to show HiGlass' viewConfig on the left-bottom
    const [showVC, setShowVC] = useState<boolean>(false);

    // whether to hide source code on the left
    const [isMaximizeVis, setIsMaximizeVis] = useState<boolean>((urlParams?.full as string) === 'true' || false);

    // for using HiGlass JS API
    // const hgRef = useRef<any>();

    /**
     * Editor moode
     */
    useEffect(() => {
        setSelectedPreviewData(0);
        setPreviewData([]);
        setCode(urlSpec ?? stringify(demo.spec as GoslingSpec));
        setHg(undefined);
    }, [demo]);

    /**
     * Show animation of small loading icon for visual feedback.
     */
    useEffect(() => {
        if (dataLoading) {
            delay(() => {
                setDataLoading(false);
            }, 3500);
        }
    }, [dataLoading]);

    const runSpecUpdateVis = useCallback(
        (run?: boolean) => {
            let editedGm;
            try {
                editedGm = replaceTemplate(JSON.parse(stripJsonComments(code)));
                setLog(validateSpec(GoslingSchema, editedGm));
            } catch (e) {
                const message = '✘ Cannnot parse the code.';
                console.warn(message);
                setLog({ message, state: 'error' });
            }
            if (!editedGm || (!autoRun && !run)) return;

            setGoslingSpec(editedGm);
        },
        [code, autoRun]
    );

    /**
     * Subscribe preview data that is being processed in the Gosling tracks.
     */
    useEffect(() => {
        // We want to show data preview in the editor.
        const token = PubSub.subscribe('data-preview', (_: string, data: PreviewData) => {
            // Data with different `dataConfig` is shown separately in data preview.
            const id = `${data.dataConfig}`;
            const newPreviewData = previewData.filter(d => d.id !== id);
            setPreviewData([...newPreviewData, { ...data, id }]);
            setDataLoading(true);
        });
        return () => {
            PubSub.unsubscribe(token);
        };
    });

    /**
     * Render visualization when edited
     */
    useEffect(() => {
        setPreviewData([]);
        setSelectedPreviewData(0);
        runSpecUpdateVis();
    }, [code, autoRun]);

    // Uncommnet below to use HiGlass APIs
    // useEffect(() => {
    //     if(hgRef.current) {
    //         hgRef.current.api.activateTool('select');
    //     }
    // }, [hg, hgRef]); // TODO: should `hg` be here?

    function getDataPreviewInfo(dataConfig: string) {
        // Detailed information of data config to show in the editor
        const dataConfigObj = JSON.parse(dataConfig);
        if (!dataConfigObj.data?.type) {
            // We do not have enough information
            return '';
        }

        let info = '';
        if (dataConfigObj.data) {
            Object.keys(dataConfigObj.data).forEach(key => {
                if (typeof dataConfigObj.data[key] === 'object') {
                    info += `${JSON.stringify(dataConfigObj.data[key])} | `;
                } else {
                    info += `${dataConfigObj.data[key]} | `;
                }
            });
        }

        return info.slice(0, info.length - 2);
    }

    return (
        <>
            <div className="demo-navbar">
                Gosling.js <code>Editor</code>
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
                <small style={{ marginLeft: '10px' }}>{' Auto Run'}</small>
                {autoRun ? (
                    <span
                        title="Automatically update visualization upon editing spec"
                        className="editor-button editor-nav-button"
                        style={{
                            marginLeft: 0,
                            color: '#0072B2'
                        }}
                        onClick={() => setAutoRun(false)}
                    >
                        {getIconSVG(ICONS.TOGGLE_ON)}
                    </span>
                ) : (
                    <span
                        title="Pause updating visualization"
                        className="editor-button editor-nav-button"
                        style={{
                            marginLeft: 0
                        }}
                        onClick={() => setAutoRun(true)}
                    >
                        {getIconSVG(ICONS.TOGGLE_OFF)}
                    </span>
                )}
                <small style={{ marginLeft: '10px' }}>{' Run'}</small>
                <span
                    title="Run"
                    className="editor-button editor-nav-button"
                    style={{
                        marginLeft: '0px',
                        paddingTop: '10px'
                    }}
                    onClick={() => runSpecUpdateVis(true)}
                >
                    {getIconSVG(ICONS.PLAY)}
                </span>
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
                    style={{ color: 'white', cursor: 'default', userSelect: 'none' }}
                    onClick={() => {
                        // if (hgRef.current) {
                        //     console.warn('Exporting SVG', hgRef.current.api.exportAsSvg());
                        //     // TODO: save as a html file
                        // }
                    }}
                >
                    {'‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ ‌‌ '}
                </span>
                <input type="hidden" id="spec-url-exporter" />
                <span
                    title={
                        code.length <= LIMIT_CLIPBOARD_LEN
                            ? `Copy unique URL of current view to clipboard (limit: ${LIMIT_CLIPBOARD_LEN} characters)`
                            : `The current code contains characters more than ${LIMIT_CLIPBOARD_LEN}`
                    }
                    className="editor-button"
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                        height: '100%',
                        paddingTop: '9px',
                        float: 'right',
                        marginRight: '10px',
                        color: code.length <= LIMIT_CLIPBOARD_LEN ? 'black' : 'lightgray',
                        cursor: code.length <= LIMIT_CLIPBOARD_LEN ? 'pointer' : 'not-allowed'
                    }}
                    onClick={() => {
                        if (code.length <= LIMIT_CLIPBOARD_LEN) {
                            // copy the unique url to clipboard using `<input/>`
                            const url = `https://gosling-lang.github.io/gosling.js/?full=${isMaximizeVis}&spec=${JSONCrush(
                                code
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
                    {getIconSVG(ICONS.LINK)}
                </span>
            </div>
            {/* ------------------------ Main View ------------------------ */}
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
                        {/* Gosling Editor */}
                        <>
                            <EditorPanel
                                code={code}
                                readOnly={false}
                                onChange={debounce(code => {
                                    setCode(code);
                                }, 1500)}
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
                    <SplitPane
                        split="horizontal"
                        defaultSize={`calc(100% - ${VIEWCONFIG_HEADER_HEIGHT}px)`}
                        maxSize={window.innerHeight - EDITOR_HEADER_HEIGHT - VIEWCONFIG_HEADER_HEIGHT}
                    >
                        <div className="preview-container">
                            <gosling.GoslingComponent
                                spec={goslingSpec}
                                compiled={(g, h) => {
                                    setHg(h);
                                }}
                            />
                        </div>
                        <SplitPane split="vertical" defaultSize="100%">
                            <>
                                <div className="editor-header">
                                    <span
                                        className={dataLoading ? 'data-preview-loading-icon' : 'data-preview-stop-icon'}
                                    >
                                        ●{' '}
                                    </span>
                                    <b>Data Preview</b> (~100 Rows, Data Before Transformation)
                                </div>
                                <div className="editor-data-preview-panel">
                                    {previewData.length > selectedPreviewData &&
                                    previewData[selectedPreviewData] &&
                                    previewData[selectedPreviewData].data.length > 0 ? (
                                        <>
                                            <div className="editor-data-preview-tab">
                                                {previewData.map((d: PreviewData, i: number) => (
                                                    <button
                                                        className={
                                                            i === selectedPreviewData
                                                                ? 'selected-tab'
                                                                : 'unselected-tab'
                                                        }
                                                        key={JSON.stringify(d)}
                                                        onClick={() => setSelectedPreviewData(i)}
                                                    >
                                                        {`${(JSON.parse(d.dataConfig).data
                                                            .type as string).toUpperCase()} `}
                                                        <small>{i}</small>
                                                    </button>
                                                ))}
                                            </div>
                                            <div className="editor-data-preview-tab-info">
                                                {getDataPreviewInfo(previewData[selectedPreviewData].dataConfig)}
                                            </div>
                                            <div className="editor-data-preview-table">
                                                <table>
                                                    <tbody>
                                                        <tr>
                                                            {Object.keys(previewData[selectedPreviewData].data[0]).map(
                                                                (field: string, i: number) => (
                                                                    <th key={i}>{field}</th>
                                                                )
                                                            )}
                                                        </tr>
                                                        {previewData[selectedPreviewData].data.map(
                                                            (row: Datum, i: number) => (
                                                                <tr key={i}>
                                                                    {Object.keys(row).map(
                                                                        (field: string, j: number) => (
                                                                            <td key={j}>{row[field].toString()}</td>
                                                                        )
                                                                    )}
                                                                </tr>
                                                            )
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </>
                                    ) : null}
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
                </SplitPane>
            </div>
            {/* ------------------------ Floating Buttons ------------------------ */}
            <span
                title={isMaximizeVis ? 'Show Gosling code' : 'Maximize a visualization panel'}
                className="editor-button"
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
                {isMaximizeVis ? getIconSVG(ICONS.MAXIMIZE) : getIconSVG(ICONS.MINIMIZE)}
            </span>
        </>
    );
}
export default Editor;

// @ts-ignore
import { GeminiTrack } from '../higlass-gemini-track/index';
import { CSVDataFetcher } from '../higlass-gemini-datafetcher/index';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
// @ts-ignore
import { default as higlassRegister } from 'higlass-register';
import React, { useState, useEffect, useRef, createRef, useMemo } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import { GeminiSpec } from '../core/gemini.schema';
import { debounce } from 'lodash';
import { examples } from './example';
import { replaceTemplate } from '../core/utils';
import { renderLayoutPreview } from '../core/layout/layout-preview';
import { getBoundingBox } from '../core/utils/bounding-box';
import { HiGlassTrack } from '../core/layout/higlass';
import './editor.css';

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
 * An API helper to contain information about domain and range of x-axis and y-axis for the HiGlass' 'location' API
 */
interface XYDomainRange {
    xDomain: [number, number];
    yDomain: [number, number];
    xRange: [number, number];
    yRange: [number, number];
}

/**
 * React component for editing Gemini specs
 */
function Editor() {
    const layoutSvg = useRef<SVGSVGElement>(null);
    const [higlassTrackOptions, setHiGlassTrackOptions] = useState<HiGlassTrack[]>([]);
    const [demo, setDemo] = useState(examples[INIT_DEMO_INDEX]);
    const [editorMode, setEditorMode] = useState<'Normal Mode' | 'Template-based Mode'>('Normal Mode');
    const [gm, setGm] = useState(stringify(examples[INIT_DEMO_INDEX].spec as GeminiSpec));

    const [hgRefs, setHgRefs] = useState<HiGlassComponent[]>([]);

    /**
     * Editor moode
     */
    useEffect(() => {
        if (editorMode === 'Normal Mode') {
            setGm(stringify(replaceTemplate(JSON.parse(stringify(demo.spec)) as GeminiSpec)));
        } else {
            setGm(stringify(demo.spec as GeminiSpec));
        }
        setHiGlassTrackOptions([]);
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
            (higlassInfo: HiGlassTrack[]) => {
                setHiGlassTrackOptions(higlassInfo);
            }
        );
    }, [gm]);

    /**
     * Listen to higlass API to link between tracks
     */
    useEffect(() => {
        if (!(JSON.parse(gm) as GeminiSpec).isLinking) {
            // experimental option: link entire tracks only when `isLinking` is `true`
            return;
        }

        hgRefs.forEach((refFrom, iFrom) => {
            if (refFrom.current) {
                refFrom.current.api.on(
                    'location',
                    debounce((_: XYDomainRange) => {
                        hgRefs.forEach((refTo, iTo) => {
                            // sync the x scales in the rest of the tracks
                            if (iFrom !== iTo) {
                                try {
                                    refTo.current.zoomTo(
                                        higlassTrackOptions[iTo].viewConfig.views[0].uid,
                                        ..._.xDomain,
                                        ..._.yDomain,
                                        0 // duration of animation
                                    );
                                } catch (e) {
                                    console.warn(e);
                                }
                            }
                        });
                    }, 100)
                );

                // TEST: force zoom to certain position
                // setTimeout(() => {
                //     try {
                //         ref.current.api.zoomTo(
                //             higlassTrackOptions[i].viewConfig.views[0].uid,//'gemini-view',
                //             1, 100000,
                //             1, 100000,
                //             0
                //         );
                //     } catch(e) {
                //         console.warn(e);
                //     }
                // }, 2500);

                // TEST: listen to view config updates
                // refFrom.current.api.on('viewConfig', (_: string) => {
                //     console.log(_);
                // });
            }
        });
        return () => {
            hgRefs.forEach((ref: HiGlassComponent) => {
                ref.current ? ref.current.api.off('location') : null;
            });
        };
    }, [hgRefs]);

    /**
     * HiGlass components to render Gemini Tracks.
     */
    const hglass = useMemo(() => {
        const refs: HiGlassComponent[] = [];
        const hgComponents = higlassTrackOptions.map(o => {
            const ref = createRef<HiGlassComponent>();

            // store `ref` to use HiGlass APIs later
            refs.push(ref);

            return (
                <div
                    key={stringify(o.viewConfig.views[0].uid)}
                    style={{
                        position: 'absolute',
                        display: 'block',
                        left: o.boundingBox.x,
                        top: o.boundingBox.y,
                        width: o.boundingBox.width,
                        height: o.boundingBox.height
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
                        viewConfig={o.viewConfig}
                        ref={ref}
                    />
                </div>
            );
        });

        // update refs of higlass components
        setHgRefs(refs);

        return hgComponents;
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

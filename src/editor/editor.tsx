import React, { useState } from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import hlOnlyHeatmap from "../lib/test/higlass-lite/hl-single-view.json";
import { compile } from '../lib/higlass-lite';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import './editor.css';
import { HiGlassLiteSpec } from '../lib/higlass-lite.schema';
import { debounce } from "lodash";

const DEBUG_DO_NOT_RENDER_HIGLASS = false;

function Editor() {

    const [hl, setHl] = useState(stringify(hlOnlyHeatmap));
    const [hg, setHg] = useState(stringify(compile(hlOnlyHeatmap as HiGlassLiteSpec)));

    return (
        <div className="editor">
            <SplitPane split="vertical" defaultSize="30%" onChange={() => { }}>
                <EditorPanel
                    code={hl}
                    onChange={debounce(hl => {
                        setHl(hl);
                        // setHg(stringify(compile(JSON.parse(hl) as HiGlassLiteSpec)));
                    }, 2000)}
                />
                <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
                    <EditorPanel
                        code={hg}
                        onChange={(hg) => {
                            // setHg(hg);
                        }}
                    />
                    {!DEBUG_DO_NOT_RENDER_HIGLASS &&
                        <HiGlassComponent
                            options={{
                                bounded: true,
                                pixelPreciseMarginPadding: true,
                                containerPaddingX: 0,
                                containerPaddingY: 0,
                                sizeMode: 'default'
                            }}
                            viewConfig={compile(hlOnlyHeatmap as HiGlassLiteSpec)}
                        />}
                </SplitPane>
            </SplitPane>
        </div>
    );
}
export default Editor;
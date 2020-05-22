import React, { useState, useEffect, useRef, useMemo } from 'react';
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

    const hgRef = useRef<typeof HiGlassComponent>();

    useEffect(() => {

        let newHg;
        try {
            newHg = stringify(compile(JSON.parse(hl)));
            setHg(newHg);
        } catch (e) {
            console.warn("Invalid HiGlass spec.");
        }

        // TODO: Do we need this?
        // hgRef?.current?.api.setViewConfig(JSON.parse(newHg)).then(() => {
        //     console.log("onSetViewConfig");
        // });
    }, [hl]);

    // Renders HiGlass by compiling the edited HiGlass-Lite code.
    const hglass = useMemo(() => {
        return <HiGlassComponent
            ref={hgRef}
            options={{
                bounded: true,
                pixelPreciseMarginPadding: true,
                containerPaddingX: 0,
                containerPaddingY: 0,
                sizeMode: "default"
            }}
            viewConfig={JSON.parse(hg)}
        />
    }, [hl]);

    return (
        <div className="editor">
            <SplitPane split="vertical" defaultSize="30%" onChange={() => { }}>
                {/* HiGlass-Lite Editor */}
                <EditorPanel
                    code={hl}
                    readOnly={false}
                    onChange={debounce(newHl => {
                        setHl(newHl);
                    }, 2000)}
                />
                <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
                    {/* HiGlass Editor */}
                    <EditorPanel
                        code={hg}
                        readOnly={true}
                    />
                    {/* HiGlass Output */}
                    {!DEBUG_DO_NOT_RENDER_HIGLASS && hglass}
                </SplitPane>
            </SplitPane>
        </div>
    );
}
export default Editor;
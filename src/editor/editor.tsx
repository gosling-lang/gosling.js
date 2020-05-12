import React from 'react';
import EditorPanel from './editor-panel';
import stringify from 'json-stringify-pretty-compact';
import SplitPane from 'react-split-pane';
import hgOnlyHeatmap from "../lib/test/higlass/only-heatmap.json";
import { validateHG } from '../lib/higlass-lite';
// @ts-ignore
import { HiGlassComponent } from 'higlass';
import './editor.css';

const DEBUG_DO_NOT_RENDER_HIGLASS = true;

function Editor() {

  // DEBUG
  if (false) validateHG(hgOnlyHeatmap);
  // 

  return (
    <div className="editor">
      <SplitPane split="vertical" defaultSize="30%" onChange={() => { }}>
        <EditorPanel
          code={stringify({ data: "", encoding: { mark: "bar" } })}
          onChange={(hl) => {

          }}
        />
        <SplitPane split="vertical" defaultSize="50%" onChange={() => { }}>
          <EditorPanel
            code={stringify(hgOnlyHeatmap)}
            onChange={(hg) => {
              validateHG(hg);
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
              viewConfig={hgOnlyHeatmap}
            />}
        </SplitPane>
      </SplitPane>
    </div>
  );
}
export default Editor;
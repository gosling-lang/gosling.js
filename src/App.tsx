import React from 'react';
import { validateHG } from './lib/higlass-lite';
import HGSingleView from "./lib/test/higlass/single-view.json";
import { EditorPanel } from './editor/editor-panel';
import stringify from 'json-stringify-pretty-compact';

import './App.css';

function App() {

  // Test
  if(false) validateHG(HGSingleView);
  // 
  
  return (
    <div className="main-view">
      <div style={{
        width: "50%", 
        height: "100%",
        display: "inline-block"
      }}>
        <EditorPanel
          code={stringify({"data": "", "encoding": { "mark": "bar" }})}
        />
      </div>
      <div style={{
        width: "50%",
        height: "100%",
        display: "inline-block"
      }}>
        <div style={{
          width: "100%",
          height: "50%"
        }}>

        </div>
        <div style={{
          width: "100%",
          height: "50%",
          borderTop: "1px solid lightgray"
        }}>
          <EditorPanel
            code={stringify(HGSingleView)}
          />
        </div>
      </div>
    </div>
  );
}

export default App;

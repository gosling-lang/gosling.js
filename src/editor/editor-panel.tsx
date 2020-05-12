import React, { useRef, useState } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ReactResizeDetector from 'react-resize-detector';

function EditorPanel(props: {
  code: string,
  onChange: (code: string) => void
}) {

  const { code: templateCode } = props;
  const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [code, setCode] = useState(templateCode);

  function editorDidMount(monacoEditor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
    console.log('editorDidMount', monacoEditor);
    editor.current = monacoEditor;
    monacoEditor.focus();
  }

  function onChange(code: string, e: any) {
    setCode(code);
    console.log('onChange', code, e);
  }

  return (
    <>
      <ReactResizeDetector
        handleWidth
        handleHeight
        onResize={(width: number, height: number) => {
          editor?.current?.layout({ width, height });
        }}
      ></ReactResizeDetector>
      <MonacoEditor
        language="json"
        value={code}
        theme={"vs"}
        options={{
          autoClosingBrackets: 'never',
          autoClosingQuotes: 'never',
          cursorBlinking: 'smooth',
          folding: true,
          lineNumbersMinChars: 4,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
        }}
        onChange={onChange}
        editorDidMount={editorDidMount}
      />
    </>
  );
}
export default EditorPanel;
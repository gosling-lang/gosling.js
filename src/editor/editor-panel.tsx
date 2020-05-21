import React, { useRef, useState, useEffect } from 'react';
import MonacoEditor from 'react-monaco-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ReactResizeDetector from 'react-resize-detector';

const DEBUG_WITHOUT_DIAGNOSIS = true;

function EditorPanel(props: {
    code: string,
    readOnly?: boolean,
    onChange?: (code: string) => void
}) {

    const { code: templateCode, readOnly } = props;
    const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const [code, setCode] = useState(templateCode);

    useEffect(() => {
        setCode(templateCode);
    }, [templateCode]);

    function editorDidMount(monacoEditor: Monaco.editor.IStandaloneCodeEditor, monaco: typeof Monaco) {
        console.log('editorDidMount', monacoEditor);
        editor.current = monacoEditor;
        monacoEditor.focus();
    }

    function setupDiagnostics() {
        if (DEBUG_WITHOUT_DIAGNOSIS) return;
        Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            allowComments: false,
            enableSchemaRequest: true,
            validate: true,
            schemas: [{
                uri: "https://raw.githubusercontent.com/higlass/higlass/develop/app/schema.json",
                fileMatch: ['*']
            }]
        });
        Monaco.languages.json.jsonDefaults.setModeConfiguration({
            documentFormattingEdits: false,
            documentRangeFormattingEdits: false,
            completionItems: true,
            hovers: true,
            documentSymbols: true,
            tokens: true,
            colors: true,
            foldingRanges: true,
            diagnostics: true,
        });
    }

    function onChangeHandle(code: string, e: any) {
        setCode(code);
        if (props.onChange) props.onChange(code);
        // console.log('onChange', code, e);

        setupDiagnostics();
    }

    function editorWillMount(monaco: typeof Monaco) {
        setupDiagnostics();
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
                // Refer to https://github.com/react-monaco-editor/react-monaco-editor
                language="json"
                value={code}
                theme={"test"}
                options={{
                    autoClosingBrackets: "never",
                    autoClosingQuotes: "never",
                    cursorBlinking: "smooth",
                    folding: true,
                    lineNumbersMinChars: 4,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    lineNumbers: "off",
                    renderLineHighlight: "line",
                    renderIndentGuides: true,
                    readOnly
                }}
                onChange={onChangeHandle}
                editorDidMount={editorDidMount}
                editorWillMount={editorWillMount}
            />
        </>
    );
}
export default EditorPanel;
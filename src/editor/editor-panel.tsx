import React, { useRef, useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import MonacoEditor from 'react-monaco-editor';
import * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';
import ReactResizeDetector from 'react-resize-detector';

function EditorPanel(props: { code: string; readOnly?: boolean; onChange?: (code: string) => void }) {
    const { code: templateCode, readOnly } = props;
    const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const [code, setCode] = useState(templateCode);

    useEffect(() => {
        setCode(templateCode);
    }, [templateCode]);

    function editorDidMount(monacoEditor: Monaco.editor.IStandaloneCodeEditor) {
        editor.current = monacoEditor;
        monacoEditor.focus();
    }

    function editorWillMount() {
        Monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
            allowComments: true,
            enableSchemaRequest: true,
            validate: true,
            schemas: [
                {
                    uri: 'GeminiSchema',
                    fileMatch: ['*'],
                    schema: {
                        $ref: 'https://raw.githubusercontent.com/sehilyi/gemini/master/schema/geminid.schema.json'
                    }
                }
            ]
        });
        Monaco.languages.json.jsonDefaults.setModeConfiguration({
            diagnostics: true,
            documentFormattingEdits: false,
            documentRangeFormattingEdits: false,
            documentSymbols: true,
            completionItems: true,
            hovers: true,
            tokens: true,
            colors: true,
            foldingRanges: true,
            selectionRanges: false
        });
    }

    function onChangeHandle(newCode: string) {
        setCode(newCode);
        if (props.onChange) props.onChange(newCode);
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
                theme={'vs-light'}
                options={{
                    autoClosingBrackets: 'beforeWhitespace',
                    autoClosingQuotes: 'beforeWhitespace',
                    cursorBlinking: 'smooth',
                    folding: true,
                    lineNumbersMinChars: 4,
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    wordWrap: 'on',
                    lineNumbers: 'on',
                    renderLineHighlight: 'line',
                    renderIndentGuides: true,
                    fontSize: 14,
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

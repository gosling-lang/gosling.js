import React, { useRef, useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
import MonacoEditor from 'react-monaco-editor';

import ReactResizeDetector from 'react-resize-detector';
import * as Monaco from './monaco';

function EditorPanelJavascript(props: {
    code: string;
    readOnly?: boolean;
    openFindBox?: boolean;
    fontZoomIn?: boolean;
    fontZoomOut?: boolean;
    onChange?: (code: string, language: string) => void;
    hide?: boolean;
    isDarkTheme?: boolean;
}) {
    const { code: templateCode, readOnly, openFindBox, fontZoomIn, fontZoomOut, isDarkTheme } = props;
    const editor = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
    const [code, setCode] = useState(templateCode);

    useEffect(() => {
        updateTheme();
    }, [isDarkTheme]);

    useEffect(() => {
        setCode(templateCode);
    }, [templateCode]);

    useEffect(() => {
        if (editor.current && openFindBox !== undefined) {
            // Monaco editor do not seem to provide a way to close the find box, so let's just open it
            editor.current.getAction('actions.find').run();
        }
    }, [openFindBox]);

    useEffect(() => {
        if (editor.current && fontZoomIn !== undefined) {
            editor.current.getAction('editor.action.fontZoomIn').run();
        }
    }, [fontZoomIn]);

    useEffect(() => {
        if (editor.current && fontZoomOut !== undefined) {
            editor.current.getAction('editor.action.fontZoomOut').run();
        }
    }, [fontZoomOut]);

    function editorDidMount(monacoEditor: Monaco.editor.IStandaloneCodeEditor) {
        editor.current = monacoEditor;
        monacoEditor.focus();

        // Workaround to make `actions.find` working with Monaco editor 0.22.0 (https://github.com/microsoft/monaco-editor/issues/2355)
        monacoEditor.createContextKey('editorIsOpen', true);
    }

    function updateTheme() {
        Monaco.editor.defineTheme(
            'gosling',
            isDarkTheme
                ? {
                      base: 'vs-dark',
                      inherit: true,
                      rules: [
                          { token: 'attribute.name', foreground: '#eeeeee', fontStyle: 'bold' }, // all keys
                          { token: 'attribute.value', foreground: '#8BE9FD', fontStyle: 'bold' }, // all values
                          { token: 'number', foreground: '#FF79C6', fontStyle: 'bold' },
                          { token: 'keyword', foreground: '#FF79C6', fontStyle: 'bold' } // true and false
                      ],
                      colors: {
                          // ...
                      }
                  }
                : {
                      base: 'vs', // vs, vs-dark, or hc-black
                      inherit: true,
                      // Complete rules: https://github.com/microsoft/vscode/blob/93028e44ea7752bd53e2471051acbe6362e157e9/src/vs/editor/standalone/common/themes.ts#L13
                      rules: [
                          { token: 'attribute.name', foreground: '#222222' }, // all keys
                          { token: 'attribute.value', foreground: '#035CC5' }, // all values
                          { token: 'number', foreground: '#E32A4F' },
                          { token: 'keyword', foreground: '#E32A4F' } // true and false
                      ],
                      colors: {
                          // ...
                      }
                  }
        );
    }

    function editorWillMount() {
        updateTheme();
    }

    function onChangeHandle(newCode: string) {
        setCode(newCode);
        if (props.onChange) props.onChange(newCode, 'Javascript');
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
                language="javascript"
                value={code}
                theme="vs"
                // theme="gosling"
                options={{
                    autoClosingBrackets: 'beforeWhitespace',
                    autoClosingQuotes: 'beforeWhitespace',
                    cursorBlinking: 'smooth',
                    folding: true,
                    lineNumbersMinChars: 4,
                    minimap: { enabled: true },
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
export default EditorPanelJavascript;
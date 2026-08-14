import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code } from 'lucide-react';

const CodeEditor = () => {
  const [code, setCode] = useState(`class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        
    }
};`);
  const editorContentRef = useRef(null);

  const handleEditorMount = (editor) => {
    editor.onDidScrollChange((e) => {
      if (editorContentRef.current) {
        editorContentRef.current.style.setProperty('--scroll-y', `${e.scrollTop}px`);
      }
    });
  };

  return (
    <div className="editor-pane">
      <div className="pane-header">
        <Code />
        <span>Code</span>
      </div>
      <div className="pane-content" ref={editorContentRef} style={{ padding: 0, overflow: 'hidden', flex: 1 }}>
        <Editor
          height="100%"
          defaultLanguage="cpp"
          theme="light"
          value={code}
          onChange={(value) => setCode(value)}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: 12 },
            lineHeight: 24,
            renderLineHighlight: 'none',
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

import React, { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown } from 'lucide-react';

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
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '2px solid var(--sketch-border)' }}>
        <div className="select-wrapper">
          <select className="lang-select" defaultValue="cpp" style={{ fontSize: '1.2rem', padding: '0 16px 0 0' }}>
            <option value="cpp">C++</option>
            <option value="java">Java</option>
            <option value="python">Python 3</option>
            <option value="javascript">JavaScript</option>
          </select>
          <ChevronDown className="select-icon" size={16} style={{ right: 0 }} />
        </div>
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
            padding: { top: 16 }, /* Add padding to center text vertically between 48px lines */
            lineHeight: 48, /* Exactly match notebook line height */
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

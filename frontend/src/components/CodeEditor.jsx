import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown } from 'lucide-react';

const CodeEditor = () => {
  const [lang, setLang] = useState('cpp');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const langLabels = {
    cpp: 'C++',
    java: 'Java',
    python: 'Python 3',
    javascript: 'JavaScript',
    c: 'C',
    csharp: 'C#',
    ruby: 'Ruby',
    swift: 'Swift',
    go: 'Go',
    kotlin: 'Kotlin',
    rust: 'Rust',
    php: 'PHP'
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
        <div className="select-wrapper" ref={dropdownRef} onClick={() => setIsOpen(!isOpen)} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-hand)', marginRight: '4px', userSelect: 'none' }}>
            {langLabels[lang]}
          </span>
          <ChevronDown size={16} />
          
          {isOpen && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              marginTop: '8px',
              backgroundColor: 'var(--paper-bg)',
              border: '2px solid var(--sketch-border)',
              borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
              boxShadow: '2px 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100,
              minWidth: '140px',
              maxHeight: '288px', /* 6 lines exactly (48px * 6) */
              overflowY: 'auto',
              backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
              backgroundSize: '100% var(--grid-size)',
              backgroundPosition: '0 -1px',
            }}>
              {Object.entries(langLabels).map(([key, label]) => (
                <div 
                  key={key}
                  onClick={(e) => { e.stopPropagation(); setLang(key); setIsOpen(false); }}
                  style={{
                    height: 'var(--grid-size)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '0 16px',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1rem',
                    color: lang === key ? '#16a34a' : 'var(--text-ink)',
                    fontWeight: lang === key ? 700 : 500,
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(0,0,0,0.05)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  {label}
                </div>
              ))}
            </div>
          )}
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

import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown, Play, Loader2 } from 'lucide-react';
import { LANGUAGE_LABELS, MONACO_LANG_MAP } from '../constants/templates';

const CodeEditor = ({
  code,
  setCode,
  lang,
  setLang,
  onRun,
  isRunning = false,
  style
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const dropdownRef = useRef(null);
  const editorContentRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (editorRef.current) {
        editorRef.current.layout();
      }
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Trigger immediate and delayed layouts to ensure Monaco sizes properly on mobile
    editor.layout();
    setTimeout(() => editor.layout(), 80);
    setTimeout(() => editor.layout(), 250);
    setTimeout(() => editor.layout(), 600);

    editor.onDidScrollChange((e) => {
      if (editorContentRef.current) {
        editorContentRef.current.style.setProperty('--scroll-y', `${e.scrollTop}px`);
      }
    });

    // Add Ctrl+Enter or Cmd+Enter shortcut to run code
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !isRunning) {
        onRun();
      }
    });
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  const monacoLanguage = MONACO_LANG_MAP[lang] || 'javascript';

  return (
    <div className="editor-pane" style={style}>
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} />
          <span>Code</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 16px', borderBottom: '2px solid var(--sketch-border)' }}>
        <div
          className="select-wrapper"
          ref={dropdownRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '1.2rem', fontWeight: 600, fontFamily: 'var(--font-hand)', marginRight: '4px', userSelect: 'none' }}>
            {LANGUAGE_LABELS[lang] || lang}
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
              minWidth: '150px',
              maxHeight: '288px',
              overflowY: 'auto',
              backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
              backgroundSize: '100% var(--grid-size)',
              backgroundPosition: '0 -1px',
              backgroundAttachment: 'local',
            }}>
              {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                <div 
                  key={key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleLanguageChange(key);
                  }}
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

      <div
        className="pane-content editor-pane-content"
        ref={editorContentRef}
        style={{
          padding: 0,
          overflow: 'hidden',
          flex: '1 1 auto',
          height: isMobile ? '380px' : '100%',
          minHeight: isMobile ? '360px' : '260px',
          position: 'relative'
        }}
      >
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="light"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: isMobile ? 15 : 16,
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: isMobile ? 10 : 16 },
            lineHeight: isMobile ? 26 : 48,
            renderLineHighlight: isMobile ? 'line' : 'none',
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            automaticLayout: true,
            tabSize: 2,
            readOnly: false,
            domReadOnly: false,
            fixedOverflowWidgets: true,
            wordWrap: 'on',
            wrappingIndent: 'same',
            glyphMargin: false,
            folding: !isMobile,
            lineNumbers: 'on',
            lineNumbersMinChars: 4,
            lineDecorationsWidth: isMobile ? 8 : 12, /* Pushes code past the 60px red margin line */
            quickSuggestions: false,
            suggestOnTriggerCharacters: false,
            acceptSuggestionOnEnter: 'off',
            tabCompletion: 'off',
            snippetSuggestions: 'none',
            autoClosingBrackets: isMobile ? 'never' : 'always',
            autoClosingQuotes: isMobile ? 'never' : 'always',
            matchBrackets: isMobile ? 'never' : 'always',
            cursorStyle: 'line',
            cursorWidth: 2,
            cursorBlinking: 'blink',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

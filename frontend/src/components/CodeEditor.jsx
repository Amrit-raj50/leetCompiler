import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown, Play, Loader2 } from 'lucide-react';
import { LANGUAGE_LABELS, MONACO_LANG_MAP, CODE_TEMPLATES } from '../constants/templates';

const CodeEditor = ({
  code,
  setCode,
  lang,
  setLang,
  onRun,
  isRunning = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768);
  const dropdownRef = useRef(null);
  const editorContentRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

    // Ensure mobile click/touch focuses the Monaco editor and triggers keyboard
    if (editorContentRef.current) {
      const handleFocusEditor = () => {
        if (editorRef.current) {
          editorRef.current.focus();
        }
      };
      editorContentRef.current.addEventListener('click', handleFocusEditor);
      editorContentRef.current.addEventListener('touchend', handleFocusEditor, { passive: true });
    }
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  const monacoLanguage = MONACO_LANG_MAP[lang] || 'javascript';

  return (
    <div className="editor-pane">
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} />
          <span>Code</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="hide-on-mobile" style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
            Ctrl + Enter to Run
          </span>
          <button
            onClick={onRun}
            disabled={isRunning}
            className="btn btn-run"
            style={{
              padding: '2px 12px',
              fontSize: '1.2rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              opacity: isRunning ? 0.7 : 1
            }}
            title="Run Code (Ctrl+Enter)"
          >
            {isRunning ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play size={16} fill="currentColor" />
                <span>Run</span>
              </>
            )}
          </button>
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

      <div className="pane-content" ref={editorContentRef} style={{ padding: 0, overflow: 'hidden', flex: '1 1 auto', minHeight: '260px', height: '100%', position: 'relative' }}>
        <Editor
          height="100%"
          language={monacoLanguage}
          theme="light"
          value={code}
          onChange={(value) => setCode(value || '')}
          onMount={handleEditorMount}
          options={{
            minimap: { enabled: false },
            fontSize: isMobile ? 14 : 16,
            fontFamily: "'JetBrains Mono', monospace",
            scrollBeyondLastLine: false,
            smoothScrolling: true,
            padding: { top: isMobile ? 8 : 16 },
            lineHeight: isMobile ? 24 : 48,
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
            glyphMargin: !isMobile,
            folding: !isMobile,
            lineNumbersMinChars: isMobile ? 2 : 3,
            quickSuggestions: !isMobile,
            suggestOnTriggerCharacters: !isMobile,
            acceptSuggestionOnEnter: isMobile ? 'off' : 'on',
            tabCompletion: isMobile ? 'off' : 'on',
            snippetSuggestions: isMobile ? 'none' : 'inline',
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
              verticalScrollbarSize: isMobile ? 6 : 8,
              horizontalScrollbarSize: isMobile ? 6 : 8,
              alwaysConsumeMouseWheel: false,
            }
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown, Copy, Check, Scissors, MousePointer2 } from 'lucide-react';
import toast from 'react-hot-toast';
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
  const [copied, setCopied] = useState(false);
  const [cut, setCut] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hasSelection, setHasSelection] = useState(false);
  const dropdownRef = useRef(null);
  const editorContentRef = useRef(null);
  const editorRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (editorRef.current) editorRef.current.layout();
    };
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleEditorMount = (editor, monaco) => {
    editorRef.current = editor;

    // Layouts for mobile sizing
    editor.layout();
    setTimeout(() => editor.layout(), 80);
    setTimeout(() => editor.layout(), 250);
    setTimeout(() => editor.layout(), 600);

    editor.onDidScrollChange((e) => {
      if (editorContentRef.current) {
        editorContentRef.current.style.setProperty('--scroll-y', `${e.scrollTop}px`);
      }
    });

    // Track whether there's an active selection (for smart copy/cut labels)
    editor.onDidChangeCursorSelection((e) => {
      const sel = e.selection;
      setHasSelection(sel && !sel.isEmpty());
    });

    // Ctrl/Cmd + Enter → Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !isRunning) onRun();
    });
  };

  // ─── Helpers ──────────────────────────────────────────────────────────────

  /** Get selected text, or fall back to all code */
  const getTextToCopy = () => {
    if (editorRef.current) {
      const sel = editorRef.current.getSelection();
      if (sel && !sel.isEmpty()) {
        return {
          text: editorRef.current.getModel().getValueInRange(sel),
          isPartial: true,
        };
      }
    }
    return { text: code || '', isPartial: false };
  };

  const handleCopy = () => {
    const { text, isPartial } = getTextToCopy();
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success(isPartial ? '✂️ Selection copied!' : '📋 All code copied!');
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => toast.error('Copy failed — use Ctrl+C / Cmd+C'));
  };

  const handleCut = () => {
    if (!editorRef.current) return;
    const sel = editorRef.current.getSelection();
    if (!sel || sel.isEmpty()) {
      toast('Select some code first to cut it.', { icon: '✂️' });
      return;
    }
    const text = editorRef.current.getModel().getValueInRange(sel);
    navigator.clipboard.writeText(text).then(() => {
      // Delete the selected range in Monaco
      editorRef.current.executeEdits('cut', [{
        range: sel,
        text: '',
        forceMoveMarkers: true,
      }]);
      setCut(true);
      toast.success('✂️ Selection cut!');
      setTimeout(() => setCut(false), 2000);
    }).catch(() => toast.error('Cut failed — use Ctrl+X / Cmd+X'));
  };

  const handleSelectAll = () => {
    if (!editorRef.current) return;
    editorRef.current.getAction('editor.action.selectAll').run();
    editorRef.current.focus();
    toast('All code selected — now use Copy or Cut.', { icon: '🖱️', duration: 2000 });
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  const monacoLanguage = MONACO_LANG_MAP[lang] || 'javascript';

  // ─── Shared button style ──────────────────────────────────────────────────
  const mobileBtn = (active, activeColor = '#15803d', activeBg = 'rgba(34,197,94,0.12)') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: '6px 12px',
    fontFamily: 'var(--font-hand)',
    fontSize: '0.9rem',
    fontWeight: 600,
    border: '1.5px solid var(--sketch-border)',
    borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
    backgroundColor: active ? activeBg : 'rgba(255,255,255,0.7)',
    color: active ? activeColor : 'var(--text-muted)',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s, transform 0.1s',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
  });

  return (
    <div className="editor-pane" style={style}>
      {/* ── Header ── */}
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} />
          <span>Code</span>
        </div>
      </div>

      {/* ── Language selector row ── */}
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
              position: 'absolute', top: '100%', left: 0, marginTop: '8px',
              backgroundColor: 'var(--paper-bg)',
              border: '2px solid var(--sketch-border)',
              borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
              boxShadow: '2px 4px 12px rgba(0,0,0,0.1)',
              zIndex: 100, minWidth: '150px', maxHeight: '288px', overflowY: 'auto',
              backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
              backgroundSize: '100% var(--grid-size)',
              backgroundPosition: '0 -1px',
              backgroundAttachment: 'local',
            }}>
              {Object.entries(LANGUAGE_LABELS).map(([key, label]) => (
                <div
                  key={key}
                  onClick={(e) => { e.stopPropagation(); handleLanguageChange(key); }}
                  style={{
                    height: 'var(--grid-size)', display: 'flex', alignItems: 'center',
                    padding: '0 16px', fontFamily: 'var(--font-hand)', fontSize: '1rem',
                    color: lang === key ? '#16a34a' : 'var(--text-ink)',
                    fontWeight: lang === key ? 700 : 500, cursor: 'pointer', userSelect: 'none',
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

      {/* ── Mobile action toolbar ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 12px',
          borderBottom: '1.5px solid var(--sketch-border)',
          backgroundColor: 'rgba(0,0,0,0.02)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0,
        }}>
          {/* Select All */}
          <button onClick={handleSelectAll} style={mobileBtn(false)} title="Select all code">
            <MousePointer2 size={14} />
            <span>Select All</span>
          </button>

          {/* Copy (smart: selection or all) */}
          <button onClick={handleCopy} style={mobileBtn(copied)} title={hasSelection ? 'Copy selection' : 'Copy all code'}>
            {copied ? <Check size={14} /> : <Copy size={14} />}
            <span>{copied ? 'Copied!' : hasSelection ? 'Copy Selection' : 'Copy All'}</span>
          </button>

          {/* Cut (requires selection) */}
          <button onClick={handleCut} style={mobileBtn(cut, '#b45309', 'rgba(245,158,11,0.12)')} title="Cut selection">
            {cut ? <Check size={14} /> : <Scissors size={14} />}
            <span>{cut ? 'Cut!' : 'Cut'}</span>
          </button>
        </div>
      )}

      {/* ── Editor area ── */}
      <div
        className="pane-content editor-pane-content"
        ref={editorContentRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        style={{
          padding: 0,
          overflow: 'hidden',
          flex: '1 1 auto',
          height: isMobile ? '380px' : '100%',
          minHeight: isMobile ? '360px' : '260px',
          position: 'relative',
        }}
      >
        {/* Floating copy button (desktop hover) */}
        {!isMobile && (
          <button
            onClick={handleCopy}
            title={hasSelection ? 'Copy selection' : 'Copy all code'}
            style={{
              position: 'absolute',
              top: '10px',
              right: '18px',
              zIndex: 20,
              display: 'flex',
              alignItems: 'center',
              gap: '5px',
              padding: '5px 10px',
              fontFamily: 'var(--font-hand)',
              fontSize: '0.85rem',
              fontWeight: 600,
              border: '1.5px solid var(--sketch-border)',
              borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
              backgroundColor: copied ? 'rgba(34,197,94,0.12)' : 'rgba(255,255,255,0.88)',
              color: copied ? '#15803d' : 'var(--text-muted)',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
              boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
              opacity: hovering || copied ? 1 : 0,
              transform: hovering || copied ? 'translateY(0)' : 'translateY(-4px)',
              transition: 'opacity 0.18s ease, transform 0.18s ease, background-color 0.15s, color 0.15s',
              pointerEvents: hovering || copied ? 'auto' : 'none',
            }}
          >
            {copied
              ? <><Check size={13} /><span>Copied!</span></>
              : <><Copy size={13} /><span>{hasSelection ? 'Copy Selection' : 'Copy'}</span></>}
          </button>
        )}

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
            lineDecorationsWidth: isMobile ? 8 : 12,
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
            // Better selection experience
            selectionHighlight: true,
            occurrencesHighlight: false,
            renderWhitespace: 'none',
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              useShadows: false,
              verticalScrollbarSize: 8,
              horizontalScrollbarSize: 8,
              alwaysConsumeMouseWheel: false,
            },
          }}
        />
      </div>
    </div>
  );
};

export default CodeEditor;

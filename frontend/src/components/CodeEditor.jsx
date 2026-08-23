import React, { useRef, useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { Code, ChevronDown, Copy, Check, Scissors, MousePointer2, Clipboard, Edit3, X } from 'lucide-react';
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
  const [showTextModal, setShowTextModal] = useState(false);
  const [modalText, setModalText] = useState('');

  const dropdownRef = useRef(null);
  const editorContentRef = useRef(null);
  const editorRef = useRef(null);
  const modalTextareaRef = useRef(null);

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

    editor.layout();
    setTimeout(() => editor.layout(), 80);
    setTimeout(() => editor.layout(), 250);
    setTimeout(() => editor.layout(), 600);

    editor.onDidScrollChange((e) => {
      if (editorContentRef.current) {
        editorContentRef.current.style.setProperty('--scroll-y', `${e.scrollTop}px`);
      }
    });

    // Track selection in Monaco
    editor.onDidChangeCursorSelection((e) => {
      const sel = e.selection;
      setHasSelection(sel && !sel.isEmpty());
    });

    // Ctrl/Cmd + Enter → Run
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      if (onRun && !isRunning) onRun();
    });
  };

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

  const handlePaste = async () => {
    try {
      const clipText = await navigator.clipboard.readText();
      if (!clipText) {
        toast('Clipboard is empty', { icon: '📋' });
        return;
      }
      if (editorRef.current) {
        const sel = editorRef.current.getSelection();
        if (sel) {
          editorRef.current.executeEdits('paste', [{
            range: sel,
            text: clipText,
            forceMoveMarkers: true
          }]);
        } else {
          setCode(clipText);
        }
        editorRef.current.focus();
        toast.success('Pasted from clipboard!');
      } else {
        setCode(clipText);
        toast.success('Pasted from clipboard!');
      }
    } catch (err) {
      toast('Use Ctrl+V or open Mobile Native Edit Mode', { icon: '💡' });
    }
  };

  const handleSelectAll = () => {
    if (!editorRef.current) return;
    editorRef.current.getAction('editor.action.selectAll').run();
    editorRef.current.focus();
    toast('All code selected — use Copy or Cut.', { icon: '🖱️', duration: 2000 });
  };

  const openNativeModal = () => {
    setModalText(code || '');
    setShowTextModal(true);
    setTimeout(() => {
      if (modalTextareaRef.current) {
        modalTextareaRef.current.focus();
      }
    }, 150);
  };

  const saveNativeModal = () => {
    setCode(modalText);
    setShowTextModal(false);
    toast.success('Code updated!');
  };

  const handleLanguageChange = (newLang) => {
    setLang(newLang);
    setIsOpen(false);
  };

  const monacoLanguage = MONACO_LANG_MAP[lang] || 'javascript';

  const actionBtnStyle = (active = false, activeColor = '#15803d', activeBg = 'rgba(34,197,94,0.12)') => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    padding: isMobile ? '6px 10px' : '4px 10px',
    fontFamily: 'var(--font-hand)',
    fontSize: isMobile ? '0.85rem' : '0.85rem',
    fontWeight: 600,
    border: '1.5px solid var(--sketch-border)',
    borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
    backgroundColor: active ? activeBg : 'rgba(255,255,255,0.75)',
    color: active ? activeColor : 'var(--text-ink)',
    cursor: 'pointer',
    transition: 'background-color 0.15s, color 0.15s, transform 0.1s',
    userSelect: 'none',
    WebkitUserSelect: 'none',
    touchAction: 'manipulation',
    whiteSpace: 'nowrap',
    flexShrink: 0
  });

  return (
    <div className="editor-pane" style={style}>
      {/* ── Header ── */}
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Code size={20} />
          <span>Code</span>
        </div>

        {/* Desktop Header Quick Tools */}
        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <button onClick={handleSelectAll} style={actionBtnStyle(false)} title="Select All (Ctrl+A)">
              <MousePointer2 size={13} />
              <span>Select All</span>
            </button>
            <button onClick={handleCopy} style={actionBtnStyle(copied)} title={hasSelection ? 'Copy selection' : 'Copy all'}>
              {copied ? <Check size={13} /> : <Copy size={13} />}
              <span>{copied ? 'Copied!' : hasSelection ? 'Copy Selection' : 'Copy'}</span>
            </button>
            <button onClick={handleCut} style={actionBtnStyle(cut, '#b45309', 'rgba(245,158,11,0.12)')} title="Cut selection">
              {cut ? <Check size={13} /> : <Scissors size={13} />}
              <span>{cut ? 'Cut!' : 'Cut'}</span>
            </button>
            <button onClick={handlePaste} style={actionBtnStyle(false)} title="Paste from clipboard">
              <Clipboard size={13} />
              <span>Paste</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Language Selector Row ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 14px', borderBottom: '2px solid var(--sketch-border)' }}>
        <div
          className="select-wrapper"
          ref={dropdownRef}
          onClick={() => setIsOpen(!isOpen)}
          style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}
        >
          <span style={{ fontSize: '1.15rem', fontWeight: 600, fontFamily: 'var(--font-hand)', marginRight: '4px', userSelect: 'none' }}>
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

        {/* Mobile Easy Text Editor Button */}
        {isMobile && (
          <button
            onClick={openNativeModal}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              fontSize: '0.82rem',
              fontFamily: 'var(--font-hand)',
              fontWeight: 700,
              backgroundColor: 'rgba(234, 179, 8, 0.15)',
              border: '1.5px solid #ca8a04',
              borderRadius: '4px',
              color: '#854d0e',
              cursor: 'pointer'
            }}
            title="Open native touch editor for easy copy/paste handles on mobile"
          >
            <Edit3 size={13} />
            <span>Mobile Text View</span>
          </button>
        )}
      </div>

      {/* ── Mobile Action Toolbar ── */}
      {isMobile && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 10px',
          borderBottom: '1.5px solid var(--sketch-border)',
          backgroundColor: 'rgba(0,0,0,0.02)',
          overflowX: 'auto',
          WebkitOverflowScrolling: 'touch',
          flexShrink: 0,
        }}>
          <button onClick={handleSelectAll} style={actionBtnStyle(false)} title="Select All Code">
            <MousePointer2 size={13} />
            <span>Select All</span>
          </button>
          <button onClick={handleCopy} style={actionBtnStyle(copied)} title={hasSelection ? 'Copy selection' : 'Copy all'}>
            {copied ? <Check size={13} /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : hasSelection ? 'Copy Selection' : 'Copy All'}</span>
          </button>
          <button onClick={handleCut} style={actionBtnStyle(cut, '#b45309', 'rgba(245,158,11,0.12)')} title="Cut selection">
            {cut ? <Check size={13} /> : <Scissors size={13} />}
            <span>{cut ? 'Cut!' : 'Cut'}</span>
          </button>
          <button onClick={handlePaste} style={actionBtnStyle(false)} title="Paste clipboard text">
            <Clipboard size={13} />
            <span>Paste</span>
          </button>
        </div>
      )}

      {/* ── Editor Area ── */}
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

      {/* ── Native Touch Selection Modal for Mobile ── */}
      {showTextModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            backdropFilter: 'blur(3px)'
          }}
        >
          <div
            style={{
              width: '100%',
              maxWidth: '560px',
              backgroundColor: 'var(--paper-bg)',
              border: '2px solid var(--sketch-border)',
              borderRadius: '8px 12px 6px 10px / 10px 6px 12px 8px',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              maxHeight: '85vh',
              overflow: 'hidden'
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '2px solid var(--sketch-border)',
              backgroundColor: 'rgba(0,0,0,0.03)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={18} />
                <span style={{ fontFamily: 'var(--font-hand)', fontSize: '1.15rem', fontWeight: 700 }}>
                  Mobile Selection & Paste View
                </span>
              </div>
              <button
                onClick={() => setShowTextModal(false)}
                style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
                💡 Native text field: touch and drag handles to select any part, copy, cut, or paste seamlessly with your phone's native menu.
              </span>
              <textarea
                ref={modalTextareaRef}
                value={modalText}
                onChange={(e) => setModalText(e.target.value)}
                style={{
                  width: '100%',
                  height: '240px',
                  boxSizing: 'border-box',
                  padding: '10px',
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.95rem',
                  lineHeight: '1.4',
                  border: '1.5px solid var(--sketch-border)',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: '#0f172a',
                  resize: 'none',
                  outline: 'none',
                  WebkitUserSelect: 'text',
                  userSelect: 'text'
                }}
              />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              padding: '12px 16px',
              borderTop: '2px solid var(--sketch-border)',
              backgroundColor: 'rgba(0,0,0,0.02)'
            }}>
              <button
                onClick={() => setShowTextModal(false)}
                style={actionBtnStyle(false)}
              >
                Cancel
              </button>
              <button
                onClick={saveNativeModal}
                style={{
                  ...actionBtnStyle(true),
                  backgroundColor: '#16a34a',
                  color: '#ffffff',
                  borderColor: '#15803d'
                }}
              >
                <Check size={14} />
                <span>Apply Changes</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;

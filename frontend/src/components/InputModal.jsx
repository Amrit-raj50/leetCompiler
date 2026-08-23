import React, { useState, useEffect } from 'react';
import { Play, Sparkles, X, Terminal, HelpCircle } from 'lucide-react';

const InputModal = ({
  isOpen,
  onClose,
  onSubmit,
  prompts = [],
  initialStdin = '',
  lang = 'java'
}) => {
  const [inputs, setInputs] = useState([]);
  const [rawMode, setRawMode] = useState(false);
  const [rawText, setRawText] = useState(initialStdin || '');

  useEffect(() => {
    if (isOpen) {
      if (prompts.length > 0) {
        // Pre-fill with existing stdin lines or default empty values
        const lines = initialStdin ? initialStdin.split('\n') : [];
        const initialForm = prompts.map((p, i) => ({
          label: p.label || `Input ${i + 1}`,
          example: p.example || '',
          value: lines[i] !== undefined ? lines[i] : ''
        }));
        setInputs(initialForm);
      } else {
        setRawMode(true);
      }
      setRawText(initialStdin || '');
    }
  }, [isOpen, prompts, initialStdin]);

  if (!isOpen) return null;

  const handleInputChange = (index, val) => {
    const updated = [...inputs];
    updated[index].value = val;
    setInputs(updated);
  };

  const handleRun = () => {
    let finalStdin = '';
    if (rawMode || prompts.length === 0) {
      finalStdin = rawText;
    } else {
      finalStdin = inputs.map(item => item.value).join('\n');
    }
    onSubmit(finalStdin);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '520px',
          backgroundColor: 'var(--paper-bg)',
          border: '2px solid var(--sketch-border)',
          borderRadius: '8px 12px 6px 10px / 10px 6px 12px 8px',
          boxShadow: '0 20px 35px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '14px 18px',
            borderBottom: '2px solid var(--sketch-border)',
            backgroundColor: 'rgba(234, 179, 8, 0.12)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={20} style={{ color: '#ca8a04' }} />
            <div>
              <h3 style={{ margin: 0, fontFamily: 'var(--font-hand)', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-ink)' }}>
                Program Requires Input
              </h3>
              <p style={{ margin: 0, fontSize: '0.82rem', fontFamily: 'var(--font-hand)', color: 'var(--text-muted)' }}>
                Your code accepts standard input ({lang.toUpperCase()}). Please provide inputs below.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted)',
              padding: '4px'
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 20px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {!rawMode && prompts.length > 0 ? (
            <>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {inputs.map((field, idx) => (
                  <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <label style={{
                      fontFamily: 'var(--font-hand)',
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'var(--text-ink)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}>
                      <span>{field.label}:</span>
                      {field.example && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 400 }}>
                          (e.g., {field.example})
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={field.value}
                      autoFocus={idx === 0}
                      onChange={(e) => handleInputChange(idx, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && idx === inputs.length - 1) {
                          handleRun();
                        }
                      }}
                      placeholder={`Enter ${field.label}...`}
                      style={{
                        padding: '8px 12px',
                        fontFamily: 'var(--font-mono)',
                        fontSize: '0.95rem',
                        border: '1.5px solid var(--sketch-border)',
                        borderRadius: '4px',
                        backgroundColor: '#ffffff',
                        color: 'var(--text-ink)',
                        outline: 'none'
                      }}
                    />
                  </div>
                ))}
              </div>

              <button
                onClick={() => {
                  setRawText(inputs.map(i => i.value).join('\n'));
                  setRawMode(true);
                }}
                style={{
                  alignSelf: 'flex-start',
                  background: 'transparent',
                  border: 'none',
                  color: '#2563eb',
                  fontSize: '0.82rem',
                  fontFamily: 'var(--font-hand)',
                  cursor: 'pointer',
                  textDecoration: 'underline',
                  padding: 0
                }}
              >
                Switch to Raw Multiline Text View
              </button>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontFamily: 'var(--font-hand)', fontSize: '0.95rem', fontWeight: 600 }}>
                Enter all inputs (one per line):
              </label>
              <textarea
                value={rawText}
                autoFocus
                onChange={(e) => setRawText(e.target.value)}
                placeholder="Enter input values here, separated by newlines..."
                rows={6}
                style={{
                  width: '100%',
                  boxSizing: 'border-box',
                  padding: '10px 12px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.95rem',
                  border: '1.5px solid var(--sketch-border)',
                  borderRadius: '4px',
                  backgroundColor: '#ffffff',
                  color: 'var(--text-ink)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              {prompts.length > 0 && (
                <button
                  onClick={() => setRawMode(false)}
                  style={{
                    alignSelf: 'flex-start',
                    background: 'transparent',
                    border: 'none',
                    color: '#2563eb',
                    fontSize: '0.82rem',
                    fontFamily: 'var(--font-hand)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    padding: 0
                  }}
                >
                  Switch back to Guided Fields
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '10px',
            padding: '12px 18px',
            borderTop: '2px solid var(--sketch-border)',
            backgroundColor: 'rgba(0,0,0,0.02)'
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '6px 14px',
              fontFamily: 'var(--font-hand)',
              fontSize: '0.95rem',
              border: '1.5px solid var(--sketch-border)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleRun}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 18px',
              fontFamily: 'var(--font-hand)',
              fontSize: '1rem',
              fontWeight: 700,
              border: '1.5px solid #15803d',
              borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
              backgroundColor: '#16a34a',
              color: '#ffffff',
              cursor: 'pointer',
              boxShadow: '0 2px 6px rgba(22, 163, 74, 0.3)'
            }}
          >
            <Play size={14} fill="#ffffff" />
            <span>Submit & Run Code</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default InputModal;

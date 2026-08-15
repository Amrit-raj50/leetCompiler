import React, { useState } from 'react';
import {
  Terminal,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Zap,
  Unlock,
  Flame,
  Clock,
  HardDrive,
  Lightbulb,
  FileCode,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  HelpCircle
} from 'lucide-react';
import toast from 'react-hot-toast';

const OutputConsole = ({
  activeTab,
  setActiveTab,
  output,
  setOutput,
  execResult,
  isRunning,
  testCases = [],
  onUpdateTestCase
}) => {
  const [selectedCaseIndex, setSelectedCaseIndex] = useState(0);
  const [showRawTrace, setShowRawTrace] = useState(false);
  const [copiedTrace, setCopiedTrace] = useState(false);

  const currentCase = testCases[selectedCaseIndex] || testCases[0];
  const isIntegrated = execResult?.mode === 'integrated';
  const diagnostics = execResult?.diagnostics;

  const handleCopyTrace = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedTrace(true);
    toast.success('Stack trace copied to clipboard!');
    setTimeout(() => setCopiedTrace(false), 2000);
  };

  return (
    <div className="console-pane">
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={20} />
          <span>Console</span>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Mode Indicator Badge (Only for Integrated Mode) */}
          {isIntegrated && (
            <span
              style={{
                fontSize: '0.85rem',
                fontFamily: 'var(--font-hand)',
                padding: '2px 8px',
                borderRadius: '4px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                border: '1px solid #22c55e',
                color: '#15803d'
              }}
            >
              <Zap size={13} />
              <span>Integrated Mode</span>
            </span>
          )}

          {activeTab === 'output' && (output || execResult) && (
            <button
              onClick={() => {
                setOutput('');
              }}
              className="btn-icon"
              style={{ fontSize: '0.9rem', gap: '4px', opacity: 0.7 }}
              title="Clear output"
            >
              <Trash2 size={14} />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Console Tabs (Only show Testcases tab if testCases are present) */}
      {testCases.length > 0 ? (
        <div className="tabs-container" style={{ borderBottom: '2px solid var(--sketch-border)' }}>
          <button
            className={`tab ${activeTab === 'testcases' ? 'active' : ''}`}
            onClick={() => setActiveTab('testcases')}
          >
            Testcases
          </button>
          <button
            className={`tab ${activeTab === 'output' ? 'active' : ''}`}
            onClick={() => setActiveTab('output')}
          >
            Test Result
            {execResult?.allPassed && <span style={{ marginLeft: '6px', color: '#16a34a' }}>●</span>}
            {execResult?.error && <span style={{ marginLeft: '6px', color: '#dc2626' }}>●</span>}
          </button>
        </div>
      ) : null}

      <div className="pane-content">
        {isRunning ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '12px', minHeight: '140px' }}>
            <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
            <span style={{ fontSize: '1.2rem', fontFamily: 'var(--font-hand)' }}>Compiling & Executing Code...</span>
          </div>
        ) : (
          <>
            {/* 1. Testcases Tab (Integrated / Catalog mode) */}
            {activeTab === 'testcases' && (
              <div>
                {testCases.length === 0 ? (
                  <div className="console-placeholder" style={{ padding: '24px 0' }}>
                    No pre-configured test cases for this scratchpad. Click "Run" to test execution output.
                  </div>
                ) : (
                  <>
                    {/* Case Buttons */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', height: 'var(--grid-size)', alignItems: 'center' }}>
                      {testCases.map((tc, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedCaseIndex(index)}
                          style={{
                            padding: '0 12px',
                            height: '32px',
                            fontFamily: 'var(--font-hand)',
                            fontSize: '1rem',
                            border: '1.5px solid var(--sketch-border)',
                            borderRadius: '4px',
                            backgroundColor: selectedCaseIndex === index ? 'rgba(0,0,0,0.08)' : 'transparent',
                            fontWeight: selectedCaseIndex === index ? 700 : 500,
                            cursor: 'pointer',
                            color: 'var(--text-ink)'
                          }}
                        >
                          Case {index + 1}
                        </button>
                      ))}
                    </div>

                    {/* Active Test Case Inputs */}
                    {currentCase && (
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        {Object.entries(currentCase.input || {}).map(([key, val]) => (
                          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 'var(--grid-size)' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
                              {key} =
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.1rem',
                              color: 'var(--text-ink)',
                              fontWeight: 600
                            }}>
                              {JSON.stringify(val)}
                            </span>
                          </div>
                        ))}

                        {currentCase.expectedOutput !== undefined && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', lineHeight: 'var(--grid-size)' }}>
                            <span style={{ fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
                              Expected Output =
                            </span>
                            <span style={{
                              fontFamily: 'var(--font-mono)',
                              fontSize: '1.1rem',
                              color: '#16a34a',
                              fontWeight: 600
                            }}>
                              {JSON.stringify(currentCase.expectedOutput)}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* 2. Output / Execution Result Tab */}
            {activeTab === 'output' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                
                {/* Result Header Badges */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
                  {execResult?.allPassed ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                      backgroundColor: 'rgba(34, 197, 94, 0.15)',
                      border: '2px solid #16a34a',
                      color: '#15803d',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      fontFamily: 'var(--font-hand)'
                    }}>
                      <CheckCircle2 size={22} />
                      <span>All Test Cases Passed!</span>
                    </div>
                  ) : execResult?.error ? (
                    <div style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 12px',
                      borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                      backgroundColor: 'rgba(239, 68, 68, 0.15)',
                      border: '2px solid #dc2626',
                      color: '#b91c1c',
                      fontWeight: 700,
                      fontSize: '1.2rem',
                      fontFamily: 'var(--font-hand)'
                    }}>
                      <XCircle size={22} />
                      <span>{diagnostics?.type || 'Execution Failed'}</span>
                    </div>
                  ) : null}

                  {/* Runtime & Memory Badges */}
                  {execResult && (execResult.executionTimeMs !== undefined || execResult.memoryMb !== undefined) && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                      {execResult.executionTimeMs !== undefined && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(2, 132, 199, 0.08)',
                          border: '1.5px solid #0284c7',
                          color: '#0369a1',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-hand)'
                        }}>
                          <Clock size={15} />
                          <span>Time: <strong style={{ fontFamily: 'var(--font-mono)' }}>{execResult.executionTimeFormatted || `${execResult.executionTimeMs} ms`}</strong></span>
                        </div>
                      )}

                      {execResult.memoryMb !== undefined && (
                        <div style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '3px 10px',
                          borderRadius: '4px',
                          backgroundColor: 'rgba(147, 51, 234, 0.08)',
                          border: '1.5px solid #9333ea',
                          color: '#7e22ce',
                          fontSize: '0.9rem',
                          fontWeight: 700,
                          fontFamily: 'var(--font-hand)'
                        }}>
                          <HardDrive size={15} />
                          <span>Space: <strong style={{ fontFamily: 'var(--font-mono)' }}>{execResult.memoryFormatted || `${execResult.memoryMb} MB`}</strong></span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* 🌟 PREMIUM ERROR DIAGNOSTIC CARD */}
                {diagnostics ? (
                  <div
                    className="sketch-box"
                    style={{
                      padding: '16px 20px',
                      backgroundColor: 'rgba(254, 242, 242, 0.65)',
                      border: '2px solid #ef4444',
                      borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px'
                    }}
                  >
                    {/* Top Diagnostic Title */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.4rem' }}>{diagnostics.icon || '🛑'}</span>
                        <span style={{ fontSize: '1.25rem', fontWeight: 800, fontFamily: 'var(--font-hand)', color: '#b91c1c' }}>
                          {diagnostics.type}
                        </span>
                      </div>

                      {diagnostics.lineNumber && (
                        <span style={{
                          fontSize: '0.85rem',
                          fontFamily: 'var(--font-mono)',
                          padding: '2px 10px',
                          backgroundColor: '#fee2e2',
                          border: '1px solid #f87171',
                          borderRadius: '12px',
                          color: '#991b1b',
                          fontWeight: 700
                        }}>
                          📍 Line {diagnostics.lineNumber}{diagnostics.columnNumber ? `:${diagnostics.columnNumber}` : ''}
                        </span>
                      )}
                    </div>

                    {/* Exact Error Message */}
                    <div style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '0.95rem',
                      backgroundColor: 'rgba(255,255,255,0.9)',
                      border: '1.5px solid #fca5a5',
                      padding: '8px 12px',
                      borderRadius: '4px',
                      color: '#991b1b',
                      wordBreak: 'break-word'
                    }}>
                      {diagnostics.message}
                    </div>

                    {/* Offending Code Snippet Preview */}
                    {diagnostics.codeSnippet && (
                      <div style={{
                        backgroundColor: '#fff',
                        border: '1.5px dashed #ef4444',
                        padding: '10px 14px',
                        borderRadius: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '4px'
                      }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <FileCode size={14} />
                          <span>Offending Code (Line {diagnostics.lineNumber}):</span>
                        </div>
                        <div style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '0.95rem',
                          color: '#b91c1c',
                          fontWeight: 600,
                          backgroundColor: 'rgba(254, 226, 226, 0.5)',
                          padding: '4px 8px',
                          borderRadius: '3px'
                        }}>
                          {diagnostics.codeSnippet}
                        </div>
                      </div>
                    )}

                    {/* Explanation */}
                    {diagnostics.explanation && (
                      <div style={{
                        fontSize: '1.05rem',
                        fontFamily: 'var(--font-hand)',
                        color: 'var(--text-ink)',
                        lineHeight: '1.4'
                      }}>
                        <strong style={{ color: '#b91c1c' }}>What happened: </strong>
                        <span>{diagnostics.explanation}</span>
                      </div>
                    )}

                    {/* Actionable Suggestions & Pro Tips */}
                    {diagnostics.suggestions && diagnostics.suggestions.length > 0 && (
                      <div style={{
                        backgroundColor: 'rgba(254, 243, 199, 0.5)',
                        border: '1.5px dashed #f59e0b',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '6px'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          color: '#b45309',
                          fontWeight: 700,
                          fontFamily: 'var(--font-hand)',
                          fontSize: '1.1rem'
                        }}>
                          <Lightbulb size={18} />
                          <span>Suggested Fixes:</span>
                        </div>
                        <ul style={{
                          margin: 0,
                          paddingLeft: '22px',
                          fontSize: '0.95rem',
                          fontFamily: 'var(--font-hand)',
                          color: 'var(--text-ink)',
                          lineHeight: '1.4'
                        }}>
                          {diagnostics.suggestions.map((item, idx) => (
                            <li key={idx} style={{ marginBottom: '4px' }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Collapsible Full Raw Stack Trace */}
                    <div style={{ marginTop: '4px' }}>
                      <button
                        onClick={() => setShowRawTrace(!showRawTrace)}
                        className="btn-icon"
                        style={{
                          fontSize: '0.9rem',
                          fontFamily: 'var(--font-hand)',
                          gap: '4px',
                          color: 'var(--text-muted)',
                          padding: '2px 8px'
                        }}
                      >
                        {showRawTrace ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                        <span>{showRawTrace ? 'Hide Raw Stack Trace' : 'View Full Raw Stack Trace'}</span>
                      </button>

                      {showRawTrace && (
                        <div style={{ marginTop: '8px', position: 'relative' }}>
                          <button
                            onClick={() => handleCopyTrace(diagnostics.raw || output)}
                            className="btn-icon"
                            style={{
                              position: 'absolute',
                              top: '8px',
                              right: '8px',
                              fontSize: '0.8rem',
                              padding: '3px 8px',
                              backgroundColor: 'rgba(255,255,255,0.85)',
                              border: '1px solid var(--sketch-border)',
                              borderRadius: '4px',
                              gap: '4px'
                            }}
                          >
                            {copiedTrace ? <Check size={13} style={{ color: '#16a34a' }} /> : <Copy size={13} />}
                            <span>{copiedTrace ? 'Copied' : 'Copy'}</span>
                          </button>
                          <pre style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.85rem',
                            whiteSpace: 'pre-wrap',
                            wordBreak: 'break-word',
                            backgroundColor: 'rgba(0,0,0,0.06)',
                            padding: '12px 14px',
                            borderRadius: '4px',
                            border: '1px solid var(--sketch-border)',
                            color: '#7f1d1d',
                            maxHeight: '200px',
                            overflowY: 'auto'
                          }}>
                            {diagnostics.raw || output}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Standard Output Logs (When no error occurred) */
                  <div>
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', fontWeight: 600, marginBottom: '4px' }}>
                      Output:
                    </div>
                    <pre style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '1rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      backgroundColor: 'rgba(0,0,0,0.03)',
                      padding: '12px 16px',
                      borderRadius: '4px',
                      border: '1px dashed var(--sketch-border)',
                      color: 'var(--text-ink)',
                      margin: 0
                    }}>
                      {output || 'No output recorded.'}
                    </pre>
                  </div>
                )}

                {/* Individual Test Case Results in Integrated Mode */}
                {execResult?.results && execResult.results.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 700, fontFamily: 'var(--font-hand)' }}>
                      Test Case Breakdown:
                    </div>
                    {execResult.results.map((res) => (
                      <div
                        key={res.caseIndex}
                        className="sketch-box"
                        style={{
                          padding: '12px 16px',
                          borderLeft: `5px solid ${res.passed ? '#16a34a' : '#dc2626'}`,
                          backgroundColor: res.passed ? 'rgba(34, 197, 94, 0.04)' : 'rgba(239, 68, 68, 0.04)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            {res.passed ? (
                              <CheckCircle2 size={18} style={{ color: '#16a34a' }} />
                            ) : (
                              <XCircle size={18} style={{ color: '#dc2626' }} />
                            )}
                            <span style={{ fontWeight: 700, fontFamily: 'var(--font-hand)', fontSize: '1.1rem' }}>
                              Case {res.caseIndex}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-mono)',
                            color: res.passed ? '#15803d' : '#b91c1c',
                            fontWeight: 600
                          }}>
                            {res.passed ? 'PASSED' : 'FAILED'} ({res.executionTimeFormatted || `${res.executionTimeMs} ms`})
                          </span>
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '8px', fontSize: '0.9rem', fontFamily: 'var(--font-mono)' }}>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Input: </span>
                            <span>{JSON.stringify(res.input)}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Expected: </span>
                            <span style={{ color: '#16a34a', fontWeight: 600 }}>{JSON.stringify(res.expected)}</span>
                          </div>
                          <div>
                            <span style={{ color: 'var(--text-muted)' }}>Your Output: </span>
                            <span style={{ color: res.passed ? '#16a34a' : '#dc2626', fontWeight: 600 }}>{JSON.stringify(res.actual)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default OutputConsole;

import React from 'react';
import { CheckCircle2, XCircle, Clock, HardDrive, Code, FileCode } from 'lucide-react';

const SubmissionDetails = ({ execResult, code, lang, problem }) => {
  if (!execResult) {
    return (
      <div className="pane-content prose" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
        <p style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>No submission data available.</p>
      </div>
    );
  }

  const isAccepted = execResult.allPassed && !execResult.error;
  const statusColor = isAccepted ? '#16a34a' : '#dc2626';
  const statusBg = isAccepted ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)';
  
  let statusText = 'Unknown Error';
  if (isAccepted) {
    statusText = 'Accepted';
  } else if (execResult.diagnostics?.type) {
    statusText = execResult.diagnostics.type;
  } else if (execResult.error) {
    statusText = 'Runtime Error';
  } else if (execResult.allPassed === false) {
    statusText = 'Wrong Answer';
  }

  return (
    <div className="pane-content prose" style={{ paddingTop: '48px', paddingBottom: '48px' }}>
      <h1 style={{ marginBottom: '48px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        {isAccepted ? <CheckCircle2 size={32} color={statusColor} /> : <XCircle size={32} color={statusColor} />}
        <span style={{ color: statusColor, fontSize: '2.5rem', fontFamily: 'var(--font-hand)', fontWeight: 700 }}>{statusText}</span>
      </h1>

      <div style={{ display: 'flex', gap: '24px', marginBottom: '48px', flexWrap: 'wrap' }}>
        {execResult.executionTimeMs !== undefined && (
          <div className="sketch-box" style={{ padding: '16px 24px', flex: '1', minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontFamily: 'var(--font-hand)' }}>
              <Clock size={18} /> Runtime
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {execResult.executionTimeFormatted || `${execResult.executionTimeMs} ms`}
            </div>
          </div>
        )}

        {execResult.memoryMb !== undefined && (
          <div className="sketch-box" style={{ padding: '16px 24px', flex: '1', minWidth: '150px' }}>
            <div style={{ color: 'var(--text-muted)', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', fontFamily: 'var(--font-hand)' }}>
              <HardDrive size={18} /> Memory
            </div>
            <div style={{ fontSize: '1.8rem', fontWeight: 'bold', fontFamily: 'var(--font-mono)' }}>
              {execResult.memoryFormatted || `${execResult.memoryMb} MB`}
            </div>
          </div>
        )}
      </div>

      <h3 style={{ marginTop: 0, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px', fontFamily: 'var(--font-hand)' }}>
        <Code size={24} /> 
        <span className="brush-highlight">
          Submitted Code
        </span>
      </h3>
      
      <div className="sketch-box" style={{ padding: '24px', backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', fontSize: '1rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
          <FileCode size={18} /> 
          <span style={{ textTransform: 'capitalize', fontWeight: 'bold' }}>{lang}</span>
        </div>
        <pre style={{ 
          margin: 0, 
          padding: '16px', 
          backgroundColor: 'rgba(0,0,0,0.03)', 
          border: '1px solid var(--sketch-border)',
          borderRadius: '4px',
          maxHeight: '400px',
          overflowY: 'auto',
          fontSize: '0.95rem',
          fontFamily: 'var(--font-mono)'
        }}>
          {code}
        </pre>
      </div>
    </div>
  );
};

export default SubmissionDetails;

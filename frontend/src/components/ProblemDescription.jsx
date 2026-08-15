import React from 'react';
import { AlignLeft, Tag } from 'lucide-react';

const ProblemDescription = ({ problem }) => {
  if (!problem) {
    return (
      <div className="pane left-pane">
        <div className="pane-header">
          <AlignLeft />
          <span>Description</span>
        </div>
        <div className="pane-content prose" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          Select a problem to view description
        </div>
      </div>
    );
  }

  return (
    <div className="pane left-pane">
      <div className="pane-header" style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlignLeft size={20} />
          <span>Description</span>
        </div>
        {problem.tags && (
          <div style={{ display: 'flex', gap: '4px' }}>
            {problem.tags.map((tag, i) => (
              <span key={i} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)' }}>
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="pane-content prose">
        <h1>{problem.title}</h1>
        <div
          className="difficulty-badge"
          style={{
            color: problem.difficultyColor || '#16a34a',
            borderColor: problem.difficultyColor || '#16a34a'
          }}
        >
          {problem.difficulty}
        </div>
        
        {/* Render description paragraphs */}
        <div
          style={{ marginTop: 'var(--grid-size)', lineHeight: 'var(--grid-size)' }}
          dangerouslySetInnerHTML={{ __html: problem.description }}
        />

        {/* Examples */}
        {problem.examples && problem.examples.map((ex, idx) => (
          <div key={idx} style={{ marginTop: 'var(--grid-size)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Example {idx + 1}:</h3>
            <pre style={{ margin: 0 }}>
              <strong>Input:</strong> {ex.input}<br />
              <strong>Output:</strong> {ex.output}<br />
              {ex.explanation && <><strong>Explanation:</strong> {ex.explanation}</>}
            </pre>
          </div>
        ))}

        {/* Constraints */}
        {problem.constraints && problem.constraints.length > 0 && (
          <div style={{ marginTop: 'var(--grid-size)', marginBottom: 'var(--grid-size)' }}>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700 }}>Constraints:</h3>
            <ul style={{ paddingLeft: '20px', color: 'var(--text-ink)' }}>
              {problem.constraints.map((c, i) => (
                <li key={i} dangerouslySetInnerHTML={{ __html: `<code>${c}</code>` }} />
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDescription;

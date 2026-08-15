import React, { useState } from 'react';
import { ArrowLeft, Search, CheckCircle2, ChevronRight, Zap, Code2, Tag } from 'lucide-react';
import { PROBLEMS } from '../constants/questions';

const ProblemList = ({ onSelectProblem, onBackToModeSelect, userToken }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filteredProblems = PROBLEMS.filter((p) => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.tags.some(t => t.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDiff = selectedDifficulty === 'All' || p.difficulty.toLowerCase() === selectedDifficulty.toLowerCase();
    return matchesSearch && matchesDiff;
  });

  return (
    <div className="problem-list-container" style={{
      minHeight: '100vh',
      backgroundColor: 'var(--paper-bg)',
      backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
      backgroundSize: '100% var(--grid-size)',
      backgroundPosition: '0 0',
      padding: '24px 32px'
    }}>
      {/* Top Bar */}
      <div className="problem-list-topbar" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '24px',
        borderBottom: '2px solid var(--sketch-border)',
        paddingBottom: '16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onBackToModeSelect}
            className="btn-icon"
            style={{
              padding: '6px 12px',
              fontFamily: 'var(--font-hand)',
              fontSize: '1.1rem',
              fontWeight: 600,
              gap: '6px',
              border: '1.5px solid var(--sketch-border)',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.6)'
            }}
          >
            <ArrowLeft size={18} />
            <span>Switch Mode / Logout</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Zap size={22} style={{ color: '#16a34a' }} />
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-hand)' }}>
              Revision Problem List
            </h1>
          </div>
        </div>

        <div style={{
          fontSize: '0.9rem',
          fontFamily: 'var(--font-mono)',
          padding: '4px 12px',
          border: '1.5px solid #16a34a',
          borderRadius: '20px',
          backgroundColor: 'rgba(22, 163, 74, 0.1)',
          color: '#15803d',
          fontWeight: 600
        }}>
          ● Authenticated via JWT
        </div>
      </div>

      {/* Controls: Search & Difficulty Filter */}
      <div className="problem-list-controls" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        marginBottom: '24px',
        flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div className="problem-list-search" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          backgroundColor: 'rgba(255,255,255,0.85)',
          border: '2px solid var(--sketch-border)',
          borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
          padding: '8px 16px',
          minWidth: 'min(100%, 320px)'
        }}>
          <Search size={18} style={{ color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search problems or tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              border: 'none',
              outline: 'none',
              fontFamily: 'var(--font-hand)',
              fontSize: '1.1rem',
              backgroundColor: 'transparent',
              width: '100%',
              color: 'var(--text-ink)'
            }}
          />
        </div>

        {/* Difficulty Tabs */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['All', 'Easy', 'Medium', 'Hard'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              style={{
                padding: '6px 16px',
                fontFamily: 'var(--font-hand)',
                fontSize: '1.1rem',
                fontWeight: selectedDifficulty === diff ? 700 : 500,
                backgroundColor: selectedDifficulty === diff ? 'rgba(0,0,0,0.08)' : 'transparent',
                border: '1.5px solid var(--sketch-border)',
                borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                cursor: 'pointer',
                color: 'var(--text-ink)'
              }}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Problem Cards Grid */}
      <div className="problem-list-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 320px), 1fr))',
        gap: '20px'
      }}>
        {filteredProblems.map((problem) => (
          <div
            key={problem.id}
            onClick={() => onSelectProblem(problem)}
            className="sketch-box"
            style={{
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              cursor: 'pointer',
              transition: 'transform 0.1s ease, box-shadow 0.1s ease',
              border: '2px solid var(--sketch-border)',
              backgroundColor: 'rgba(255, 255, 255, 0.85)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.boxShadow = '3px 6px 12px rgba(0,0,0,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = '2px 3px 6px rgba(0,0,0,0.05)';
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <h3 style={{ fontSize: '1.4rem', fontWeight: 700, fontFamily: 'var(--font-hand)', color: 'var(--text-ink)' }}>
                  {problem.title}
                </h3>
                <span
                  className="difficulty-badge"
                  style={{
                    color: problem.difficultyColor || '#16a34a',
                    borderColor: problem.difficultyColor || '#16a34a',
                    marginTop: 0
                  }}
                >
                  {problem.difficulty}
                </span>
              </div>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                {problem.tags.map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '0.8rem',
                      fontFamily: 'var(--font-hand)',
                      backgroundColor: 'rgba(0,0,0,0.04)',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      color: 'var(--text-muted)'
                    }}
                  >
                    #{t}
                  </span>
                ))}
              </div>

              <p style={{
                fontSize: '0.95rem',
                color: 'var(--text-ink)',
                lineHeight: '1.5',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                marginBottom: '16px'
              }} dangerouslySetInnerHTML={{ __html: problem.description }} />
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              paddingTop: '12px',
              borderTop: '1px dashed var(--sketch-border)'
            }}>
              <span style={{ fontSize: '0.9rem', color: '#15803d', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Code2 size={16} />
                <span>Ready in C++, Python, JS, Java</span>
              </span>

              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-ink)', fontWeight: 700, fontFamily: 'var(--font-hand)' }}>
                <span>Solve</span>
                <ChevronRight size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredProblems.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)', fontFamily: 'var(--font-hand)', fontSize: '1.4rem' }}>
          No revision problems match "{searchTerm}". Try another search term.
        </div>
      )}
    </div>
  );
};

export default ProblemList;

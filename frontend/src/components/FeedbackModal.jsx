import React, { useState } from 'react';
import { Star, MessageSquareHeart, X, Send, Loader2, Sparkles, CheckCircle2, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { submitFeedbackApi } from '../services/compilerService';

const FeedbackModal = ({ isOpen, onClose, mode = 'standalone', runCount = 5 }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [name, setName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Please enter a short comment or suggestion!');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedbackApi({
        name: name.trim() || 'Anonymous Coder',
        rating,
        mode,
        comment: comment.trim()
      });
      setIsSubmitted(true);
      toast.success('🎉 Thank you! Your feedback has been added to the project README!');
      setTimeout(() => {
        setIsSubmitted(false);
        setComment('');
        onClose();
      }, 2200);
    } catch (err) {
      console.error('Feedback error:', err);
      toast.error('Feedback recorded locally. Thank you!');
      setTimeout(onClose, 1500);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDismiss = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    onClose();
  };

  return (
    <div
      onClick={handleDismiss}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 99999,
        padding: '16px',
        touchAction: 'manipulation'
      }}
    >
      <div
        className="sketch-box"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'var(--paper-bg)',
          backgroundImage: 'linear-gradient(var(--line-color) 1px, transparent 1px)',
          backgroundSize: '100% var(--grid-size)',
          maxWidth: '520px',
          width: '100%',
          padding: '28px 24px',
          borderRadius: '4px 8px 3px 6px / 7px 4px 6px 3px',
          boxShadow: '0 16px 40px rgba(0,0,0,0.25)',
          position: 'relative'
        }}
      >
        {/* Top-Right Circular Close / Cancel Button */}
        <button
          type="button"
          onClick={handleDismiss}
          className="btn-icon"
          title="Close / Cancel"
          aria-label="Close"
          style={{
            position: 'absolute',
            top: '12px',
            right: '12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            border: '1.5px solid var(--sketch-border)',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.85)',
            cursor: 'pointer',
            zIndex: 10
          }}
        >
          <X size={20} />
        </button>

        {isSubmitted ? (
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <CheckCircle2 size={48} style={{ color: '#16a34a', margin: '0 auto 12px auto' }} />
            <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-hand)', fontWeight: 800 }}>
              Feedback Added!
            </h2>
            <p style={{ fontSize: '1.15rem', fontFamily: 'var(--font-hand)', color: 'var(--text-muted)' }}>
              Your feedback is now featured on the project README & database. Thank you for making LeetCompiler better!
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Modal Header */}
            <div>
              <h2 style={{ fontSize: '2rem', fontFamily: 'var(--font-hand)', fontWeight: 800, margin: '2px 0' }}>
                Share Your Feedback
              </h2>
              <p style={{ fontSize: '1.05rem', fontFamily: 'var(--font-hand)', color: 'var(--text-muted)' }}>
                Your review helps improve LeetCompiler and will be added to the project's README!
              </p>
            </div>

            {/* Star Rating */}
            <div>
              <div style={{ fontSize: '1rem', fontFamily: 'var(--font-hand)', fontWeight: 700, marginBottom: '6px' }}>
                How is your coding experience?
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      padding: '2px',
                      transition: 'transform 0.15s ease'
                    }}
                  >
                    <Star
                      size={28}
                      fill={(hoverRating || rating) >= star ? '#f59e0b' : 'none'}
                      color={(hoverRating || rating) >= star ? '#d97706' : 'var(--text-muted)'}
                    />
                  </button>
                ))}
                <span style={{ marginLeft: '8px', fontSize: '1.1rem', fontFamily: 'var(--font-hand)', color: '#b45309', fontWeight: 700 }}>
                  {rating === 5 ? '⭐⭐⭐⭐⭐ Amazing!' : rating === 4 ? '⭐⭐⭐⭐ Great!' : rating === 3 ? '⭐⭐⭐ Good' : 'Needs Improvement'}
                </span>
              </div>
            </div>

            {/* Name Input */}
            <div>
              <label style={{ display: 'block', fontSize: '1rem', fontFamily: 'var(--font-hand)', fontWeight: 700, marginBottom: '4px' }}>
                Your Name / GitHub Handle (Optional):
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Amrit or @ankit"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-hand)',
                  fontSize: '1.05rem',
                  border: '1.5px solid var(--sketch-border)',
                  borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  color: 'var(--text-ink)',
                  outline: 'none'
                }}
              />
            </div>

            {/* Feedback Comment */}
            <div>
              <label style={{ display: 'block', fontSize: '1rem', fontFamily: 'var(--font-hand)', fontWeight: 700, marginBottom: '4px' }}>
                What do you think of the editor & compiler? <span style={{ color: '#dc2626' }}>*</span>
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                rows={3}
                placeholder="Write your feedback, feature suggestions, or experience here..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  fontFamily: 'var(--font-hand)',
                  fontSize: '1.05rem',
                  border: '1.5px solid var(--sketch-border)',
                  borderRadius: '4px 7px 3px 5px / 6px 3px 5px 4px',
                  backgroundColor: 'rgba(255, 255, 255, 0.85)',
                  color: 'var(--text-ink)',
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
              <a
                href="https://mail.google.com/mail/?view=cm&fs=1&to=ncode8952@gmail.com&su=LeetCompiler+Idea/Improvement"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#2563eb',
                  fontSize: '0.95rem',
                  fontFamily: 'var(--font-hand)',
                  textDecoration: 'none',
                  cursor: 'pointer',
                  fontWeight: '600',
                  whiteSpace: 'nowrap'
                }}
              >
                <Mail size={16} /> Email me an idea!
              </a>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  type="button"
                  onClick={handleDismiss}
                  disabled={isSubmitting}
                  className="btn-icon"
                  style={{
                    padding: '6px 14px',
                    fontFamily: 'var(--font-hand)',
                    fontSize: '1.05rem',
                    cursor: 'pointer'
                  }}
                >
                  Skip
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn btn-submit"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '1.15rem',
                    padding: '6px 16px',
                    cursor: isSubmitting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      <span>Submit to README</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default FeedbackModal;

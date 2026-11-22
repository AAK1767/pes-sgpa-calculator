import React, { useEffect, useState } from 'react';
import { X, Star, CheckCircle2 } from 'lucide-react';
import { trackEvent } from '../utils/analytics';

function ModalFrame({ title, onClose, children, width = 'max-w-sm' }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[999] flex items-end justify-center bg-black/60 sm:items-center" onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative w-full ${width} rounded-t-xl border border-line bg-surface p-5 sm:mx-4 sm:rounded-xl`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 20px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" onClick={onClose} className="btn btn-ghost !absolute right-2 top-2 !min-h-0 !p-2" aria-label="Close">
          <X className="h-4 w-4" />
        </button>
        <h2 className="pr-8 text-base font-semibold text-ink">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export function ToffeeModal({ onClose }) {
  return (
    <ModalFrame title="Buy me a toffee" onClose={onClose} width="max-w-xs">
      <p className="mt-1 text-sm text-ink-2">
        If this tool helped you out, support it with whatever you like. Totally optional.
      </p>
      <div className="mt-4 flex justify-center">
        <div className="inline-block rounded-lg bg-white p-3">
          <img
            src="/upi-qr.png"
            alt="UPI QR code"
            className="h-48 w-48 object-contain"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'block';
            }}
          />
          <p className="hidden text-xs text-neutral-500">QR code not found. Add upi-qr.png to /public.</p>
        </div>
      </div>
      <p className="mt-3 text-center text-xs text-ink-3">Scan with any UPI app</p>
    </ModalFrame>
  );
}

export function FeedbackModal({ onClose }) {
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [status, setStatus] = useState('idle'); // 'idle' | 'submitting' | 'success' | 'error'

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    setStatus('submitting');
    try {
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          feedback: text.trim(),
          rating,
        }),
      });

      if (response.ok) {
        trackEvent('feedback_submitted', {
          rating,
          has_name: !!name.trim(),
          feedback_length: text.trim().length,
          status: 'success',
        });
        setStatus('success');
        setName('');
        setText('');
        setRating(0);
      } else {
        trackEvent('feedback_submitted', { status: 'failed' });
        setStatus('error');
      }
    } catch {
      trackEvent('feedback_submitted', { status: 'failed' });
      setStatus('error');
    }
  };

  return (
    <ModalFrame title="Send feedback" onClose={onClose}>
      <p className="mt-1 text-sm text-ink-2">
        Found a bug or have an idea? This goes straight to the developer.
      </p>

      {status === 'success' ? (
        <div className="notice notice-good mt-4 text-center">
          <CheckCircle2 className="mx-auto mb-1 h-5 w-5" />
          <p className="font-medium">Feedback sent. Thank you!</p>
          <button type="button" onClick={() => setStatus('idle')} className="mt-2 text-sm underline">
            Send more feedback
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <span className="label">Rating (optional)</span>
            <div className="flex items-center gap-0.5">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(rating === star ? 0 : star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="rounded p-1"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  aria-pressed={star <= rating}
                >
                  <Star className={`h-5 w-5 transition-colors ${star <= (hoverRating || rating) ? 'fill-warn text-warn' : 'text-ink-3'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="feedback-name" className="label">Name (optional)</label>
            <input id="feedback-name" type="text" placeholder="Anonymous" value={name} onChange={(e) => setName(e.target.value)} className="input" />
          </div>

          <div>
            <label htmlFor="feedback-msg" className="label">Message</label>
            <textarea
              id="feedback-msg"
              required
              rows={4}
              placeholder="What should be better?"
              value={text}
              onChange={(e) => setText(e.target.value)}
              className="input resize-none"
            />
          </div>

          {status === 'error' && <p className="text-sm text-bad">Couldn&apos;t send that. Please try again.</p>}

          <button type="submit" disabled={status === 'submitting' || !text.trim()} className="btn btn-primary w-full">
            {status === 'submitting' ? 'Sending…' : 'Send feedback'}
          </button>
        </form>
      )}
    </ModalFrame>
  );
}

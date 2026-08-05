import React, { useEffect } from 'react';
import Button from './Button';

/*
 * Replaces window.confirm for the "changing this resets your cart" prompts.
 * The native dialog is unstyled, blocks the whole tab, and reads as a browser
 * warning rather than part of the order flow.
 */
const ConfirmDialog = ({
  open,
  title,
  body,
  confirmLabel = 'Continue',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) => {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onCancel();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      data-ui="v2"
      className="fixed inset-0 z-[70] flex items-end justify-center bg-sand-950/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onCancel}
      role="presentation"
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md animate-scale-in rounded-3xl border border-sand-200 bg-white p-6 font-sans shadow-lift sm:p-7"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-saffron-50 text-saffron-700">
          <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10 6v5M10 14h.01" />
            <circle cx="10" cy="10" r="8" />
          </svg>
        </div>

        <h2 id="confirm-title" className="mt-4 font-display text-2xl text-sand-900">
          {title}
        </h2>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">{body}</p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row-reverse">
          <Button onClick={onConfirm}>{confirmLabel}</Button>
          <Button variant="secondary" onClick={onCancel}>
            {cancelLabel}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import Button from './ui/Button';
import Field from './ui/Field';

const EMPTY = { name: '', email: '', phone: '', message: '' };

const SupportDialog = ({ open, onClose, user }) => {
  const [complaintData, setComplaintData] = useState(EMPTY);
  const [sending, setSending] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  // Prefill from the signed-in user each time the dialog opens.
  useEffect(() => {
    if (!open) return;
    setComplaintData(
      user
        ? {
            name: user.name || '',
            email: user.email || '',
            phone: user.phone || '',
            message: '',
          }
        : EMPTY
    );
  }, [open, user]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setComplaintData((prev) => ({ ...prev, [name]: value }));
  };

  const sendComplaint = async () => {
    const { name, email, phone, message } = complaintData;

    if (!name.trim() || !email.trim() || !phone.trim() || !message.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email');
      return;
    }

    // Remove optional '+91' prefix if present
    const cleanedPhone = phone.replace(/^(\+91)?/, '');
    if (!/^\d{10}$/.test(cleanedPhone)) {
      toast.error('Please enter a valid 10-digit phone number');
      return;
    }

    setSending(true);

    try {
      const res = await axios.post(
        `${API}/api/complaints/register-complaint`,
        complaintData,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success('Your complaint has been sent! We will look into it shortly.');
        setComplaintData((prev) => ({ ...prev, message: '' }));
        onClose();
      } else {
        throw new Error('Failed to send complaint');
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to send complaint. Please try again later.');
    } finally {
      setSending(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-sand-950/50 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="support-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full max-w-md animate-scale-in overflow-y-auto rounded-3xl border border-sand-200 bg-white p-6 font-sans shadow-lift sm:p-7"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="support-title" className="font-display text-2xl text-sand-900">
              Contact support
            </h2>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              Tell us your issue and we'll respond within 24 hours.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 rounded-lg p-1.5 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
          >
            <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>

        <form
          className="mt-6 space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            sendComplaint();
          }}
        >
          <Field
            id="support-name"
            name="name"
            label="Your name"
            placeholder="Full name"
            value={complaintData.name}
            onChange={handleChange}
            disabled={!!user?.name}
          />
          <Field
            id="support-email"
            name="email"
            type="email"
            label="Email"
            placeholder="you@example.com"
            value={complaintData.email}
            onChange={handleChange}
            disabled={!!user?.email}
          />
          <Field
            id="support-phone"
            name="phone"
            type="tel"
            inputMode="numeric"
            label="Phone"
            placeholder="98765 43210"
            value={complaintData.phone}
            onChange={handleChange}
            disabled={!!user?.phone}
          />

          <div>
            <label
              htmlFor="support-message"
              className="mb-2 block text-sm font-semibold text-sand-800"
            >
              How can we help?
            </label>
            <textarea
              id="support-message"
              name="message"
              rows={4}
              placeholder="Describe your issue…"
              value={complaintData.message}
              onChange={handleChange}
              className="w-full resize-y rounded-xl border-2 border-sand-300 bg-white px-4 py-3 text-[0.9375rem] text-sand-900 transition-all duration-200 outline-none placeholder:text-sand-400 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={sending} loadingText="Sending…">
              Send
            </Button>
          </div>
        </form>

        <p className="mt-4 text-center text-sm text-sand-500">
          We typically respond within 24 hours.
        </p>
      </div>
    </div>
  );
};

export default SupportDialog;

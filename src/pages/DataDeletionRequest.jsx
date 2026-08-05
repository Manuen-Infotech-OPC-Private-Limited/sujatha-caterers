import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const DataDeletionRequest = () => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const validate = () => {
    const next = {};
    if (name.trim().length < 2) next.name = 'Please enter your registered name.';
    if (!/^\d{10}$/.test(phone.replace(/^\+91/, '').replace(/\s/g, '')))
      next.phone = 'Enter the 10-digit number on your account.';
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = 'Enter a valid email, or leave it blank.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/users/request-deletion`, {
        name,
        phone,
        email,
        reason,
      });

      toast.success(res.data.message || 'Request submitted successfully.');
      navigate('/');
    } catch (err) {
      console.error('Deletion request failed:', err);
      toast.error(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero compact eyebrow="Privacy" title="Request data deletion">
        Ask us to permanently remove your account and everything associated
        with it.
      </PageHero>

      <section className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
          <form className="space-y-5" noValidate onSubmit={handleSubmit}>
            <Field
              id="del-name"
              label="Full name"
              placeholder="Your registered name"
              autoComplete="name"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
              }}
              error={errors.name}
            />

            <Field
              id="del-phone"
              label="Phone number"
              type="tel"
              inputMode="numeric"
              prefix="+91"
              placeholder="98765 43210"
              autoComplete="tel-national"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                if (errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
              }}
              error={errors.phone}
              hint="The number your account is registered with"
            />

            <Field
              id="del-email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) setErrors((p) => ({ ...p, email: undefined }));
              }}
              error={errors.email}
              hint="Optional"
            />

            <div>
              <label
                htmlFor="del-reason"
                className="mb-2 block text-sm font-semibold text-sand-800"
              >
                Reason for leaving
              </label>
              <textarea
                id="del-reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Help us improve by sharing why you're leaving"
                className="w-full resize-y rounded-xl border-2 border-sand-300 bg-white px-4 py-3 text-[0.9375rem] text-sand-900 outline-none transition-all duration-200 placeholder:text-sand-400 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
              <p className="mt-1.5 text-sm text-sand-500">Optional</p>
            </div>

            <div className="rounded-2xl border border-brand-300/60 bg-brand-50 p-4">
              <p className="text-[0.9375rem] leading-relaxed text-brand-700">
                <strong className="font-semibold">This cannot be undone.</strong>{' '}
                Once processed, your profile, order history and consultation
                requests are permanently removed.
              </p>
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row-reverse">
              <Button type="submit" loading={loading} loadingText="Submitting…">
                Submit deletion request
              </Button>
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </section>
    </PageShell>
  );
};

export default DataDeletionRequest;

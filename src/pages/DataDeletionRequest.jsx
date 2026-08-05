import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { BUSINESS } from '../data/business';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const DataDeletionRequest = () => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { user, loading: loadingUser } = useAuth();
  const API = process.env.REACT_APP_API_URL;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /*
       * Name, phone and email are no longer sent. The API reads them from the
       * signed-in account, because taking them from this form meant anyone
       * could file a deletion request against someone else's number.
       */
      const res = await axios.post(
        `${API}/api/users/request-deletion`,
        { reason },
        { withCredentials: true }
      );

      toast.success(res.data.message || 'Request submitted successfully.');
      navigate('/');
    } catch (err) {
      console.error('Deletion request failed:', err);
      toast.error(
        err.response?.data?.error || 'Failed to submit request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingUser) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <span className="text-brand-500">
            <Spinner className="mx-auto h-8 w-8" />
          </span>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <PageHero compact eyebrow="Privacy" title="Request data deletion">
        Ask us to permanently remove your account and everything associated
        with it.
      </PageHero>

      <section className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
        {!user ? (
          /* Signed out: we can't confirm who is asking. */
          <div className="rounded-3xl border border-sand-200 bg-white p-7 text-center shadow-card sm:p-9">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </span>

            <h2 className="mt-5 font-display text-2xl text-sand-900">
              Please log in first
            </h2>
            <p className="mt-3 text-[1.0625rem] leading-relaxed text-sand-600">
              Deleting an account is permanent, so we need to confirm the
              request comes from its owner. Log in with the phone number on the
              account and the form will appear here.
            </p>

            <Button className="mx-auto mt-7 sm:w-auto sm:px-7" onClick={() => navigate('/login')}>
              Log in to continue
            </Button>

            <p className="mt-8 border-t border-sand-200 pt-6 text-[0.9375rem] leading-relaxed text-sand-600">
              Can't access your account? Call{' '}
              <a
                href={BUSINESS.phoneHref}
                className="font-semibold text-brand-600 underline-offset-4 hover:underline"
              >
                {BUSINESS.phone}
              </a>{' '}
              or email{' '}
              <a
                href={`mailto:${BUSINESS.email}`}
                className="font-semibold text-brand-600 underline-offset-4 hover:underline"
              >
                {BUSINESS.email}
              </a>{' '}
              and we'll verify you another way.
            </p>
          </div>
        ) : (
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <div className="rounded-2xl bg-sand-100 p-5">
              <p className="text-sm font-semibold text-sand-800">
                This will delete the account for
              </p>
              <dl className="mt-3 space-y-1.5 text-[0.9375rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Name</dt>
                  <dd className="font-medium text-sand-900">{user.name || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Phone</dt>
                  <dd className="font-medium text-sand-900">{user.phone || '—'}</dd>
                </div>
                {user.email && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-sand-600">Email</dt>
                    <dd className="font-medium break-all text-sand-900">{user.email}</dd>
                  </div>
                )}
              </dl>
            </div>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
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
        )}
      </section>
    </PageShell>
  );
};

export default DataDeletionRequest;

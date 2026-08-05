import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const DEVICES = ['Android', 'iOS'];

const PERKS = [
  'Early access to the app before public release',
  'Your feedback shapes what ships',
  'An approval email with your testing link',
];

const ClosedTestingRegistration = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [deviceType, setDeviceType] = useState('Android');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  const validate = () => {
    const next = {};
    if (name.trim().length < 2) next.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      next.email = 'We send your testing link here, so it needs to be valid.';
    if (!/^\d{10}$/.test(phone.replace(/^\+91/, '').replace(/\s/g, '')))
      next.phone = 'Enter a 10-digit mobile number.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);

    try {
      const res = await axios.post(`${API}/api/testing/register`, {
        name,
        email,
        phone,
        deviceType,
      });

      toast.success(res.data.message || 'Registration successful!');
      navigate('/');
    } catch (err) {
      console.error('Testing registration failed:', err);
      toast.error(
        err.response?.data?.error || 'Failed to process registration. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero compact eyebrow="Early access" title="Join our closed testing">
        Be among the first to use the new Sujatha Caterers app, and help us get
        it right before it ships.
      </PageHero>

      <section className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_18rem] lg:gap-10">
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
            <form className="space-y-5" noValidate onSubmit={handleSubmit}>
              <Field
                id="ct-name"
                label="Full name"
                placeholder="Your full name"
                autoComplete="name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((p) => ({ ...p, name: undefined }));
                }}
                error={errors.name}
              />

              <Field
                id="ct-email"
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
                hint="Your approval and testing link are sent here"
              />

              <Field
                id="ct-phone"
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
              />

              <fieldset>
                <legend className="mb-2 text-sm font-semibold text-sand-800">
                  Which device will you test on?
                </legend>
                <div className="grid grid-cols-2 gap-3">
                  {DEVICES.map((d) => (
                    <label
                      key={d}
                      className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border-2 px-4 py-3 font-semibold transition-all duration-200 ${
                        deviceType === d
                          ? 'border-brand-500 bg-brand-50 text-sand-900'
                          : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deviceType"
                        value={d}
                        checked={deviceType === d}
                        onChange={() => setDeviceType(d)}
                        className="sr-only"
                      />
                      {d}
                    </label>
                  ))}
                </div>
              </fieldset>

              <Button type="submit" className="mt-1" loading={loading} loadingText="Submitting…">
                Request access
              </Button>
            </form>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-sand-100/70 p-6">
              <h2 className="text-lg font-semibold text-sand-900">What you get</h2>
              <ul className="mt-4 space-y-3">
                {PERKS.map((perk) => (
                  <li key={perk} className="flex items-start gap-2.5 text-[0.9375rem] text-sand-700">
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700">
                      <svg viewBox="0 0 20 20" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M4 10.5l4 4 8-9" />
                      </svg>
                    </span>
                    {perk}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
};

export default ClosedTestingRegistration;

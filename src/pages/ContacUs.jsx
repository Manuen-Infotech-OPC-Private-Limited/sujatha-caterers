import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaMapMarkerAlt,
} from 'react-icons/fa';
import { testimonials } from '../data/testimonials';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const EVENT_TYPES = [
  'Wedding',
  'Pooja / Annadanam',
  'Corporate Event',
  'Housewarming',
  'Birthday / Family Event',
];

const EVENTS_WE_CATER = [
  'Weddings',
  'Engagements',
  'Housewarming',
  'Poojas & Annadanam',
  'Corporate Events',
  'Birthday Celebrations',
  'Festival Catering',
];

/* Primary contact channels, ordered by immediacy. */
const CHANNELS = [
  {
    icon: FaPhoneAlt,
    label: 'Call us',
    value: '+91 97035 05356',
    note: 'Available 24/7',
    href: 'tel:+919703505356',
    tone: 'bg-brand-50 text-brand-600',
  },
  {
    icon: FaWhatsapp,
    label: 'WhatsApp',
    value: 'Start a chat',
    note: 'Fastest response',
    href: 'https://wa.me/919703505356',
    external: true,
    tone: 'bg-success-50 text-success-700',
  },
  {
    icon: FaEnvelope,
    label: 'Email',
    value: 'sujathameals@gmail.com',
    note: 'Replies within 12 hours',
    href: 'mailto:sujathameals@gmail.com',
    tone: 'bg-saffron-50 text-saffron-700',
  },
];

const ADDRESS =
  'Opposite Meenakshi Palms, Tarakarama Nagar, Srinivasa Nagar Colony, Guntur — 522006';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=Sujatha+Meals+Contractors,+Guntur';

const inputBase =
  'w-full rounded-xl border-2 border-sand-300 bg-white px-4 py-3.5 text-[1.0625rem] text-sand-900 outline-none transition-all duration-200 placeholder:text-sand-400 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

const ContactUs = () => {
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    eventType: '',
    guests: '',
    notes: '',
    type: '',
  });
  const [errors, setErrors] = useState({});
  const [serviceInfo, setServiceInfo] = useState(null);
  const [checkingArea, setCheckingArea] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState(0);

  const api = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  const set = (key) => (e) => {
    setForm((prev) => ({ ...prev, [key]: e.target.value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  /*
   * Serviceability is checked up front rather than during submit.
   * Previously the "Consultation type" dropdown only offered Offline once
   * serviceInfo existed — but serviceInfo was only set *by submitting*, so
   * Offline could never be chosen on a first attempt.
   */
  const checkServiceArea = () => {
    if (!navigator.geolocation) {
      toast.error('Your browser does not support location access.');
      return;
    }

    setCheckingArea(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const res = await fetch(`${api}/api/consultations/check-service-area`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ lat: latitude, lng: longitude }),
          });

          if (!res.ok) throw new Error('Service area check failed');

          const data = await res.json();
          setServiceInfo(data);
          // An out-of-area visitor can only book online, so preselect it.
          setForm((prev) => ({ ...prev, type: data.isServiceArea ? prev.type : 'online' }));
        } catch (err) {
          console.error(err);
          toast.error('Could not check service availability. Please try again.');
        } finally {
          setCheckingArea(false);
        }
      },
      () => {
        setCheckingArea(false);
        toast.warning('Please allow location access to check availability.');
      }
    );
  };

  const validate = () => {
    const next = {};
    if (form.name.trim().length < 2) next.name = 'Please enter your name.';
    if (!/^\d{10}$/.test(form.phone.replace(/^\+91/, '').replace(/\s/g, '')))
      next.phone = 'Enter a 10-digit phone number.';
    if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim()))
      next.email = 'Enter a valid email, or leave it blank.';
    if (!form.eventType) next.eventType = 'Pick an event type.';
    if (form.guests && !/^\d+$/.test(form.guests.trim()))
      next.guests = 'Guests should be a number.';
    if (!form.type) next.type = 'Pick a consultation type.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!serviceInfo) {
      toast.error('Please check availability at your location first.');
      return;
    }
    if (!validate()) return;

    if (!serviceInfo.isServiceArea && form.type === 'offline') {
      toast.warning(
        'You are outside the regular service area. Only online consultation is available.'
      );
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch(`${api}/api/consultations/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ ...form, isServiceArea: serviceInfo.isServiceArea }),
      });

      if (!res.ok) throw new Error('Consultation submit failed');

      toast.success('Consultation request submitted successfully!');
      setForm({
        name: '',
        phone: '',
        email: '',
        eventType: '',
        guests: '',
        notes: '',
        type: '',
      });
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit consultation request.');
    } finally {
      setSubmitting(false);
    }
  };

  const quote = testimonials[index];

  return (
    <PageShell>
      <PageHero compact eyebrow="Get in touch" title="Let's plan your event">
        Call us for something urgent, or send a few details and our team will
        come back to you with a plan.
      </PageHero>

      {/* ============ RAIL + FORM ============ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[21rem_1fr] lg:gap-12">
          {/* ---------- contact rail ---------- */}
          <aside className="space-y-3 lg:sticky lg:top-24 lg:self-start">
            <h2 className="text-sm font-semibold tracking-wide text-sand-500 uppercase">
              Talk to us
            </h2>

            {CHANNELS.map(({ icon: Icon, label, value, note, href, external, tone }) => (
              <a
                key={label}
                href={href}
                target={external ? '_blank' : undefined}
                rel={external ? 'noopener noreferrer' : undefined}
                className="group flex items-center gap-4 rounded-2xl border border-sand-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-sand-300 hover:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25"
              >
                <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${tone}`}>
                  <Icon className="h-5 w-5" />
                </span>

                <span className="min-w-0 flex-1">
                  <span className="block text-sm text-sand-500">{label}</span>
                  <span className="block truncate font-semibold text-sand-900">{value}</span>
                  <span className="block text-xs text-sand-500">{note}</span>
                </span>

                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 shrink-0 text-sand-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-brand-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M7 4l6 6-6 6" />
                </svg>
              </a>
            ))}

            <div className="rounded-2xl border border-sand-200 bg-white p-4 shadow-card">
              <p className="text-sm text-sand-500">Business hours</p>
              <p className="mt-0.5 font-semibold text-sand-900">Mon – Sun, 8:00 AM – 9:00 PM</p>
              <p className="mt-1 text-xs text-sand-500 italic">Applicable to Meal Box</p>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-4 shadow-card">
              <p className="flex-1 text-sm text-sand-600">Follow us</p>
              <a
                href="https://www.facebook.com/share/1BCf3bKKyk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-100 text-sand-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <FaFacebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com/sujathacaterers"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-sand-100 text-sand-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <FaInstagram className="h-4 w-4" />
              </a>
            </div>
          </aside>

          {/* ---------- consultation form ---------- */}
          <div>
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-8">
              <h2 className="font-display text-3xl text-sand-900">Request a consultation</h2>
              <p className="mt-2 text-[0.9375rem] text-sand-600">
                Share a few details and our team will get back to you shortly.
              </p>

              {/* serviceability gate */}
              <div
                className={`mt-6 rounded-2xl border p-4 ${
                  serviceInfo
                    ? serviceInfo.isServiceArea
                      ? 'border-success-500/30 bg-success-50'
                      : 'border-saffron-500/30 bg-saffron-50'
                    : 'border-sand-200 bg-sand-100/70'
                }`}
              >
                {serviceInfo ? (
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        serviceInfo.isServiceArea
                          ? 'bg-success-500 text-white'
                          : 'bg-saffron-500 text-white'
                      }`}
                    >
                      <FaMapMarkerAlt className="h-3 w-3" />
                    </span>
                    <div>
                      <p className="text-[0.9375rem] font-semibold text-sand-900">
                        {serviceInfo.isServiceArea
                          ? `We serve your area (${serviceInfo.distanceKm} km away)`
                          : `Outside our regular area (${serviceInfo.distanceKm} km away)`}
                      </p>
                      <p className="mt-0.5 text-sm text-sand-600">
                        {serviceInfo.isServiceArea
                          ? 'Both online and offline consultations are available.'
                          : 'Online consultation only. Offline visits need special approval.'}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-[0.9375rem] text-sand-700">
                      First, let's check whether we serve your area.
                    </p>
                    <Button
                      variant="secondary"
                      className="shrink-0 sm:w-auto sm:px-5 sm:py-2.5 sm:text-[0.9375rem]"
                      onClick={checkServiceArea}
                      loading={checkingArea}
                      loadingText="Checking…"
                    >
                      <FaMapMarkerAlt className="h-3.5 w-3.5" />
                      Check my location
                    </Button>
                  </div>
                )}
              </div>

              <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit}>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="c-name"
                    label="Full name"
                    placeholder="Your name"
                    value={form.name}
                    onChange={set('name')}
                    error={errors.name}
                  />
                  <Field
                    id="c-phone"
                    label="Phone number"
                    type="tel"
                    inputMode="numeric"
                    prefix="+91"
                    placeholder="98765 43210"
                    value={form.phone}
                    onChange={set('phone')}
                    error={errors.phone}
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="c-email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={set('email')}
                    error={errors.email}
                    hint="Optional"
                  />

                  <div>
                    <label htmlFor="c-event" className="mb-2 block text-sm font-semibold text-sand-800">
                      Event type
                    </label>
                    <select
                      id="c-event"
                      value={form.eventType}
                      onChange={set('eventType')}
                      className={`${inputBase} ${errors.eventType ? 'border-brand-400' : ''}`}
                    >
                      <option value="">Select event type</option>
                      {EVENT_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                    {errors.eventType && (
                      <p className="mt-1.5 text-sm font-medium text-brand-600">{errors.eventType}</p>
                    )}
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="c-guests"
                    label="Approximate guests"
                    inputMode="numeric"
                    placeholder="e.g. 250"
                    value={form.guests}
                    onChange={set('guests')}
                    error={errors.guests}
                  />

                  <div>
                    <label htmlFor="c-type" className="mb-2 block text-sm font-semibold text-sand-800">
                      Consultation type
                    </label>
                    <select
                      id="c-type"
                      value={form.type}
                      onChange={set('type')}
                      disabled={!serviceInfo}
                      className={`${inputBase} disabled:cursor-not-allowed disabled:bg-sand-100 disabled:text-sand-500 ${
                        errors.type ? 'border-brand-400' : ''
                      }`}
                    >
                      <option value="">
                        {serviceInfo ? 'Select type' : 'Check your location first'}
                      </option>
                      {serviceInfo?.isServiceArea && <option value="offline">Offline</option>}
                      {serviceInfo && <option value="online">Online</option>}
                    </select>
                    {errors.type && (
                      <p className="mt-1.5 text-sm font-medium text-brand-600">{errors.type}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="c-notes" className="mb-2 block text-sm font-semibold text-sand-800">
                    Additional notes
                  </label>
                  <textarea
                    id="c-notes"
                    rows={4}
                    placeholder="Anything else we should know?"
                    value={form.notes}
                    onChange={set('notes')}
                    className={`${inputBase} resize-y text-[0.9375rem]`}
                  />
                </div>

                <Button type="submit" loading={submitting} loadingText="Submitting…">
                  Request consultation
                </Button>
              </form>
            </div>

            {/* trust signal, placed at the point of conversion */}
            <figure className="mt-5 rounded-2xl border border-sand-200 bg-sand-100/70 p-5">
              <div className="flex gap-0.5 text-saffron-500" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="currentColor">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
                  </svg>
                ))}
              </div>
              <blockquote
                key={index}
                className="mt-3 animate-fade-in text-[0.9375rem] leading-relaxed text-sand-700"
              >
                “{quote.message}”
              </blockquote>
              <figcaption className="mt-2 text-sm text-sand-500">
                <span className="font-semibold text-sand-800">{quote.name}</span> · {quote.location}
              </figcaption>
            </figure>

          </div>
        </div>
      </section>

      {/* ============ VISIT US ============ */}
      <section className="border-t border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-4xl text-sand-900">Visit us</h2>

          <div className="mt-8 grid overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card lg:grid-cols-[22rem_1fr]">
            <div className="flex flex-col justify-center p-7">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <FaMapMarkerAlt className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-sand-900">Our kitchen</h3>
              <address className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600 not-italic">
                {ADDRESS}
              </address>

              <a
                href={DIRECTIONS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-2 font-semibold text-brand-600 transition-colors hover:text-brand-700"
              >
                Get directions
                <svg
                  viewBox="0 0 20 20"
                  className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10h11M10 5l5 5-5 5" />
                </svg>
              </a>
            </div>

            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3828.878551065998!2d80.40892567409921!3d16.329148632429334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a358b71d28fdfc7%3A0x7699357a26dcc9e1!2sSujatha%20Meals%20Contractors!5e0!3m2!1sen!2sin!4v1752248567560!5m2!1sen!2sin"
              className="block h-72 w-full border-0 lg:h-full lg:min-h-[22rem]"
              loading="lazy"
              title="Sujatha Caterers on Google Maps"
            />
          </div>
        </div>
      </section>

      {/* ============ EVENTS STRIP ============ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-8">
          <p className="shrink-0 text-sm font-semibold tracking-wide text-sand-500 uppercase">
            Events we cater
          </p>
          <ul className="flex flex-wrap gap-2">
            {EVENTS_WE_CATER.map((e) => (
              <li
                key={e}
                className="rounded-full border border-sand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-sand-700"
              >
                {e}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </PageShell>
  );
};

export default ContactUs;

import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import {
  FaPhoneAlt,
  FaWhatsapp,
  FaFacebook,
  FaInstagram,
  FaEnvelope,
  FaClock,
  FaMapMarkerAlt,
  FaShieldAlt,
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

const CONTACT_CARDS = [
  {
    icon: FaPhoneAlt,
    title: 'Phone',
    lines: [{ text: '+91 97035 05356', href: 'tel:+919703505356' }, { text: 'Available 24/7' }],
  },
  {
    icon: FaWhatsapp,
    title: 'WhatsApp',
    lines: [
      { text: 'Chat now', href: 'https://wa.me/919703505356', external: true },
      { text: 'Instant support' },
    ],
  },
  {
    icon: FaEnvelope,
    title: 'Email',
    lines: [
      { text: 'sujathameals@gmail.com', href: 'mailto:sujathameals@gmail.com' },
      { text: 'Replies within 12 hours' },
    ],
  },
  {
    icon: FaClock,
    title: 'Business hours',
    lines: [{ text: 'Monday – Sunday' }, { text: '8:00 AM – 9:00 PM' }, { text: 'Applicable to Meal Box', muted: true }],
  },
  {
    icon: FaMapMarkerAlt,
    title: 'Address',
    lines: [
      {
        text: 'Opposite Meenakshi Palms, Tarakarama Nagar, Srinivasa Nagar Colony, Guntur — 522006',
      },
    ],
  },
];

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
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
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

  return (
    <PageShell>
      <PageHero eyebrow="Get in touch" title="We'd love to hear from you">
        Whether you're planning a wedding, festive gathering or corporate event,
        we're here to bring your vision to life with exquisite South Indian
        vegetarian cuisine.
      </PageHero>

      {/* ---------------- CONTACT CARDS ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {CONTACT_CARDS.map(({ icon: Icon, title, lines }) => (
            <div
              key={title}
              className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card transition-shadow duration-300 hover:shadow-lift"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 text-lg font-semibold text-sand-900">{title}</h3>
              <div className="mt-2 space-y-1">
                {lines.map((line) => (
                  <p
                    key={line.text}
                    className={`text-[0.9375rem] leading-relaxed ${
                      line.muted ? 'text-sand-500 italic' : 'text-sand-600'
                    }`}
                  >
                    {line.href ? (
                      <a
                        href={line.href}
                        target={line.external ? '_blank' : undefined}
                        rel={line.external ? 'noopener noreferrer' : undefined}
                        className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
                      >
                        {line.text}
                      </a>
                    ) : (
                      line.text
                    )}
                  </p>
                ))}
              </div>
            </div>
          ))}

          {/* social */}
          <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
            <h3 className="text-lg font-semibold text-sand-900">Follow us</h3>
            <div className="mt-4 flex gap-3">
              <a
                href="https://www.facebook.com/share/1BCf3bKKyk/?mibextid=wwXIfr"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100 text-sand-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <FaFacebook className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com/sujathacaterers"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex h-11 w-11 items-center justify-center rounded-xl bg-sand-100 text-sand-700 transition-colors hover:bg-brand-50 hover:text-brand-600"
              >
                <FaInstagram className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- CONSULTATION ---------------- */}
      <section className="border-y border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 lg:py-20">
          <h2 className="font-display text-4xl text-sand-900">Request a consultation</h2>
          <p className="mt-3 text-[1.0625rem] text-sand-600">
            Share a few details and our team will get back to you shortly.
          </p>

          {/* serviceability check */}
          <div className="mt-8 rounded-2xl border border-sand-200 bg-white p-5">
            {serviceInfo ? (
              <div className="flex items-start gap-3">
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                    serviceInfo.isServiceArea
                      ? 'bg-success-50 text-success-700'
                      : 'bg-saffron-50 text-saffron-700'
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
                <p className="text-[0.9375rem] text-sand-600">
                  Check whether we serve your area before booking.
                </p>
                <Button
                  variant="secondary"
                  className="shrink-0 sm:w-auto sm:px-5 sm:py-2.5 sm:text-[0.9375rem]"
                  onClick={checkServiceArea}
                  loading={checkingArea}
                  loadingText="Checking…"
                >
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
      </section>

      {/* ---------------- EVENTS ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <h2 className="font-display text-4xl text-sand-900">Events we cater</h2>
        <ul className="mt-8 flex flex-wrap gap-3">
          {EVENTS_WE_CATER.map((e) => (
            <li
              key={e}
              className="rounded-full border border-sand-200 bg-white px-4 py-2 text-[0.9375rem] font-medium text-sand-700 shadow-card"
            >
              {e}
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- TESTIMONIALS ---------------- */}
      <section className="border-t border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-3xl px-5 py-14 text-center sm:px-8">
          <h2 className="font-display text-4xl text-sand-900">What our clients say</h2>

          <figure className="mt-8 rounded-3xl border border-sand-200 bg-white p-8 shadow-card">
            <blockquote
              key={index}
              className="animate-fade-in font-display text-xl leading-relaxed text-sand-800 sm:text-2xl"
            >
              “{testimonials[index].message}”
            </blockquote>
            <figcaption className="mt-5 text-[0.9375rem] text-sand-600">
              — <span className="font-semibold text-sand-900">{testimonials[index].name}</span>,{' '}
              {testimonials[index].location}
            </figcaption>
          </figure>

          <div className="mt-6 flex justify-center gap-2">
            {testimonials.map((t, i) => (
              <button
                key={t.name + t.location}
                onClick={() => setIndex(i)}
                aria-label={`Show testimonial ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  i === index ? 'w-6 bg-brand-500' : 'w-2 bg-sand-300 hover:bg-sand-400'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- PRIVACY ---------------- */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col items-start gap-4 rounded-2xl border border-sand-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.9375rem] text-sand-700">
            Your data security is our priority. We value your privacy.
          </p>
          <Button
            variant="secondary"
            className="shrink-0 sm:w-auto sm:px-5 sm:py-2.5 sm:text-[0.9375rem]"
            onClick={() => navigate('/privacy')}
          >
            <FaShieldAlt className="h-4 w-4" />
            View privacy policy
          </Button>
        </div>
      </section>

      {/* ---------------- MAP ---------------- */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="overflow-hidden rounded-3xl border border-sand-200 shadow-card">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3828.878551065998!2d80.40892567409921!3d16.329148632429334!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a358b71d28fdfc7%3A0x7699357a26dcc9e1!2sSujatha%20Meals%20Contractors!5e0!3m2!1sen!2sin!4v1752248567560!5m2!1sen!2sin"
            className="block h-[26rem] w-full border-0"
            loading="lazy"
            title="Sujatha Caterers on Google Maps"
          />
        </div>
      </section>
    </PageShell>
  );
};

export default ContactUs;

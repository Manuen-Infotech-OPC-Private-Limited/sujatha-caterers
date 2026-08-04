import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import axios from 'axios';
import useAuth from '../hooks/useAuth';
import { testimonials } from '../data/testimonials';
import cateringImg from '../assets/logos/catering.png';
import mealboxImg from '../assets/logos/new_mealbox.png';
import Button from '../components/ui/Button';
import SupportDialog from '../components/SupportDialog';

const STEPS = [
  {
    title: 'Pick your package',
    body: 'Choose Basic, Classic, Premium or Luxury — then build the menu dish by dish.',
  },
  {
    title: 'Tell us the details',
    body: 'Headcount, date and where it needs to go. We check serviceability for you.',
  },
  {
    title: 'We cook and deliver',
    body: 'Freshly prepared on the day, delivered on time, with live order updates.',
  },
];

const Home = () => {
  const navigate = useNavigate();
  const { user, loading: loadingUser } = useAuth();
  const [visitCount, setVisitCount] = useState(null);
  const [showCookiePrompt, setShowCookiePrompt] = useState(false);
  const [supportDialogOpen, setSupportDialogOpen] = useState(false);

  const API = process.env.REACT_APP_API_URL;

  // ---------------- INIT ----------------
  useEffect(() => {
    const consent = Cookies.get('cookie_consent');
    const alreadyVisited = Cookies.get('already_visited');

    if (!consent) {
      setShowCookiePrompt(true);
    } else {
      if (!alreadyVisited || consent === 'true' || consent === 'customize') {
        axios
          .get(`${API}/api/visit`, { withCredentials: true })
          .then((res) => {
            setVisitCount(res.data.count);
            Cookies.set('already_visited', 'true', { expires: 7 });
          })
          .catch((err) => console.error('Failed to fetch visit count:', err));
      }
    }
  }, [API]);

  // ---------------- COOKIE HANDLERS ----------------
  const acceptAllCookies = () => {
    Cookies.set('cookie_consent', 'true', { expires: 365 });
    setShowCookiePrompt(false);
  };

  const acceptEssentialCookies = () => {
    Cookies.set('cookie_consent', 'essential', { expires: 365 });
    toast.info('Only essential cookies will be used.');
    setShowCookiePrompt(false);
  };

  return (
    <div data-ui="v2" className="min-h-screen bg-sand-50 font-sans text-sand-900">
      <Header />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden">
        {/* warm glow behind the hero */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 -right-40 h-[32rem] w-[32rem] rounded-full bg-brand-100/50 blur-3xl"
        />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-sand-200 bg-white px-3.5 py-1.5 text-sm font-medium text-sand-700 shadow-card">
              {!loadingUser && user ? (
                <>Welcome back, {user.name} 👋</>
              ) : (
                <>Welcome, food lover 👋</>
              )}
            </p>

            <h1 className="mt-6 font-display text-5xl leading-[1.05] text-sand-900 sm:text-6xl xl:text-7xl">
              Sujatha Caterers
            </h1>

            <p className="mt-5 text-xl leading-snug text-sand-700 sm:text-2xl">
              Not just food, but a feast of flavors — crafted with love, served
              with tradition.
            </p>

            <p className="mt-5 max-w-xl text-[1.0625rem] leading-relaxed text-sand-600">
              From grand weddings to intimate gatherings, we bring the rich
              heritage of authentic South and North Indian cooking to your table.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button className="sm:w-auto sm:px-7" onClick={() => navigate('/menu')}>
                Explore our menu
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
              </Button>
              <Button
                variant="secondary"
                className="sm:w-auto sm:px-7"
                onClick={() => navigate('/mealbox')}
              >
                Browse meal boxes
              </Button>
            </div>

            {!loadingUser && !user && (
              <p className="mt-6 text-[0.9375rem] text-sand-600">
                For a personalised experience,{' '}
                <button
                  onClick={() => navigate('/login')}
                  className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
                >
                  log in
                </button>{' '}
                or{' '}
                <button
                  onClick={() => navigate('/register')}
                  className="font-semibold text-brand-600 underline-offset-4 transition-colors hover:text-brand-700 hover:underline"
                >
                  sign up
                </button>
                .
              </p>
            )}

            {visitCount !== null && (
              <p className="mt-8 flex items-center gap-2 text-sm text-sand-500">
                <span className="relative flex h-2 w-2" aria-hidden="true">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-success-500 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-success-500" />
                </span>
                Joined by{' '}
                <strong className="font-semibold text-sand-800">
                  {visitCount.toLocaleString('en-IN')}
                </strong>{' '}
                hungry visitors
              </p>
            )}
          </div>

          {/* hero image */}
          <div className="relative animate-scale-in lg:justify-self-end">
            <div
              aria-hidden="true"
              className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-saffron-100 to-brand-100 opacity-70"
            />
            <img
              src={cateringImg}
              alt="A traditional South Indian thali served in a woven basket"
              className="relative w-full rounded-[2rem] object-cover shadow-lift"
            />
          </div>
        </div>
      </section>

      {/* ================= SERVICE PATHS ================= */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-sand-900">Two ways to order</h2>
          <p className="mt-3 text-[1.0625rem] text-sand-600">
            Full-service catering for the big days, and meal boxes for everything
            in between.
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[
            {
              img: cateringImg,
              tag: 'Catering',
              title: 'Catering for events',
              body: 'Weddings, housewarmings and corporate gatherings. Build a menu across four packages, priced per plate.',
              cta: 'Build your menu',
              to: '/menu',
            },
            {
              img: mealboxImg,
              tag: 'Meal boxes',
              title: 'Meal boxes from ₹179',
              body: 'Individually packed meals in Classic or Premium. Pick up from five locations, or get them delivered.',
              cta: 'Browse meal boxes',
              to: '/mealbox',
            },
          ].map((card) => (
            <button
              key={card.to}
              onClick={() => navigate(card.to)}
              className="group flex flex-col overflow-hidden rounded-3xl border border-sand-200 bg-white text-left shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-sand-300 hover:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25"
            >
              <div className="relative aspect-[16/10] overflow-hidden bg-sand-100">
                <img
                  src={card.img}
                  alt=""
                  aria-hidden="true"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute top-4 left-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold tracking-wide text-sand-800 uppercase backdrop-blur">
                  {card.tag}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <h3 className="font-display text-2xl text-sand-900">{card.title}</h3>
                <p className="mt-2 flex-1 text-[0.9375rem] leading-relaxed text-sand-600">
                  {card.body}
                </p>
                <span className="mt-5 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-brand-600">
                  {card.cta}
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
                </span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* ================= HOW IT WORKS ================= */}
      <section className="border-y border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
          <h2 className="font-display text-4xl text-sand-900">How it works</h2>

          <ol className="mt-10 grid gap-8 md:grid-cols-3">
            {STEPS.map((step, i) => (
              <li key={step.title} className="relative">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-500 font-display text-lg text-white shadow-brand">
                  {i + 1}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-sand-900">{step.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ================= TESTIMONIALS ================= */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl text-sand-900">Loved across Andhra</h2>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {testimonials.slice(0, 6).map((t) => (
            <figure
              key={`${t.name}-${t.location}`}
              className="flex flex-col rounded-2xl border border-sand-200 bg-white p-6 shadow-card"
            >
              <div className="flex gap-0.5 text-saffron-500" aria-label="5 out of 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} viewBox="0 0 20 20" className="h-4 w-4" fill="currentColor">
                    <path d="M10 1.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L10 14.9 4.8 17.6l1-5.8L1.5 7.7l5.9-.9z" />
                  </svg>
                ))}
              </div>

              <blockquote className="mt-4 flex-1 text-[0.9375rem] leading-relaxed text-sand-700">
                “{t.message}”
              </blockquote>

              <figcaption className="mt-5 border-t border-sand-200 pt-4">
                <span className="block font-semibold text-sand-900">{t.name}</span>
                <span className="text-sm text-sand-500">{t.location}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="border-t border-sand-200 bg-white">
        <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
          <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
            <div className="max-w-sm">
              <p className="font-display text-2xl text-sand-900">Sujatha Caterers</p>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">
                Authentic South and North Indian catering, serving Guntur and
                the surrounding districts.
              </p>
            </div>

            <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[0.9375rem]">
              {[
                { label: 'Menu', to: '/menu' },
                { label: 'Meal boxes', to: '/mealbox' },
                { label: 'Services', to: '/services' },
                { label: 'About us', to: '/about' },
                { label: 'Contact', to: '/contact' },
                { label: 'Privacy', to: '/privacy' },
              ].map((l) => (
                <button
                  key={l.to}
                  onClick={() => navigate(l.to)}
                  className="text-sand-600 transition-colors hover:text-brand-600"
                >
                  {l.label}
                </button>
              ))}
            </nav>
          </div>

          <p className="mt-10 border-t border-sand-200 pt-6 text-sm text-sand-500">
            © {new Date().getFullYear()} Sujatha Caterers. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= SUPPORT FAB ================= */}
      <button
        onClick={() => setSupportDialogOpen(true)}
        className={`fixed right-5 z-40 flex items-center gap-2 rounded-full bg-brand-500 px-5 py-3.5 text-[0.9375rem] font-semibold text-white shadow-brand transition-all duration-300 hover:bg-brand-600 focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30 ${
          showCookiePrompt ? 'bottom-40 sm:bottom-28' : 'bottom-6'
        }`}
      >
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 12a3 3 0 0 1-3 3l-3.5 2.5V15H6a3 3 0 0 1-3-3V6a3 3 0 0 1 3-3h8a3 3 0 0 1 3 3z" />
        </svg>
        Contact support
      </button>

      <SupportDialog
        open={supportDialogOpen}
        onClose={() => setSupportDialogOpen(false)}
        user={user}
      />

      {/* ================= COOKIE BANNER ================= */}
      {showCookiePrompt && (
        <div className="fixed inset-x-0 bottom-0 z-50 animate-fade-up p-4 sm:p-5">
          <div className="mx-auto flex max-w-3xl flex-col gap-4 rounded-2xl border border-sand-200 bg-white p-5 shadow-lift sm:flex-row sm:items-center">
            <p className="flex-1 text-[0.9375rem] leading-relaxed text-sand-700">
              We use essential cookies by default. Accept all to help us improve
              your experience?
            </p>
            <div className="flex shrink-0 gap-2">
              <button
                onClick={acceptEssentialCookies}
                className="flex-1 rounded-xl border-2 border-sand-300 px-4 py-2.5 text-[0.9375rem] font-semibold text-sand-800 transition-colors hover:border-sand-400 hover:bg-sand-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:flex-none"
              >
                Essential only
              </button>
              <button
                onClick={acceptAllCookies}
                className="flex-1 rounded-xl bg-brand-500 px-5 py-2.5 text-[0.9375rem] font-semibold text-white transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:flex-none"
              >
                Accept all
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;

import React from 'react';
import { useNavigate } from 'react-router-dom';
import mealboximg from '../assets/logos/new_mealbox.png';
import cateringImg from '../assets/logos/catering.png';
import { useAuthContext } from '../utils/AuthContext';
import { PRICES } from '../utils/pricing';
import { MEALBOX_ALLOWED_PINCODES, CATERING_PINCODE_RANGE } from '../utils/serviceability';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';

const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];
const PACKAGES = ['Basic', 'Classic', 'Premium', 'Luxury'];

/* Tier summaries mirror the limits in utils/cartRules.js — keep them in sync. */
const TIER_NOTES = {
  Basic: 'Idly, vada and upma at breakfast. One dish from each lunch course.',
  Classic: 'Adds pongal and a sweet. Two sweets and two pickles at lunch.',
  Premium: 'Adds dosa, Indian breads, ice cream and paan. Two dishes per course.',
  Luxury: 'Adds mysore bonda, with tea and coffee included. Three sweets, three hot snacks.',
};

/* Pickup points mirror PICKUP_LOCATIONS in pages/MealBox.jsx. */
const PICKUP_LOCATIONS = [
  'Taraka Rama Nagar — 10th Line',
  'Tanvika Function Hall — Ala Hospital backside',
  'Sujatha Convention — Vidya Nagar Main Road',
  'Near SBI Bank, Pattabhipuram',
  'Sujatha Caterers Main Kitchen, Guntur',
];

const MEALBOX_BASE = [
  'Sweet', 'Veg Roll', 'Tomato Pappu', 'Fry', 'Curry', 'Rice', 'Ghee',
  'Pickle', 'Papad', 'Sambar', 'Curd', 'Salt', 'Water', 'Napkins',
];

/* The two rows people actually compare before choosing. */
const COMPARISON = [
  { label: 'Best for', catering: 'Weddings, poojas, corporate events', mealbox: 'Office lunches, small gatherings' },
  { label: 'Typical size', catering: 'Dozens to hundreds of guests', mealbox: '1 – 15 boxes' },
  { label: 'Price', catering: 'From ₹100 per plate', mealbox: '₹179 or ₹199 per box' },
  { label: 'How it works', catering: 'Build a menu across four packages', mealbox: 'Pick a variant, pick up or get it delivered' },
];

const Check = ({ className = 'h-4 w-4' }) => (
  <svg viewBox="0 0 20 20" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10.5l4 4 8-9" />
  </svg>
);

const Arrow = () => (
  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 10h11M10 5l5 5-5 5" />
  </svg>
);

const Services = () => {
  const navigate = useNavigate();
  const { user } = useAuthContext();

  const go = (path) => navigate(user ? path : '/login');

  return (
    <PageShell>
      <PageHero compact eyebrow="What we do" title="Catering and meal boxes">
        Full-service catering for the big days, and individually packed meals
        for everything in between. Here's what each costs and how to order.
      </PageHero>

      {/* ============ CHOOSE ============ */}
      <section className="mx-auto max-w-7xl px-5 py-12 sm:px-8 lg:py-16">
        <h2 className="font-display text-3xl text-sand-900">Which one do you need?</h2>

        <div className="mt-8 overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
          {/* headers */}
          <div className="grid grid-cols-2 md:grid-cols-[10rem_1fr_1fr]">
            <div className="hidden border-b border-sand-200 md:block" />
            {[
              { img: cateringImg, name: 'Catering', to: '/catering/order', cta: 'Start an order' },
              { img: mealboximg, name: 'Meal Box', to: '/mealbox', cta: 'Order boxes' },
            ].map((col) => (
              <div key={col.name} className="border-b border-sand-200 p-5 text-center">
                <img
                  src={col.img}
                  alt=""
                  aria-hidden="true"
                  className="mx-auto h-24 w-24 rounded-2xl object-cover sm:h-28 sm:w-28"
                />
                <h3 className="mt-3 font-display text-2xl text-sand-900">{col.name}</h3>
              </div>
            ))}
          </div>

          {/* comparison rows */}
          {COMPARISON.map((row, i) => (
            <div
              key={row.label}
              className={`grid grid-cols-2 md:grid-cols-[10rem_1fr_1fr] ${
                i % 2 ? 'bg-sand-50' : 'bg-white'
              }`}
            >
              <p className="col-span-2 px-5 pt-4 text-xs font-semibold tracking-wide text-sand-500 uppercase md:col-span-1 md:self-center md:py-4 md:pt-4 md:text-sm md:normal-case">
                {row.label}
              </p>
              <p className="px-5 py-3 text-[0.9375rem] text-sand-700 md:py-4">{row.catering}</p>
              <p className="px-5 py-3 text-[0.9375rem] text-sand-700 md:py-4">{row.mealbox}</p>
            </div>
          ))}

          {/* actions */}
          <div className="grid grid-cols-2 gap-4 border-t border-sand-200 p-5 md:grid-cols-[10rem_1fr_1fr]">
            <div className="hidden md:block" />
            <Button onClick={() => go('/catering/order')}>
              {user ? 'Start an order' : 'Log in to order'}
              <Arrow />
            </Button>
            <Button variant="secondary" onClick={() => go('/mealbox')}>
              {user ? 'Order boxes' : 'Log in to order'}
            </Button>
          </div>
        </div>
      </section>

      {/* ============ CATERING PRICING ============ */}
      <section className="border-y border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl text-sand-900">Catering packages</h2>
            <p className="mt-3 text-[1.0625rem] text-sand-600">
              Four tiers across breakfast, lunch and dinner. Prices are per
              plate — build the menu dish by dish once you've picked a tier.
            </p>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            {PACKAGES.map((pkg) => (
              <article
                key={pkg}
                className={`flex flex-col rounded-2xl border bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift ${
                  pkg === 'Premium' ? 'border-brand-300 ring-2 ring-brand-500/15' : 'border-sand-200'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-display text-2xl text-sand-900">{pkg}</h3>
                  {pkg === 'Premium' && (
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
                      Popular
                    </span>
                  )}
                </div>

                <p className="mt-4 text-sm text-sand-500">From</p>
                <p className="font-display text-4xl text-sand-900">
                  ₹{Math.min(...MEAL_TYPES.map((m) => PRICES[m][pkg]))}
                  <span className="ml-1 font-sans text-sm font-medium text-sand-500">/ plate</span>
                </p>

                <dl className="mt-5 space-y-1.5 border-t border-sand-200 pt-4">
                  {MEAL_TYPES.map((meal) => (
                    <div key={meal} className="flex items-baseline justify-between gap-2">
                      <dt className="text-[0.9375rem] text-sand-600">{meal}</dt>
                      <dd className="font-semibold tabular-nums text-sand-900">
                        ₹{PRICES[meal][pkg]}
                      </dd>
                    </div>
                  ))}
                </dl>

                <p className="mt-5 flex-1 text-sm leading-relaxed text-sand-600">
                  {TIER_NOTES[pkg]}
                </p>
              </article>
            ))}
          </div>

          <p className="mt-6 text-sm text-sand-500">
            All prices exclusive of 5% GST (2.5% CGST + 2.5% SGST).
          </p>
        </div>
      </section>

      {/* ============ MEAL BOX ============ */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
        <div className="max-w-2xl">
          <h2 className="font-display text-4xl text-sand-900">What's in a meal box</h2>
          <p className="mt-3 text-[1.0625rem] text-sand-600">
            Individually packed South Indian vegetarian meals. Order between 1
            and 15 boxes.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {[
            {
              name: 'Classic',
              price: 179,
              extra: ['Pulihora'],
              blurb: 'The everyday box — a full plate without the biryani course.',
              featured: false,
            },
            {
              name: 'Premium',
              price: 199,
              extra: ['Veg Biryani', 'Veg Kurma', 'Raitha'],
              blurb: 'Adds a biryani course with kurma and raitha.',
              featured: true,
            },
          ].map((variant) => (
            <article
              key={variant.name}
              className={`flex flex-col rounded-3xl border bg-white p-6 shadow-card sm:p-7 ${
                variant.featured ? 'border-brand-300 ring-2 ring-brand-500/15' : 'border-sand-200'
              }`}
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-3xl text-sand-900">{variant.name}</h3>
                <p className="font-display text-3xl text-brand-600">
                  ₹{variant.price}
                  <span className="ml-1 font-sans text-sm font-medium text-sand-500">/ box</span>
                </p>
              </div>

              <p className="mt-2 text-[0.9375rem] text-sand-600">{variant.blurb}</p>

              <div className="mt-5 rounded-2xl bg-saffron-50 p-4">
                <p className="text-xs font-semibold tracking-wide text-saffron-700 uppercase">
                  Includes
                </p>
                <ul className="mt-2 flex flex-wrap gap-1.5">
                  {variant.extra.map((item) => (
                    <li
                      key={item}
                      className="rounded-full bg-white px-2.5 py-1 text-sm font-semibold text-saffron-700"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              <p className="mt-5 text-xs font-semibold tracking-wide text-sand-500 uppercase">
                Plus, in every box
              </p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {MEALBOX_BASE.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-sand-200 bg-sand-50 px-2.5 py-1 text-sm text-sand-700"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        {/* pickup + delivery */}
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-7">
            <h3 className="text-lg font-semibold text-sand-900">Pick up — free</h3>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              Collect from any of our five points across Guntur.
            </p>
            <ul className="mt-4 space-y-2.5">
              {PICKUP_LOCATIONS.map((loc) => (
                <li key={loc} className="flex items-start gap-2.5 text-[0.9375rem] text-sand-700">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700">
                    <Check className="h-3 w-3" />
                  </span>
                  {loc}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-7">
            <h3 className="text-lg font-semibold text-sand-900">Door delivery</h3>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              Delivered to your address via Rapido.
            </p>
            <div className="mt-4 rounded-2xl border border-saffron-300/60 bg-saffron-50 p-4">
              <p className="text-[0.9375rem] leading-relaxed text-saffron-700">
                <strong className="font-semibold">Please note:</strong> delivery
                charges are paid directly to the Rapido rider and are not
                included in the box price.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ WHERE WE SERVE ============ */}
      <section className="border-t border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <h2 className="font-display text-4xl text-sand-900">Where we serve</h2>

          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-sand-900">Catering</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">
                Available across pincodes{' '}
                <strong className="font-semibold text-sand-900">
                  {CATERING_PINCODE_RANGE[0]} – {CATERING_PINCODE_RANGE[1]}
                </strong>
                , covering Guntur and the surrounding districts. We confirm
                serviceability from your location when you order.
              </p>
            </div>

            <div className="rounded-2xl border border-sand-200 bg-white p-6 shadow-card">
              <h3 className="text-lg font-semibold text-sand-900">Meal boxes</h3>
              <p className="mt-2 text-[0.9375rem] text-sand-600">
                Delivered to these pincodes:
              </p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {MEALBOX_ALLOWED_PINCODES.map((pin) => (
                  <li
                    key={pin}
                    className="rounded-lg border border-sand-200 bg-sand-50 px-2.5 py-1 font-mono text-sm text-sand-700"
                  >
                    {pin}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
        <div className="flex flex-col items-start gap-5 rounded-3xl border border-sand-200 bg-white p-7 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-2xl text-sand-900">
              Planning something bigger?
            </h2>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              Tell us about your event and we'll put a menu together with you.
            </p>
          </div>
          <Button
            className="shrink-0 sm:w-auto sm:px-7"
            onClick={() => navigate('/contact')}
          >
            Request a consultation
            <Arrow />
          </Button>
        </div>
      </section>
    </PageShell>
  );
};

export default Services;

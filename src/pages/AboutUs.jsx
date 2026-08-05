import React from 'react';
import { useNavigate } from 'react-router-dom';
import newLogo from '../assets/logos/newlogo.png';
import PageShell, { PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';

/* Every figure here is sourced from the app itself or from existing copy —
   nothing is invented. Packages/meals come from utils/pricing.js. */
const STATS = [
  { value: '23+', label: 'Years of catering', note: 'Since the early 2000s' },
  { value: '100%', label: 'Vegetarian', note: 'South & North Indian' },
  { value: '4', label: 'Curated packages', note: 'Basic to Luxury' },
  { value: '3', label: 'Meal services', note: 'Breakfast, lunch, dinner' },
];

/* The concrete things that set the kitchen apart. These were previously
   buried in a single closing sentence. */
const KNOWN_FOR = [
  {
    title: 'Live dosa station',
    body: 'Dosas made to order in front of your guests — the centrepiece of our Premium and Luxury breakfast spreads.',
  },
  {
    title: 'Banana leaf meals',
    body: 'The traditional service, laid out course by course the way a South Indian feast is meant to be eaten.',
  },
  {
    title: 'Menus built dish by dish',
    body: "You aren't handed a fixed plate. Pick a package, then choose each item across sweets, curries, rice and breads.",
  },
];

const VALUES = [
  { title: 'Purity', body: 'Handpicked vegetables and delicate spices, sourced with care for every event.' },
  { title: 'Hygiene', body: 'Uncompromised standards from prep through to plating and delivery.' },
  { title: 'Punctuality', body: 'Setup and delivery on schedule, so the day runs the way you planned it.' },
  { title: 'Personal attention', body: 'White-glove service — one team, accountable from menu design to the last plate.' },
];

const About = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <PageHero eyebrow="Our story" title="Food that carries a memory">
        Twenty-three years of cooking for the days people remember — weddings,
        poojas, housewarmings and everything that brings a family together.
      </PageHero>

      {/* ============ STATS ============ */}
      <section className="border-b border-sand-200 bg-white">
        {/* bg-sand-200 draws the 1px divider lines through `gap-px`, so this
            element must carry no padding — padding would render as stray
            sand-coloured strips down either edge. */}
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-px bg-sand-200 lg:grid-cols-4">
          {STATS.map((stat) => (
            <div key={stat.label} className="bg-white px-5 py-8 text-center sm:py-10">
              <p className="font-display text-4xl text-brand-600 sm:text-5xl">{stat.value}</p>
              <p className="mt-1 font-semibold text-sand-900">{stat.label}</p>
              <p className="mt-0.5 text-sm text-sand-500">{stat.note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ============ STORY + STICKY LOGO ============ */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
          <div className="animate-fade-up">
            <article className="space-y-4 text-[1.0625rem] leading-relaxed text-sand-700">
              <h2 className="font-display text-3xl text-sand-900">Our roots</h2>
              <p>
                At Sujatha Catering, we believe food is more than nourishment —
                it's a celebration of heritage, emotion, and experience. With
                over{' '}
                <strong className="font-semibold text-sand-900">23+ years of expertise</strong>,
                our team brings deep-rooted culinary knowledge and consistent
                excellence to every event.
              </p>
              <p>
                Rooted in tradition yet elevated with a touch of luxury, every
                dish we serve reflects our values — purity, passion, and
                perfection. From delicate spices to handpicked vegetables, our
                ingredients are thoughtfully sourced and prepared with
                uncompromised hygiene and care.
              </p>
            </article>

            <article className="mt-10 space-y-4 text-[1.0625rem] leading-relaxed text-sand-700">
              <h2 className="font-display text-3xl text-sand-900">
                Where tradition meets sophistication
              </h2>
              <p>
                Our team doesn't just serve food — we curate experiences.
                Whether it's a wedding, pooja, corporate gathering or intimate
                celebration, we take pride in delivering meals that create
                lasting impressions.
              </p>
              <p>
                From menu design and preparation through to seamless delivery
                and elegant presentation, we handle every detail so you can
                remain present in the moment.
              </p>
            </article>

            <blockquote className="mt-10 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 p-6 font-display text-xl leading-relaxed text-sand-800">
              Whether it's the sizzle of a live dosa station or the grace of a
              traditional banana leaf meal, we serve not just food — but
              meaning, memory, and magic.
            </blockquote>
          </div>

          {/* sticky logo figure */}
          <figure className="animate-scale-in lg:sticky lg:top-24 lg:self-start">
            <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <img
                src={newLogo}
                alt="Sujatha Catering logo"
                className="mx-auto w-full max-w-[16rem]"
              />
            </div>
            <figcaption className="mt-3 text-center text-sm text-sand-500 italic">
              Sujatha Catering — Serving tradition with grace
            </figcaption>
          </figure>
        </div>
      </section>

      {/* ============ KNOWN FOR ============ */}
      <section className="border-y border-sand-200 bg-sand-100/60">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
          <div className="max-w-2xl">
            <h2 className="font-display text-4xl text-sand-900">What we're known for</h2>
            <p className="mt-3 text-[1.0625rem] text-sand-600">
              The things guests remember long after the plates are cleared.
            </p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {KNOWN_FOR.map((item, i) => (
              <article
                key={item.title}
                className="rounded-3xl border border-sand-200 bg-white p-7 shadow-card"
              >
                <span className="font-display text-5xl text-brand-200">0{i + 1}</span>
                <h3 className="mt-3 font-display text-2xl text-sand-900">{item.title}</h3>
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ============ VALUES ============ */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[18rem_1fr] lg:gap-16">
          <div>
            <h2 className="font-display text-4xl text-sand-900">How we work</h2>
            <p className="mt-3 text-[0.9375rem] leading-relaxed text-sand-600">
              Four things we hold to on every event, whether it's fifty guests
              or five hundred.
            </p>
          </div>

          <dl className="grid gap-x-10 gap-y-8 sm:grid-cols-2">
            {VALUES.map((value) => (
              <div key={value.title}>
                <dt className="flex items-center gap-2.5 text-lg font-semibold text-sand-900">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success-50 text-success-700">
                    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 10.5l4 4 8-9" />
                    </svg>
                  </span>
                  {value.title}
                </dt>
                <dd className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">
                  {value.body}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8">
        <div className="flex flex-col items-start gap-5 rounded-3xl border border-sand-200 bg-white p-7 shadow-card sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-2xl text-sand-900">Let's cook for your event</h2>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              See what each package includes, or talk it through with our team.
            </p>
          </div>
          <div className="flex w-full shrink-0 flex-col gap-3 sm:w-auto sm:flex-row">
            <Button className="sm:w-auto sm:px-6" onClick={() => navigate('/services')}>
              View packages
            </Button>
            <Button
              variant="secondary"
              className="sm:w-auto sm:px-6"
              onClick={() => navigate('/contact')}
            >
              Contact us
            </Button>
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default About;

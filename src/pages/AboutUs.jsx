import React from 'react';
import newLogo from '../assets/logos/newlogo.png';
import PageShell, { PageHero } from '../components/ui/PageShell';

const HIGHLIGHTS = [
  '23+ years of catering expertise',
  '100% authentic South Indian vegetarian cuisine',
  'Customized menus with elegant presentation',
  'White-glove service & personal attention',
  'Punctual, hassle-free setup & delivery',
  'Uncompromised hygiene & quality standards',
];

const About = () => (
  <PageShell>
    <PageHero eyebrow="Our story" title="About us">
      Food is more than nourishment — it's a celebration of heritage, emotion
      and experience.
    </PageHero>

    <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        {/* ---------- prose ---------- */}
        <div className="animate-fade-up space-y-5 text-[1.0625rem] leading-relaxed text-sand-700">
          <p>
            At Sujatha Catering, we believe food is more than nourishment — it's
            a celebration of heritage, emotion, and experience. With over{' '}
            <strong className="font-semibold text-sand-900">23+ years of expertise</strong>{' '}
            in the catering industry, our team brings deep-rooted culinary
            knowledge and consistent excellence to every event.
          </p>

          <p>
            Rooted in tradition yet elevated with a touch of luxury, every dish
            we serve is a reflection of our values — purity, passion, and
            perfection. From delicate spices to handpicked vegetables, our
            ingredients are thoughtfully sourced and prepared with uncompromised
            hygiene and care.
          </p>

          <h2 className="pt-4 font-display text-3xl text-sand-900">
            Where tradition meets sophistication
          </h2>

          <p>
            Our team doesn't just serve food — we curate experiences. Whether
            it's a wedding, pooja, corporate gathering, or intimate celebration,
            Sujatha Catering takes pride in delivering meals that create lasting
            impressions.
          </p>

          <p>
            From menu design and preparation to seamless delivery and elegant
            presentation, we handle every detail so you can remain present in
            the moment.
          </p>

          <blockquote className="mt-8 rounded-2xl border-l-4 border-brand-500 bg-brand-50/60 p-6 font-display text-xl leading-relaxed text-sand-800">
            Whether it's the sizzle of a live dosa station or the grace of a
            traditional banana leaf meal, we serve not just food — but meaning,
            memory, and magic.
          </blockquote>
        </div>

        {/* ---------- logo figure ---------- */}
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

    {/* ---------- why choose us ---------- */}
    <section className="border-t border-sand-200 bg-sand-100/60">
      <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
        <h2 className="font-display text-4xl text-sand-900">
          Why choose Sujatha Catering?
        </h2>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {HIGHLIGHTS.map((item) => (
            <li
              key={item}
              className="flex items-start gap-3 rounded-2xl border border-sand-200 bg-white p-5 shadow-card"
            >
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-success-50 text-success-700">
                <svg
                  viewBox="0 0 20 20"
                  className="h-3.5 w-3.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 10.5l4 4 8-9" />
                </svg>
              </span>
              <span className="text-[0.9375rem] leading-snug font-medium text-sand-800">
                {item}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  </PageShell>
);

export default About;

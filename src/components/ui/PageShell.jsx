import React from 'react';
import Header from '../Header';
import Footer from '../Footer';

/*
 * Standard page frame for converted pages: opts into the data-ui="v2" reset,
 * pins the footer to the bottom on short pages, and keeps the header/footer
 * pairing in one place.
 */
export const PageShell = ({ children, className = '' }) => (
  <div data-ui="v2" className="flex min-h-screen flex-col bg-sand-50 font-sans text-sand-900">
    <Header />
    <main className={`flex-1 ${className}`}>{children}</main>
    <Footer />
  </div>
);

/* Consistent page-title band across the secondary pages. */
export const PageHero = ({ eyebrow, title, children }) => (
  <section className="doodle-texture relative overflow-hidden border-b border-sand-200 bg-white">
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -top-32 -right-24 h-96 w-96 rounded-full bg-brand-100/40 blur-3xl"
    />
    <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20">
      <div className="max-w-2xl animate-fade-up">
        {eyebrow && (
          <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="mt-2 font-display text-4xl leading-tight text-sand-900 sm:text-5xl">
          {title}
        </h1>
        {children && (
          <p className="mt-4 text-[1.0625rem] leading-relaxed text-sand-600">{children}</p>
        )}
      </div>
    </div>
  </section>
);

export default PageShell;

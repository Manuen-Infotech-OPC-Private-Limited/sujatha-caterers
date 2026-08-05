import React from 'react';
import { useNavigate } from 'react-router-dom';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';

const LINKS = [
  { label: 'Browse the menu', to: '/menu' },
  { label: 'Meal boxes', to: '/mealbox' },
  { label: 'Contact us', to: '/contact' },
];

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <PageShell>
      <section className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center sm:px-8">
        <p className="font-display text-7xl leading-none text-brand-200 sm:text-8xl">404</p>

        <h1 className="mt-4 font-display text-3xl text-sand-900 sm:text-4xl">
          We couldn't find that page
        </h1>
        <p className="mt-3 text-[1.0625rem] leading-relaxed text-sand-600">
          It may have moved, been renamed, or never existed. Here's where most
          people are headed.
        </p>

        <Button className="mt-8 sm:w-auto sm:px-7" onClick={() => navigate('/')}>
          Back to home
        </Button>

        <nav className="mt-8 flex flex-wrap justify-center gap-2 border-t border-sand-200 pt-6">
          {LINKS.map((l) => (
            <button
              key={l.to}
              onClick={() => navigate(l.to)}
              className="rounded-full border border-sand-200 bg-white px-4 py-2 text-[0.9375rem] font-medium text-sand-700 transition-colors hover:border-brand-300 hover:text-brand-600"
            >
              {l.label}
            </button>
          ))}
        </nav>
      </section>
    </PageShell>
  );
};

export default NotFound;

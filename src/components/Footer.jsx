import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BUSINESS } from '../data/business';

const LINKS = [
  { label: 'Menu', to: '/menu' },
  { label: 'Meal boxes', to: '/mealbox' },
  { label: 'Services', to: '/services' },
  { label: 'About us', to: '/about' },
  { label: 'Contact', to: '/contact' },
  { label: 'Privacy', to: '/privacy' },
];

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="border-t border-sand-200 bg-white">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-2xl text-sand-900">Sujatha Caterers</p>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-sand-600">
              Authentic South and North Indian catering, serving Guntur and the
              surrounding districts.
            </p>
            <a
              href={BUSINESS.phoneHref}
              className="mt-4 inline-block font-semibold text-brand-600 transition-colors hover:text-brand-700"
            >
              {BUSINESS.phone}
            </a>
          </div>

          <nav className="flex flex-wrap gap-x-8 gap-y-3 text-[0.9375rem]">
            {LINKS.map((l) => (
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
  );
};

export default Footer;

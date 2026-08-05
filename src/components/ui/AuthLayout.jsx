import React from 'react';
import loginBg from '../../assets/logos/loginbg.webp';
import logonoBg from '../../assets/logos/logo-nobg.png';

/*
 * Shared split-screen shell for /login and /register: food photography on the
 * left (desktop only), form on a cream panel to the right.
 */
const AuthLayout = ({ headline, sub, backLabel, onBack, wide = false, children }) => (
  <div className="flex min-h-screen bg-sand-50 font-sans">
    {/* ---------------- Left: imagery (desktop only) ---------------- */}
    <aside className="relative hidden w-1/2 shrink-0 overflow-hidden lg:block xl:w-[55%]">
      <img
        src={loginBg}
        alt=""
        aria-hidden="true"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-sand-950/90 via-sand-950/55 to-sand-950/30" />

      {/* absolute inset-0 rather than h-full: h-full lets the content grow
          past the panel and overflow-hidden then clips the last line. */}
      <div className="absolute inset-0 flex flex-col justify-between gap-6 p-10 xl:p-14">
        <img
          src={logonoBg}
          alt="Sujatha Caterers"
          className="h-auto w-24 shrink-0 drop-shadow-lg"
        />

        <div className="min-h-0 max-w-lg animate-fade-up">
          <p className="font-display text-3xl leading-tight text-white xl:text-[2.75rem]">
            {headline}
          </p>
          {/* Hidden on short viewports so the headline never gets clipped. */}
          <p className="mt-3 hidden text-base text-white/75 min-[820px]:block xl:text-lg">
            {sub}
          </p>
        </div>
      </div>
    </aside>

    {/* ---------------- Right: form ---------------- */}
    <div className="relative flex w-full flex-col lg:w-1/2 xl:w-[45%]">
      <div className="p-5 sm:p-8">
        <button
          type="button"
          onClick={onBack}
          className="group inline-flex items-center gap-2 rounded-lg py-2 pr-3 text-sm font-medium text-sand-600 transition-colors hover:text-sand-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
        >
          <svg
            viewBox="0 0 20 20"
            className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 4l-6 6 6 6" />
          </svg>
          {backLabel}
        </button>
      </div>

      <div className="flex flex-1 items-center justify-center px-5 pb-12 sm:px-8">
        <div className={`w-full ${wide ? 'max-w-[29rem]' : 'max-w-[26rem]'}`}>
          {/* Logo — mobile only; desktop shows it over the photo */}
          <img
            src={logonoBg}
            alt="Sujatha Caterers"
            className="mx-auto mb-8 w-24 lg:hidden"
          />
          {children}
        </div>
      </div>
    </div>
  </div>
);

export default AuthLayout;

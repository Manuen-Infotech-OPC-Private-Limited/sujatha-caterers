import React from 'react';
import { ToastContainer, Slide } from 'react-toastify';

/*
 * Custom toast presentation for the whole app.
 *
 * This deliberately styles react-toastify rather than replacing it: all 13
 * files that already call `toast.success(...)` / `toast.error(...)` inherit
 * the new look with no changes at the call sites.
 */

const iconWrap =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full';

const ToastIcon = ({ type }) => {
  if (type === 'success') {
    return (
      <span className={`${iconWrap} bg-success-50 text-success-700`}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 10.5l4 4 8-9" />
        </svg>
      </span>
    );
  }

  if (type === 'error') {
    return (
      <span className={`${iconWrap} bg-brand-50 text-brand-600`}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 6l8 8M14 6l-8 8" />
        </svg>
      </span>
    );
  }

  if (type === 'warning') {
    return (
      <span className={`${iconWrap} bg-saffron-50 text-saffron-700`}>
        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M10 6v5M10 14h.01" />
        </svg>
      </span>
    );
  }

  // info + default
  return (
    <span className={`${iconWrap} bg-sand-100 text-sand-700`}>
      <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10 9v5M10 6h.01" />
      </svg>
    </span>
  );
};

// Toasts portal to <body>, outside the scope, so the reset
// utilities (appearance-none / border-0 / bg-transparent) are spelled out here.
const CloseButton = ({ closeToast }) => (
  <button
    type="button"
    onClick={closeToast}
    aria-label="Dismiss notification"
    className="ml-auto shrink-0 cursor-pointer appearance-none self-start rounded-md border-0 bg-transparent p-1 text-sand-400 transition-colors hover:bg-sand-100 hover:text-sand-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
  >
    <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <path d="M5 5l10 10M15 5L5 15" />
    </svg>
  </button>
);

/*
 * The progress bar is recoloured in index.css via react-toastify's own CSS
 * variables, deliberately NOT via the `progressClassName` prop: that prop
 * replaces the default class list, which drops
 * `Toastify__progress-bar--animated`. The toast auto-closes on that
 * animation's `animationend` event, so overriding the class stops toasts
 * from ever dismissing.
 */

const Toaster = () => (
  <ToastContainer
    position="top-right"
    autoClose={3200}
    newestOnTop
    closeOnClick
    pauseOnHover
    draggable
    transition={Slide}
    hideProgressBar={false}
    icon={ToastIcon}
    closeButton={CloseButton}
    /* The container needs a real width. `w-auto` let it collapse to the
       icon's width and the message had nowhere to lay out. */
    className="!w-[min(25rem,calc(100vw-2rem))] !p-4"
    /*
     * v11 renders no `Toastify__toast-body` wrapper — the message is a bare
     * text node directly inside this element, so there is nothing for
     * `bodyClassName` to style. Typography therefore lives here and is
     * inherited by that text node.
     */
    toastClassName={() =>
      'relative mb-3 flex w-full min-h-0 items-center gap-3 overflow-hidden rounded-2xl border border-sand-200 bg-white p-3.5 font-sans text-[0.9375rem] font-medium leading-snug text-sand-900 shadow-lift'
    }
  />
);

export default Toaster;

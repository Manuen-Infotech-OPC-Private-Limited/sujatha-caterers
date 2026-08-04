import React from 'react';
import Spinner from './Spinner';

const VARIANTS = {
  primary:
    'bg-brand-500 text-white shadow-brand hover:bg-brand-600 focus-visible:ring-brand-500/30 disabled:bg-sand-300 disabled:text-sand-500 disabled:shadow-none',
  secondary:
    'border-2 border-sand-300 bg-white text-sand-800 hover:border-sand-400 hover:bg-sand-50 focus-visible:ring-sand-400/40 disabled:opacity-50',
  ghost:
    'text-sand-600 hover:bg-sand-100 hover:text-sand-900 focus-visible:ring-sand-400/40 disabled:opacity-50',
};

const Button = ({
  children,
  variant = 'primary',
  loading = false,
  loadingText,
  disabled,
  className = '',
  type = 'button',
  ...props
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={`group flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-[1.0625rem] font-semibold transition-all duration-200 active:scale-[0.99] focus:outline-none focus-visible:ring-4 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
    {...props}
  >
    {loading ? (
      <>
        <Spinner />
        {loadingText ?? children}
      </>
    ) : (
      children
    )}
  </button>
);

export default Button;

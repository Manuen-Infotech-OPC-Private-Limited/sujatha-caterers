import React from 'react';

/*
 * Labelled text input with an optional inline prefix (e.g. "+91") and an
 * error message slot. The border/ring lives on the wrapper so the prefix and
 * the input read as one control.
 */
const Field = ({ id, label, error, hint, prefix, className = '', ...props }) => (
  <div className={className}>
    <label htmlFor={id} className="mb-2 block text-sm font-semibold text-sand-800">
      {label}
    </label>

    <div
      className={`flex items-stretch overflow-hidden rounded-xl border-2 bg-white transition-all duration-200 ${
        error
          ? 'border-brand-400 ring-4 ring-brand-500/10'
          : 'border-sand-300 hover:border-sand-400 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-500/15'
      }`}
    >
      {prefix && (
        <span className="flex shrink-0 select-none items-center gap-2 border-r-2 border-sand-200 bg-sand-100 px-3.5 text-[0.9375rem] font-semibold text-sand-700">
          {prefix}
        </span>
      )}
      <input
        id={id}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full bg-transparent px-4 py-3.5 text-[1.0625rem] text-sand-900 outline-none placeholder:text-sand-400"
        {...props}
      />
    </div>

    {error ? (
      <p id={`${id}-error`} className="mt-1.5 text-sm font-medium text-brand-600">
        {error}
      </p>
    ) : (
      hint && <p className="mt-1.5 text-sm text-sand-500">{hint}</p>
    )}
  </div>
);

export default Field;

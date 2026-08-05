import React from 'react';

/*
 * Pill-style segmented control used for meal type and package selection.
 * `options` may be plain strings or { value, label, sub } objects.
 */
const SegmentedControl = ({ label, options, value, onSelect, name }) => (
  <div className="font-sans">
    {label && (
      <p className="mb-2 text-xs font-semibold tracking-wide text-sand-500 uppercase">
        {label}
      </p>
    )}

    <div
      role="radiogroup"
      aria-label={label || name}
      className="inline-flex w-full flex-wrap gap-1 rounded-2xl border border-sand-200 bg-sand-100 p-1 sm:w-auto"
    >
      {options.map((opt) => {
        const val = typeof opt === 'string' ? opt : opt.value;
        const text = typeof opt === 'string' ? opt : opt.label;
        const sub = typeof opt === 'string' ? null : opt.sub;
        const active = val === value;

        return (
          <button
            key={val}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onSelect(val)}
            className={`flex-1 rounded-xl px-4 py-2.5 text-[0.9375rem] font-semibold whitespace-nowrap transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 sm:flex-none ${
              active
                ? 'bg-white text-sand-900 shadow-card'
                : 'text-sand-600 hover:bg-white/60 hover:text-sand-900'
            }`}
          >
            {text}
            {sub && (
              <span
                className={`ml-1.5 text-xs font-medium ${
                  active ? 'text-brand-600' : 'text-sand-500'
                }`}
              >
                {sub}
              </span>
            )}
          </button>
        );
      })}
    </div>
  </div>
);

export default SegmentedControl;

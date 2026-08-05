import React, { useState } from 'react';

/*
 * Props are unchanged — CollapsibleMenu and InclusionsList (both still on
 * legacy CSS) render this too, so `data-ui="v2"` sits on the card root rather
 * than relying on an ancestor providing it.
 */
const DishCard = ({ name, packages = [], selectedPackage, image, isSelected, tag }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const isAvailable = !selectedPackage || packages.includes(selectedPackage);

  return (
    <div
      data-ui="v2"
      className={`group relative flex flex-col overflow-hidden rounded-2xl border bg-white font-sans transition-all duration-200 ${
        isSelected
          ? 'border-brand-500 ring-2 ring-brand-500/20 shadow-lift'
          : 'border-sand-200 shadow-card hover:-translate-y-0.5 hover:shadow-lift'
      } ${isAvailable ? '' : 'opacity-55 grayscale-[35%]'}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-sand-100">
        {/* No src at all is the same end state as a failed load — without this
            the skeleton below would pulse forever. */}
        {!loaded && image && !failed && (
          <div className="absolute inset-0 animate-pulse bg-sand-200" />
        )}

        {image && !failed && (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className={`h-full w-full object-cover transition-all duration-500 group-hover:scale-105 ${
              loaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        )}

        {/* Fallback when the dish image is missing or 404s. */}
        {(failed || !image) && (
          <div className="flex h-full w-full items-center justify-center bg-sand-100 text-sand-400">
            <svg viewBox="0 0 24 24" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19h16M6 19V9a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v10M9 7V5m3 2V4m3 3V5" />
            </svg>
          </div>
        )}

        {isSelected && (
          <span className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-brand-500 text-white shadow-brand">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10.5l4 4 8-9" />
            </svg>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        <h4 className="text-[0.9375rem] leading-snug font-semibold text-sand-900">{name}</h4>

        {tag && (
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-saffron-50 px-2 py-0.5 text-xs font-semibold text-saffron-700">
            {tag}
          </span>
        )}

        {!isAvailable && packages.length > 0 && (
          <span className="mt-1.5 inline-flex w-fit rounded-full bg-sand-100 px-2 py-0.5 text-xs font-medium text-sand-600">
            In {packages.join(', ')}
          </span>
        )}
      </div>
    </div>
  );
};

export default DishCard;

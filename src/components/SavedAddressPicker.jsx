import React, { useEffect, useState } from 'react';

/*
 * Choose one of the customer's saved addresses at checkout.
 *
 * The backend has stored these for a while and the web app never read them, so
 * the full address was retyped on every order — including by customers who had
 * already saved it from the app.
 *
 * Renders nothing when there is nothing saved, so a first order is never
 * blocked behind setting one up.
 */
const SavedAddressPicker = ({ api, selectedId, onSelect }) => {
  const [addresses, setAddresses] = useState([]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${api}/api/users/addresses`, { credentials: 'include' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data?.addresses) setAddresses(data.addresses);
      })
      // Signed out, offline, anything — the form below still works.
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [api]);

  if (addresses.length === 0) return null;

  return (
    <div className="mb-5">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-sand-500">
        Saved addresses
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1">
        {addresses.map((a) => {
          const isSelected = a._id === selectedId;
          return (
            <button
              key={a._id}
              type="button"
              onClick={() => onSelect(a)}
              aria-pressed={isSelected}
              className={`w-52 shrink-0 rounded-2xl border p-3 text-left transition ${
                isSelected
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-sand-200 bg-white hover:border-sand-300'
              }`}
            >
              <span
                className={`block text-sm font-semibold ${
                  isSelected ? 'text-brand-700' : 'text-sand-900'
                }`}
              >
                {a.label || 'Address'}
              </span>
              <span className="mt-1 block text-xs leading-snug text-sand-600">
                {[a.address, a.city, a.pincode].filter(Boolean).join(', ')}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default SavedAddressPicker;

import React from 'react';
import SegmentedControl from './ui/SegmentedControl';

const packages = ['Basic', 'Classic', 'Premium', 'Luxury'];

/*
 * The Exotic Meal is ₹250 a plate and one dish per course on every package, so
 * the control is offering four choices that do nothing. It is replaced with a
 * line saying so rather than disabled — a greyed-out row of tiers still reads
 * as "pick one", and the customer would be looking for the difference.
 *
 * The selected package is deliberately NOT reset when this hides. It is still
 * sent and stored, it just has no effect; overwriting it would quietly lose the
 * customer's real choice the moment they switched back to Lunch.
 */
const PackageSelector = ({
  selectedPackage,
  onSelect,
  label = 'Package',
  prices,
  mealType,
}) => {
  if (mealType === 'Exotic') {
    return (
      <div className="font-sans">
        <p className="mb-2 text-xs font-semibold tracking-wide text-sand-500 uppercase">
          {label}
        </p>
        <p className="rounded-2xl border border-sand-200 bg-sand-100 px-4 py-2.5 text-[0.9375rem] text-sand-600">
          One dish from every course — the same on any package.
        </p>
      </div>
    );
  }

  return (
    <SegmentedControl
      name="package"
      label={label}
      value={selectedPackage}
      onSelect={onSelect}
      options={packages.map((pkg) => ({
        value: pkg,
        label: pkg,
        sub: prices?.[pkg] ? `₹${prices[pkg]}` : null,
      }))}
    />
  );
};

export default PackageSelector;

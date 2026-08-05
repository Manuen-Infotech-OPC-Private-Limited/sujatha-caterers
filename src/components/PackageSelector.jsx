import React from 'react';
import SegmentedControl from './ui/SegmentedControl';

const packages = ['Basic', 'Classic', 'Premium', 'Luxury'];

/* Props are unchanged — OrderPage still renders this. */
const PackageSelector = ({ selectedPackage, onSelect, label = 'Package', prices }) => (
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

export default PackageSelector;

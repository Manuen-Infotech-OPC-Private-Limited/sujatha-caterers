import React from 'react';
import SegmentedControl from './ui/SegmentedControl';

/* The value must match the API and the rule tables exactly — 'Exotic' — while
   the customer reads "Exotic Meal", hence the object form for that one. */
const mealTypes = [
  'Breakfast',
  'Lunch',
  'Dinner',
  { value: 'Exotic', label: 'Exotic Meal' },
];

/* Props are unchanged — OrderPage still renders this. */
const MealTypeSelector = ({ selectedMealType, onSelect, label = 'Meal type' }) => (
  <SegmentedControl
    name="mealType"
    label={label}
    value={selectedMealType}
    onSelect={onSelect}
    options={mealTypes}
  />
);

export default MealTypeSelector;

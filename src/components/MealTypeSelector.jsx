import React from 'react';
import SegmentedControl from './ui/SegmentedControl';

const mealTypes = ['Breakfast', 'Lunch', 'Dinner'];

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

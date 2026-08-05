import React from 'react';
import DishCard from './DishCard';
import { getCategoryLimit } from '../../utils/cartRules';
import { formatCategory } from '../../utils/categoryLabels';

/*
 * Replaces BreakfastMenu and LunchDinnerMenu, which were near-identical —
 * they differed only by a heading and a regex that didn't work.
 */
const MenuSections = ({
  menuData,
  mealType,
  selectedPackage,
  query = '',
  showUnavailable = false,
}) => {
  const q = query.trim().toLowerCase();

  const sections = Object.entries(menuData)
    .map(([category, dishes]) => {
      const limit = getCategoryLimit(mealType, selectedPackage, category);

      const matched = (dishes || []).filter(
        (d) => !q || d.name.toLowerCase().includes(q)
      );
      const included = matched.filter((d) => d.packages?.includes(selectedPackage));
      const others = matched.filter((d) => !d.packages?.includes(selectedPackage));

      return { category, limit, included, others };
    })
    .filter(({ included, others }) => included.length > 0 || (showUnavailable && others.length > 0));

  if (sections.length === 0) {
    return (
      <div className="rounded-2xl border border-sand-200 bg-white p-10 text-center">
        <p className="font-semibold text-sand-900">No dishes match that search</p>
        <p className="mt-1 text-[0.9375rem] text-sand-600">
          Try a different name, or switch package to see more.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      {sections.map(({ category, limit, included, others }) => (
        <section key={category} id={`cat-${category}`} className="scroll-mt-40">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h3 className="font-display text-2xl text-sand-900">
              {formatCategory(category)}
            </h3>
            <span className="text-sm text-sand-500">
              {included.length} {included.length === 1 ? 'dish' : 'dishes'}
            </span>
            {limit > 0 && (
              <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-600">
                Choose up to {limit}
              </span>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {included.map((dish) => (
              <DishCard
                key={dish.name}
                name={dish.name}
                packages={dish.packages}
                selectedPackage={selectedPackage}
                image={dish.image ? `${process.env.REACT_APP_API_URL}${dish.image}` : null}
              />
            ))}

            {showUnavailable &&
              others.map((dish) => (
                <DishCard
                  key={dish.name}
                  name={dish.name}
                  packages={dish.packages}
                  selectedPackage={selectedPackage}
                  image={dish.image ? `${process.env.REACT_APP_API_URL}${dish.image}` : null}
                />
              ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MenuSections;

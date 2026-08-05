import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import PackageSelector from '../components/PackageSelector';
import MealTypeSelector from '../components/MealTypeSelector';
import MenuSections from '../components/MenuDisplay/MenuSections';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import useAuth from '../hooks/useAuth';
import { useMenu } from '../utils/MenuContext';
import { PRICES } from '../utils/pricing';
import { getCategoryLimit } from '../utils/cartRules';
import { formatCategory } from '../utils/categoryLabels';

const MenuSkeleton = () => (
  <div className="space-y-12">
    {[0, 1].map((s) => (
      <div key={s}>
        <div className="h-7 w-40 animate-pulse rounded-lg bg-sand-200" />
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-sand-200 bg-white">
              <div className="aspect-[4/3] animate-pulse bg-sand-200" />
              <div className="p-3">
                <div className="h-4 w-3/4 animate-pulse rounded bg-sand-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    ))}
  </div>
);

const MenuPage = () => {
  const [selectedPackage, setSelectedPackage] = useState('Basic');
  const [selectedMealType, setSelectedMealType] = useState('Breakfast');
  const [menuData, setMenuData] = useState({});
  const [query, setQuery] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { getMenu, loading: loadingMenu, error: menuError } = useMenu();

  // Fetch menu via shared cache
  useEffect(() => {
    let isMounted = true;

    getMenu(selectedMealType)
      .then((data) => {
        if (isMounted) setMenuData(data);
      })
      .catch(() => {
        // error already handled in context
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMealType, getMenu]);

  const pricePerPlate = PRICES[selectedMealType]?.[selectedPackage];

  /* What this package actually gives you, derived from cartRules rather than
     written out by hand, so it tracks the real limits. */
  const included = useMemo(() => {
    const entries = Object.keys(menuData)
      .map((category) => ({
        category,
        limit: getCategoryLimit(selectedMealType, selectedPackage, category),
        count: (menuData[category] || []).filter((d) =>
          d.packages?.includes(selectedPackage)
        ).length,
      }))
      .filter((e) => e.count > 0);

    return {
      categories: entries,
      dishCount: entries.reduce((sum, e) => sum + e.count, 0),
      totalCount: Object.values(menuData).reduce((sum, d) => sum + (d?.length || 0), 0),
    };
  }, [menuData, selectedMealType, selectedPackage]);

  const hasMenu = Object.keys(menuData).length > 0;

  return (
    <PageShell>
      {/* ============ HERO ============ */}
      <section className="doodle-texture relative overflow-hidden border-b border-sand-200 bg-white">
        <div className="relative mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="animate-fade-up">
              <p className="text-sm font-semibold tracking-wide text-brand-600 uppercase">
                Catering menu
              </p>
              <h1 className="mt-2 font-display text-4xl text-sand-900 sm:text-5xl">
                Build your plate
              </h1>
              <p className="mt-3 max-w-xl text-[1.0625rem] text-sand-600">
                Pick a meal and a package to see exactly what's included and how
                many dishes you can choose from each course.
              </p>
            </div>

            {!authLoading &&
              (user ? (
                <Button className="sm:w-auto sm:px-7" onClick={() => navigate('/catering/order')}>
                  Start an order
                  <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 10h11M10 5l5 5-5 5" />
                  </svg>
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="sm:w-auto sm:px-7"
                  onClick={() => navigate('/login')}
                >
                  Log in to order
                </Button>
              ))}
          </div>
        </div>
      </section>

      {/* ============ STICKY CONTROLS ============ */}
      <div className="sticky top-16 z-40 border-b border-sand-200 bg-sand-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <MealTypeSelector
                selectedMealType={selectedMealType}
                onSelect={setSelectedMealType}
              />
              <PackageSelector
                selectedPackage={selectedPackage}
                onSelect={setSelectedPackage}
                prices={PRICES[selectedMealType]}
              />
            </div>

            {/* search */}
            <div className="relative lg:w-64">
              <svg
                viewBox="0 0 20 20"
                className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-sand-400"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <circle cx="9" cy="9" r="6" />
                <path d="M14 14l4 4" />
              </svg>
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search dishes…"
                aria-label="Search dishes"
                className="w-full rounded-xl border-2 border-sand-300 bg-white py-2.5 pr-4 pl-10 text-[0.9375rem] text-sand-900 outline-none transition-all duration-200 placeholder:text-sand-400 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ============ PACKAGE SUMMARY ============ */}
      <section className="mx-auto max-w-7xl px-5 pt-8 sm:px-8">
        <div className="flex flex-col gap-5 rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex flex-wrap items-baseline gap-x-3">
              <h2 className="font-display text-2xl text-sand-900">
                {selectedPackage} · {selectedMealType}
              </h2>
              {pricePerPlate && (
                <p className="font-display text-2xl text-brand-600">
                  ₹{pricePerPlate}
                  <span className="ml-1 font-sans text-sm font-medium text-sand-500">
                    per plate
                  </span>
                </p>
              )}
            </div>

            {hasMenu && (
              <p className="mt-1.5 text-[0.9375rem] text-sand-600">
                <strong className="font-semibold text-sand-900">{included.dishCount}</strong>{' '}
                dishes available across{' '}
                <strong className="font-semibold text-sand-900">
                  {included.categories.length}
                </strong>{' '}
                {included.categories.length === 1 ? 'course' : 'courses'}
                {included.totalCount > included.dishCount && (
                  <> · {included.totalCount - included.dishCount} more in higher packages</>
                )}
              </p>
            )}
          </div>

          {included.totalCount > included.dishCount && (
            <label className="flex shrink-0 cursor-pointer items-center gap-2.5 text-[0.9375rem] text-sand-700">
              <input
                type="checkbox"
                checked={showUnavailable}
                onChange={(e) => setShowUnavailable(e.target.checked)}
                className="h-4 w-4 shrink-0 cursor-pointer rounded border-2 border-sand-300 accent-brand-500"
              />
              Show dishes from other packages
            </label>
          )}
        </div>

        {/* course jump links */}
        {hasMenu && included.categories.length > 1 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {included.categories.map(({ category, count }) => (
              <a
                key={category}
                href={`#cat-${category}`}
                className="rounded-full border border-sand-200 bg-white px-3 py-1.5 text-sm font-medium text-sand-700 transition-colors hover:border-brand-300 hover:text-brand-600"
              >
                {formatCategory(category)}
                <span className="ml-1.5 text-sand-400">{count}</span>
              </a>
            ))}
          </div>
        )}
      </section>

      {/* ============ MENU ============ */}
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:pb-16">
        {loadingMenu && !hasMenu ? (
          <MenuSkeleton />
        ) : menuError ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50 p-8 text-center">
            <p className="font-semibold text-brand-700">Couldn't load the menu</p>
            <p className="mt-1 text-[0.9375rem] text-sand-700">{menuError}</p>
          </div>
        ) : !hasMenu ? (
          <div className="rounded-2xl border border-sand-200 bg-white p-10 text-center">
            <p className="font-semibold text-sand-900">
              The {selectedMealType.toLowerCase()} menu isn't available right now
            </p>
            <p className="mt-1 text-[0.9375rem] text-sand-600">
              Try another meal type, or check back shortly.
            </p>
          </div>
        ) : (
          <MenuSections
            menuData={menuData}
            mealType={selectedMealType}
            selectedPackage={selectedPackage}
            query={query}
            showUnavailable={showUnavailable}
          />
        )}
      </section>
    </PageShell>
  );
};

export default MenuPage;

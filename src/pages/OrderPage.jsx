// src/pages/OrderPage.js
import React, { useState, useEffect } from 'react';
import MealTypeSelector from '../components/MealTypeSelector';
import PackageSelector from '../components/PackageSelector';
import { useCart } from '../utils/cartContext';
import CollapsibleMenu from '../components/MenuDisplay/CollapsibleMenu';
import CartSummary from '../components/CartSummary';
import { PRICES } from '../utils/pricing';
import { getEligibleItems } from '../utils/eligibility';
import { useMenu } from '../utils/MenuContext';
import { useLocation } from '../utils/LocationContext';
import { CATERING_PINCODE_RANGE } from '../utils/serviceability';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import ConfirmDialog from '../components/ui/ConfirmDialog';

/* Centred panel used by the loading and out-of-area states. */
const Gate = ({ children }) => (
  <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center sm:px-8">
    {children}
  </div>
);

const OrderPage = () => {
  const [selectedPackage, setSelectedPackage] = useState(
    () => localStorage.getItem('selectedPackage') || 'Classic'
  );
  const [selectedMealType, setSelectedMealType] = useState(
    () => localStorage.getItem('selectedMealType') || 'Breakfast'
  );
  const [menuData, setMenuData] = useState({});
  // Replaces window.confirm; holds the change waiting on confirmation.
  const [pendingChange, setPendingChange] = useState(null);

  const { cart, resetCart } = useCart();
  const isCartEmpty = Object.keys(cart).length === 0;

  const { getMenu, loading: loadingMenu, error: menuError } = useMenu();
  const {
    isCateringServiceable,
    isLoading: loadingLocation,
    requestLocation,
    permissionDenied,
    pincode
  } = useLocation();

  // Request location on mount
  useEffect(() => {
    if (!pincode && !permissionDenied) {
      requestLocation();
    }
  }, [pincode, permissionDenied, requestLocation]);

  // Fetch menu via shared cache when meal type changes
  useEffect(() => {
    let isMounted = true;

    getMenu(selectedMealType)
      .then((data) => {
        if (isMounted) setMenuData(data);
      })
      .catch(() => {
        // error already handled in MenuContext
      });

    return () => {
      isMounted = false;
    };
  }, [selectedMealType, getMenu]);

  const applyChange = (kind, value) => {
    if (kind === 'package') {
      setSelectedPackage(value);
      localStorage.setItem('selectedPackage', value);
    } else {
      setSelectedMealType(value);
      localStorage.setItem('selectedMealType', value);
    }
  };

  const requestChange = (kind, value) => {
    const current = kind === 'package' ? selectedPackage : selectedMealType;
    if (value === current) return;

    if (isCartEmpty) {
      applyChange(kind, value);
      return;
    }
    setPendingChange({ kind, value });
  };

  const confirmChange = () => {
    if (!pendingChange) return;
    resetCart();
    applyChange(pendingChange.kind, pendingChange.value);
    setPendingChange(null);
  };

  /* ---------------- gates ---------------- */

  if (loadingLocation) {
    return (
      <PageShell>
        <Gate>
          <span className="text-brand-500">
            <Spinner className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl text-sand-900">
            Checking your area
          </h1>
          <p className="mt-2 text-[1.0625rem] text-sand-600">
            We're confirming that we deliver catering to your location.
          </p>
        </Gate>
      </PageShell>
    );
  }

  if (permissionDenied || (pincode && !isCateringServiceable)) {
    return (
      <PageShell>
        <Gate>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>

          <h1 className="mt-5 font-display text-3xl text-sand-900">
            {permissionDenied ? 'Location needed' : 'Outside our catering area'}
          </h1>

          <p className="mt-3 text-[1.0625rem] leading-relaxed text-sand-600">
            {permissionDenied
              ? 'We use your location to check whether we can cater in your area. Nothing is stored.'
              : `We don't currently cater to pincode ${pincode}. Catering runs across ${CATERING_PINCODE_RANGE[0]} – ${CATERING_PINCODE_RANGE[1]}.`}
          </p>

          {permissionDenied && (
            <Button className="mt-7 sm:w-auto sm:px-7" onClick={requestLocation}>
              Allow location access
            </Button>
          )}

          <p className="mt-8 border-t border-sand-200 pt-5 text-[0.9375rem] text-sand-600">
            Think this is wrong? Call us on{' '}
            <a
              href="tel:+919703505356"
              className="font-semibold text-brand-600 underline-offset-4 hover:underline"
            >
              +91 97035 05356
            </a>
            .
          </p>
        </Gate>
      </PageShell>
    );
  }

  /* ---------------- order flow ---------------- */

  const pricePerPerson = PRICES[selectedMealType]?.[selectedPackage];

  return (
    <PageShell>
      {/* ---------- sticky order bar ---------- */}
      <div className="sticky top-16 z-40 border-b border-sand-200 bg-sand-50/95 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-5 py-4 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <MealTypeSelector
                selectedMealType={selectedMealType}
                onSelect={(v) => requestChange('mealType', v)}
              />
              <PackageSelector
                selectedPackage={selectedPackage}
                onSelect={(v) => requestChange('package', v)}
                prices={PRICES[selectedMealType]}
              />
            </div>

            <p className="shrink-0 font-display text-2xl text-sand-900">
              ₹{pricePerPerson}
              <span className="ml-1.5 font-sans text-sm font-medium text-sand-500">
                per person
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* ---------- menu + cart ---------- */}
      <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:py-10">
        <h1 className="font-display text-4xl text-sand-900">Build your order</h1>
        <p className="mt-2 text-[1.0625rem] text-sand-600">
          Pick a course to open it, then choose your dishes.
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_22rem] lg:gap-10">
          <div className="min-w-0">
            {loadingMenu && Object.keys(menuData).length === 0 ? (
              <div className="flex items-center gap-3 rounded-2xl border border-sand-200 bg-white p-6 text-sand-600">
                <Spinner /> Loading the {selectedMealType.toLowerCase()} menu…
              </div>
            ) : menuError ? (
              <div className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                <p className="font-semibold text-brand-700">Couldn't load the menu</p>
                <p className="mt-1 text-[0.9375rem] text-sand-700">{menuError}</p>
              </div>
            ) : Object.keys(menuData).length === 0 ? (
              <div className="rounded-2xl border border-sand-200 bg-white p-8 text-center">
                <p className="font-semibold text-sand-900">
                  No {selectedMealType.toLowerCase()} menu available
                </p>
                <p className="mt-1 text-[0.9375rem] text-sand-600">
                  Try another meal type.
                </p>
              </div>
            ) : (
              <CollapsibleMenu
                menuData={getEligibleItems(selectedMealType, selectedPackage, menuData)}
                selectedPackage={selectedPackage}
                selectedMealType={selectedMealType}
              />
            )}
          </div>

          <aside className="lg:sticky lg:top-44 lg:self-start">
            <CartSummary
              selectedPackage={selectedPackage}
              selectedMealType={selectedMealType}
            />
          </aside>
        </div>
      </section>

      <ConfirmDialog
        open={!!pendingChange}
        title={
          pendingChange?.kind === 'package' ? 'Change package?' : 'Change meal type?'
        }
        body={`Switching to ${pendingChange?.value} clears the dishes you've chosen so far, because the courses and limits are different.`}
        confirmLabel={`Switch to ${pendingChange?.value ?? ''}`}
        cancelLabel="Keep my selection"
        onConfirm={confirmChange}
        onCancel={() => setPendingChange(null)}
      />
    </PageShell>
  );
};

export default OrderPage;

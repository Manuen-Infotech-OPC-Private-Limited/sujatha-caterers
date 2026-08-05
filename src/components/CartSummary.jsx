import React, { useEffect, useState } from 'react';
import { useCart } from '../utils/cartContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getCategoryLimit } from '../utils/cartRules';
import { formatCategory } from '../utils/categoryLabels';
import { useMenu } from '../utils/MenuContext';
import Button from './ui/Button';

const CartSummary = ({ selectedPackage, selectedMealType }) => {
  const { cart, removeItemFromCategory } = useCart();
  const navigate = useNavigate();
  const { getMenu } = useMenu();

  const [menuData, setMenuData] = useState(null);

  const isCartEmpty = Object.keys(cart).length === 0;

  // 🔹 Fetch menu from backend via MenuContext
  useEffect(() => {
    let mounted = true;

    getMenu(selectedMealType)
      .then((data) => {
        if (mounted) setMenuData(data);
      })
      .catch(() => { });

    return () => {
      mounted = false;
    };
  }, [selectedMealType, getMenu]);

  const handleRemoveClick = (category, itemName) => {
    removeItemFromCategory(category, itemName);
  };

  // ✅ Complimentary items now come ONLY from backend data
  // Include if: Match Package AND (Explicitly AutoInclude OR Not Selectable)
  const complimentaryItems =
    menuData?.complimentary
      ?.filter(item =>
        item.packages.includes(selectedPackage) &&
        (item.autoInclude || !item.selectableGroup)
      ) || [];

  // Get all non-complimentary categories
  const categories = menuData
    ? Object.keys(menuData).filter((c) => c.toLowerCase() !== 'complimentary')
    : [];

  // Categories that must be selected
  const requiredCategories = categories.filter(
    (category) => getCategoryLimit(selectedMealType, selectedPackage, category) > 0
  );

  const cartKeysLower = Object.keys(cart).map(k => k.toLowerCase());

  const isCategoryFilled = (category) => {
    const matchingKey = cartKeysLower.find(k => k === category.toLowerCase());
    if (!matchingKey) return false;
    const realKey = Object.keys(cart).find(k => k.toLowerCase() === matchingKey);
    return (cart[realKey] || []).length > 0;
  };

  const filledCount = requiredCategories.filter(isCategoryFilled).length;
  const allCategoriesSelected = filledCount === requiredCategories.length;

  const handleReviewOrder = () => {
    if (!allCategoriesSelected) {
      const missing = requiredCategories.filter((c) => !isCategoryFilled(c));
      toast.warn(
        `Still to choose: ${missing.map(formatCategory).join(', ')}.`
      );
      return;
    }

    // 🔹 Validate Complimentary Drinks (Tea/Coffee) Selection
    if (menuData?.complimentary) {
      const hasSelectableDrink = menuData.complimentary.some(
        item =>
          item.packages.includes(selectedPackage) &&
          item.selectableGroup === 'drink' &&
          !item.autoInclude
      );

      if (hasSelectableDrink) {
        const drinkCart = cart['Opted-drink'] || [];
        if (drinkCart.length === 0) {
          toast.warn('Please select either Tea or Coffee from the Complimentary section.');
          return;
        }
      }
    }

    // 🔒 Defensive check: never allow webpack URLs to pass
    const hasInvalidImage = complimentaryItems.some(
      item => item.image?.startsWith('/static/media')
    );

    if (hasInvalidImage) {
      toast.error('Invalid image data detected. Please refresh the page.');
      return;
    }

    navigate('/review-order', {
      state: {
        orderType: 'catering',
        selectedPackage,
        selectedMealType,
        complimentaryItems,
      },
    });
  };

  const progress = requiredCategories.length
    ? Math.round((filledCount / requiredCategories.length) * 100)
    : 0;

  return (
    <div
      data-ui="v2"
      className="rounded-3xl border border-sand-200 bg-white p-5 font-sans shadow-card sm:p-6"
    >
      <h3 className="font-display text-2xl text-sand-900">Your selection</h3>

      <dl className="mt-3 space-y-1 text-[0.9375rem]">
        <div className="flex justify-between gap-3">
          <dt className="text-sand-600">Meal</dt>
          <dd className="font-semibold text-sand-900">{selectedMealType}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-sand-600">Package</dt>
          <dd className="font-semibold text-sand-900">{selectedPackage}</dd>
        </div>
      </dl>

      {/* progress */}
      {requiredCategories.length > 0 && (
        <div className="mt-4">
          <div className="flex items-baseline justify-between text-sm">
            <span className="font-medium text-sand-700">
              {filledCount} of {requiredCategories.length} courses chosen
            </span>
            <span className="tabular-nums text-sand-500">{progress}%</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-sand-200">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                allCategoriesSelected ? 'bg-success-500' : 'bg-brand-500'
              }`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <p className="mt-4 rounded-xl bg-sand-100 px-3.5 py-2.5 text-sm text-sand-600">
        All complimentary items are added automatically.
      </p>

      {isCartEmpty ? (
        <p className="mt-5 border-t border-sand-200 pt-5 text-[0.9375rem] text-sand-500 italic">
          Nothing selected yet — pick a course to get started.
        </p>
      ) : (
        <>
          <div className="mt-5 space-y-4 border-t border-sand-200 pt-5">
            {Object.entries(cart).map(([category, items]) => (
              <div key={category}>
                <h4 className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
                  {category === 'Opted-drink' ? 'Selected drinks' : formatCategory(category)}
                </h4>

                <ul className="mt-2 space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.name}
                      className="flex items-center gap-2.5 rounded-xl border border-sand-200 bg-sand-50 p-2"
                    >
                      {item.image && (
                        <img
                          src={`${process.env.REACT_APP_API_URL}${item.image}`}
                          alt=""
                          aria-hidden="true"
                          className="h-9 w-9 shrink-0 rounded-lg object-cover"
                        />
                      )}
                      <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-sand-900">
                        {item.name}
                      </span>
                      <button
                        type="button"
                        aria-label={`Remove ${item.name}`}
                        onClick={() => handleRemoveClick(category, item.name)}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-sand-400 transition-colors hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
                      >
                        <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M5 5l10 10M15 5L5 15" />
                        </svg>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <Button className="mt-5" onClick={handleReviewOrder}>
            Review order
            <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 10h11M10 5l5 5-5 5" />
            </svg>
          </Button>
        </>
      )}
    </div>
  );
};

export default CartSummary;

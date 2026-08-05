import React, { useState, useEffect } from 'react';
import DishCard from './DishCard';
import { useCart } from '../../utils/cartContext';
import { getCategoryLimit } from '../../utils/cartRules';
import { formatCategory } from '../../utils/categoryLabels';
import { toast } from 'react-toastify';

const CollapsibleMenu = ({ menuData, selectedPackage, selectedMealType }) => {
    const [openCategory, setOpenCategory] = useState(
        () => localStorage.getItem("openCategory") || null
    );
    const { cart, setCategoryItem, removeItemFromCategory } = useCart();

    // UPDATE LOCAL STORAGE WHEN CATEGORY CHANGES
    const toggleCategory = (category) => {
        setOpenCategory((prev) => {
            const newValue = prev === category ? null : category;
            localStorage.setItem("openCategory", newValue ?? "");
            return newValue;
        });
    };

    // CLEAR OPEN CATEGORY IF IT DOESN'T EXIST ANYMORE IN MENUDATA
    useEffect(() => {
        const availableCategories = Object.keys(menuData);
        if (!availableCategories.includes(openCategory)) {
            setOpenCategory(null);
            localStorage.removeItem("openCategory");
        }
    }, [menuData, openCategory]);

    const handleItemClick = (category, item) => {
        if (!item.packages.includes(selectedPackage)) {
            toast.error(`"${item.name}" is not available in the "${selectedPackage}" package.`);
            return;
        }

        const limit = getCategoryLimit(selectedMealType, selectedPackage, category);

        // 🔹 Determine the correct cart key (matches cartContext.js logic)
        const cartKey = (category.toLowerCase() === 'complimentary' && item.selectableGroup)
            ? `Opted-${item.selectableGroup}`
            : category;

        const existing = cart[cartKey] || [];
        const isAlreadySelected = existing.some(i => i.name === item.name);

        if (isAlreadySelected) {
            removeItemFromCategory(cartKey, item.name);
            toast.info(`"${item.name}" removed from "${formatCategory(category)}".`);
            return;
        }

        // Check cross-category mutual exclusion (Pongal vs Upma)
        if (selectedMealType === "Breakfast") {
            const lowerCat = category.toLowerCase();
            const conflictsWith = lowerCat === 'pongal' ? 'upma' : lowerCat === 'upma' ? 'pongal' : null;

            if (conflictsWith && (cart[conflictsWith] || []).length > 0) {
                toast.warn(`You can choose either Pongal OR Upma, not both.`);
                return;
            }
        }

        if (existing.length >= limit) {
            toast.info(`Limit reached for "${formatCategory(category)}". Remove an item to add new ones.`);
            return;
        }

        setCategoryItem(category, item, limit);
    };

    const entries = Object.entries(menuData);

    return (
        <div className="font-sans">
            {/* ---------- course chips ---------- */}
            <div className="flex flex-wrap gap-2">
                {entries.map(([category]) => {
                    const limit = getCategoryLimit(selectedMealType, selectedPackage, category);
                    const isComplimentary = category.toLowerCase() === 'complimentary';
                    const selectedCount = (cart[category] || []).length;
                    const isOpen = openCategory === category;
                    const isComplete = !isComplimentary && limit > 0 && selectedCount >= limit;
                    const notApplicable = !isComplimentary && limit === 0;

                    return (
                        <button
                            key={category}
                            type="button"
                            aria-expanded={isOpen}
                            onClick={() => toggleCategory(category)}
                            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-[0.9375rem] font-semibold transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 ${
                                isOpen
                                    ? 'border-brand-500 bg-brand-500 text-white shadow-brand'
                                    : isComplete
                                        ? 'border-success-500/40 bg-success-50 text-success-700'
                                        : notApplicable
                                            ? 'border-sand-200 bg-sand-100 text-sand-400'
                                            : 'border-sand-200 bg-white text-sand-700 hover:border-sand-300 hover:bg-sand-50'
                            }`}
                        >
                            {isComplete && !isOpen && (
                                <svg viewBox="0 0 20 20" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M4 10.5l4 4 8-9" />
                                </svg>
                            )}
                            {formatCategory(category)}
                            <span className={isOpen ? 'text-white/80' : 'text-sand-400'}>
                                {isComplimentary
                                    ? 'options'
                                    : notApplicable
                                        ? '—'
                                        : `${selectedCount}/${limit}`}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* ---------- open course ---------- */}
            {entries.map(([category, dishes]) =>
                openCategory === category ? (
                    <div key={category} className="mt-5 rounded-3xl border border-sand-200 bg-white p-5 shadow-card">
                        <div className="flex flex-wrap items-baseline justify-between gap-2">
                            <h3 className="font-display text-2xl text-sand-900">
                                {formatCategory(category)}
                            </h3>
                            <p className="text-[0.9375rem] text-sand-600">
                                {category.toLowerCase() === 'complimentary'
                                    ? 'Included with your package'
                                    : `Choose up to ${getCategoryLimit(selectedMealType, selectedPackage, category)}`}
                            </p>
                        </div>

                        {category.toLowerCase() === 'complimentary' &&
                            dishes.some(d => d.selectableGroup === 'drink' && !d.autoInclude) && (
                                <p className="mt-3 rounded-xl border border-saffron-300/60 bg-saffron-50 px-4 py-3 text-[0.9375rem] text-saffron-700">
                                    Please select either <strong className="font-semibold">Tea</strong> or{' '}
                                    <strong className="font-semibold">Coffee</strong> — only one is allowed.
                                </p>
                            )}

                        {dishes.length === 0 ? (
                            <p className="mt-4 text-[0.9375rem] text-sand-500 italic">
                                No items in this category
                            </p>
                        ) : (
                            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4">
                                {dishes.map((dish) => {
                                    const limit = getCategoryLimit(selectedMealType, selectedPackage, category);
                                    const isComplimentary = category.toLowerCase() === 'complimentary';
                                    const isSelectable = !isComplimentary || !!dish.selectableGroup;
                                    const isAutoIncluded = dish.autoInclude;

                                    const cartKey = (isComplimentary && dish.selectableGroup)
                                        ? `Opted-${dish.selectableGroup}`
                                        : category;

                                    const selectedItems = cart[cartKey] || [];
                                    const isSelected = selectedItems.some(i => i.name === dish.name);
                                    const selectedCount = selectedItems.length;

                                    const disabled = !isAutoIncluded && selectedCount >= limit && !isSelected;
                                    const isDrink = dish.selectableGroup === 'drink';
                                    const clickable = !disabled && isSelectable && !isAutoIncluded;

                                    return (
                                        <div key={dish.name} className="flex flex-col">
                                            <button
                                                type="button"
                                                disabled={!clickable}
                                                aria-pressed={isSelected}
                                                onClick={() => clickable && handleItemClick(category, dish)}
                                                className={`block w-full rounded-2xl text-left transition-opacity focus:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/25 ${
                                                    disabled ? 'cursor-not-allowed opacity-50' : ''
                                                } ${isAutoIncluded ? 'cursor-default' : ''}`}
                                            >
                                                <DishCard
                                                    name={dish.name}
                                                    packages={dish.packages}
                                                    selectedPackage={selectedPackage}
                                                    image={dish.image ? `${process.env.REACT_APP_API_URL}${dish.image}` : null}
                                                    isSelected={isSelected}
                                                    tag={isDrink && !isAutoIncluded ? 'Select 1' : null}
                                                />
                                            </button>

                                            {isAutoIncluded && (
                                                <span className="mt-1.5 text-center text-xs font-semibold text-success-700">
                                                    Included
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ) : null
            )}
        </div>
    );
};

export default CollapsibleMenu;

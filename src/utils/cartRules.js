/*
 * Per-package course limits. This file is the source of truth for these
 * numbers; service/cartRules.js (server) and lib/utils/cart_rules.dart
 * (Flutter) are copies and must be changed in the same commit. The server
 * validates what the clients allow, so a client that permits one more dish
 * than the server accepts charges the card and then drops the order into the
 * refund queue.
 *
 * Lunch and Dinner share one table deliberately — the client's April 2026
 * tightening applies to both.
 */
export function getCategoryLimit(mealType, selectedPackage, category) {
  /*
   * Exotic Meal: one item from any category, on every package. The package is
   * not a gate here — it is asked for because the rest of the catering flow
   * needs one, and the price is the same whichever is chosen.
   *
   * Complimentary stays 0, as it does for Lunch and Dinner: it is not a course
   * the guest picks, it is driven by selectableGroup.
   */
  if (mealType === "Exotic") {
    return category.toLowerCase() === "complimentary" ? 0 : 1;
  }

  // Breakfast rules
  if (mealType === "Breakfast") {
    const lowerCat = category.toLowerCase();

    if (lowerCat === 'complimentary') {
      // Allow selection for Tea/Coffee (managed by selectableGroup)
      // Auto-included items don't count towards this cart limit.
      return 5; 
    }

    // Limits configuration
    const limits = {
      Basic: {
        idly: 1,
        vada: 1,
        upma: 1,
        pongal: 0,
        dosa: 0,
        mysorebonda: 0,
        sweets: 0
      },
      Classic: {
        idly: 1,
        vada: 1,
        upma: 1,
        pongal: 1,
        dosa: 0,
        mysorebonda: 0,
        sweets: 1
      },
      Premium: {
        idly: 1,
        vada: 1,
        upma: 1,
        pongal: 1,
        dosa: 1,
        mysorebonda: 0,
        sweets: 1
      },
      Luxury: {
        idly: 1,
        vada: 1,
        upma: 1,
        pongal: 1,
        dosa: 1,
        mysorebonda: 1,
        sweets: 1
      }
    };

    return limits[selectedPackage]?.[lowerCat] ?? 0;
  }

  // Lunch & Dinner rules
  const rules = {
    Basic: {
      chaaru: 0,
      sweets: 1,
      hotsnacks: 1,
      indianbreads: 0,
      flavoredrice: 1,
      northindian: 1,
      southindiancurries: 1,
      pappu: 1,
      pickles: 1,
      southindianfries: 1,
      icecreams: 0,
      paan: 0,
      powders: 0,
      complimentary: 0,
    },
    Classic: {
      chaaru: 0,
      sweets: 2,
      pickles: 2,
      powders: 0,
      paan: 0,
      // Explicitly 0, not absent. Without a key this falls through to the
      // `?? 1` default below and Classic silently allowed one bread.
      indianbreads: 0,
      complimentary: 0,
    },
    /* "Grand Feast" to a customer — see data/packages.js. */
    Premium: {
      /* One of ulavacharu or pachi pulusu, on the Grand Feast. Also on the
         Premium Feast above it — a top tier that offers less than the one
         below it is not a top tier. */
      chaaru: 1,
      sweets: 2,
      powders: 0,
      pickles: 2,
      hotsnacks: 2,
      indianbreads: 1,
      // October 2026: two flavoured rices, and one each of the fry, the curry
      // and the pappu. Fewer picks on three courses, more on one.
      flavoredrice: 2,
      northindian: 1,
      southindiancurries: 1,
      pappu: 1,
      southindianfries: 1,
      icecreams: 1,
      paan: 1,
      complimentary: 0,
    },
    /* "Premium Feast" to a customer — see data/packages.js. */
    Luxury: {
      /* One of ulavacharu or pachi pulusu. Sambar is not here because it is
         complimentary — it arrives without being chosen, which is what the
         client means by a confirmed dish. */
      chaaru: 1,
      sweets: 3,
      pickles: 2,
      hotsnacks: 2,
      // October 2026: one podi, one curry, one pappu. The tier still leads on
      // sweets, breads and the two rices.
      powders: 1,
      indianbreads: 1,
      flavoredrice: 2,
      northindian: 2,
      southindiancurries: 1,
      pappu: 1,
      southindianfries: 2,
      icecreams: 1,
      paan: 1,
      complimentary: 0,
    }
  };

  const lowerCategory = category.toLowerCase();
  return rules[selectedPackage]?.[lowerCategory] ?? 1;
}
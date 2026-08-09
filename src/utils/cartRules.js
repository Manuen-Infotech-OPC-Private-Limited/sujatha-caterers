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
      sweets: 2,
      pickles: 2,
      powders: 0,
      paan: 0,
      // Explicitly 0, not absent. Without a key this falls through to the
      // `?? 1` default below and Classic silently allowed one bread.
      indianbreads: 0,
      complimentary: 0,
    },
    Premium: {
      sweets: 2,
      powders: 0,
      pickles: 2,
      hotsnacks: 2,
      indianbreads: 1,
      flavoredrice: 1,
      northindian: 1,
      southindiancurries: 2,
      pappu: 2,
      southindianfries: 2,
      icecreams: 1,
      paan: 1,
      complimentary: 0,
    },
    Luxury: {
      sweets: 3,
      pickles: 2,
      hotsnacks: 2,
      powders: 2,
      indianbreads: 1,
      flavoredrice: 2,
      northindian: 2,
      southindiancurries: 2,
      pappu: 2,
      southindianfries: 2,
      icecreams: 1,
      paan: 1,
      complimentary: 0,
    }
  };

  const lowerCategory = category.toLowerCase();
  return rules[selectedPackage]?.[lowerCategory] ?? 1;
}
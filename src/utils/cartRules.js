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
      complimentary: 0,
    },
    Premium: {
      sweets: 2,
      powders: 0,
      pickles: 2,
      hotsnacks: 2,
      indianbreads: 2,
      flavoredrice: 2,
      northindian: 2,
      southindiancurries: 2,
      pappu: 2,
      southindianfries: 2,
      icecreams: 2,
      paan: 1,
      complimentary: 0,
    },
    Luxury: {
      sweets: 3,
      pickles: 3,
      hotsnacks: 3,
      powders: 2,
      indianbreads: 2,
      flavoredrice: 2,
      northindian: 2,
      southindiancurries: 2,
      pappu: 2,
      southindianfries: 2,
      icecreams: 2,
      paan: 1,
      complimentary: 0,
    }
  };

  const lowerCategory = category.toLowerCase();
  return rules[selectedPackage]?.[lowerCategory] ?? 1;
}
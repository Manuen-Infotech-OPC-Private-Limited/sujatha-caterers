export const PRICES = {
  Breakfast: {
    Basic: 100,
    Classic: 150,
    Premium: 200,
    Luxury: 300,
  },
  Lunch: {
    Basic: 200,
    Classic: 250,
    Premium: 300,
    Luxury: 350,
  },
  Dinner: {
    Basic: 200,
    Classic: 250,
    Premium: 300,
    Luxury: 350,
  },
  /*
   * The Exotic Meal is a meal type in its own right, alongside the other three,
   * and everything about it works like catering — 30 guest minimum, same taxes,
   * same platform fee, same advance splits.
   *
   * It is ₹250 whatever the package, because the package does not gate anything
   * here: every category allows exactly one item (see cartRules.js). The four
   * entries are identical on purpose rather than by oversight — the selector
   * still asks for a package and the price must resolve for whichever is sent.
   */
  Exotic: {
    Basic: 250,
    Classic: 250,
    Premium: 250,
    Luxury: 250,
  },
};

/*
 * The headcount catering will not go below. Raised from 30 to 50 on the
 * client's instruction, October 2026.
 *
 * Mirrored by MIN_GUESTS in the server's service/pricing.js and by
 * kMinGuests in lib/utils/pricing.dart. The server is what actually refuses an
 * order, so a client left on 30 takes the payment and then has it rejected —
 * change all three together.
 */
// 22 Oct 2026: the client's catering floor is 100. This was still 50 — the
// server moved to 25 in October and this was never brought along, so the
// website has been quoting a minimum nothing enforced. The server reads the
// live figure from app settings; this is the copy shown in marketing text.
export const MIN_GUESTS = 100;

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
   * and everything about it works like catering — the same guest minimum, taxes,
   * platform fee and advance splits.
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

/*
 * Meal box prices, contents and packing, in one place.
 *
 * These lists used to live in pages/MealBox.jsx with a second hand-kept copy in
 * pages/Services.jsx. They drifted: the April 2026 revision dropped the veg
 * roll and turned napkins into tissue in the ordering page, and Services went
 * on advertising both for six months. A customer comparing the two pages was
 * being told two different things about the same box, so there is now one copy
 * and both pages import it.
 *
 * Server mirror: service/pricing.js (prices, packing surcharge). Flutter
 * mirror: lib/screens/meal_box_screen.dart. The web app is the source of truth
 * for the numbers.
 */

// 22 Oct 2026: 179 → 200 and 199 → 220. The price IS the variant key the
// server validates, so all three codebases move together or the customer is
// charged and then refused.
export const CLASSIC_PRICE = 200;
export const PREMIUM_PRICE = 220;
export const RICE_PRICE = 99;

/*
 * October 2026: the customer chooses what the box is packed in, and
 * bio-degradable costs ₹20 more.
 *
 * The surcharge is PER BOX, not per order — every box needs its own container,
 * so twelve bio-degradable boxes cost ₹240 more, not ₹20. The server charges it
 * the same way; if that ever stops being true the checkout will take one amount
 * and the server will refuse it, which is the refund queue.
 *
 * `id` is what travels to the server and is stored on the order. The labels can
 * be reworded freely; the ids cannot.
 */
export const PACKING_TYPES = [
  {
    id: 'plastic',
    label: 'Food grade plastic',
    sub: 'Included',
    surcharge: 0,
  },
  {
    id: 'biodegradable',
    label: 'Bio-degradable',
    sub: 'Better for the bin',
    surcharge: 20,
  },
];

export const DEFAULT_PACKING = 'plastic';

export const packingSurcharge = (id) =>
  PACKING_TYPES.find((p) => p.id === id)?.surcharge ?? 0;

/* Falls back to plastic rather than to a blank: orders placed before October
   2026 carry no packing choice at all, and those were plastic. */
export const packingLabel = (id) =>
  PACKING_TYPES.find((p) => p.id === id)?.label ?? PACKING_TYPES[0].label;

/*
 * In every thali box, whichever variant is chosen.
 *
 * The client's October 2026 edits: the water bottle and the ghee are out,
 * "Tomato Pappu" is just "Pappu", and cutlery goes in. A rice bowl carries none
 * of this — it is the rice, not the full thali — so listing these against it
 * would promise food that is not in the box.
 */
export const MEALBOX_BASE = [
  'Sweet',
  'Hot',
  'Pappu',
  'Fry',
  'Curry',
  'Papad',
  'Vadiyalu',
  'Ghee',
  'Salt',
  'Pickle',
  'Sambar',
  'Curd',
  'Buffet plates',
  'Napkins',
  'Water bottle',
];

/*
 * What each variant adds on top of the base.
 *
 * 22 Oct 2026: the rice is named again rather than both boxes saying "Flavour
 * Rice". The hot snack and the vadiyalu moved into the base, because the
 * client added them to Classic too, so they no longer tell the boxes apart.
 */
export const VARIANT_EXTRAS = {
  [PREMIUM_PRICE]: ['Biryani', 'Veg Kurma', 'Raitha'],
  [CLASSIC_PRICE]: ['Pulihara'],
};

/*
 * The ₹99 box — "Rice Bowl" since October 2026, "Rice Box" before it. Orders
 * placed under the old name keep it; nothing matches on this string, the server
 * validates the box by its price.
 *
 * Pulihara was added when it stopped being the ₹179 box's headline item.
 */
export const RICE_VARIETIES = [
  'Avakaya Rice',
  'Gongura Rice',
  'Veg Biryani',
  'Pulihara',
  'Sambar Rice',
  'Curd Rice',
];

export const VARIANTS = [
  {
    price: PREMIUM_PRICE,
    name: 'Premium',
    blurb: 'Biryani with veg kurma and raitha',
  },
  {
    price: CLASSIC_PRICE,
    name: 'Classic',
    blurb: 'Pulihara with the full thali',
  },
  {
    price: RICE_PRICE,
    name: 'Rice Bowl',
    blurb: `A single rice, any mix of ${RICE_VARIETIES.length} varieties`,
  },
];

/* The label stored on the order, which the admin board and invoice display. */
export const variantLabel = (price) =>
  price === RICE_PRICE
    ? `Rice Bowl (${RICE_PRICE})`
    : price === PREMIUM_PRICE
      ? `Premium (${PREMIUM_PRICE})`
      : `Classic (${CLASSIC_PRICE})`;

export const boxContents = (price) =>
  price === RICE_PRICE
    ? RICE_VARIETIES
    : [...MEALBOX_BASE, ...(VARIANT_EXTRAS[price] || [])];

/*
 * The kitchen starts packing at noon, so an order for today is only possible
 * before then. Past noon the calendar opens at tomorrow rather than refusing
 * today's date after it has been picked — a date you cannot choose is clearer
 * than an error after you chose it.
 */
export const ORDER_START_HOUR = 12;

export const earliestMealBoxDate = (now = new Date()) => {
  const d = new Date(now);
  if (d.getHours() >= ORDER_START_HOUR) d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* Local date in YYYY-MM-DD. `toISOString` converts to UTC first, which in
   IST (+5:30) rolls the date back a day for anything before 05:30 — the
   calendar's floor would land on yesterday for an early-morning customer. */
export const isoDate = (d) => {
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

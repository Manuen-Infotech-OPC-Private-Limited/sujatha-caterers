/*
 * Pickles & powders catalogue — display mirror of service/provisions.js on the
 * server, which is the pricing authority. Ids must match it exactly; the server
 * re-prices every line from its own copy and rejects an id it does not know, so
 * a rename here alone turns into "Unknown item" at checkout.
 *
 * Weights are GRAMS throughout. The storefront sells in 0.5 kg steps and 0.5 in
 * floating point is how a total drifts a rupee away from the server's.
 */

/*
 * Rate and step, per kind.
 *
 * One pair of constants served both while they charged the same. The client
 * doubled powders on 22 Oct 2026 — ₹200 for 250g rather than 500g — and left
 * pickles alone. Mirrors PRICING in service/provisions.js.
 *
 * The step is also the minimum: a powder priced per 250g that could only be
 * bought in 500g lots would show a ₹400 minimum for one jar.
 */
export const PRICING = {
  pickle: { ratePerStep: 200, gramsPerStep: 500 },
  powder: { ratePerStep: 200, gramsPerStep: 250 },
};

export const rateFor = (kind) => PRICING[kind] || PRICING.pickle;

export const MAX_GRAMS_PER_ORDER = 100000; // 100 kg

export const CGST_PERCENT = 2.5;
export const SGST_PERCENT = 2.5;

export const CATALOGUE = [
  {
    kind: 'pickle',
    label: 'Pickles',
    blurb: 'Made in small batches, no preservatives.',
    items: [
      { id: 'avakaya', name: 'Avakaya (Mango)' },
      { id: 'gongura', name: 'Gongura' },
      { id: 'tomato', name: 'Tomato' },
      { id: 'lemon', name: 'Lemon' },
      { id: 'red-chilli', name: 'Red Chilli' },
    ],
  },
  {
    kind: 'powder',
    label: 'Powders',
    blurb: 'Dry roasted and ground to order.',
    items: [
      { id: 'kandi-podi', name: 'Kandi Podi' },
      { id: 'karivepaku-podi', name: 'Karivepaku Podi' },
      { id: 'nuvvula-podi', name: 'Nuvvula Podi' },
      { id: 'palli-podi', name: 'Palli Podi' },
      { id: 'idly-podi', name: 'Idly Podi' },
    ],
  },
];

/* Grams below a kilo, kilos above: powders sell in 250g steps since 22 Oct
   2026 and "0.25 kg" for a quarter kilo is both wrong-looking and harder to
   read than "250 g". */
export const formatKg = (grams) =>
  grams < 1000 ? `${grams} g` : `${grams / 1000} kg`;

/* Mirrors priceProvisionsOrder on the server, including the rounding: CGST and
   SGST are each rounded from the subtotal rather than halving one 5% figure. */
export function priceLines(lines) {
  const subTotal = lines.reduce((sum, l) => {
    const { ratePerStep, gramsPerStep } = rateFor(l.kind);
    return sum + (l.grams / gramsPerStep) * ratePerStep;
  }, 0);
  const cgst = Math.round(subTotal * (CGST_PERCENT / 100));
  const sgst = Math.round(subTotal * (SGST_PERCENT / 100));
  const totalGrams = lines.reduce((sum, l) => sum + l.grams, 0);

  return { subTotal, cgst, sgst, totalGrams, total: subTotal + cgst + sgst };
}

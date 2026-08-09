/*
 * Pickles & powders catalogue — display mirror of service/provisions.js on the
 * server, which is the pricing authority. Ids must match it exactly; the server
 * re-prices every line from its own copy and rejects an id it does not know, so
 * a rename here alone turns into "Unknown item" at checkout.
 *
 * Weights are GRAMS throughout. The storefront sells in 0.5 kg steps and 0.5 in
 * floating point is how a total drifts a rupee away from the server's.
 */

export const RATE_PER_500G = 200;
export const GRAMS_PER_STEP = 500;
export const MIN_GRAMS_PER_ITEM = 500;
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

export const formatKg = (grams) => `${grams / 1000} kg`;

/* Mirrors priceProvisionsOrder on the server, including the rounding: CGST and
   SGST are each rounded from the subtotal rather than halving one 5% figure. */
export function priceLines(lines) {
  const subTotal = lines.reduce(
    (sum, l) => sum + (l.grams / GRAMS_PER_STEP) * RATE_PER_500G,
    0
  );
  const cgst = Math.round(subTotal * (CGST_PERCENT / 100));
  const sgst = Math.round(subTotal * (SGST_PERCENT / 100));
  const totalGrams = lines.reduce((sum, l) => sum + l.grams, 0);

  return { subTotal, cgst, sgst, totalGrams, total: subTotal + cgst + sgst };
}

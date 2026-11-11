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
/*
 * The catalogue and its rates are fetched from GET /api/provisions since
 * 12 Nov 2026. They used to be hardcoded here, in the app and on the server
 * -- three copies, of which only the server's decided what a customer paid,
 * so a price changed in one disagreed silently with the other two.
 *
 * There is deliberately no hardcoded fallback. A standby list would quietly
 * reintroduce exactly the drift this removed, and would do it on the day the
 * client changed a price.
 */
export const rateFor = (catalogue, kind) => {
  const found = (catalogue || []).find((g) => g.kind === kind);
  if (found) return { ratePerStep: found.ratePerStep, gramsPerStep: found.gramsPerStep };
  const first = (catalogue || [])[0];
  return first
    ? { ratePerStep: first.ratePerStep, gramsPerStep: first.gramsPerStep }
    : { ratePerStep: 0, gramsPerStep: 1 };
};

/** Until the catalogue arrives, so a cap exists even then. */
export const DEFAULT_MAX_GRAMS_PER_ORDER = 100000; // 100 kg

/** Rows that cannot be sold are dropped: the server will not price them. */
export const catalogueFromJson = (json) =>
  (json?.categories || [])
    .filter(
      (c) =>
        c?.kind &&
        Number(c.ratePerStep) > 0 &&
        Number(c.gramsPerStep) > 0 &&
        (c.items || []).length > 0
    )
    .map((c) => ({
      kind: c.kind,
      label: c.label || c.kind,
      blurb: c.blurb || '',
      ratePerStep: Number(c.ratePerStep),
      gramsPerStep: Number(c.gramsPerStep),
      items: (c.items || []).filter((i) => i?.id && i?.name),
    }));

export const CGST_PERCENT = 2.5;
export const SGST_PERCENT = 2.5;


/* Grams below a kilo, kilos above: powders sell in 250g steps since 22 Oct
   2026 and "0.25 kg" for a quarter kilo is both wrong-looking and harder to
   read than "250 g". */
export const formatKg = (grams) =>
  grams < 1000 ? `${grams} g` : `${grams / 1000} kg`;

/* Mirrors priceProvisionsOrder on the server, including the rounding: CGST and
   SGST are each rounded from the subtotal rather than halving one 5% figure. */
export function priceLines(lines, catalogue) {
  const subTotal = lines.reduce((sum, l) => {
    const { ratePerStep, gramsPerStep } = rateFor(catalogue, l.kind);
    return sum + (l.grams / gramsPerStep) * ratePerStep;
  }, 0);
  const cgst = Math.round(subTotal * (CGST_PERCENT / 100));
  const sgst = Math.round(subTotal * (SGST_PERCENT / 100));
  const totalGrams = lines.reduce((sum, l) => sum + l.grams, 0);

  return { subTotal, cgst, sgst, totalGrams, total: subTotal + cgst + sgst };
}

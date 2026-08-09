/*
 * The three pickup points, per the client's April 2026 revision. This replaced
 * a five-entry list that included 'Taraka Rama Nagar - 10th Line' and 'Near SBI
 * Bank, Pattabhipuram'; both are gone, not merely reordered.
 *
 * Shared by the meal box flow and the pickles & powders storefront, which is
 * pickup-only. Keep this the single definition — a customer driving to a point
 * one screen offers and another does not is the failure this prevents.
 *
 * `id` is what gets stored on the order; the label is display text, so the
 * wording can be corrected later without orphaning existing orders.
 */
export const PICKUP_POINTS = [
  {
    id: 'main-kitchen',
    label: 'Sujatha Caterers Main Kitchen, Guntur',
  },
  {
    id: 'sujatha-convention',
    label: 'Sujatha Convention - Vidya Nagar Main Road',
  },
  {
    id: 'tanvika-function-hall',
    label: 'Tanvika Function Hall - Ala Hospital Backside',
  },
];

export const PICKUP_LABELS = PICKUP_POINTS.map((p) => p.label);

export const findPickupPoint = (idOrLabel) =>
  PICKUP_POINTS.find((p) => p.id === idOrLabel || p.label === idOrLabel) ?? null;

export default PICKUP_POINTS;

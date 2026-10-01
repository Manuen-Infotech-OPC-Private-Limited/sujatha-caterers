/*
 * Catering package keys and the names customers see.
 *
 * READ THIS BEFORE TOUCHING THE KEYS. The four keys below are stored on every
 * order ever placed, listed in the `packages` array of every menu item, and
 * used as map keys in utils/pricing.js, utils/cartRules.js and the server's
 * service/pricing.js. Renaming a key would orphan historical orders and make
 * the whole menu unavailable, so the client's October 2026 rename is applied
 * as a display label and nothing else.
 *
 * The trap this creates, spelled out because it will catch someone: the word
 * "Premium" now means two different tiers depending on which side of the map
 * you are on. Key `Premium` shows as "Grand Feast"; it is key `Luxury` that
 * shows as "Premium Feast". Never infer one from the other.
 *
 * Meal box variants are a separate naming scheme that happens to reuse two of
 * these words — "Classic (179)" and "Premium (199)" are boxes, not packages,
 * and the client did not rename them. See data/mealBox.js.
 */
export const PACKAGE_KEYS = ['Basic', 'Classic', 'Premium', 'Luxury'];

export const PACKAGE_LABELS = {
  Basic: 'Basic Feast',
  Classic: 'Classic Feast',
  Premium: 'Grand Feast',
  Luxury: 'Premium Feast',
};

/* Falls back to the key rather than to an empty string: an unknown package is
   a bug worth seeing in the UI, not a blank where a tier name should be. */
export const packageLabel = (key) => PACKAGE_LABELS[key] || key || '';

export default PACKAGE_LABELS;

/*
 * Menu categories arrive from the API as compact keys ("flavoredrice",
 * "HotSnacks"). The old display did `category.replace(/([A-Z])/g, ' $1')`,
 * which does nothing at all for the all-lowercase keys.
 *
 * Known keys mirror the category names in utils/cartRules.js.
 */
const KNOWN_LABELS = {
  hotsnacks: 'Hot Snacks',
  indianbreads: 'Indian Breads',
  flavoredrice: 'Flavoured Rice',
  flavouredrice: 'Flavoured Rice',
  northindian: 'North Indian',
  southindian: 'South Indian',
  icecreams: 'Ice Creams',
  mysorebonda: 'Mysore Bonda',
  complimentary: 'Complimentary',
  sweets: 'Sweets',
  pickles: 'Pickles',
  powders: 'Powders',
  fries: 'Fries',
  paan: 'Paan',
  idly: 'Idly',
  vada: 'Vada',
  upma: 'Upma',
  pongal: 'Pongal',
  dosa: 'Dosa',
};

export const formatCategory = (key = '') => {
  const compact = key.replace(/[\s_-]/g, '').toLowerCase();
  if (KNOWN_LABELS[compact]) return KNOWN_LABELS[compact];

  // Fall back to splitting camelCase / snake_case and title-casing.
  return key
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .trim()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

export default formatCategory;

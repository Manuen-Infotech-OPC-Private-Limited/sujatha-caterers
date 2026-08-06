/*
 * Where we actually deliver.
 *
 * The client caters around Guntur. These two constants are the business rule
 * and are shown to customers ("Catering runs across 522001 - 522663"), so they
 * must stay honest.
 *
 * 500084 and 500085 used to sit inside them — a developer's own Hyderabad
 * pincode, added because a browser cannot have its location faked the way an
 * emulator can, so the site was otherwise untestable from outside the service
 * area. Shipped, that let roughly 22,000 addresses order catering nobody could
 * deliver. They now live in DEV_TEST_PINCODES below, which is empty in a
 * production build.
 */
export const CATERING_PINCODE_RANGE = [522001, 522663];

export const MEALBOX_ALLOWED_PINCODES = [
  '522001', '522002', '522003', '522004', '522005',
  '522006', '522007', '522017', '522034', '522509',
];

/*
 * Testing convenience, development only.
 *
 * import.meta.env.DEV is true under `vite dev` and false in any built bundle,
 * so the literal below is dropped at build time rather than merely ignored.
 */
const DEV_TEST_PINCODES = import.meta.env.DEV ? ['500084', '500085'] : [];

export const checkCateringServiceable = (pincode) => {
  if (!pincode) return false;
  if (DEV_TEST_PINCODES.includes(String(pincode))) return true;

  const code = parseInt(pincode, 10);
  if (isNaN(code)) return false;
  return code >= CATERING_PINCODE_RANGE[0] && code <= CATERING_PINCODE_RANGE[1];
};

export const checkMealboxServiceable = (pincode) => {
  if (!pincode) return false;
  const code = String(pincode);
  return (
    MEALBOX_ALLOWED_PINCODES.includes(code) || DEV_TEST_PINCODES.includes(code)
  );
};

export const CATERING_PINCODE_RANGE = [500084, 522663];
export const MEALBOX_ALLOWED_PINCODES = [
  '522001', '522002', '522003', '522004', '522005',
  '522006', '522007', '522017', '522034', '522509',
  '500085','500084'
];

export const checkCateringServiceable = (pincode) => {
  if (!pincode) return false;
  const code = parseInt(pincode, 10);
  if (isNaN(code)) return false;
  return code >= CATERING_PINCODE_RANGE[0] && code <= CATERING_PINCODE_RANGE[1];
};

export const checkMealboxServiceable = (pincode) => {
  if (!pincode) return false;
  return MEALBOX_ALLOWED_PINCODES.includes(pincode.toString());
};

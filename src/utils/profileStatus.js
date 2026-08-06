/*
 * Whether an account has the details we need before it can order.
 *
 * The backend creates the User record the moment a phone number is verified,
 * before the name and email are collected. So a customer who stops at that
 * point leaves a record behind with nothing but a phone number.
 *
 * Login used to navigate to '/' unconditionally after verifying the code, with
 * no check at all — registration was a separate link the customer had to find
 * for themselves. A brand-new user therefore landed on the home page with an
 * unfinished account and nothing telling them so, and their orders go out
 * addressed to "Customer".
 */
export const isProfileComplete = (user) => {
  if (!user) return false;
  const name = String(user.name ?? '').trim();
  const email = String(user.email ?? '').trim();
  return name !== '' && email !== '';
};

export default isProfileComplete;

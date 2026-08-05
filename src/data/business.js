/*
 * Single source for the business's public contact details.
 *
 * The invoice template carried placeholders (info@sujathacaterers.com and
 * +91-9123456789) that never matched the real numbers shown on the contact
 * page and footer, so customers were receiving invoices with an unreachable
 * phone number. Import from here rather than retyping.
 */
export const BUSINESS = {
  name: 'Sujatha Caterers',
  phone: '+91 97035 05356',
  phoneHref: 'tel:+919703505356',
  email: 'sujathameals@gmail.com',
  whatsapp: 'https://wa.me/919703505356',
  address:
    'Opposite Meenakshi Palms, Tarakarama Nagar, Srinivasa Nagar Colony, Guntur — 522006',
};

export default BUSINESS;

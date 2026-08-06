import React, { useState, useEffect } from 'react';
import mealBoxImg from '../assets/logos/new_mealbox.png';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../utils/AuthContext'; // ✅ get logged-in user
import { useLocation } from '../utils/LocationContext';
import { checkMealboxServiceable } from '../utils/serviceability';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import Spinner from '../components/ui/Spinner';
import SavedAddressPicker from '../components/SavedAddressPicker';

const PICKUP_LOCATIONS = [
  'Taraka Rama Nagar - 10th Line',
  'Tanvika Function Hall - Ala Hospital Backside',
  'Sujatha Convention - Vidya Nagar Main Road',
  'Near SBI Bank, Pattabhipuram',
  'Sujatha Caterers Main Kitchen, Guntur',
];

const VARIANTS = [
  { price: 199, name: 'Premium', blurb: 'Includes Veg Biryani, Kurma and Raita' },
  { price: 179, name: 'Classic', blurb: 'Replaces Biryani with Pulihora' },
];

const selectClass =
  'w-full rounded-xl border-2 border-sand-300 bg-white px-4 py-3.5 text-[1.0625rem] text-sand-900 outline-none transition-all duration-200 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

const Gate = ({ children }) => (
  <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center sm:px-8">
    {children}
  </div>
);

const MealBox = () => {
  const { user } = useAuthContext(); // ✅ get logged-in user

  const [selectedVariant, setSelectedVariant] = useState(199);
  const [deliveryMode, setDeliveryMode] = useState('pickup'); // 'pickup' | 'door'

  const TAX_RATE = 0.025; // 2.5% CGST + 2.5% SGST = 5% Total
  const MIN_QTY = 1;
  const MAX_QTY = 15;

  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(MIN_QTY);
  const [loading, setLoading] = useState(false);

  const {
    isMealboxServiceable,
    isLoading: loadingLocation,
    requestLocation,
    permissionDenied,
    pincode,
  } = useLocation();

  // Request location on mount
  useEffect(() => {
    if (!pincode && !permissionDenied) {
      requestLocation();
    }
  }, [pincode, permissionDenied, requestLocation]);

  const [deliveryDate, setDeliveryDate] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState(null);

  const useSavedAddress = (a) => {
    setSelectedAddressId(a._id);
    setDeliveryLocation((prev) => ({
      ...prev,
      address: a.address || '',
      landmark: a.landmark || '',
      city: a.city || '',
      pincode: a.pincode || '',
    }));
  };

  const [deliveryLocation, setDeliveryLocation] = useState({
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  });

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  useEffect(() => {
    if (user && deliveryMode === 'door') {
      setDeliveryLocation((prev) => ({
        ...prev,
        address: user.address || '',
        pincode: pincode || prev.pincode || '',
      }));
    } else if (deliveryMode === 'pickup') {
      setDeliveryLocation({
        address: PICKUP_LOCATIONS[0],
        landmark: 'Pickup Point',
        city: 'Guntur',
        pincode: '522001',
      });
    }
  }, [user, deliveryMode, pincode]);

  // Variant Menu Logic
  const baseItems = [
    'Sweet', 'Veg Roll',
    'Tomato Pappu', 'Fry', 'Curry', 'Rice', 'Ghee',
    'Pickle', 'Papad', 'Sambar', 'Curd', 'Salt', 'Water', 'Napkins',
  ];

  const variantItems = selectedVariant === 199
    ? ['Veg Biryani', 'Veg Kurma', 'Raitha']
    : ['Pulihora']; // 179 Variant replaces Biryani/Kurma/Raita with Pulihora

  const menuItems = [...baseItems, ...variantItems];

  const increment = () => quantity < MAX_QTY && setQuantity((q) => q + 1);
  const decrement = () => quantity > MIN_QTY && setQuantity((q) => q - 1);

  const subTotal = selectedVariant * quantity;
  const cgst = Math.round(subTotal * TAX_RATE);
  const sgst = Math.round(subTotal * TAX_RATE);
  const totalPrice = subTotal + cgst + sgst;

  const sendBrowserNotification = (title, body) => {
    if (!('Notification' in window)) return;

    try {
      if (Notification.permission === 'granted') {
        new Notification(title, { body, icon: '/logo192.png' });
      }
    } catch (e) {
      console.warn('Notification API failed:', e);
    }
  };

  // --------------------------------------------------
  // PAYMENT + ORDER
  // --------------------------------------------------
  const handleOrder = async () => {
    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    const selectedDate = new Date(deliveryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    if (selectedDate < now) {
      toast.error('Delivery date cannot be in the past');
      return;
    }

    if (deliveryMode === 'door') {
      if (!deliveryLocation.address) {
        toast.error('Please enter delivery address');
        return;
      }
      if (!deliveryLocation.city) {
        toast.error('Please enter city');
        return;
      }
      if (!/^\d{6}$/.test(deliveryLocation.pincode)) {
        toast.error('Please enter a valid 6-digit pincode');
        return;
      }
      // The mount-time gate only checks where the *browser* is. A typed
      // delivery pincode could still be outside the meal-box area.
      if (!checkMealboxServiceable(deliveryLocation.pincode)) {
        toast.error(
          `We don't deliver meal boxes to ${deliveryLocation.pincode} yet. Try pickup instead.`
        );
        return;
      }
    }

    setLoading(true);

    try {
      const res = await fetch(`${API}/api/payments/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: totalPrice }),
      });

      const data = await res.json();
      if (!data?.orderId) throw new Error();

      const options = {
        key: data.key,
        amount: data.amount,
        currency: 'INR',
        name: 'Sujatha Caterers',
        description: 'South Indian Veg Meal Box',
        order_id: data.orderId,
        theme: { color: '#e63946' },

        // ✅ SUCCESS
        handler: async (response) => {
          sendBrowserNotification(
            'Sujatha Caterers • Payment Successful',
            `Your payment of ₹${totalPrice} was completed successfully.`
          );
          await placeMealBoxOrder(response, data.orderId);
        },

        // ❌ PAYMENT FAILED
        modal: {
          ondismiss: () => {
            sendBrowserNotification(
              'Sujatha Caterers • Payment Cancelled',
              'You closed the payment window. You can retry anytime.'
            );
            toast.info('Payment cancelled. You can try again.');
            setLoading(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on('payment.failed', (response) => {
        sendBrowserNotification(
          'Sujatha Caterers • Payment Failed',
          response.error?.description || 'Payment could not be completed. Please try again.'
        );
        console.error('Payment failed:', response);
        toast.error(response.error?.description || 'Payment failed');
        setLoading(false);
      });

      razorpay.open();
    } catch (err) {
      console.error(err);
      toast.error('Payment initiation failed');
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // FINALIZE ORDER
  // --------------------------------------------------
  const placeMealBoxOrder = async (paymentResponse, razorpayOrderId) => {
    try {
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderType: 'mealbox',
          mealBox: {
            quantity,
            pricePerBox: selectedVariant,
            items: menuItems,
            taxes: { cgst, sgst },
            variant: selectedVariant === 199 ? 'Premium (199)' : 'Classic (179)',
            deliveryMode,
          },
          deliveryDate, // ✅ Send delivery date
          deliveryLocation, // ✅ Send full delivery location
          payment: {
            orderId: razorpayOrderId,
            paymentId: paymentResponse.razorpay_payment_id,
            signature: paymentResponse.razorpay_signature,
            amount: totalPrice,
          },
        }),
      });

      if (!res.ok) throw new Error();
      setTimeout(() => {
        navigate('/');
      }, 500);
      toast.success('Meal Box order placed successfully!');
    } catch (err) {
      console.error(err);
      toast.error('Order placement failed');
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- gates ---------------- */

  if (loadingLocation) {
    return (
      <PageShell>
        <Gate>
          <span className="text-brand-500">
            <Spinner className="h-8 w-8" />
          </span>
          <h1 className="mt-5 font-display text-3xl text-sand-900">Checking your area</h1>
          <p className="mt-2 text-[1.0625rem] text-sand-600">
            We're confirming that we deliver meal boxes to your location.
          </p>
        </Gate>
      </PageShell>
    );
  }

  if (permissionDenied || (pincode && !isMealboxServiceable)) {
    return (
      <PageShell>
        <Gate>
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-saffron-50 text-saffron-700">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
          </span>

          <h1 className="mt-5 font-display text-3xl text-sand-900">
            {permissionDenied ? 'Location needed' : 'Outside our delivery area'}
          </h1>

          <p className="mt-3 text-[1.0625rem] leading-relaxed text-sand-600">
            {permissionDenied
              ? 'We use your location to check whether meal boxes reach your area. Nothing is stored.'
              : `We don't deliver meal boxes to pincode ${pincode} yet.`}
          </p>

          {permissionDenied && (
            <Button className="mt-7 sm:w-auto sm:px-7" onClick={requestLocation}>
              Allow location access
            </Button>
          )}

          <p className="mt-8 border-t border-sand-200 pt-5 text-[0.9375rem] text-sand-600">
            Think this is wrong? Call us on{' '}
            <a href="tel:+919703505356" className="font-semibold text-brand-600 underline-offset-4 hover:underline">
              +91 97035 05356
            </a>
            .
          </p>
        </Gate>
      </PageShell>
    );
  }

  /* ---------------- page ---------------- */

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-10">
          {/* ---------- product ---------- */}
          <div className="min-w-0">
            <div className="overflow-hidden rounded-3xl border border-sand-200 bg-white shadow-card">
              <img
                src={mealBoxImg}
                alt="South Indian veg meal box"
                className="aspect-[16/10] w-full object-cover"
              />
            </div>

            <h1 className="mt-7 font-display text-4xl text-sand-900 sm:text-5xl">
              South Indian Veg Meal Box
            </h1>
            <p className="mt-3 max-w-xl text-[1.0625rem] leading-relaxed text-sand-600">
              An authentic South Indian vegetarian meal made with fresh
              ingredients — ideal for office lunches, poojas and small events.
            </p>

            {/* variant */}
            <fieldset className="mt-8">
              <legend className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
                Choose your box
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {VARIANTS.map((v) => (
                  <label
                    key={v.price}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                      selectedVariant === v.price
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-sand-200 bg-white hover:border-sand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="variant"
                      value={v.price}
                      checked={selectedVariant === v.price}
                      onChange={() => setSelectedVariant(v.price)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-sand-900">
                        {v.name} · ₹{v.price}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-sand-600">
                        {v.blurb}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* contents */}
            <div className="mt-8">
              <h2 className="font-display text-2xl text-sand-900">What's inside</h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {menuItems.map((item) => (
                  <li
                    key={item}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                      variantItems.includes(item)
                        ? 'border-saffron-300 bg-saffron-50 text-saffron-700'
                        : 'border-sand-200 bg-white text-sand-700'
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.9375rem] text-sand-600">
                <strong className="font-semibold text-sand-900">Note:</strong> fry
                and curry items vary daily.
              </p>
            </div>
          </div>

          {/* ---------- order card ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl text-sand-900">Your order</h2>

              {/* quantity */}
              <div className="mt-5">
                <p className="mb-2 text-sm font-semibold text-sand-800">Boxes</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={decrement}
                    disabled={quantity === MIN_QTY}
                    aria-label="Decrease quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-sand-300 text-xl font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    −
                  </button>
                  <span className="w-12 text-center font-display text-2xl tabular-nums text-sand-900">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={increment}
                    disabled={quantity === MAX_QTY}
                    aria-label="Increase quantity"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-sand-300 text-xl font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    +
                  </button>
                  <span className="ml-auto text-sm text-sand-500">max {MAX_QTY}</span>
                </div>
              </div>

              <div className="mt-5">
                <Field
                  id="mealbox-date"
                  label="Delivery date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              {/* delivery mode */}
              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold text-sand-800">
                  How would you like it?
                </legend>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: 'pickup', label: 'Pickup', note: 'Free' },
                    { value: 'door', label: 'Door delivery', note: 'Via Rapido' },
                  ].map((m) => (
                    <label
                      key={m.value}
                      className={`cursor-pointer rounded-xl border-2 px-3 py-2.5 text-center transition-all duration-200 ${
                        deliveryMode === m.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-sand-200 bg-white hover:border-sand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="deliveryMode"
                        value={m.value}
                        checked={deliveryMode === m.value}
                        onChange={() => setDeliveryMode(m.value)}
                        className="sr-only"
                      />
                      <span className="block text-[0.9375rem] font-semibold text-sand-900">
                        {m.label}
                      </span>
                      <span className="block text-xs text-sand-500">{m.note}</span>
                    </label>
                  ))}
                </div>
              </fieldset>

              {/* location */}
              {deliveryMode === 'pickup' ? (
                <div className="mt-5">
                  <label
                    htmlFor="pickup-location"
                    className="mb-2 block text-sm font-semibold text-sand-800"
                  >
                    Pickup point
                  </label>
                  <select
                    id="pickup-location"
                    value={deliveryLocation.address}
                    onChange={(e) =>
                      setDeliveryLocation({
                        ...deliveryLocation,
                        address: e.target.value,
                        landmark: 'Pickup Point',
                        city: 'Guntur',
                      })
                    }
                    className={selectClass}
                  >
                    {PICKUP_LOCATIONS.map((loc) => (
                      <option key={loc} value={loc}>
                        {loc}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="mt-5 space-y-4">
                  <p className="rounded-xl border border-saffron-300/60 bg-saffron-50 px-3.5 py-3 text-sm leading-relaxed text-saffron-700">
                    Delivered via Rapido Parcel.{' '}
                    <strong className="font-semibold">
                      Delivery charges are paid directly to the rider
                    </strong>{' '}
                    and are not included below.
                  </p>

                  {/* Same gap as the catering checkout: saved addresses
                      existed and were never offered here. */}
                  <SavedAddressPicker
                    api={API}
                    selectedId={selectedAddressId}
                    onSelect={useSavedAddress}
                  />
                  <Field
                    id="mb-address"
                    label="Full address"
                    placeholder="House no, street, area"
                    autoComplete="street-address"
                    value={deliveryLocation.address}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, address: e.target.value })
                    }
                  />
                  <Field
                    id="mb-landmark"
                    label="Landmark"
                    placeholder="Nearby landmark"
                    hint="Optional"
                    value={deliveryLocation.landmark}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, landmark: e.target.value })
                    }
                  />
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field
                      id="mb-city"
                      label="City"
                      placeholder="Guntur"
                      value={deliveryLocation.city}
                      onChange={(e) =>
                        setDeliveryLocation({ ...deliveryLocation, city: e.target.value })
                      }
                    />
                    <Field
                      id="mb-pincode"
                      label="Pincode"
                      type="tel"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="522006"
                      value={deliveryLocation.pincode}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, '');
                        if (val.length <= 6) {
                          setDeliveryLocation({ ...deliveryLocation, pincode: val });
                        }
                      }}
                      error={
                        deliveryLocation.pincode.length === 6 &&
                        !checkMealboxServiceable(deliveryLocation.pincode)
                          ? "We don't deliver here yet — try pickup."
                          : undefined
                      }
                    />
                  </div>
                </div>
              )}

              {/* price */}
              <dl className="mt-6 space-y-2 border-t border-sand-200 pt-5 text-[0.9375rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">
                    ₹{selectedVariant} × {quantity}
                  </dt>
                  <dd className="font-medium tabular-nums text-sand-900">₹{subTotal}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">CGST (2.5%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{cgst}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">SGST (2.5%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{sgst}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-sand-200 pt-3">
                  <dt className="font-semibold text-sand-900">Total</dt>
                  <dd className="font-display text-2xl tabular-nums text-brand-600">
                    ₹{totalPrice}
                  </dd>
                </div>
              </dl>

              <Button
                className="mt-5"
                onClick={handleOrder}
                loading={loading}
                loadingText="Processing…"
              >
                Pay ₹{totalPrice}
              </Button>

              <p className="mt-3 text-center text-sm text-sand-500">
                Secure payment via Razorpay
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
};

export default MealBox;

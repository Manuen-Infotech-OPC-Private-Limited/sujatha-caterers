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
import { PICKUP_LABELS } from '../utils/pickupPoints';
import {
  VARIANTS,
  RICE_VARIETIES,
  RICE_PRICE,
  PACKING_TYPES,
  DEFAULT_PACKING,
  VARIANT_EXTRAS,
  boxContents,
  variantLabel,
  packingSurcharge,
  earliestMealBoxDate,
  isoDate,
  ORDER_START_HOUR,
} from '../data/mealBox';

/*
 * The ₹99 rice bowl is ordered by variety rather than as one count: ten bowls
 * can be ten of one rice, or any mix that sums to ten. The cap is on the total,
 * not per variety, which is why quantity for this box is a map and not a
 * number.
 */
const MIN_RICE_BOXES = 1;
const MAX_RICE_BOXES = 10;

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
  const [packingType, setPackingType] = useState(DEFAULT_PACKING);
  const [deliveryMode, setDeliveryMode] = useState('pickup'); // 'pickup' | 'door'

  const TAX_RATE = 0.025; // 2.5% CGST + 2.5% SGST = 5% Total
  const MIN_QTY = 1;
  const MAX_QTY = 15;

  const API = process.env.REACT_APP_API_URL;
  const navigate = useNavigate();

  const [quantity, setQuantity] = useState(MIN_QTY);
  // variety -> count, for the ₹99 rice box only.
  const [riceQty, setRiceQty] = useState({});
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

  /*
   * Ordering for today closes at noon, when the kitchen starts packing. After
   * that the calendar's floor is tomorrow — the date is removed rather than
   * rejected on submit, because a customer who can pick today and is then told
   * no has been misled by the control they were given.
   */
  const earliest = earliestMealBoxDate();
  const minDate = isoDate(earliest);
  const maxDateObj = new Date(earliest);
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = isoDate(maxDateObj);
  const closedForToday = new Date().getHours() >= ORDER_START_HOUR;

  useEffect(() => {
    if (user && deliveryMode === 'door') {
      setDeliveryLocation((prev) => ({
        ...prev,
        address: user.address || '',
        pincode: pincode || prev.pincode || '',
      }));
    } else if (deliveryMode === 'pickup') {
      setDeliveryLocation({
        address: PICKUP_LABELS[0],
        landmark: 'Pickup Point',
        city: 'Guntur',
        pincode: '522001',
      });
    }
  }, [user, deliveryMode, pincode]);

  /*
   * "Raita (or) kurma" and "Flavour Rice" are each one item, not a choice the
   * customer makes — the kitchen sends whichever suits the day. Neither is a
   * selectable option: adding one would mean a field to validate server-side
   * and a promise the kitchen has not made.
   *
   * The lists themselves live in data/mealBox.js, which Services.jsx reads too.
   */
  const isRiceBox = selectedVariant === RICE_PRICE;

  const variantItems = VARIANT_EXTRAS[selectedVariant] || [];
  const menuItems = boxContents(selectedVariant);

  const riceTotal = RICE_VARIETIES.reduce((sum, v) => sum + (riceQty[v] || 0), 0);

  /* One count drives pricing regardless of which box is selected; for rice it is
     the sum across varieties. */
  const effectiveQty = isRiceBox ? riceTotal : quantity;

  const setRiceVariety = (variety, next) => {
    const clamped = Math.max(0, next);
    const others = riceTotal - (riceQty[variety] || 0);
    if (others + clamped > MAX_RICE_BOXES) return; // cap is on the total
    setRiceQty((prev) => ({ ...prev, [variety]: clamped }));
  };

  const increment = () => quantity < MAX_QTY && setQuantity((q) => q + 1);
  const decrement = () => quantity > MIN_QTY && setQuantity((q) => q - 1);

  /* Packing is charged per box, not per order — every box needs its own
     container. The server recomputes this the same way; the two must agree or
     the payment is captured and then refused. */
  const packingExtra = packingSurcharge(packingType);
  const subTotal = (selectedVariant + packingExtra) * effectiveQty;
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
    if (isRiceBox && riceTotal < MIN_RICE_BOXES) {
      toast.error('Choose at least one rice bowl');
      return;
    }

    if (!deliveryDate) {
      toast.error('Please select a delivery date');
      return;
    }

    /* Checked against the noon floor rather than against midnight, so a page
       left open across 12 o'clock cannot post a date it offered an hour ago. */
    const selectedDate = new Date(deliveryDate);
    selectedDate.setHours(0, 0, 0, 0);

    if (selectedDate < earliestMealBoxDate()) {
      toast.error(
        // Read fresh, not from the render-time flag: a page left open across
        // noon would otherwise explain the refusal with the wrong reason.
        new Date().getHours() >= ORDER_START_HOUR
          ? 'Orders for today closed at 12 noon — please choose tomorrow or later.'
          : 'Delivery date cannot be in the past'
      );
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
        // Identifies the client on the order. The app already sends "mobile";
        // web says so explicitly rather than being inferred from the header's
        // absence, which would mislabel any future client as web.
        headers: { 'Content-Type': 'application/json', 'x-client-type': 'web' },
        credentials: 'include',
        body: JSON.stringify({
          orderType: 'mealbox',
          // The browser's own pincode, not the delivery address. A pickup
          // order puts the pickup point in deliveryLocation, whose pincode is
          // ours, so without this it carries no trace of where it was placed
          // from. Omitted when location was declined — an absent field is
          // honest, a blank string is not.
          ...(pincode ? { orderedFromPincode: pincode } : {}),
          mealBox: {
            quantity: effectiveQty,
            pricePerBox: selectedVariant,
            packingType,
            // For rice, the kitchen needs the per-variety split, not a total of
            // ten unnamed boxes. `items` stays a flat list for the existing
            // invoice and admin views; `varieties` carries the breakdown.
            items: isRiceBox
              ? RICE_VARIETIES.filter((v) => riceQty[v] > 0).map(
                  (v) => `${v} x${riceQty[v]}`
                )
              : menuItems,
            ...(isRiceBox && {
              varieties: RICE_VARIETIES.filter((v) => riceQty[v] > 0).map((v) => ({
                name: v,
                quantity: riceQty[v],
              })),
            }),
            taxes: { cgst, sgst },
            variant: variantLabel(selectedVariant),
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
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
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

            {/* packing */}
            <fieldset className="mt-8">
              <legend className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
                Packing
              </legend>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {PACKING_TYPES.map((pk) => (
                  <label
                    key={pk.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                      packingType === pk.id
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-sand-200 bg-white hover:border-sand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="packingType"
                      value={pk.id}
                      checked={packingType === pk.id}
                      onChange={() => setPackingType(pk.id)}
                      className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
                    />
                    <span className="min-w-0">
                      <span className="block font-semibold text-sand-900">
                        {pk.label}
                        {pk.surcharge > 0 && (
                          <span className="ml-1 font-normal text-brand-600">
                            +₹{pk.surcharge} a box
                          </span>
                        )}
                      </span>
                      <span className="mt-0.5 block text-sm leading-snug text-sand-600">
                        {pk.sub}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>

            {/* contents */}
            <div className="mt-8">
              <h2 className="font-display text-2xl text-sand-900">
                {isRiceBox ? 'Available varieties' : "What's inside"}
              </h2>
              <ul className="mt-3 flex flex-wrap gap-2">
                {menuItems.map((item) => (
                  <li
                    key={item}
                    className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
                      (isRiceBox ? riceQty[item] > 0 : variantItems.includes(item))
                        ? 'border-saffron-300 bg-saffron-50 text-saffron-700'
                        : 'border-sand-200 bg-white text-sand-700'
                    }`}
                  >
                    {item}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-[0.9375rem] text-sand-600">
                <strong className="font-semibold text-sand-900">Note:</strong>{' '}
                {isRiceBox
                  ? `Mix as you like — up to ${MAX_RICE_BOXES} boxes in total.`
                  : 'fry and curry items vary daily.'}
              </p>
            </div>
          </div>

          {/* ---------- order card ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl text-sand-900">Your order</h2>

              {/* quantity — one stepper per variety for the rice box, since its
                  cap applies to the total across varieties rather than to each */}
              {isRiceBox ? (
                <div className="mt-5">
                  <div className="mb-2 flex items-baseline justify-between gap-2">
                    <p className="text-sm font-semibold text-sand-800">Rice bowls</p>
                    <p className="text-sm tabular-nums text-sand-500">
                      {riceTotal} of {MAX_RICE_BOXES}
                    </p>
                  </div>

                  <ul className="space-y-2">
                    {RICE_VARIETIES.map((variety) => {
                      const count = riceQty[variety] || 0;
                      return (
                        <li
                          key={variety}
                          className={`flex items-center gap-2 rounded-xl border-2 px-3 py-2 transition-colors ${
                            count > 0
                              ? 'border-brand-300 bg-brand-50'
                              : 'border-sand-200 bg-white'
                          }`}
                        >
                          <span className="min-w-0 flex-1 truncate text-[0.9375rem] text-sand-800">
                            {variety}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRiceVariety(variety, count - 1)}
                            disabled={count === 0}
                            aria-label={`Fewer ${variety}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-sand-300 text-lg font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-7 text-center font-display text-lg tabular-nums text-sand-900">
                            {count}
                          </span>
                          <button
                            type="button"
                            onClick={() => setRiceVariety(variety, count + 1)}
                            disabled={riceTotal >= MAX_RICE_BOXES}
                            aria-label={`More ${variety}`}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border-2 border-sand-300 text-lg font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  {riceTotal >= MAX_RICE_BOXES && (
                    <p className="mt-2 text-sm text-sand-500">
                      That's the maximum of {MAX_RICE_BOXES} bowls per order.
                    </p>
                  )}
                </div>
              ) : (
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
              )}

              <div className="mt-5">
                <Field
                  id="mealbox-date"
                  label="Delivery date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  hint={
                    closedForToday
                      ? "Today's orders closed at 12 noon — the earliest is tomorrow."
                      : 'Orders for today close at 12 noon.'
                  }
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
                    {PICKUP_LABELS.map((loc) => (
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
                    ₹{selectedVariant} × {effectiveQty}
                  </dt>
                  <dd className="font-medium tabular-nums text-sand-900">
                    ₹{selectedVariant * effectiveQty}
                  </dd>
                </div>
                {packingExtra > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-sand-600">
                      Bio-degradable packing · ₹{packingExtra} × {effectiveQty}
                    </dt>
                    <dd className="font-medium tabular-nums text-sand-900">
                      ₹{packingExtra * effectiveQty}
                    </dd>
                  </div>
                )}
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
                disabled={effectiveQty < 1}
              >
                {effectiveQty < 1 ? 'Choose a rice bowl' : `Pay ₹${totalPrice}`}
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

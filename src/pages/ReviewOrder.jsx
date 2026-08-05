import React, { useState, useEffect } from 'react';
import { useCart } from '../utils/cartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { PRICES } from '../utils/pricing';
import { toast } from 'react-toastify';
import { formatCategory } from '../utils/categoryLabels';
import OrderPlacedAnimation from '../components/OrderPlacedAnimation';
import soundSuccess from '../assets/sounds/order-placed.mp3';
import useAuth from '../hooks/useAuth';
import { checkCateringServiceable, CATERING_PINCODE_RANGE } from '../utils/serviceability';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';

const CGST_PERCENT = 2.5;
const SGST_PERCENT = 2.5;
const PLATFORM_CHARGE = 15;
const MIN_GUESTS = 30;

const Section = ({ step, title, sub, children }) => (
  <section className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card sm:p-7">
    <div className="flex items-start gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 font-display text-[0.9375rem] text-white">
        {step}
      </span>
      <div>
        <h2 className="font-display text-2xl leading-tight text-sand-900">{title}</h2>
        {sub && <p className="mt-1 text-[0.9375rem] text-sand-600">{sub}</p>}
      </div>
    </div>
    <div className="mt-5">{children}</div>
  </section>
);

const ReviewOrder = () => {
  const { cart, resetCart } = useCart();
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth(); // ✅ get logged-in user

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [selectedMealType, setSelectedMealType] = useState(null);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [guests, setGuests] = useState(MIN_GUESTS);
  const [complimentaryItems, setComplimentaryItems] = useState([]);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [deliveryLocation, setDeliveryLocation] = useState({
    address: '',
    landmark: '',
    city: '',
    pincode: '',
  });

  const [paymentOption, setPaymentOption] = useState(100);
  const [loadingPayment, setLoadingPayment] = useState(false);

  const API = process.env.REACT_APP_API_URL;
  const today = new Date();
  const minDate = today.toISOString().split('T')[0];

  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  // 🔔 Send system notification
  const sendOrderPlacedNotification = () => {
    if (!('Notification' in window)) return;

    if (Notification.permission === 'granted') {
      // Try using Service Worker (required for Android Chrome)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready
          .then((registration) => {
            registration.showNotification('Sujatha Caterers • Order Placed', {
              body: 'Thank you! Your order has been placed successfully.',
              icon: '/logo192.png',
            });
          })
          .catch((err) => {
            console.warn('ServiceWorker notification failed:', err);
            try {
              new Notification('Sujatha Caterers • Order Placed', {
                body: 'Thank you! Your order has been placed successfully.',
                icon: '/logo192.png',
              });
            } catch (e) {
              console.warn('Notification API failed:', e);
            }
          });
      } else {
        try {
          new Notification('Sujatha Caterers • Order Placed', {
            body: 'Thank you! Your order has been placed successfully.',
            icon: '/logo192.png',
          });
        } catch (e) {
          console.warn('Notification API failed:', e);
        }
      }
    }
  };

  useEffect(() => {
    if (user) {
      setDeliveryLocation((prev) => ({
        ...prev,
        address: user.address || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (location.state?.selectedPackage && location.state?.selectedMealType) {
      setSelectedPackage(location.state.selectedPackage);
      setSelectedMealType(location.state.selectedMealType);
      setComplimentaryItems(location.state.complimentaryItems || []);
    } else {
      navigate('/', { replace: true });
    }
  }, [location.state, navigate]);

  if (!selectedPackage || !selectedMealType) return null;

  const pricePerPerson = PRICES[selectedMealType]?.[selectedPackage] || 0;
  const total = guests && guests >= MIN_GUESTS ? guests * pricePerPerson : 0;

  const cgstAmount = Math.round((total * CGST_PERCENT) / 100);
  const sgstAmount = Math.round((total * SGST_PERCENT) / 100);
  const totalGst = cgstAmount + sgstAmount;

  const finalAmount = total + totalGst + PLATFORM_CHARGE;
  const payableNow = Math.round((finalAmount * paymentOption) / 100);

  const dishCount =
    Object.values(cart).reduce((n, items) => n + items.length, 0) + complimentaryItems.length;

  // ---------------- PAYMENT ----------------
  const handlePayAndPlaceOrder = async () => {
    if (!guests || guests < MIN_GUESTS) {
      toast.error(`Minimum ${MIN_GUESTS} guests are required to place an order`);
      return;
    }
    if (!deliveryDate) {
      toast.error('Please select delivery date');
      return;
    }
    if (!deliveryLocation.address) {
      toast.error('Please enter delivery address');
      return;
    }
    if (!deliveryLocation.city) {
      toast.error('Please enter your city');
      return;
    }
    if (!/^\d{6}$/.test(deliveryLocation.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    if (!checkCateringServiceable(deliveryLocation.pincode)) {
      // Range read from serviceability.js — this message used to hardcode
      // "522001 - 522663" and went stale when the range was widened.
      toast.error(
        `Sorry, we don't cater to pincode ${deliveryLocation.pincode}. Catering runs across ${CATERING_PINCODE_RANGE[0]} - ${CATERING_PINCODE_RANGE[1]}.`
      );
      return;
    }

    const selectedDate = new Date(deliveryDate);
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const maxAllowedDate = new Date();
    maxAllowedDate.setMonth(maxAllowedDate.getMonth() + 3);

    if (selectedDate < now) {
      toast.error('Delivery date cannot be in the past');
      return;
    }

    if (selectedDate > maxAllowedDate) {
      toast.error('Delivery date cannot be more than 3 months from today');
      return;
    }

    setLoadingPayment(true);

    try {
      const orderRes = await fetch(`${API}/api/payments/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: payableNow }),
      });

      const orderData = await orderRes.json();
      if (!orderData?.orderId) throw new Error();

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sujatha Caterers',
        order_id: orderData.orderId,
        handler: async (response) => {
          await finalizeOrder(response, orderData.orderId);
        },
        theme: { color: '#e63946' },
      };
      options.modal = {
        ondismiss: () => {
          setLoadingPayment(false);
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.log(`error while creating payment: ${err}`);
      toast.error('Payment failed');
      setLoadingPayment(false);
    }
  };

  const finalizeOrder = async (paymentResponse, razorpayOrderId) => {
    try {
      const fullCart = {
        ...cart,
        complimentary: complimentaryItems,
      };
      const res = await fetch(`${API}/api/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          orderType: 'catering',
          cart: fullCart,
          selectedPackage,
          selectedMealType,
          guests,
          total: finalAmount,
          deliveryDate,
          pricePerPerson,
          deliveryLocation,
          payment: {
            orderId: razorpayOrderId,
            paymentId: paymentResponse.razorpay_payment_id,
            signature: paymentResponse.razorpay_signature,
            amount: payableNow,
          },
          status: 'pending',
        }),
      });

      if (!res.ok) throw new Error();

      sendOrderPlacedNotification();
      resetCart();
      setOrderPlaced(true);
    } catch (err) {
      console.log(err);
      toast.error('Order placement failed');
      setLoadingPayment(false);
    }
  };

  // Show Lottie animation if order placed
  if (orderPlaced) {
    return <OrderPlacedAnimation duration={3000} soundUrl={soundSuccess} />;
  }

  // Serviceability is part of this, not just the 6-digit format — otherwise
  // the button stays enabled for an uncatered pincode and clicking it only
  // produces an error toast.
  const canPay =
    !loadingPayment &&
    total > 0 &&
    deliveryDate &&
    deliveryLocation.address &&
    deliveryLocation.city &&
    /^\d{6}$/.test(deliveryLocation.pincode) &&
    checkCateringServiceable(deliveryLocation.pincode);

  const ItemChips = ({ items }) => (
    <ul className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <li
          key={item.name}
          className="flex items-center gap-2 rounded-full border border-sand-200 bg-sand-50 py-1 pr-3 pl-1"
        >
          {item.image && (
            <img
              src={`${API}${item.image}`}
              alt=""
              aria-hidden="true"
              className="h-6 w-6 rounded-full object-cover"
            />
          )}
          <span className="text-sm font-medium text-sand-800">{item.name}</span>
        </li>
      ))}
    </ul>
  );

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <button
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 rounded-lg py-2 text-sm font-medium text-sand-600 transition-colors hover:text-sand-900"
        >
          <svg viewBox="0 0 20 20" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 4l-6 6 6 6" />
          </svg>
          Back to menu
        </button>

        <h1 className="mt-2 font-display text-4xl text-sand-900 sm:text-5xl">
          Review your order
        </h1>
        <p className="mt-2 text-[1.0625rem] text-sand-600">
          {selectedPackage} · {selectedMealType} · {dishCount}{' '}
          {dishCount === 1 ? 'dish' : 'dishes'}
        </p>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_23rem] lg:gap-8">
          {/* ---------------- left: the form ---------------- */}
          <div className="min-w-0 space-y-6">
            <Section step="1" title="Your menu" sub="Everything you've chosen for this order.">
              <div className="space-y-4">
                {Object.entries(cart).map(([category, items]) => (
                  <div key={category}>
                    <h3 className="text-xs font-semibold tracking-wide text-sand-500 uppercase">
                      {category === 'Opted-drink' ? 'Selected drinks' : formatCategory(category)}
                    </h3>
                    <ItemChips items={items} />
                  </div>
                ))}

                {complimentaryItems.length > 0 && (
                  <div className="border-t border-sand-200 pt-4">
                    <h3 className="text-xs font-semibold tracking-wide text-success-700 uppercase">
                      Complimentary · included free
                    </h3>
                    <ItemChips items={complimentaryItems} />
                  </div>
                )}
              </div>
            </Section>

            <Section
              step="2"
              title="Event details"
              sub={`We cater for ${MIN_GUESTS} guests and above.`}
            >
              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="guests"
                  label="Number of guests"
                  type="number"
                  min={MIN_GUESTS}
                  step="1"
                  value={guests}
                  onKeyDown={(e) =>
                    ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()
                  }
                  onChange={(e) => {
                    const value = e.target.value;
                    setGuests(value === '' ? '' : Number(value));
                  }}
                  error={
                    guests !== '' && guests < MIN_GUESTS
                      ? `Minimum ${MIN_GUESTS} guests.`
                      : undefined
                  }
                />

                <Field
                  id="delivery-date"
                  label="Delivery date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={deliveryDate}
                  onChange={(e) => setDeliveryDate(e.target.value)}
                  hint="Up to 3 months ahead"
                />
              </div>
            </Section>

            <Section step="3" title="Delivery address" sub="Where should we bring the food?">
              <div className="space-y-5">
                <Field
                  id="address"
                  label="Full address"
                  placeholder="House no, street, area"
                  autoComplete="street-address"
                  value={deliveryLocation.address}
                  onChange={(e) =>
                    setDeliveryLocation({ ...deliveryLocation, address: e.target.value })
                  }
                />
                <Field
                  id="landmark"
                  label="Landmark"
                  placeholder="Nearby landmark"
                  hint="Optional"
                  value={deliveryLocation.landmark}
                  onChange={(e) =>
                    setDeliveryLocation({ ...deliveryLocation, landmark: e.target.value })
                  }
                />
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    id="city"
                    label="City"
                    placeholder="Guntur"
                    autoComplete="address-level2"
                    value={deliveryLocation.city}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, city: e.target.value })
                    }
                  />
                  <Field
                    id="pincode"
                    label="Pincode"
                    type="tel"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="522006"
                    autoComplete="postal-code"
                    value={deliveryLocation.pincode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 6) {
                        setDeliveryLocation({ ...deliveryLocation, pincode: value });
                      }
                    }}
                    error={
                      deliveryLocation.pincode.length === 6 &&
                      !checkCateringServiceable(deliveryLocation.pincode)
                        ? `We don't cater to this pincode yet.`
                        : undefined
                    }
                  />
                </div>
              </div>
            </Section>

            <Section step="4" title="Payment" sub="Pay a deposit now, the rest before the event.">
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">Advance payment amount</legend>
                {[25, 50, 100].map((p) => (
                  <label
                    key={p}
                    className={`flex cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 transition-all duration-200 ${
                      paymentOption === p
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-sand-200 bg-white hover:border-sand-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentOption"
                      value={p}
                      checked={paymentOption === p}
                      onChange={() => setPaymentOption(p)}
                      className="h-4 w-4 accent-brand-500"
                    />
                    <span>
                      <span className="block font-semibold text-sand-900">Pay {p}%</span>
                      <span className="block text-sm text-sand-600">
                        ₹{Math.round((finalAmount * p) / 100)}
                      </span>
                    </span>
                  </label>
                ))}
              </fieldset>
            </Section>
          </div>

          {/* ---------------- right: sticky summary ---------------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl text-sand-900">Order summary</h2>

              <dl className="mt-5 space-y-2.5 text-[0.9375rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Price per person</dt>
                  <dd className="font-medium tabular-nums text-sand-900">₹{pricePerPerson}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Subtotal · {guests || 0} guests</dt>
                  <dd className="font-medium tabular-nums text-sand-900">₹{total}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">CGST ({CGST_PERCENT}%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{cgstAmount}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">SGST ({SGST_PERCENT}%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{sgstAmount}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Platform fee</dt>
                  <dd className="tabular-nums text-sand-700">₹{PLATFORM_CHARGE}</dd>
                </div>

                <div className="flex justify-between gap-3 border-t border-sand-200 pt-3">
                  <dt className="font-semibold text-sand-900">Total</dt>
                  <dd className="font-display text-xl tabular-nums text-sand-900">
                    ₹{finalAmount}
                  </dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 rounded-xl bg-brand-50 px-3.5 py-3">
                  <dt className="font-semibold text-brand-700">
                    Payable now ({paymentOption}%)
                  </dt>
                  <dd className="font-display text-2xl tabular-nums text-brand-600">
                    ₹{payableNow}
                  </dd>
                </div>
              </dl>

              <Button
                className="mt-6"
                onClick={handlePayAndPlaceOrder}
                loading={loadingPayment}
                loadingText="Processing…"
                disabled={!canPay}
              >
                Pay ₹{payableNow}
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

export default ReviewOrder;

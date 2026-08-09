import React, { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

import { useAuthContext } from '../utils/AuthContext';
import { PageShell, PageHero } from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Field from '../components/ui/Field';
import { PICKUP_POINTS } from '../utils/pickupPoints';
import {
  CATALOGUE,
  GRAMS_PER_STEP,
  MAX_GRAMS_PER_ORDER,
  MIN_GRAMS_PER_ITEM,
  RATE_PER_500G,
  formatKg,
  priceLines,
} from '../utils/provisions';

const selectClass =
  'w-full rounded-xl border-2 border-sand-300 bg-white px-4 py-3.5 text-[1.0625rem] text-sand-900 outline-none transition-all duration-200 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15';

const key = (kind, id) => `${kind}:${id}`;

const Provisions = () => {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  // key -> grams. Absent means not ordered; 0 is never stored.
  const [grams, setGrams] = useState({});
  const [pickupPoint, setPickupPoint] = useState(PICKUP_POINTS[0].id);
  const [pickupDate, setPickupDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [loading, setLoading] = useState(false);

  const today = new Date();
  const minDate = today.toISOString().split('T')[0];
  const maxDateObj = new Date();
  maxDateObj.setMonth(maxDateObj.getMonth() + 3);
  const maxDate = maxDateObj.toISOString().split('T')[0];

  const lines = useMemo(
    () =>
      CATALOGUE.flatMap((group) =>
        group.items
          .filter((item) => grams[key(group.kind, item.id)] > 0)
          .map((item) => ({
            kind: group.kind,
            id: item.id,
            name: item.name,
            grams: grams[key(group.kind, item.id)],
          }))
      ),
    [grams]
  );

  const priced = useMemo(() => priceLines(lines), [lines]);
  const atCap = priced.totalGrams >= MAX_GRAMS_PER_ORDER;

  /* The cap is on the order, not the item, so a step is only allowed if the
     whole order still fits. Mirrors the server, which rejects the total. */
  const adjust = (kind, id, delta) => {
    const k = key(kind, id);
    const current = grams[k] || 0;
    const next = current + delta * GRAMS_PER_STEP;

    if (next < MIN_GRAMS_PER_ITEM) {
      setGrams((prev) => {
        const copy = { ...prev };
        delete copy[k];
        return copy;
      });
      return;
    }

    if (priced.totalGrams - current + next > MAX_GRAMS_PER_ORDER) {
      toast.info(`Orders are limited to ${formatKg(MAX_GRAMS_PER_ORDER)} in total.`);
      return;
    }

    setGrams((prev) => ({ ...prev, [k]: next }));
  };

  const placeOrder = async (payment) => {
    const res = await fetch(`${API}/api/orders`, {
      method: 'POST',
      // Identifies the client on the order. The app already sends "mobile";
      // web says so explicitly rather than being inferred from the header's
      // absence, which would mislabel any future client as web.
      headers: { 'Content-Type': 'application/json', 'x-client-type': 'web' },
      credentials: 'include',
      body: JSON.stringify({
        orderType: 'provisions',
        provisions: {
          // Names and amounts are deliberately not sent — the server prices
          // every line from its own catalogue and ignores anything else.
          lines: lines.map((l) => ({ kind: l.kind, id: l.id, grams: l.grams })),
          pickupPoint,
        },
        deliveryDate: pickupDate,
        deliveryLocation: {
          address: PICKUP_POINTS.find((p) => p.id === pickupPoint)?.label || '',
          landmark: 'Pickup Point',
          city: 'Guntur',
          pincode: '522001',
        },
        payment,
      }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data?.error || 'Order failed');
    return data;
  };

  const handleSubmit = async () => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/login');
      return;
    }
    if (lines.length === 0) {
      toast.error('Choose at least one item');
      return;
    }
    if (!pickupDate) {
      toast.error('Choose a pickup date');
      return;
    }

    setLoading(true);

    // Pay at the counter: no money moves here, so the order is simply created.
    // This is the one flow that cannot strand a payment.
    if (paymentMethod === 'on_pickup') {
      try {
        await placeOrder({ method: 'on_pickup' });
        toast.success('Order placed — pay when you collect it');
        navigate('/');
      } catch (err) {
        toast.error(err.message || 'Order failed');
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(`${API}/api/payments/create-razorpay-order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ amount: priced.total }),
      });

      const data = await res.json();
      if (!data?.orderId) throw new Error('Could not start the payment');

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: 'INR',
        name: 'Sujatha Caterers',
        description: 'Pickles & Powders',
        order_id: data.orderId,
        theme: { color: '#e63946' },
        handler: async (response) => {
          try {
            await placeOrder({
              method: 'online',
              orderId: data.orderId,
              paymentId: response.razorpay_payment_id,
              signature: response.razorpay_signature,
              amount: priced.total,
            });
            toast.success('Order placed');
            navigate('/');
          } catch (err) {
            toast.error(err.message || 'Order failed');
          } finally {
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => {
            toast.info('Payment cancelled. You can try again.');
            setLoading(false);
          },
        },
      });

      rzp.on('payment.failed', (response) => {
        toast.error(response.error?.description || 'Payment failed');
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.message || 'Payment could not be started');
      setLoading(false);
    }
  };

  return (
    <PageShell>
      <PageHero eyebrow="Pickles & Powders" title="Made in our kitchen, sold by weight">
        Andhra pickles and podis at ₹{RATE_PER_500G} per {formatKg(GRAMS_PER_STEP)}.
        Collection only, from any of our three pickup points.
      </PageHero>

      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <div className="grid gap-8 lg:grid-cols-[1fr_24rem] lg:gap-10">
          <div className="min-w-0 space-y-8">
            {CATALOGUE.map((group) => (
              <div key={group.kind}>
                <h2 className="font-display text-2xl text-sand-900">{group.label}</h2>
                <p className="mt-1 text-[0.9375rem] text-sand-600">{group.blurb}</p>

                <ul className="mt-4 space-y-2">
                  {group.items.map((item) => {
                    const g = grams[key(group.kind, item.id)] || 0;
                    return (
                      <li
                        key={item.id}
                        className={`flex flex-wrap items-center gap-3 rounded-2xl border-2 px-4 py-3 transition-colors ${
                          g > 0 ? 'border-brand-300 bg-brand-50' : 'border-sand-200 bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-semibold text-sand-900">{item.name}</p>
                          <p className="text-sm text-sand-600">
                            ₹{RATE_PER_500G} per {formatKg(GRAMS_PER_STEP)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => adjust(group.kind, item.id, -1)}
                            disabled={g === 0}
                            aria-label={`Less ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-sand-300 text-lg font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            −
                          </button>
                          <span className="w-20 text-center font-display text-lg tabular-nums text-sand-900">
                            {g > 0 ? formatKg(g) : '—'}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjust(group.kind, item.id, 1)}
                            disabled={atCap}
                            aria-label={`More ${item.name}`}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-sand-300 text-lg font-semibold text-sand-700 transition-colors hover:border-sand-400 hover:bg-sand-50 disabled:cursor-not-allowed disabled:opacity-40"
                          >
                            +
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>

          {/* ---------- order card ---------- */}
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl text-sand-900">Your order</h2>

              {lines.length === 0 ? (
                <p className="mt-4 text-[0.9375rem] text-sand-600">
                  Nothing chosen yet. Minimum {formatKg(MIN_GRAMS_PER_ITEM)} per item.
                </p>
              ) : (
                <ul className="mt-4 space-y-1.5 text-[0.9375rem]">
                  {lines.map((l) => (
                    <li key={key(l.kind, l.id)} className="flex justify-between gap-3">
                      <span className="min-w-0 truncate text-sand-600">
                        {l.name} · {formatKg(l.grams)}
                      </span>
                      <span className="tabular-nums text-sand-900">
                        ₹{(l.grams / GRAMS_PER_STEP) * RATE_PER_500G}
                      </span>
                    </li>
                  ))}
                </ul>
              )}

              <div className="mt-5">
                <label
                  htmlFor="pickup-point"
                  className="mb-2 block text-sm font-semibold text-sand-800"
                >
                  Pickup point
                </label>
                <select
                  id="pickup-point"
                  value={pickupPoint}
                  onChange={(e) => setPickupPoint(e.target.value)}
                  className={selectClass}
                >
                  {PICKUP_POINTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-5">
                <Field
                  id="pickup-date"
                  label="Pickup date"
                  type="date"
                  min={minDate}
                  max={maxDate}
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                />
              </div>

              <fieldset className="mt-5">
                <legend className="mb-2 text-sm font-semibold text-sand-800">Payment</legend>
                <div className="grid gap-2">
                  {[
                    { value: 'online', label: 'Pay now', note: 'Card, UPI or netbanking' },
                    { value: 'on_pickup', label: 'Pay on pickup', note: 'At the counter' },
                  ].map((opt) => (
                    <label
                      key={opt.value}
                      className={`flex cursor-pointer items-start gap-3 rounded-2xl border-2 p-3.5 transition-colors ${
                        paymentMethod === opt.value
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-sand-200 bg-white hover:border-sand-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment-method"
                        value={opt.value}
                        checked={paymentMethod === opt.value}
                        onChange={() => setPaymentMethod(opt.value)}
                        className="mt-1 h-4 w-4 shrink-0 accent-brand-500"
                      />
                      <span className="min-w-0">
                        <span className="block font-semibold text-sand-900">{opt.label}</span>
                        <span className="mt-0.5 block text-sm text-sand-600">{opt.note}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>

              <dl className="mt-6 space-y-2 border-t border-sand-200 pt-5 text-[0.9375rem]">
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">Subtotal · {formatKg(priced.totalGrams)}</dt>
                  <dd className="font-medium tabular-nums text-sand-900">₹{priced.subTotal}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">CGST (2.5%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{priced.cgst}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-sand-600">SGST (2.5%)</dt>
                  <dd className="tabular-nums text-sand-700">₹{priced.sgst}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-sand-200 pt-3">
                  <dt className="font-semibold text-sand-900">Total</dt>
                  <dd className="font-display text-2xl tabular-nums text-brand-600">
                    ₹{priced.total}
                  </dd>
                </div>
              </dl>

              <Button
                className="mt-5"
                onClick={handleSubmit}
                loading={loading}
                loadingText="Processing…"
                disabled={lines.length === 0}
              >
                {lines.length === 0
                  ? 'Choose an item'
                  : paymentMethod === 'on_pickup'
                    ? 'Place order'
                    : `Pay ₹${priced.total}`}
              </Button>

              <p className="mt-3 text-center text-sm text-sand-500">
                {paymentMethod === 'on_pickup'
                  ? `₹${priced.total} due when you collect`
                  : 'Secure payment via Razorpay'}
              </p>
            </div>
          </aside>
        </div>
      </section>
    </PageShell>
  );
};

export default Provisions;

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import PageShell from '../components/ui/PageShell';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';

const STATUS_TONE = {
  pending: 'bg-saffron-50 text-saffron-700 border-saffron-300/60',
  confirmed: 'bg-success-50 text-success-700 border-success-500/30',
  completed: 'bg-success-50 text-success-700 border-success-500/30',
  delivered: 'bg-success-50 text-success-700 border-success-500/30',
  cancelled: 'bg-brand-50 text-brand-700 border-brand-300/60',
};

const PAYMENT_TONE = {
  paid: 'text-success-700',
  partial: 'text-saffron-700',
  failed: 'text-brand-600',
};

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3 text-[0.9375rem]">
    <dt className="shrink-0 text-sand-600">{label}</dt>
    <dd className="min-w-0 text-right font-medium text-sand-900">{children}</dd>
  </div>
);

const Profile = () => {
  const [user, setUser] = useState(null);
  const [address, setAddress] = useState('');
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const API = process.env.REACT_APP_API_URL;

  // 🔔 Browser notification helper
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

  // Handle partial payments
  const handlePayRemaining = async (order, amount) => {
    if (!window.Razorpay) {
      toast.error('Payment could not start — please refresh and try again.');
      return;
    }

    try {
      const res = await axios.post(
        `${API}/api/payments/create-razorpay-order`,
        { amount },
        { withCredentials: true }
      );

      const orderData = res.data;
      if (!orderData?.orderId) throw new Error('Failed to create Razorpay order');

      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: 'INR',
        name: 'Sujatha Caterers',
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            const finalizeRes = await axios.post(
              `${API}/api/orders/${order._id}/repay`,
              {
                payment: {
                  orderId: orderData.orderId,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                  amount,
                },
              },
              { withCredentials: true }
            );

            const updatedOrder = finalizeRes.data.order;
            setOrders((prev) =>
              prev.map((o) => (o._id === updatedOrder._id ? updatedOrder : o))
            );

            toast.success(`Paid ₹${amount}. Your order is fully settled.`);
            sendBrowserNotification(
              'Sujatha Caterers • Payment Successful',
              `Your remaining amount of ₹${amount} has been paid successfully.`
            );
          } catch (err) {
            console.error('Error finalizing payment:', err);
            toast.error('Payment succeeded, but updating the order failed. Please contact us.');
          }
        },
        theme: { color: '#e63946' },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.error('Error creating Razorpay order:', err);
      toast.error('Failed to start payment. Please try again.');
    }
  };

  // Load user + orders
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const res = await axios.get(`${API}/api/users/me`, { withCredentials: true });
        setUser(res.data.user);
        setAddress(res.data.user.address || '');
      } catch (err) {
        console.error('User fetch failed:', err);
        navigate('/');
        return;
      }

      try {
        const res = await axios.get(`${API}/api/orders`, { withCredentials: true });
        setOrders(Array.isArray(res.data.orders) ? res.data.orders : []);
      } catch (err) {
        console.error('Order fetch failed:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [API, navigate]);

  // Save profile changes
  const handleSave = async () => {
    try {
      setSaving(true);
      const updatedUser = {
        phone: user.phone,
        name: user.name || '',
        email: user.email || '',
        address,
      };

      const res = await axios.put(`${API}/api/users/update-profile`, updatedUser, {
        withCredentials: true,
      });
      setUser(res.data.user);
      setEditing(false);
      toast.success('Address updated.');
    } catch (err) {
      console.error('Update failed:', err);
      toast.error('Could not save your address. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <PageShell>
        <div className="mx-auto flex max-w-lg flex-col items-center px-5 py-24 text-center">
          <span className="text-brand-500">
            <Spinner className="h-8 w-8" />
          </span>
          <p className="mt-4 text-[1.0625rem] text-sand-600">Loading your profile…</p>
        </div>
      </PageShell>
    );
  }

  if (!user) return null;

  return (
    <PageShell>
      <section className="mx-auto max-w-7xl px-5 py-10 sm:px-8 lg:py-12">
        <h1 className="font-display text-4xl text-sand-900 sm:text-5xl">
          {user.name || 'Your profile'}
        </h1>
        <p className="mt-2 text-[1.0625rem] text-sand-600">
          {orders.length === 0
            ? 'No orders yet.'
            : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'} so far.`}
        </p>

        <div className="mt-8 grid gap-8 lg:grid-cols-[22rem_1fr] lg:gap-10">
          {/* ---------- details ---------- */}
          <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="font-display text-2xl text-sand-900">Your details</h2>

              <dl className="mt-4 space-y-2.5">
                <Row label="Name">{user.name || '—'}</Row>
                <Row label="Phone">{user.phone || '—'}</Row>
                <Row label="Email">
                  <span className="break-all">{user.email || '—'}</span>
                </Row>
              </dl>

              <div className="mt-5 border-t border-sand-200 pt-5">
                <p className="text-sm font-semibold text-sand-800">Address</p>

                {editing ? (
                  <>
                    <textarea
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      rows={3}
                      aria-label="Your address"
                      className="mt-2 w-full resize-y rounded-xl border-2 border-sand-300 bg-white px-4 py-3 text-[0.9375rem] text-sand-900 outline-none transition-all duration-200 placeholder:text-sand-400 hover:border-sand-400 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15"
                    />
                    <div className="mt-3 flex gap-2">
                      <Button onClick={handleSave} loading={saving} loadingText="Saving…">
                        Save
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => {
                          setAddress(user.address || '');
                          setEditing(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-sand-600">
                      {user.address || 'No address added yet.'}
                    </p>
                    <Button
                      variant="secondary"
                      className="mt-3"
                      onClick={() => setEditing(true)}
                    >
                      {user.address ? 'Edit address' : 'Add address'}
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card">
              <h2 className="text-lg font-semibold text-sand-900">Account</h2>
              <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-sand-600">
                To request deletion of your account and its data, use our official
                request form.
              </p>
              <Button
                variant="secondary"
                className="mt-4"
                onClick={() => navigate('/request-deletion')}
              >
                Request data deletion
              </Button>
            </div>
          </aside>

          {/* ---------- orders ---------- */}
          <div className="min-w-0">
            <h2 className="font-display text-3xl text-sand-900">Order history</h2>

            {orders.length === 0 ? (
              <div className="mt-5 rounded-3xl border border-sand-200 bg-white p-10 text-center shadow-card">
                <p className="font-semibold text-sand-900">No orders yet</p>
                <p className="mt-1 text-[0.9375rem] text-sand-600">
                  When you place an order it'll show up here.
                </p>
                <Button className="mx-auto mt-6 sm:w-auto sm:px-7" onClick={() => navigate('/menu')}>
                  Browse the menu
                </Button>
              </div>
            ) : (
              <div className="mt-5 space-y-5">
                {orders.map((order) => {
                  const remainingAmount = order.total - (order.payment?.amount || 0);
                  const isMealBox = order.orderType === 'mealbox';

                  const itemList = isMealBox
                    ? order.mealBox?.items || []
                    : Object.values(order.cart || {})
                        .flat()
                        .map((item) => item.name);

                  return (
                    <article
                      key={order._id}
                      className="rounded-3xl border border-sand-200 bg-white p-6 shadow-card"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-display text-xl text-sand-900">
                            {isMealBox ? 'Meal Box' : 'Catering'}
                          </p>
                          <p className="mt-0.5 text-sm text-sand-500">
                            #{order._id.slice(-6)} · ordered{' '}
                            {new Date(order.createdAt).toLocaleDateString('en-IN')}
                          </p>
                        </div>

                        <span
                          className={`rounded-full border px-3 py-1 text-xs font-semibold capitalize ${
                            STATUS_TONE[order.status] ?? 'border-sand-200 bg-sand-100 text-sand-700'
                          }`}
                        >
                          {order.status}
                        </span>
                      </div>

                      <dl className="mt-5 grid gap-2.5 border-t border-sand-200 pt-5 sm:grid-cols-2 sm:gap-x-8">
                        {isMealBox ? (
                          <>
                            <Row label="Variant">{order.mealBox?.variant || 'Standard'}</Row>
                            <Row label="Quantity">{order.mealBox?.quantity} boxes</Row>
                            <Row label="Delivery">
                              {order.mealBox?.deliveryMode === 'door' ? 'Door delivery' : 'Pickup'}
                            </Row>
                          </>
                        ) : (
                          <>
                            <Row label="Guests">{order.guests}</Row>
                            <Row label="Package">
                              {order.selectedPackage} ({order.selectedMealType})
                            </Row>
                          </>
                        )}
                        <Row label="Delivery date">
                          {new Date(order.deliveryDate).toLocaleDateString('en-IN')}
                        </Row>
                        <Row
                          label={
                            order.mealBox?.deliveryMode === 'pickup' ? 'Pickup point' : 'Deliver to'
                          }
                        >
                          {order.deliveryLocation?.address || '—'}
                        </Row>
                      </dl>

                      <div className="mt-5 flex flex-wrap items-baseline justify-between gap-3 border-t border-sand-200 pt-5">
                        <span className="text-[0.9375rem] text-sand-600">Total</span>
                        <span className="font-display text-2xl tabular-nums text-sand-900">
                          ₹{order.total}
                        </span>
                      </div>

                      {order.payment && (
                        <div className="mt-4 rounded-2xl bg-sand-100 p-4">
                          <p className="text-[0.9375rem] text-sand-700">
                            {order.payment.status === 'paid' && (
                              <>
                                <span className={`font-semibold ${PAYMENT_TONE.paid}`}>
                                  Paid in full
                                </span>{' '}
                                — ₹{order.payment.amount}
                                {order.payment.paidAt && (
                                  <> on {new Date(order.payment.paidAt).toLocaleDateString('en-IN')}</>
                                )}
                              </>
                            )}
                            {order.payment.status === 'partial' && (
                              <>
                                <span className={`font-semibold ${PAYMENT_TONE.partial}`}>
                                  Part paid
                                </span>{' '}
                                — ₹{order.payment.amount} of ₹{order.total}. Remaining{' '}
                                <strong className="font-semibold text-sand-900">
                                  ₹{remainingAmount}
                                </strong>
                              </>
                            )}
                            {order.payment.status === 'failed' && (
                              <span className={`font-semibold ${PAYMENT_TONE.failed}`}>
                                Payment failed
                              </span>
                            )}
                          </p>

                          {order.payment.status === 'partial' && remainingAmount > 0 && (
                            <Button
                              className="mt-3"
                              onClick={() => handlePayRemaining(order, remainingAmount)}
                            >
                              Pay remaining ₹{remainingAmount}
                            </Button>
                          )}
                        </div>
                      )}

                      <details className="group mt-4">
                        <summary className="cursor-pointer list-none text-[0.9375rem] font-semibold text-brand-600 hover:text-brand-700">
                          View {itemList.length} {itemList.length === 1 ? 'item' : 'items'}
                        </summary>
                        <ul className="mt-3 flex flex-wrap gap-1.5">
                          {itemList.map((name, i) => (
                            <li
                              key={`${name}-${i}`}
                              className="rounded-full border border-sand-200 bg-sand-50 px-2.5 py-1 text-sm text-sand-700"
                            >
                              {name}
                            </li>
                          ))}
                        </ul>
                      </details>

                      <Button
                        variant="secondary"
                        className="mt-5 sm:w-auto sm:px-6"
                        onClick={() => navigate(`/invoice/${order._id}`, { state: { order, user } })}
                      >
                        Show invoice
                      </Button>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
};

export default Profile;

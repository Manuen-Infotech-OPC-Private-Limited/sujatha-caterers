import React, { useState, useEffect } from 'react';
import { useCart } from '../utils/cartContext';
import { useNavigate, useLocation } from 'react-router-dom';
import '../css/ReviewOrder.css';
import { PRICES } from '../utils/pricing';
import { toast } from 'react-toastify';
import { formatCategory } from '../utils/categoryLabels';
import OrderPlacedAnimation from '../components/OrderPlacedAnimation';
import soundSuccess from '../assets/sounds/order-placed.mp3';
import useAuth from '../hooks/useAuth';
import { checkCateringServiceable } from '../utils/serviceability';

const CGST_PERCENT = 2.5;
const SGST_PERCENT = 2.5;
const PLATFORM_CHARGE = 15;
const MIN_GUESTS = 30;

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
    if (!("Notification" in window)) return;
    
    if (Notification.permission === "granted") {
      // Try using Service Worker (required for Android Chrome)
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.ready.then((registration) => {
          registration.showNotification("Sujatha Caterers • Order Placed", {
            body: "Thank you! Your order has been placed successfully.",
            icon: "/logo192.png",
          });
        }).catch((err) => {
           console.warn("ServiceWorker notification failed:", err);
           // Fallback to new Notification (Desktop)
           try {
             new Notification("Sujatha Caterers • Order Placed", {
               body: "Thank you! Your order has been placed successfully.",
               icon: "/logo192.png",
             });
           } catch (e) {
             console.warn("Notification API failed:", e);
           }
        });
      } else {
        // Fallback for browsers without Service Worker support
        try {
          new Notification("Sujatha Caterers • Order Placed", {
            body: "Thank you! Your order has been placed successfully.",
            icon: "/logo192.png",
          });
        } catch (e) {
          console.warn("Notification API failed:", e);
        }
      }
    }
  };

  useEffect(() => {
    if (user) {
      setDeliveryLocation((prev) => ({
        ...prev,
        address: user.address || '',
        // Optionally, you can prefill city or landmark if you store it
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
    if (!/^\d{6}$/.test(deliveryLocation.pincode)) {
      toast.error('Please enter a valid 6-digit pincode');
      return;
    }

    if (!checkCateringServiceable(deliveryLocation.pincode)) {
      toast.error(`Sorry, we do not provide catering services in your area (Pincode: ${deliveryLocation.pincode}). Available for 522001 - 522663.`);
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
        theme: { color: '#0f766e' },
      };
      options.modal = {
        ondismiss: () => {
          setLoadingPayment(false);
        },
      };

      new window.Razorpay(options).open();
    } catch (err) {
      console.log(`error while creating payment: ${err}`)
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

  return (
    <div className="review-order">
      <h2>Review Your Order</h2>
      <p><strong>Meal Type:</strong> {selectedMealType}</p>
      <p><strong>Package:</strong> {selectedPackage}</p>

      <div className="order-content">
        {/* Left Column */}
        <div className="column-left">
          <div className="selected-items">
            {Object.entries(cart).map(([category, items]) => (
              <div key={category}>
                <h4>
                  {category === 'Opted-drink' 
                    ? 'Selected Drinks' 
                    : formatCategory(category)}
                </h4>
                <ul className="item-list">
                  {items.map((item) => (
                    <li key={item.name} className="item-card">
                      {item.image && <img src={`${API}${item.image}`} alt={item.name} className="item-image" />}
                      <span className="item-name">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            {complimentaryItems.length > 0 && (
              <div className="complimentary-items">
                <h4>Complimentary Items</h4>
                <ul className="item-list">
                  {complimentaryItems.map((item) => (
                    <li key={item.name} className="item-card">
                      {item.image && <img src={`${API}${item.image}`} alt={item.name} className="item-image" />}
                      <span className="item-name">{item.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Right Column */}
        <div className="column-right">
          <label>
            Number of Guests:
            <input
              type="number"
              placeholder={`Minimum ${MIN_GUESTS} guests are required to place an order`}
              value={guests} min={MIN_GUESTS}
              step="1"
              onKeyDown={(e) => ['e', 'E', '+', '-', '.'].includes(e.key) && e.preventDefault()}
              onChange={(e) => {
                const value = e.target.value;
                if (value === '') {
                  setGuests('');
                } else {
                  setGuests(Number(value));
                }
              }}
              onBlur={() => document.getElementById('delivery-date')?.focus()}

            />
          </label>

          <label>
            Delivery Date

            <input
              type="date"
              min={minDate}
              max={maxDate}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </label>
          <label>Delivery Location</label>
          <input
            type="text"
            placeholder="Full Address"
            value={deliveryLocation.address}
            onChange={(e) =>
              setDeliveryLocation({ ...deliveryLocation, address: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="Landmark (optional)"
            value={deliveryLocation.landmark}
            onChange={(e) =>
              setDeliveryLocation({ ...deliveryLocation, landmark: e.target.value })
            }
          />
          <input
            type="text"
            placeholder="City"
            value={deliveryLocation.city}
            onChange={(e) =>
              setDeliveryLocation({ ...deliveryLocation, city: e.target.value })
            }
          />
          <input
            type="tel"
            placeholder="Pincode"
            maxLength={6}
            value={deliveryLocation.pincode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, ''); // digits only
              if (value.length <= 6) {
                setDeliveryLocation({ ...deliveryLocation, pincode: value });
              }
            }}
          />


          <h4>Payment</h4>
          <p>You are paying <strong>{paymentOption}%</strong> advance.</p>
          {[25, 50, 100].map((p) => (
            <label key={p}>
              <input
                type="radio"
                checked={paymentOption === p}
                onChange={() => setPaymentOption(p)}
              />
              Pay {p}%
            </label>
          ))}

          <hr />
          <div className="price-summary">
            <div className="price-row">
              <span>Price per person</span>
              <span>₹{pricePerPerson}</span>
            </div>
            <div className="price-row subtotal">
              <span>Subtotal ({guests} guests)</span>
              <span>₹{total}</span>
            </div>
            <div className="price-row gst-item">
              <span>CGST ({CGST_PERCENT}%)</span>
              <span>₹{cgstAmount}</span>
            </div>
            <div className="price-row gst-item">
              <span>SGST ({SGST_PERCENT}%)</span>
              <span>₹{sgstAmount}</span>
            </div>
            <div className="price-row total-gst">
              <span>Total GST</span>
              <span>₹{totalGst}</span>
            </div>
            <div className="price-row">
              <span>Platform Fee</span>
              <span>₹{PLATFORM_CHARGE}</span>
            </div>
            <div className="price-row total-payable">
              <span>Total Amount</span>
              <span>₹{finalAmount}</span>
            </div>
            <div className="price-row payable-now">
              <span>Payable Now ({paymentOption}%)</span>
              <span>₹{payableNow}</span>
            </div>
          </div>

          <div className="button-row">
            <button className="adjust-order-btn" onClick={() => navigate(-1)}>
              Go Back
            </button>
            <button
              className="place-order-btn"
              onClick={handlePayAndPlaceOrder}
              disabled={
                loadingPayment ||
                total === 0 ||
                !deliveryDate ||
                !deliveryLocation.address ||
                !deliveryLocation.city ||
                !/^\d{6}$/.test(deliveryLocation.pincode)
              }
            >
              {loadingPayment ? 'Processing...' : `Pay ₹${payableNow}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewOrder;
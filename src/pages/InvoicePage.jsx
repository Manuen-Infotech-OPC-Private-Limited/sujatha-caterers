import React, { useRef } from "react";
import { formatCategory } from '../utils/categoryLabels';
import { useLocation, useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import logo from "../assets/logos/logo-nobg.png";
import { BUSINESS } from "../data/business";
import PageShell from "../components/ui/PageShell";
import Button from "../components/ui/Button";

const InvoicePage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const invoiceRef = useRef();

  if (!state || !state.order || !state.user) {
    return (
      <PageShell>
        <div className="mx-auto max-w-lg px-5 py-24 text-center">
          <h1 className="font-display text-3xl text-sand-900">Invoice not available</h1>
          <p className="mt-2 text-[1.0625rem] text-sand-600">
            Open an invoice from your order history so we know which one to show.
          </p>
          <Button className="mx-auto mt-7 sm:w-auto sm:px-7" onClick={() => navigate("/profile")}>
            Go to order history
          </Button>
        </div>
      </PageShell>
    );
  }

  const { order, user } = state;
  const totalAmount = order.total;
  const paidAmount = order.payment?.amount || 0;
  const remainingAmount = totalAmount - paidAmount;

  const handleDownload = () => {
    const opt = {
      margin: 0.5,
      filename: `${user.name}-invoice.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, scrollY: 0 },
      jsPDF: { unit: "in", format: "a4", orientation: "portrait" },
    };
    html2pdf().set(opt).from(invoiceRef.current).save();
  };

  const chunkArray = (arr, size = 2) => {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push(arr.slice(i, i + size));
    }
    return result;
  };

  return (
    <PageShell>
      <div className="px-5 py-10 sm:px-8" style={{ fontFamily: "Arial, sans-serif" }}>
      <div
        ref={invoiceRef}
        style={{
          maxWidth: "700px",
          margin: "auto",
          padding: "2rem",
          border: "1px solid #ddd",
          borderRadius: "10px",
          backgroundColor: "#fff",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <img src={logo} alt="Company Logo" style={{ maxWidth: "120px" }} />
          <div style={{ textAlign: "right" }}>
            <h3 style={{ margin: "0 0 5px 0" }}>{BUSINESS.name}</h3>
            <p style={{ margin: "0", fontSize: "0.9rem" }}>Email: {BUSINESS.email}</p>
            <p style={{ margin: "0", fontSize: "0.9rem" }}>Phone: {BUSINESS.phone}</p>
          </div>
        </div>

        <h2 style={{ textAlign: "center", margin: "0 0 1rem 0" }}>Invoice</h2>

        {/* Customer & Order Info */}
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1rem" }}>
          <div style={{flex: 1}}>
            <p><strong>Invoice ID:</strong> #{order._id.slice(-6)}</p>
            <p><strong>Name:</strong> {user.name}</p>
            <p><strong>Phone:</strong> {user.phone}</p>
            <p><strong>Address:</strong> {user.address}</p>
          </div>
          <div style={{flex: 1, textAlign: 'right'}}>
            <p><strong>Order Date:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Delivery Date:</strong> {order.deliveryDate ? new Date(order.deliveryDate).toLocaleDateString("en-IN") : "N/A"}</p>
            
            {order.orderType === "catering" && (
                <>
                    <p><strong>Type:</strong> Catering</p>
                    <p><strong>Meal:</strong> {order.selectedMealType} ({order.selectedPackage})</p>
                    <p><strong>Guests:</strong> {order.guests}</p>
                    <p><strong>Price / Person:</strong> ₹{order.pricePerPerson}</p>
                </>
            )}

            {order.orderType === "mealbox" && (
                <>
                    <p><strong>Type:</strong> Meal Box</p>
                    <p><strong>Variant:</strong> {order.mealBox.variant || 'Standard'}</p>
                    <p><strong>Qty:</strong> {order.mealBox.quantity}</p>
                    <p><strong>Delivery:</strong> {order.mealBox.deliveryMode === 'pickup' ? 'Pickup' : 'Door Delivery'}</p>
                </>
            )}
            
            <p><strong>Status:</strong> {order.status}</p>
          </div>
        </div>

        {/* Payment Details Table */}
        {order.payment && (
          <div style={{ marginBottom: "1rem" }}>
            <h3>Payment Details</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem", fontSize: '0.9rem' }}>
              <tbody>
                <tr style={{ backgroundColor: "#e8f0fe" }}>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Method</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Transaction ID</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Date</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Amount</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>Status</td>
                </tr>
                <tr>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{order.payment.provider}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{order.payment.paymentId}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{new Date(order.payment.paidAt).toLocaleDateString()}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>₹{paidAmount}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{order.payment.status}</td>
                </tr>
                {remainingAmount > 0 && (
                  <tr style={{background: '#fff0f0'}}>
                    <td colSpan={3} style={{ border: "1px solid #ddd", padding: "8px", textAlign: 'right', fontWeight: 'bold' }}>Remaining Balance:</td>
                    <td colSpan={2} style={{ border: "1px solid #ddd", padding: "8px", color: 'red', fontWeight: 'bold' }}>₹{remainingAmount}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Items Table - CATERING */}
        {order.orderType === 'catering' && order.cart && (
            <>
                <h3 style={{ marginTop: "1rem" }}>Menu Items</h3>
                <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "0.5rem" }}>
                <tbody>
                    {Object.entries(order.cart).map(([category, items]) => {
                    const chunks = chunkArray(items, 2);
                    return (
                        <React.Fragment key={category}>
                        <tr style={{ backgroundColor: "#e8f0fe" }}>
                            <td colSpan={2} style={{ border: "1px solid #ddd", padding: "8px", fontWeight: "bold" }}>
                            {category === 'Opted-drink' ? 'Selected Drinks' : formatCategory(category)}
                            </td>
                        </tr>
                        {chunks.map((pair, rowIdx) => (
                            <tr key={rowIdx} style={{ backgroundColor: rowIdx % 2 === 0 ? "#fafafa" : "#fff" }}>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{pair[0]?.name || ""}</td>
                            <td style={{ border: "1px solid #ddd", padding: "8px" }}>{pair[1]?.name || ""}</td>
                            </tr>
                        ))}
                        </React.Fragment>
                    );
                    })}
                </tbody>
                </table>
            </>
        )}

        {/* Items Table - MEALBOX */}
        {order.orderType === 'mealbox' && order.mealBox?.items && (
            <>
                <h3 style={{ marginTop: "1rem" }}>Box Contents</h3>
                <div style={{
                    display: 'flex', 
                    flexWrap: 'wrap', 
                    gap: '10px', 
                    border: '1px solid #eee', 
                    padding: '15px', 
                    borderRadius: '8px', 
                    background: '#fafafa'
                }}>
                    {order.mealBox.items.map((item, idx) => (
                        <span key={idx} style={{
                            background: '#fff', 
                            border: '1px solid #ddd', 
                            padding: '5px 10px', 
                            borderRadius: '15px', 
                            fontSize: '0.9rem'
                        }}>
                            {item}
                        </span>
                    ))}
                </div>
            </>
        )}

        {/* Total */}
        <div style={{ textAlign: "right", marginTop: "1.5rem", fontSize: "1.3rem", fontWeight: "bold", color: '#d32f2f' }}>
          Grand Total: ₹{totalAmount}
        </div>

        {/* Footer */}
        <div style={{ marginTop: "2rem", fontSize: "0.75rem", color: "#555", textAlign: "right" }}>
          Invoice Generated On: {new Date().toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          })}
        </div>
      </div>

      {/* Actions — page chrome only; the invoice above stays inline-styled
          because html2canvas rasterises it for the PDF. */}
      <div className="mx-auto mt-6 flex max-w-[700px] flex-col gap-3 sm:flex-row-reverse">
        <Button onClick={handleDownload}>Download PDF</Button>
        <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
      </div>
      </div>
    </PageShell>
  );
};

export default InvoicePage;
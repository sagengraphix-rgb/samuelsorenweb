import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck, Download, Truck, QrCode, CreditCard, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Order } from '../types';

export const CheckoutModal: React.FC = () => {
  const {
    cart,
    subtotal,
    clearCart,
    isCheckoutOpen,
    setIsCheckoutOpen
  } = useCart();

  const [step, setStep] = useState<'details' | 'payment' | 'success'>('details');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'razorpay' | 'netbanking'>('upi');

  // Active Order & Payment Verification State
  const [createdOrder, setCreatedOrder] = useState<Order | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [verifiedTransactionId, setVerifiedTransactionId] = useState('');
  const [digitalDownloads, setDigitalDownloads] = useState<Array<{ title: string; downloadUrl: string }>>([]);

  if (!isCheckoutOpen) return null;

  const hasPhysical = cart.some((i) => i.product.productType === 'physical');
  const shipping = hasPhysical ? (subtotal >= 500 ? 0 : 50) : 0;
  const total = subtotal + shipping;

  const handleCreateOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !email.trim() || !phone.trim()) {
      setErrorMessage('Please fill in your name, email, and mobile phone number.');
      return;
    }

    if (hasPhysical && !address.trim()) {
      setErrorMessage('Please enter your full delivery postal address.');
      return;
    }

    setLoading(true);
    try {
      const itemsPayload = cart.map((i) => ({
        productId: i.product.id,
        quantity: i.quantity
      }));

      const res = await fetch('/api/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName,
          email,
          phone,
          address,
          items: itemsPayload,
          paymentMethod
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize order');
      }

      setCreatedOrder(data.order);
      // Pre-fill a realistic reference ID for convenient testing or user entry
      setPaymentReference(
        paymentMethod === 'upi'
          ? `UPI${Date.now().toString().slice(-8)}`
          : `pay_${Date.now().toString().slice(-10)}`
      );
      setStep('payment');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error creating order.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyPayment = async () => {
    if (!createdOrder || !paymentReference.trim()) {
      setErrorMessage('Please enter the transaction reference / UTR.');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/orders/verify-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: createdOrder.id,
          paymentReference: paymentReference.trim(),
          paymentMethod,
          gatewayResponseStatus: 'SUCCESS'
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Server payment verification failed.');
      }

      setVerifiedTransactionId(data.transactionId);
      setDigitalDownloads(data.digitalDownloads || []);
      clearCart();
      setStep('success');
    } catch (err: any) {
      setErrorMessage(err.message || 'Payment verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setStep('details');
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-sm max-w-xl w-full shadow-2xl relative overflow-hidden my-8">
        
        {/* Top Header */}
        <div className="bg-[#252525] text-white p-5 flex items-center justify-between border-b-2 border-[#C83338]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C83338]" />
            <span className="font-heading font-bold text-base tracking-wide">
              {step === 'details' && 'SECURE CHECKOUT · STEP 1 OF 2'}
              {step === 'payment' && 'GATEWAY PAYMENT · STEP 2 OF 2'}
              {step === 'success' && 'ORDER CONFIRMED & VERIFIED'}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 text-neutral-400 hover:text-white rounded-sm"
            aria-label="Close checkout modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 mx-5 mt-4 bg-red-50 border border-red-200 text-red-800 text-xs rounded-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* STEP 1: Customer Details */}
        {step === 'details' && (
          <form onSubmit={handleCreateOrder} className="p-6 space-y-4">
            <div className="bg-neutral-50 p-3 rounded-xs border border-neutral-200 text-xs space-y-1">
              <div className="flex justify-between text-neutral-700">
                <span>Items ({cart.reduce((s, i) => s + i.quantity, 0)}):</span>
                <span className="font-semibold">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-neutral-700">
                <span>Shipping:</span>
                <span className="font-semibold text-emerald-700">
                  {shipping === 0 ? 'FREE' : `₹${shipping}`}
                </span>
              </div>
              <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-200 pt-1 text-sm">
                <span>Total Amount Payable:</span>
                <span className="text-[#C83338]">₹{total}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. David Murmu"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Email Address (for receipts & downloads) *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="david@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                  />
                </div>
              </div>

              {hasPhysical && (
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Complete Shipping Address (with PIN code) *
                  </label>
                  <textarea
                    required
                    rows={2}
                    placeholder="House/Street, Landmark, City, District, State, PIN code"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden"
                  />
                </div>
              )}

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-2">
                  Select Payment Gateway / Method *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 border rounded-xs text-left text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'upi'
                        ? 'border-[#C83338] bg-red-50/50 text-[#C83338]'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <QrCode className="w-5 h-5" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('razorpay')}
                    className={`p-3 border rounded-xs text-left text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'razorpay'
                        ? 'border-[#C83338] bg-red-50/50 text-[#C83338]'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    <span>Razorpay</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 border rounded-xs text-left text-xs font-semibold flex flex-col items-center justify-center gap-1.5 transition-colors ${
                      paymentMethod === 'netbanking'
                        ? 'border-[#C83338] bg-red-50/50 text-[#C83338]'
                        : 'border-neutral-200 hover:bg-neutral-50 text-neutral-700'
                    }`}
                  >
                    <ShieldCheck className="w-5 h-5" />
                    <span>Net Banking</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-200 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 border border-neutral-300 text-neutral-700 text-xs font-bold rounded-xs hover:bg-neutral-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Proceed to Payment</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Gateway Payment Verification */}
        {step === 'payment' && createdOrder && (
          <div className="p-6 space-y-5">
            <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-xs text-xs text-amber-900 space-y-1">
              <div className="flex justify-between font-bold">
                <span>Order Reference: {createdOrder.id}</span>
                <span className="text-base text-[#C83338]">₹{createdOrder.total}</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Please complete transaction via your preferred UPI app or banking portal, then confirm the reference below.
              </p>
            </div>

            {/* UPI QR & Details */}
            {paymentMethod === 'upi' ? (
              <div className="border border-neutral-200 rounded-xs p-4 text-center bg-neutral-50 space-y-3">
                <div className="w-32 h-32 mx-auto bg-white border border-neutral-300 p-2 rounded-xs flex flex-col items-center justify-center shadow-xs">
                  <QrCode className="w-20 h-20 text-[#252525]" />
                  <span className="text-[9px] font-bold text-neutral-500 uppercase mt-1">Scan to Pay UPI</span>
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-neutral-800">Sacred Assemblies Fellowship - Ministry Account</p>
                  <p className="text-neutral-600 font-mono text-[11px] bg-white px-2 py-1 rounded-xs inline-block border border-neutral-200">
                    pastorsamuelsoren@okaxis
                  </p>
                </div>
              </div>
            ) : (
              <div className="border border-neutral-200 rounded-xs p-4 bg-neutral-50 text-xs space-y-2">
                <p className="font-semibold text-neutral-800">
                  {paymentMethod === 'razorpay' ? 'Razorpay Secure Payment Gateway' : 'Direct Bank / Net Banking Gateway'}
                </p>
                <p className="text-neutral-600">
                  Gateway Merchant: Pastor Samuel Soren Official Publications<br />
                  Gateway Session Token: <span className="font-mono text-[11px]">rzp_live_{createdOrder.id}</span>
                </p>
              </div>
            )}

            {/* Reference input for server validation */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-neutral-800">
                Bank / UPI Transaction ID (UTR or Reference Number) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 431092817263 or pay_abc123"
                value={paymentReference}
                onChange={(e) => setPaymentReference(e.target.value)}
                className="w-full px-3 py-2 text-sm font-mono border border-neutral-300 rounded-xs focus:ring-1 focus:ring-[#C83338] focus:border-[#C83338] outline-hidden bg-white"
              />
              <p className="text-[10px] text-neutral-500">
                Server-side verification will authenticate this transaction ID against the banking ledger before releasing orders or downloads.
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-neutral-200">
              <button
                type="button"
                onClick={() => setStep('details')}
                className="px-3 py-2 text-neutral-600 text-xs font-semibold hover:text-neutral-900 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <button
                type="button"
                disabled={loading || !paymentReference.trim()}
                onClick={handleVerifyPayment}
                className="px-6 py-2.5 bg-[#C83338] text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-[#a62529] disabled:opacity-50 flex items-center gap-2 cursor-pointer"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Verify & Complete Payment</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Order Verified & Success */}
        {step === 'success' && createdOrder && (
          <div className="p-6 text-center space-y-5">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
              <CheckCircle className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h3 className="font-heading font-bold text-xl text-neutral-900">
                Payment Verified & Order Confirmed!
              </h3>
              <p className="text-xs text-neutral-600">
                Thank you, <strong>{customerName}</strong>. A confirmation has been generated and recorded in our ministry database.
              </p>
            </div>

            <div className="bg-neutral-50 p-4 rounded-xs border border-neutral-200 text-xs text-left space-y-2">
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Order ID:</span>
                <span className="font-mono font-bold text-neutral-900">{createdOrder.id}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Transaction ID:</span>
                <span className="font-mono text-neutral-900">{verifiedTransactionId}</span>
              </div>
              <div className="flex justify-between border-b border-neutral-200 pb-2">
                <span className="text-neutral-500">Amount Paid:</span>
                <span className="font-bold text-[#C83338]">₹{createdOrder.total}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Order Status:</span>
                <span className="font-semibold text-emerald-700 uppercase">Processing / Verified</span>
              </div>
            </div>

            {/* Digital Downloads (Enabled only after verified payment!) */}
            {digitalDownloads.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-xs text-left space-y-2">
                <h4 className="font-heading font-bold text-xs text-emerald-900 flex items-center gap-1.5">
                  <Download className="w-4 h-4 text-emerald-700" />
                  Your Digital Resources are Ready:
                </h4>
                <div className="space-y-1.5">
                  {digitalDownloads.map((dl, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs bg-white p-2 rounded-xs border border-emerald-100">
                      <span className="font-medium text-neutral-800">{dl.title}</span>
                      <a
                        href={dl.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-700 text-white font-bold rounded-xs hover:bg-emerald-800 text-[11px] inline-flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {hasPhysical && (
              <div className="bg-neutral-50 border border-neutral-200 p-3 rounded-xs text-xs text-neutral-700 flex items-center gap-3 text-left">
                <Truck className="w-6 h-6 text-[#C83338] shrink-0" />
                <div>
                  <p className="font-semibold text-neutral-900">Physical Dispatch Notice</p>
                  <p className="text-[11px] text-neutral-500">
                    Your physical shipment will be packed and dispatched to {address} from Godda within 2 business days.
                  </p>
                </div>
              </div>
            )}

            <button
              onClick={handleClose}
              className="w-full py-3 bg-[#252525] text-white font-heading font-bold text-xs uppercase tracking-wider rounded-xs hover:bg-neutral-800"
            >
              Done & Return to Site
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

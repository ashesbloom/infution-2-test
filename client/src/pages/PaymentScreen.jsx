// client/src/pages/PaymentScreen.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

const PaymentScreen = () => {
  const navigate = useNavigate();
  const { cartItems, openCart } = useCart();

  const shippingAddress = JSON.parse(localStorage.getItem('shippingAddress'));

  useEffect(() => {
    // If no shipping address, go back to shipping
    if (!shippingAddress) {
      navigate('/shipping');
    }
    // If cart is empty, go home
    if (!cartItems || cartItems.length === 0) {
      navigate('/');
    }
  }, [navigate, shippingAddress, cartItems]);

  const [paymentMethod, setPaymentMethod] = useState('PayPal');

  const submitHandler = (e) => {
    e.preventDefault();
    // Save payment method to LocalStorage
    localStorage.setItem('paymentMethod', paymentMethod);
    // Move to final step: Place Order
    navigate('/placeorder');
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-black text-white flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.9)] px-6 sm:px-8 py-8 md:py-10">
        {/* Back button inside card */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a] transition text-sm"
        >
          ← Back
        </button>

        {/* Step Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[10px] md:text-xs font-semibold tracking-[0.2em] text-center mb-6">
          <button
            type="button"
            onClick={openCart}
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            1 · CART
          </button>
          <span className="text-zinc-600">·</span>
          <button
            type="button"
            onClick={() => navigate('/shipping')}
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            2 · SHIPPING
          </button>
          <span className="text-zinc-600">·</span>
          <span className="text-emerald-500 border-b border-emerald-500 pb-0.5">
            3 · PAYMENT
          </span>
        </div>

        {/* Header */}
        <div className="mb-6">
          <p className="text-[11px] tracking-[0.35em] text-emerald-500 uppercase mb-2">
            Checkout · Payment
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Payment <span className="text-[#06a34f]">Method</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-zinc-400">
            Choose how you want to pay for your order. You can still review everything on the next step.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-5">
          <h2 className="text-sm md:text-base font-semibold uppercase tracking-[0.25em] text-zinc-300 mb-2">
            Select Method
          </h2>

          {/* PayPal / Card */}
          <label className="flex items-center gap-3 cursor-pointer p-3.5 md:p-4 rounded-2xl border border-white/10 bg-[#080808] hover:border-[#06a34f] hover:bg-[#0d0d0d] transition">
            <input
              type="radio"
              value="PayPal"
              name="paymentMethod"
              checked={paymentMethod === 'PayPal'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 accent-emerald-500"
            />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-white">
                PayPal / Card
              </span>
              <span className="text-[11px] text-zinc-500">
                Pay securely using your PayPal account or credit / debit card.
              </span>
            </div>
          </label>

          {/* UPI / Netbanking */}
          <label className="flex items-center gap-3 cursor-pointer p-3.5 md:p-4 rounded-2xl border border-white/10 bg-[#080808] hover:border-[#06a34f] hover:bg-[#0d0d0d] transition">
            <input
              type="radio"
              value="UPI"
              name="paymentMethod"
              checked={paymentMethod === 'UPI'}
              onChange={(e) => setPaymentMethod(e.target.value)}
              className="w-4 h-4 accent-emerald-500"
            />
            <div className="flex flex-col">
              <span className="text-sm md:text-base font-semibold text-white">
                UPI / Netbanking
              </span>
              <span className="text-[11px] text-zinc-500">
                Pay using UPI apps or internet banking through our gateway.
              </span>
            </div>
          </label>

          {/* Continue button */}
          <button
            type="submit"
            className="mt-2 w-full bg-[#06a34f] hover:bg-[#058a42] text-white font-black text-xs md:text-sm tracking-[0.3em] uppercase py-3 rounded-xl shadow-[0_0_25px_rgba(6,163,79,0.7)] transition"
          >
            Continue to Review
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentScreen;

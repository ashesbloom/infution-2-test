// client/src/pages/OrderScreen.jsx
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const OrderScreen = () => {
  const { id: orderId } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/orders/${orderId}`, {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        if (!mounted) return;
        setOrder(data);

        // Force scroll to top after content loads so mobile opens at top.
        // Slight timeout allows layout to settle (prevents jumping to middle).
        setTimeout(() => {
          try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          } catch (e) {
            // ignore if window not available
          }
        }, 50);
      } catch (err) {
        console.error('Order fetch error:', err.response?.data || err.message);
        if (!mounted) return;
        setError(
          err.response?.data?.message || 'Failed to load order details.'
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (user) fetchOrder();

    // Also safe-guard: ensure we are at top when component mounts (navigation)
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    } catch (e) {}

    return () => {
      mounted = false;
    };
  }, [orderId, user]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] text-yellow-400">
        <h2 className="text-lg font-semibold tracking-wide">
          Loading your order...
        </h2>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050816] px-4">
        <h2 className="text-center text-red-400 font-semibold">{error}</h2>
      </div>
    );

  if (!order) return null;

  // ---------- Expected Delivery Logic ----------
  const placedDate = new Date(order.createdAt);
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const expectedStart = new Date(placedDate.getTime() + 3 * ONE_DAY);
  const expectedEnd = new Date(placedDate.getTime() + 5 * ONE_DAY);

  const formatDate = (d) =>
    d.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const expectedRange =
    formatDate(expectedStart) === formatDate(expectedEnd)
      ? formatDate(expectedStart)
      : `${formatDate(expectedStart)} - ${formatDate(expectedEnd)}`;

  // ---------- Payment Status Text ----------
  let paymentStatusText = '';
  if (order.paymentMethod === 'COD') {
    paymentStatusText = order.isPaid ? 'Paid (COD)' : 'Pending (COD)';
  } else {
    paymentStatusText = order.isPaid
      ? 'Paid (Prepaid)'
      : 'Pending (Online Payment)';
  }

  // ---------- Delivered Date ----------
  const deliveredDateString =
    order.isDelivered && order.deliveredAt
      ? new Date(order.deliveredAt).toLocaleDateString('en-IN', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        })
      : null;

  const isCancelled = order.isCancelled || order.status === 'Cancelled';

  const statusHeaderLabel = isCancelled
    ? 'Order Cancelled'
    : order.isDelivered
    ? 'Delivered On'
    : 'Expected Delivery';

  const statusHeaderValue = isCancelled
    ? '—'
    : order.isDelivered
    ? deliveredDateString || 'Delivered'
    : expectedRange;

  // Small presentational helpers so we can reuse in different order
  const ShippingCard = () => (
    <div className="bg-[#0b1020] border border-yellow-500/20 rounded-2xl shadow-lg shadow-black/40 p-4 sm:p-5 lg:p-6">
      <h2 className="text-base md:text-xl font-bold tracking-wide text-yellow-400 border-b border-gray-700/70 pb-3 mb-3">
        Shipping To
      </h2>
      <div className="space-y-1 text-xs sm:text-sm">
        <p className="font-semibold text-gray-100">
          {order.shippingAddress.fullName}
        </p>
        <p className="text-gray-300">
          {order.shippingAddress.address}, {order.shippingAddress.city},{' '}
          {order.shippingAddress.state} - {order.shippingAddress.postalCode}
        </p>
        <p className="text-gray-300">{order.shippingAddress.country}</p>
        <p className="text-gray-300">
          Mobile:{' '}
          <span className="font-mono">{order.shippingAddress.phone}</span>
        </p>
      </div>
    </div>
  );

  const OrderItemsCard = () => (
    <div className="bg-[#0b1020] border border-yellow-500/20 rounded-2xl shadow-lg shadow-black/40 p-4 sm:p-5 lg:p-6">
      <h2 className="text-base md:text-xl font-bold tracking-wide text-yellow-400 border-b border-gray-700/70 pb-3 mb-4">
        Order Items
      </h2>
      <div className="space-y-3">
        {order.orderItems.map((item) => (
          <div
            key={item.product}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-800 pb-3 last:border-b-0"
          >
            <div className="flex items-center gap-3 min-w-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
              />
              <div className="flex flex-col min-w-0">
                <span className="text-sm md:text-base text-gray-100 font-medium break-words">
                  {item.name}
                </span>
                <span className="text-xs text-gray-400">Qty: {item.qty}</span>
              </div>
            </div>
            <div className="text-xs sm:text-sm md:text-base text-gray-200 sm:text-right">
              {item.qty} x ₹{item.price}{' '}
              <span className="hidden sm:inline">=</span>{' '}
              <div className="sm:inline-block font-semibold text-yellow-300">
                ₹{(item.qty * item.price).toFixed(2)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-[#050816] text-gray-100 overflow-x-hidden px-4 py-4 md:py-6">
      <div className="w-full max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="flex flex-col mb-3 md:mb-5">
          {/* Back button ABOVE heading */}
          <div className="mb-2">
            <Link
              to={user?.isAdmin ? '/admin/orderlist' : '/myorders'}
              className="inline-flex items-center justify-center gap-1 px-3 py-1.5 text-[10px] 
                         md:px-5 md:py-2.5 md:text-sm 
                         rounded-full border border-yellow-500/60 
                         bg-yellow-500/10 text-yellow-300 font-semibold 
                         hover:bg-yellow-400 hover:text-black 
                         shadow-[0_0_10px_rgba(234,179,8,0.25)] 
                         transition-all duration-200 w-fit"
            >
              <span className="text-base md:text-lg leading-none">🔙</span>
              <span>Back to Orders</span>
            </Link>
          </div>

          <h1 className="text-lg md:text-2xl font-extrabold tracking-wide text-yellow-400 leading-tight">
            Order Details
          </h1>
          <p className="text-[11px] md:text-sm text-gray-400 mt-1">
            Thank you for shopping with INFUSED.
          </p>
        </div>

        {/* CANCELLATION / REFUND BANNERS */}
        {isCancelled && (
          <div className="mb-4 rounded-xl border border-red-600/50 bg-red-900/50 px-4 py-3 text-sm md:text-base text-red-100 font-semibold">
            This order has been cancelled.
          </div>
        )}

        {isCancelled && order.paymentMethod === 'Razorpay' && order.isPaid && (
          <div className="mb-6 rounded-xl border border-yellow-500/60 bg-yellow-900/40 px-4 py-3 text-sm md:text-base text-yellow-100">
            Refund has been initiated. It will be credited back to your original
            payment method within
            <span className="font-bold text-yellow-300"> 3–5 business days</span>.
          </div>
        )}

        {/* MAIN LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-7">
          {/* LEFT SECTION */}
          <div className="lg:col-span-2 space-y-5 lg:space-y-6">
            {/* Order Info Card */}
            <div className="bg-[#0b1020] border border-yellow-500/20 rounded-2xl shadow-lg shadow-black/40 p-4 sm:p-5 lg:p-6">
              <div className="flex items-center justify-between gap-2 mb-4 border-b border-gray-700/70 pb-3">
                <h2 className="text-base md:text-xl font-bold tracking-wide text-yellow-400">
                  Order Info
                </h2>
                <span className="text-[11px] md:text-xs px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-400/40 text-yellow-300 font-semibold">
                  #{order._id.slice(-8)}
                </span>
              </div>

              {/* Expected / Delivered / Cancelled Box */}
              <div
                className={`mb-5 rounded-2xl px-4 py-3 sm:px-5 sm:py-4 border 
                ${
                  isCancelled
                    ? 'border-red-500/40 bg-red-900/30'
                    : order.isDelivered
                    ? 'border-emerald-500/30 bg-emerald-900/30'
                    : 'border-emerald-500/30 bg-emerald-900/30'
                }`}
              >
                <p className="text-[10px] sm:text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200">
                  {statusHeaderLabel}
                </p>

                <p className="mt-1 text-lg md:text-xl font-extrabold text-emerald-100">
                  {statusHeaderValue}
                </p>

                {!isCancelled ? (
                  !order.isDelivered ? (
                    <p className="mt-1 text-[11px] sm:text-xs text-emerald-200/90">
                      We’ll notify you when your order is out for delivery. Keep
                      your phone nearby.
                    </p>
                  ) : (
                    <p className="mt-1 text-[11px] sm:text-xs text-emerald-200/90">
                      Your order has been delivered. Thank you for choosing
                      INFUSED!
                    </p>
                  )
                ) : (
                  <p className="mt-1 text-[11px] sm:text-xs text-red-200/90">
                    This order was cancelled. If you have any questions, please
                    contact support with your Order ID.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-8 text-xs sm:text-sm">
                <p>
                  <span className="text-gray-400">Order ID:</span>{' '}
                  <span className="font-mono break-all text-gray-200">
                    {order._id}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Payment Method:</span>{' '}
                  <span className="font-semibold text-gray-100">
                    {order.paymentMethod}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Payment Status:</span>{' '}
                  <span
                    className={`font-semibold ${
                      order.isPaid ? 'text-emerald-300' : 'text-red-300'
                    }`}
                  >
                    {paymentStatusText}
                  </span>
                </p>
                <p>
                  <span className="text-gray-400">Delivery Status:</span>{' '}
                  <span
                    className={`font-semibold ${
                      isCancelled
                        ? 'text-red-300'
                        : order.isDelivered
                        ? 'text-emerald-300'
                        : 'text-yellow-300'
                    }`}
                  >
                    {isCancelled
                      ? 'Cancelled'
                      : order.isDelivered
                      ? 'Delivered'
                      : 'Not Delivered'}
                  </span>
                </p>
                {order.status && (
                  <p>
                    <span className="text-gray-400">Shipping Status:</span>{' '}
                    <span className="font-semibold text-gray-100">
                      {order.status}
                    </span>
                  </p>
                )}
                <p>
                  <span className="text-gray-400">Placed At:</span>{' '}
                  <span className="text-gray-200">
                    {placedDate.toLocaleString('en-IN')}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Items ABOVE Shipping on mobile */}
            <div className="block lg:hidden">
              <OrderItemsCard />
              <ShippingCard />
            </div>

            {/* Shipping then Items on desktop */}
            <div className="hidden lg:block space-y-5 lg:space-y-6">
              <ShippingCard />
              <OrderItemsCard />
            </div>
          </div>

          {/* RIGHT SECTION - PRICE SUMMARY */}
          <div className="lg:col-span-1">
            <div className="bg-[#0b1020] border border-yellow-500/30 rounded-2xl shadow-lg shadow-black/50 p-4 sm:p-5 lg:p-6 relative lg:sticky lg:top-20">
              <h2 className="text-lg md:text-2xl font-extrabold tracking-wide text-yellow-400 mb-4 border-b border-gray-700/70 pb-3">
                Price Summary
              </h2>

              <div className="space-y-2 text-sm md:text-base">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Items</span>
                  <span className="font-medium text-gray-100">
                    ₹{order.itemsPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Shipping</span>
                  <span className="font-medium text-gray-100">
                    ₹{order.shippingPrice.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Tax</span>
                  <span className="font-medium text-gray-100">
                    ₹{order.taxPrice.toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700/70">
                <div className="flex items-center justify-between">
                  <span className="text-base md:text-lg font-bold text-gray-200">
                    Total
                  </span>
                  <span className="text-xl md:text-2xl font-extrabold text-yellow-400">
                    ₹{order.totalPrice.toFixed(2)}
                  </span>
                </div>
                <p className="mt-2 text-[11px] sm:text-xs text-gray-400">
                  Inclusive of all taxes. You’ll receive an invoice by email and
                  in your INFUSED profile.
                </p>
              </div>

              <div className="mt-5 text-[11px] sm:text-xs text-gray-500">
                <p>Need help with this order?</p>
                <p>Contact support with your Order ID for quick resolution.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;

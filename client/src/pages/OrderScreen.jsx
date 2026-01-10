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

        const { data } = await axios.get(
          `/api/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${user.token}` },
          }
        );

        const cancelled =
          data.isCancelled === true ||
          data.status?.toLowerCase() === "cancelled" ||
          data.shippingStatus?.toLowerCase() === "cancelled" ||
          data.paymentStatus?.toLowerCase() === "cancelled";

        const updatedOrder = {
          ...data,
          isCancelled: cancelled,
          status: cancelled ? "Cancelled" : data.status,
        };

        if (!mounted) return;
        setOrder(updatedOrder);

        setTimeout(() => {
          try {
            window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
          } catch {}
        }, 50);
      } catch (err) {
        if (!mounted) return;
        setError(err.response?.data?.message || 'Failed to load order details.');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // ⭐ IMPORTANT → do NOT call API if user or token is not ready
    if (!user || !user.token) {
      setLoading(false);
      setError("Unable to authenticate. Please log in again.");
      return;
    }

    fetchOrder();

    return () => {
      mounted = false;
    };
  }, [orderId, user]);

  // =========================
  // LOADING / ERROR STATES
  // =========================
  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-emerald-500">
        <h2 className="text-lg font-semibold tracking-wide">Loading your order...</h2>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <h2 className="text-center text-red-400 font-semibold">{error}</h2>
      </div>
    );

  if (!order) return null;

  // =========================
  // FINAL CANCELLATION VALUE
  // =========================
  const isCancelled = order.isCancelled;

  // -------------------------
  // Expected Delivery Logic
  // -------------------------
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

  const paymentStatusText =
    order.paymentMethod === 'COD'
      ? order.isPaid
        ? "Paid (COD)"
        : "Pending (COD)"
      : order.isPaid
      ? "Paid (Online)"
      : "Pending Payment";

  const deliveredDateString =
    order.isDelivered && order.deliveredAt
      ? formatDate(new Date(order.deliveredAt))
      : null;

  const statusHeaderLabel = isCancelled
    ? "Order Cancelled"
    : order.isDelivered
    ? "Delivered On"
    : "Expected Delivery";

  const statusHeaderValue = isCancelled
    ? "—"
    : order.isDelivered
    ? deliveredDateString
    : expectedRange;

  const boxColorClass = isCancelled
    ? "border-red-500/40 bg-red-50"
    : order.isDelivered
    ? "border-emerald-500/30 bg-emerald-50"
    : "border-emerald-500/30 bg-emerald-50";

  // -------------------------
  // Components
  // -------------------------

  const ShippingCard = () => (
    <div className="bg-gray-50 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
      <h2 className="text-xl font-bold text-emerald-500 border-b border-gray-300 pb-3 mb-3">
        Shipping To
      </h2>
      <div className="text-sm space-y-1">
        <p className="font-semibold">{order.shippingAddress.fullName}</p>
        <p>{order.shippingAddress.address}</p>
        <p>
          {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
          {order.shippingAddress.postalCode}
        </p>
        <p>{order.shippingAddress.country}</p>
        <p>Mobile: {order.shippingAddress.phone}</p>
      </div>
    </div>
  );

  const OrderItemsCard = () => (
    <div className="bg-gray-50 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
      <h2 className="text-xl font-bold text-emerald-500 border-b border-gray-300 pb-3 mb-4">
        Order Items
      </h2>
      <div className="space-y-3">
        {order.orderItems.map((item) => (
          <div
            key={item.product}
            className="flex items-center justify-between border-b border-gray-200 pb-2"
          >
            <div className="flex gap-3">
              <img loading="lazy" src={item.image} className="w-12 h-12 rounded-lg" />
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-gray-500 text-xs">Qty: {item.qty}</p>
              </div>
            </div>
            <p className="text-emerald-600 font-semibold">
              ₹{(item.qty * item.price).toFixed(2)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-700 px-4 py-6">
      <div className="max-w-6xl mx-auto">

        {/* Back Button */}
        <Link
          to={user?.isAdmin ? "/admin/orderlist" : "/myorders"}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/40"
        >
           Back to Orders
        </Link>

        <h1 className="text-3xl font-extrabold text-emerald-500 mt-4">Order Details</h1>

        {/* Cancel Banner */}
        {isCancelled && (
          <div className="mt-4 p-3 rounded-xl bg-red-50 border border-red-600/40 text-red-600 font-semibold">
            This order has been cancelled.
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">

          {/* LEFT */}
          <div className="lg:col-span-2 space-y-6">

            {/* Main Order Info */}
            <div className="bg-gray-50 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">

              {/* Status Box */}
              <div className={`rounded-xl p-4 border ${boxColorClass}`}>
                <p className="uppercase text-xs tracking-wider">{statusHeaderLabel}</p>
                <h2 className="text-xl font-bold mt-1">{statusHeaderValue}</h2>

                {isCancelled ? (
                  <p className="text-red-300 text-xs mt-1">This order was cancelled.</p>
                ) : order.isDelivered ? (
                  <p className="text-emerald-600 text-xs mt-1">Your order has been delivered.</p>
                ) : (
                  <p className="text-emerald-600 text-xs mt-1">
                    We'll notify you when your order is out for delivery.
                  </p>
                )}
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-8 mt-4 text-sm">
                <p><b>Order ID:</b> {order._id}</p>
                <p><b>Payment Method:</b> {order.paymentMethod}</p>
                <p><b>Payment Status:</b> {paymentStatusText}</p>
                <p>
                  <b>Delivery Status:</b>{" "}
                  {isCancelled ? "Cancelled" : order.isDelivered ? "Delivered" : "Not Delivered"}
                </p>
                <p><b>Shipping Status:</b> {order.status}</p>
                <p><b>Placed At:</b> {placedDate.toLocaleString("en-IN")}</p>
              </div>
            </div>

            <OrderItemsCard />
            <ShippingCard />
          </div>

          {/* RIGHT - PRICE SUMMARY */}
          <div className="bg-gray-50 border border-emerald-500/20 rounded-2xl p-5 shadow-lg">
            <h2 className="text-xl font-bold text-emerald-500 mb-4">Price Summary</h2>

            <div className="space-y-2 text-sm">
              <p className="flex justify-between">
                <span>Items</span> <span>₹{order.itemsPrice}</span>
              </p>
              <p className="flex justify-between">
                <span>Shipping</span> <span>₹{order.shippingPrice}</span>
              </p>
              <p className="flex justify-between">
                <span>Tax</span> <span>₹{order.taxPrice}</span>
              </p>
            </div>

            <hr className="my-3 border-gray-300" />

            <p className="flex justify-between text-lg font-bold text-emerald-600">
              <span>Total</span>
              <span>₹{order.totalPrice}</span>
            </p>

            <p className="text-gray-500 text-xs mt-3">Inclusive of all taxes.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderScreen;

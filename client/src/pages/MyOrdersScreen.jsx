// client/src/pages/MyOrdersScreen.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Check } from 'lucide-react';

const MyOrdersScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const fetchMyOrders = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get('/api/orders/myorders', {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        });
        setOrders(data);
      } catch (err) {
        setError(
          err?.response?.data?.message || 'Failed to load your orders.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchMyOrders();
  }, [user]);

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      setCancellingId(orderId);

      await axios.put(
        `/api/orders/${orderId}/cancel`,
        {},
        {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      );

      const { data } = await axios.get('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${user.token}` },
      });
      setOrders(data);
    } catch (error) {
      alert(
        error?.response?.data?.message ||
          'Failed to cancel order. Please try again.'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const text = status || 'Processing';

    let classes =
      'inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] ';
    switch (text) {
      case 'Cancelled':
        classes += 'bg-red-900/40 text-red-300 border border-red-500/60';
        break;
      case 'Shipped':
        classes += 'bg-blue-900/40 text-blue-300 border border-blue-500/60';
        break;
      case 'Out for Delivery':
        classes +=
          'bg-yellow-900/30 text-yellow-300 border border-yellow-500/60';
        break;
      case 'Delivered':
        classes +=
          'bg-emerald-900/40 text-emerald-300 border border-emerald-500/60';
        break;
      default:
        classes += 'bg-zinc-900/70 text-zinc-300 border border-zinc-600/70';
        break;
    }

    return <span className={classes}>{text}</span>;
  };

  const renderPaymentBadge = (order) => {
    if (order.paymentMethod === 'COD') {
      return (
        <span className="inline-block bg-zinc-900 text-zinc-100 px-3 py-1 rounded-full text-[11px] font-semibold border border-zinc-600">
          COD
        </span>
      );
    }

    if (order.isPaid) {
      return (
        <span className="inline-block bg-emerald-900/40 text-emerald-300 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/60">
          Prepaid
        </span>
      );
    }

    return (
      <span className="inline-block bg-red-900/50 text-red-300 px-3 py-1 rounded-full text-[11px] font-semibold border border-red-500/60">
        Pending
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center px-4 text-center">
        Please login to view your orders.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black text-red-400 flex items-center justify-center px-4 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 md:px-10 py-4">
      <div className="max-w-6xl mx-auto">
        {/* Back Button - smaller on mobile */}
        <button
          onClick={() => (window.location.href = '/')}
          className="
            mb-3
            inline-flex items-center gap-1
            px-2 py-1 text-[10px]
            md:px-4 md:py-2 md:text-xs
            rounded-lg
            bg-[#111111] text-white
            hover:bg-[#181818]
            border border-white/10
            transition
            font-semibold uppercase tracking-[0.2em]
          "
        >
          ← Back to Home
        </button>

        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          My Orders
          <span className="text-sm md:text-base text-zinc-400 ml-2 font-normal">
            ({orders.length})
          </span>
        </h1>

        {orders.length === 0 ? (
          <p className="text-zinc-400 text-sm">
            You have not placed any orders yet.
          </p>
        ) : (
          <div className="space-y-4">
            {/* MOBILE CARDS */}
            <div className="md:hidden space-y-4">
              {orders.map((order) => {
                const isCancelled =
                  order.isCancelled || order.status === 'Cancelled';

                const canCancel =
                  !isCancelled &&
                  !order.isDelivered &&
                  order.status !== 'Shipped' &&
                  order.status !== 'Out for Delivery' &&
                  order.status !== 'Delivered';

                const itemNames =
                  order.orderItems.length > 0
                    ? order.orderItems.map((i) => i.name).join(', ')
                    : 'Items not available';

                return (
                  <div
                    key={order._id}
                    className="rounded-2xl border border-white/10 bg-[#050505] shadow-[0_0_25px_rgba(0,0,0,0.8)] p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500">
                          Order ID
                        </p>
                        <p className="font-mono text-xs">
                          {order._id.substring(19)}
                        </p>
                      </div>
                      {renderStatusBadge(
                        isCancelled ? 'Cancelled' : order.status
                      )}
                    </div>

                    <div className="grid grid-cols-2 mt-2 gap-3">
                      <div>
                        <p className="text-[10px] uppercase text-zinc-500">
                          Items
                        </p>
                        <p className="text-[11px] text-zinc-200 line-clamp-2">
                          {itemNames}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase text-zinc-500">
                          Date
                        </p>
                        <p className="text-[11px]">
                          {order.createdAt.substring(0, 10)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1">
                      <p className="text-[10px] uppercase text-zinc-500">
                        Payment & Total
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        {renderPaymentBadge(order)}
                        <p className="font-semibold text-[#f5b014]">
                          ₹{order.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-3 text-[11px] text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-zinc-500">
                          Delivery
                        </span>

                        {order.isDelivered ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400">
                            <Check size={14} />
                            Delivered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-400">
                            <X size={14} />
                            Not Delivered
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-white/5">
                      {canCancel && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="flex-1 py-2 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded-md font-bold uppercase tracking-[0.2em] disabled:opacity-60"
                        >
                          {cancellingId === order._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      )}

                      <Link to={`/order/${order._id}`} className="flex-1">
                        <button className="w-full py-2 text-[10px] bg-[#f5b014] hover:bg-[#ffca3b] text-black rounded-md font-bold uppercase tracking-[0.2em]">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE LAYOUT */}
            <div className="hidden md:block overflow-x-auto bg-[#050505] rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-white/10">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-[#101010]">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-zinc-400 uppercase tracking-[0.25em]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-black divide-y divide-white/10">
                  {orders.map((order) => {
                    const isCancelled =
                      order.isCancelled || order.status === 'Cancelled';

                    const canCancel =
                      !isCancelled &&
                      !order.isDelivered &&
                      order.status !== 'Shipped' &&
                      order.status !== 'Out for Delivery' &&
                      order.status !== 'Delivered';

                    return (
                      <tr
                        key={order._id}
                        className="hover:bg-[#080808] transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-zinc-300">
                          {order._id.substring(19)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-400">
                          {order.createdAt.substring(0, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-zinc-200">
                          ₹{order.totalPrice}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {renderPaymentBadge(order)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {order.isDelivered ? (
                            <div className="flex justify-center text-emerald-400">
                              <Check size={18} />
                            </div>
                          ) : (
                            <div className="flex justify-center text-red-400">
                              <X size={18} />
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {renderStatusBadge(
                            isCancelled ? 'Cancelled' : order.status
                          )}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium space-x-2">
                          {canCancel && (
                            <button
                              onClick={() => cancelOrder(order._id)}
                              disabled={cancellingId === order._id}
                              className="inline-flex items-center px-4 py-2 text-[10px] bg-red-600 hover:bg-red-500 text-white rounded-md font-bold uppercase tracking-[0.2em] transition disabled:opacity-60"
                            >
                              {cancellingId === order._id
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}

                          <Link to={`/order/${order._id}`}>
                            <button className="inline-flex items-center px-4 py-2 text-[10px] bg-[#f5b014] hover:bg-[#ffca3b] text-black rounded-md font-bold uppercase tracking-[0.2em] transition">
                              View Details
                            </button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrdersScreen;

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
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '' });

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

  const promptCancel = (orderId) => {
    setSelectedCancelId(orderId);
    setShowConfirm(true);
  };

  const cancelOrder = async (orderId) => {
    try {
      setShowConfirm(false);
      setCancellingId(orderId);

      await axios.put(
  `/api/orders/${orderId}/cancel`,
  {},
  {
    headers: { Authorization: `Bearer ${user.token}` },
  }
);


    const { data } = await axios.get(
  `/api/orders/myorders`,
  {
    headers: { Authorization: `Bearer ${user.token}` },
  }
);

      setOrders(data);
      setToast({ show: true, message: 'Order cancelled successfully.' });
      setTimeout(() => setToast({ show: false, message: '' }), 2500);
    } catch (error) {
      setToast({
        show: true,
        message:
          error?.response?.data?.message ||
          'Failed to cancel order. Please try again.',
      });
      setTimeout(() => setToast({ show: false, message: '' }), 3500);
    } finally {
      setCancellingId(null);
      setSelectedCancelId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const text = status || 'Processing';

    let classes =
      'inline-flex px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-[0.2em] ';
    switch (text) {
      case 'Cancelled':
        classes += 'bg-red-50 text-red-600 border border-red-500/60';
        break;
      case 'Shipped':
        classes += 'bg-blue-900/40 text-blue-300 border border-blue-500/60';
        break;
      case 'Out for Delivery':
        classes +=
          'bg-emerald-50 text-emerald-600 border border-emerald-500/60';
        break;
      case 'Delivered':
        classes +=
          'bg-emerald-50 text-emerald-600 border border-emerald-500/60';
        break;
      default:
        classes += 'bg-gray-100/70 text-gray-600 border border-gray-300/70';
        break;
    }

    return <span className={classes}>{text}</span>;
  };

  const renderPaymentBadge = (order) => {
    if (order.paymentMethod === 'COD') {
      return (
        <span className="inline-block bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[11px] font-semibold border border-gray-300">
          COD
        </span>
      );
    }

    if (order.isPaid) {
      return (
        <span className="inline-block bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full text-[11px] font-semibold border border-emerald-500/60">
          Prepaid
        </span>
      );
    }

    return (
      <span className="inline-block bg-red-100 text-red-600 px-3 py-1 rounded-full text-[11px] font-semibold border border-red-500/60">
        Pending
      </span>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-white text-red-400 flex items-center justify-center px-4 text-center">
        Please login to view your orders.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
        Loading your orders...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-red-400 flex items-center justify-center px-4 text-center">
        Error: {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 px-4 md:px-10 py-4">
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
            bg-gray-50 text-gray-800
            hover:bg-[#181818]
            border border-gray-200
            transition
            font-semibold uppercase tracking-[0.2em]
          "
        >
          ← Back to Home
        </button>

        <h1 className="text-2xl md:text-3xl font-black mb-6 tracking-tight">
          My Orders
          <span className="text-sm md:text-base text-gray-500 ml-2 font-normal">
            ({orders.length})
          </span>
        </h1>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-sm">
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
                    className="rounded-2xl border border-gray-200 bg-white shadow-lg p-4 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-[10px] uppercase text-gray-500">
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
                        <p className="text-[10px] uppercase text-gray-500">
                          Items
                        </p>
                        <p className="text-[11px] text-gray-700 line-clamp-2">
                          {itemNames}
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] uppercase text-gray-500">
                          Date
                        </p>
                        <p className="text-[11px]">
                          {order.createdAt.substring(0, 10)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-1">
                      <p className="text-[10px] uppercase text-gray-500">
                        Payment & Total
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        {renderPaymentBadge(order)}
                        <p className="font-semibold text-[#06a34f]">
                          ₹{order.totalPrice}
                        </p>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 pt-3 text-[11px] text-gray-600">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] uppercase text-gray-500">
                          Delivery
                        </span>

                        {order.isDelivered ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600">
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

                    <div className="flex gap-2 pt-2 border-t border-gray-200">
                      {canCancel && (
                        <button
                          onClick={() => promptCancel(order._id)}
                          disabled={cancellingId === order._id}
                          className="flex-1 py-2 text-[10px] bg-red-600 hover:bg-red-500 text-gray-800 rounded-md font-bold uppercase tracking-[0.2em] disabled:opacity-60"
                        >
                          {cancellingId === order._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      )}

                      <Link to={`/order/${order._id}`} className="flex-1">
                        <button className="w-full py-2 text-[10px] bg-[#06a34f] hover:bg-[#058a42] text-gray-800 rounded-md font-bold uppercase tracking-[0.2em]">
                          View Details
                        </button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* DESKTOP TABLE LAYOUT */}
            <div className="hidden md:block overflow-x-auto bg-white rounded-2xl shadow-[0_0_30px_rgba(0,0,0,0.8)] border border-gray-200">
              <table className="min-w-full divide-y divide-white/10 text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Total
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Delivered
                    </th>
                    <th className="px-6 py-3 text-center text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-[10px] font-semibold text-gray-500 uppercase tracking-[0.25em]">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-white divide-y divide-white/10">
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
                        className="hover:bg-gray-100 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-mono text-gray-600">
                          {order._id.substring(19)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                          {order.createdAt.substring(0, 10)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                          ₹{order.totalPrice}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {renderPaymentBadge(order)}
                        </td>

                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          {order.isDelivered ? (
                            <div className="flex justify-center text-emerald-600">
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
                              onClick={() => promptCancel(order._id)}
                              disabled={cancellingId === order._id}
                              className="inline-flex items-center px-4 py-2 text-[10px] bg-red-600 hover:bg-red-500 text-gray-800 rounded-md font-bold uppercase tracking-[0.2em] transition disabled:opacity-60"
                            >
                              {cancellingId === order._id
                                ? 'Cancelling...'
                                : 'Cancel'}
                            </button>
                          )}

                          <Link to={`/order/${order._id}`}>
                            <button className="inline-flex items-center px-4 py-2 text-[10px] bg-[#06a34f] hover:bg-[#058a42] text-gray-800 rounded-md font-bold uppercase tracking-[0.2em] transition">
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

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-gray-50" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-gray-50 border border-gray-200 rounded-2xl p-6 w-[90%] max-w-md z-70 shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-600 mb-4">Are you sure you want to cancel this order?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-gray-100 text-gray-600 border border-gray-200"
              >
                No
              </button>
              <button
                onClick={() => cancelOrder(selectedCancelId)}
                className="px-4 py-2 rounded-md bg-red-600 text-gray-800 font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className="fixed bottom-6 right-6 z-60 bg-gray-100 text-gray-800 px-4 py-2 rounded-md shadow-[0_8px_30px_rgba(0,0,0,0.8)]">
          {toast.message}
        </div>
      )}
    </div>
  );
};

export default MyOrdersScreen;

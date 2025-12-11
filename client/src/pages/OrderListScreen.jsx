import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { X, Check, Filter } from 'lucide-react';

const OrderListScreen = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // 🔍 Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

  // small toast for success messages
  const [toast, setToast] = useState(null);

  const config =
    user && user.token
      ? {
          headers: { Authorization: `Bearer ${user.token}` },
        }
      : {};

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get('/api/orders', config);
      setOrders(data);
      setLoading(false);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) {
      fetchOrders();
    }
  }, [user]);

  // helper to show a transient toast
  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await axios.put(`/api/orders/${orderId}/status`, { status }, config);
      await fetchOrders();
      showToast(`Order ${orderId.substring(19)} updated to "${status}". Email sent if configured.`);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to update order status'
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;

    try {
      setCancellingId(orderId);
      await axios.put(`/api/orders/${orderId}/cancel`, {}, config);
      await fetchOrders();
      showToast(`Order ${orderId.substring(19)} cancelled.`);
    } catch (err) {
      alert(
        err?.response?.data?.message ||
          err?.message ||
          'Failed to cancel order'
      );
    } finally {
      setCancellingId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const text = status || 'Processing';

    let classes =
      'inline-flex items-center justify-center px-3 py-1 rounded-full text-[11px] font-semibold border ';
    switch (text) {
      case 'Shipped':
        classes +=
          'bg-blue-500/10 text-blue-300 border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.45)]';
        break;
      case 'Out for Delivery':
        classes +=
          'bg-yellow-500/10 text-yellow-300 border-yellow-500/40 shadow-[0_0_10px_rgba(245,158,11,0.45)]';
        break;
      case 'Delivered':
        classes +=
          'bg-green-500/10 text-green-300 border-green-500/40 shadow-[0_0_10px_rgba(34,197,94,0.45)]';
        break;
      case 'Cancelled':
        classes +=
          'bg-red-500/10 text-red-300 border-red-500/40 shadow-[0_0_10px_rgba(239,68,68,0.45)]';
        break;
      default:
        classes += 'bg-gray-500/10 text-gray-300 border-gray-500/40';
        break;
    }

    return <span className={classes}>{text}</span>;
  };

  // 🔎 Derived filtered orders
  const filteredOrders = (orders || []).filter((order) => {
    const statusText = order.status || 'Processing';
    let paymentText;

    if (order.paymentMethod === 'COD') {
      paymentText = 'COD';
    } else if (order.isPaid) {
      paymentText = 'Prepaid';
    } else {
      paymentText = 'Pending';
    }

    if (filterStatus !== 'all' && statusText !== filterStatus) return false;
    if (filterPayment !== 'all' && paymentText !== filterPayment) return false;

    return true;
  });

  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen w-full bg-black text-red-500 flex items-center justify-center px-4 text-center">
        You are not authorized to view this page.
      </div>
    );
  }

  if (loading)
    return (
      <div className="min-h-screen w-full bg-black text-gray-300 flex items-center justify-center">
        Loading Orders...
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen w-full bg-black text-red-500 flex items-center justify-center px-4 text-center">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-8 pb-10">

        {/* Header + Filter button row */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-white">Orders </span>
            <span className="text-yellow-400 text-sm sm:text-base">
              ({filteredOrders.length})
            </span>
          </h1>

          {/* Filter button (no dropdown here, overlay will be below) */}
          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-500 text-yellow-300 bg-black/40 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-yellow-500/10 hover:text-yellow-200 shadow-[0_0_16px_rgba(250,204,21,0.4)] transition-all"
          >
            <Filter size={14} />
            Filter
            <span className="text-[9px]">{filterOpen ? '▲' : '▼'}</span>
          </button>
        </div>

        {/* Table container – page scroll only */}
        <div className="w-full rounded-2xl bg-[#050814] border border-white/10 shadow-xl overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-[#0b1220] sticky top-0 z-20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Delivered
                </th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, idx) => {
                const statusText = order.status || 'Processing';
                const isProcessing = statusText === 'Processing';
                const isCancelled =
                  order.status === 'Cancelled' || order.isCancelled;
                const canCancel =
                  isProcessing && !order.isDelivered && !isCancelled;

                const showShip = statusText === 'Processing';
                const showOutForDelivery =
                  statusText === 'Processing' || statusText === 'Shipped';
                const showDelivered =
                  statusText === 'Processing' ||
                  statusText === 'Shipped' ||
                  statusText === 'Out for Delivery';

                return (
                  <tr
                    key={order._id}
                    className={`border-t border-white/5 transition-all ${
                      idx % 2 === 0 ? 'bg-[#050814]' : 'bg-[#050814]/80'
                    } hover:bg-[#0f172a] hover:shadow-[0_0_18px_rgba(245,176,20,0.35)]`}
                  >
                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-200">
                      {order._id.substring(19)}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      {order.user?.name}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      {order.createdAt.substring(0, 10)}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">
                      ₹{order.totalPrice}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs sm:text-sm">
                      {order.paymentMethod === 'COD' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-500/20 text-gray-100 border border-gray-500/50">
                          COD
                        </span>
                      ) : order.isPaid ? (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-green-500/15 text-green-300 border border-green-500/50">
                          Prepaid
                        </span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/50">
                          Pending
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      {order.isDelivered ? (
                        <div className="flex justify-center text-green-500">
                          <Check size={18} />
                        </div>
                      ) : (
                        <div className="flex justify-center text-red-500">
                          <X size={18} />
                        </div>
                      )}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs sm:text-sm">
                      {renderStatusBadge(
                        isCancelled ? 'Cancelled' : order.status
                      )}
                    </td>

                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium space-x-2">
                      {canCancel && (
                        <button
                          onClick={() => cancelOrder(order._id)}
                          disabled={cancellingId === order._id}
                          className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_14px_rgba(239,68,68,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all"
                        >
                          {cancellingId === order._id
                            ? 'Cancelling...'
                            : 'Cancel'}
                        </button>
                      )}

                      {!order.isDelivered && !isCancelled && (
                        <>
                          {showShip && (
                            <button
                              onClick={() =>
                                updateStatus(order._id, 'Shipped')
                              }
                              disabled={updatingId === order._id}
                              className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-blue-500 text-white hover:bg-blue-400 hover:shadow-[0_0_14px_rgba(59,130,246,0.7)] disabled:opacity-60 disabled:hover:shadow-none transition-all"
                            >
                              {updatingId === order._id
                                ? 'Updating...'
                                : 'Shipped'}
                            </button>
                          )}

                          {showOutForDelivery && (
                            <button
                              onClick={() =>
                                updateStatus(order._id, 'Out for Delivery')
                              }
                              disabled={updatingId === order._id}
                              className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_14px_rgba(245,197,24,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all"
                            >
                              {updatingId === order._id
                                ? 'Updating...'
                                : 'Out for Delivery'}
                            </button>
                          )}

                          {showDelivered && (
                            <button
                              onClick={() =>
                                updateStatus(order._id, 'Delivered')
                              }
                              disabled={updatingId === order._id}
                              className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-green-500 text-white hover:bg-green-400 hover:shadow-[0_0_14px_rgba(34,197,94,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all"
                            >
                              {updatingId === order._id
                                ? 'Updating...'
                                : 'Delivered'}
                            </button>
                          )}
                        </>
                      )}

                      <Link to={`/order/${order._id}`}>
                        <button className="mt-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-gray-700 text-gray-100 hover:bg-gray-600 hover:shadow-[0_0_12px_rgba(148,163,184,0.8)] transition-all">
                          Details
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

      {/* 🔶 FILTER OVERLAY (FLOATING, DOES NOT MOVE TABLE) */}
      {filterOpen && (
        <div
       className="fixed inset-0 z-40 flex items-start justify-end pt-32 pr-20 sm:pt-40 sm:pr-48 bg-black/40 backdrop-blur-sm"
        onClick={() => setFilterOpen(false)}
          >

          <div
            className="w-72 rounded-2xl bg-[#020617] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.9)] p-4 text-xs text-gray-200 relative"
            onClick={(e) => e.stopPropagation()} // prevent close when clicking inside
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setFilterOpen(false)}
              className="absolute top-3 right-3 text-gray-500 hover:text-yellow-400 transition"
            >
              <X size={16} />
            </button>

            {/* Status filter */}
            <div className="mb-4 mt-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                Status
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'Processing', value: 'Processing' },
                  { label: 'Shipped', value: 'Shipped' },
                  { label: 'Out for Delivery', value: 'Out for Delivery' },
                  { label: 'Delivered', value: 'Delivered' },
                  { label: 'Cancelled', value: 'Cancelled' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilterStatus(opt.value)}
                    className={`px-2.5 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.16em] text-center ${
                      filterStatus === opt.value
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                        : 'border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Payment filter */}
            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">
                Payment
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: 'All', value: 'all' },
                  { label: 'COD', value: 'COD' },
                  { label: 'Prepaid', value: 'Prepaid' },
                  { label: 'Pending', value: 'Pending' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFilterPayment(opt.value)}
                    className={`px-2.5 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.16em] ${
                      filterPayment === opt.value
                        ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300'
                        : 'border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Reset button */}
            <button
              type="button"
              onClick={() => {
                setFilterStatus('all');
                setFilterPayment('all');
              }}
              className="w-full text-[10px] uppercase tracking-[0.22em] text-gray-300 hover:text-yellow-400 mt-1"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Simple toast (bottom-right) */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50">
          <div className="px-4 py-2 rounded-lg bg-black/90 border border-white/10 text-sm text-gray-200 shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;

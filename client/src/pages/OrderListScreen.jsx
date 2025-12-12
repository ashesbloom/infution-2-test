// client/src/pages/OrderListScreen.jsx
// <-- paste this entire file (replaces current OrderListScreen.jsx) -->

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

  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');

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
      setOrders(data || []);
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
      alert(err?.response?.data?.message || err?.message || 'Failed to update order status');
    } finally {
      setUpdatingId(null);
    }
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState(null);

  const promptCancel = (orderId) => {
    setSelectedCancelId(orderId);
    setShowConfirm(true);
  };

  const cancelOrder = async (orderId) => {
    try {
      setShowConfirm(false);
      setCancellingId(orderId);
      await axios.put(`/api/orders/${orderId}/cancel`, {}, config);
      await fetchOrders();
      showToast(`Order ${orderId.substring(19)} cancelled.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to cancel order');
    } finally {
      setCancellingId(null);
      setSelectedCancelId(null);
    }
  };

  const renderStatusBadge = (status) => {
    const text = status || 'Processing';

    // base pill
    let base = 'inline-block px-3 py-1 rounded-full text-[12px] font-semibold border ';
    // glow + color per status
    switch (text) {
      case 'Shipped':
        return <span className={base + 'bg-blue-900/60 text-blue-300 border-blue-500/30 shadow-[0_0_14px_rgba(59,130,246,0.18)]'}>{text}</span>;
      case 'Out for Delivery':
        return <span className={base + 'bg-yellow-900/45 text-yellow-300 border-yellow-400/30 shadow-[0_0_18px_rgba(245,176,20,0.18)]'}>{text}</span>;
      case 'Delivered':
        return <span className={base + 'bg-green-900/50 text-green-300 border-green-400/30 shadow-[0_0_18px_rgba(34,197,94,0.18)]'}>{text}</span>;
      case 'Cancelled':
        return <span className={base + 'bg-red-900/45 text-red-300 border-red-400/30 shadow-[0_0_18px_rgba(239,68,68,0.18)]'}>{text}</span>;
      default:
        return <span className={base + 'bg-gray-800 text-gray-300 border-gray-700/40'}>{text}</span>;
    }
  };

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
        <div className="mb-5">
          <Link to="/admin/dashboard">
            <button className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              ← Back
            </button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            <span className="text-white">Orders </span>
            <span className="text-yellow-400 text-sm sm:text-base">({filteredOrders.length})</span>
          </h1>

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

        {/* desktop table unchanged */}
        <div className="hidden md:block w-full rounded-2xl bg-[#050814] border border-white/10 shadow-xl overflow-x-auto">
          <table className="min-w-full table-auto">
            <thead className="bg-[#0b1220] sticky top-0 z-20">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Delivered</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredOrders.map((order, idx) => {
                const statusText = order.status || 'Processing';
                const isCancelled = order.status === 'Cancelled' || order.isCancelled;
                // Only allow cancel if not cancelled, not delivered, not shipped, not out for delivery
                const canCancel = !isCancelled && !order.isDelivered && statusText !== 'Shipped' && statusText !== 'Out for Delivery' && statusText !== 'Delivered';

                const showShip = statusText === 'Processing';
                const showOutForDelivery = statusText === 'Processing' || statusText === 'Shipped';
                const showDelivered = statusText === 'Processing' || statusText === 'Shipped' || statusText === 'Out for Delivery';

                return (
                  <tr key={order._id} className={`border-t border-white/5 transition-all ${idx % 2 === 0 ? 'bg-[#050814]' : 'bg-[#050814]/80'} hover:bg-[#0f172a] hover:shadow-[0_0_18px_rgba(245,176,20,0.35)]`}>
                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-200">{order._id.substring(19)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{order.user?.name}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{order.createdAt.substring(0, 10)}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">₹{order.totalPrice}</td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs sm:text-sm">
                      {order.paymentMethod === 'COD' ? (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-gray-500/20 text-gray-100 border border-gray-500/50">COD</span>
                      ) : order.isPaid ? (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-green-500/15 text-green-300 border border-green-500/50">Prepaid</span>
                      ) : (
                        <span className="inline-block px-3 py-1 rounded-full text-[11px] font-semibold bg-red-500/15 text-red-300 border border-red-500/50">Pending</span>
                      )}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center">
                      {order.isDelivered ? (<div className="flex justify-center text-green-500"><Check size={18} /></div>) : (<div className="flex justify-center text-red-500"><X size={18} /></div>)}
                    </td>
                    <td className="px-6 py-3 whitespace-nowrap text-center text-xs sm:text-sm">{renderStatusBadge(order.status)}</td>

                    <td className="px-6 py-3 whitespace-nowrap text-xs sm:text-sm font-medium space-x-2">
                      {canCancel && (
                        <button onClick={() => promptCancel(order._id)} disabled={cancellingId === order._id} className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-red-600 text-white hover:bg-red-500 hover:shadow-[0_0_14px_rgba(239,68,68,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all">
                          {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                        </button>
                      )}

                      {!order.isDelivered && !isCancelled && (
                        <>
                          {showShip && (
                            <button onClick={() => updateStatus(order._id, 'Shipped')} disabled={updatingId === order._id} className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-blue-500 text-white hover:bg-blue-400 hover:shadow-[0_0_14px_rgba(59,130,246,0.7)] disabled:opacity-60 disabled:hover:shadow-none transition-all">
                              {updatingId === order._id ? 'Updating...' : 'Shipped'}
                            </button>
                          )}

                          {showOutForDelivery && (
                            <button onClick={() => updateStatus(order._id, 'Out for Delivery')} disabled={updatingId === order._id} className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-yellow-400 text-black hover:bg-yellow-300 hover:shadow-[0_0_14px_rgba(245,197,24,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all">
                              {updatingId === order._id ? 'Updating...' : 'Out for Delivery'}
                            </button>
                          )}

                          {showDelivered && (
                            <button onClick={() => updateStatus(order._id, 'Delivered')} disabled={updatingId === order._id} className="mb-1 inline-flex items-center px-3 py-1 text-[11px] rounded bg-green-500 text-white hover:bg-green-400 hover:shadow-[0_0_14px_rgba(34,197,94,0.9)] disabled:opacity-60 disabled:hover:shadow-none transition-all">
                              {updatingId === order._id ? 'Updating...' : 'Delivered'}
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

        {/* MOBILE CARDS: product-like theme (matches ProductsScreen) */}
        <section className="md:hidden space-y-4">
          {loading ? (
            <p className="text-gray-300">Loading...</p>
          ) : filteredOrders.length === 0 ? (
            <p className="text-gray-400 text-sm">No orders found.</p>
          ) : (
            filteredOrders.map((order) => {
              const statusText = order.status || 'Processing';
              const isCancelled = order.status === 'Cancelled' || order.isCancelled;
              // Only allow cancel if not cancelled, not delivered, not shipped, not out for delivery
              const canCancel = !isCancelled && !order.isDelivered && statusText !== 'Shipped' && statusText !== 'Out for Delivery' && statusText !== 'Delivered';

              const showShip = statusText === 'Processing';
              const showOutForDelivery = statusText === 'Processing' || statusText === 'Shipped';
              const showDelivered = statusText === 'Processing' || statusText === 'Shipped' || statusText === 'Out for Delivery';

              const firstItem = order.orderItems?.[0] || {};

              return (
                <div
                  key={order._id}
                  className="bg-[#0d0d0d] border-yellow-300 border-opacity-30 rounded-2xl p-4 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-yellow-500/12"
                >
                  {/* small top-left tag (optional if you want a tag like product cards) */}
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-20 h-20 flex items-center justify-center bg-[#0b0b0b] rounded-lg p-2">
                      <img src={firstItem.image || '/images/placeholder.png'} alt={firstItem.name || 'Order item'} className="max-h-16 object-contain" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="truncate">
                          <h3 className="text-sm font-extrabold text-gray-200 truncate">{firstItem.name ? firstItem.name : `Order #${order._id.substring(19)}`}</h3>
                          <p className="text-xs text-gray-300 truncate mt-1">{order.user?.name || '—'}</p>
                        </div>

                        <div className="text-right">
                          <p className="text-yellow-400 font-bold text-sm">₹{order.totalPrice}</p>

                          {/* status badge with glow */}
                          <div className="mt-2">
                            {renderStatusBadge(isCancelled ? 'Cancelled' : order.status)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-300 grid grid-cols-2 gap-2">
                        <div>
                          <div className="text-[11px] text-gray-400">Date</div>
                          <div className="font-medium">{order.createdAt.substring(0, 10)}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-gray-400">Items</div>
                          <div className="font-medium">{order.orderItems?.length ?? 0}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-gray-400">Payment</div>
                          <div className="font-medium">{order.paymentMethod === 'COD' ? 'COD' : order.isPaid ? 'Prepaid' : 'Pending'}</div>
                        </div>
                        <div>
                          <div className="text-[11px] text-gray-400">Delivered</div>
                          <div className="font-medium">{order.isDelivered ? 'Yes' : 'No'}</div>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {canCancel && (
                          <button onClick={() => promptCancel(order._id)} disabled={cancellingId === order._id} className="inline-flex items-center px-3 py-1.5 text-[12px] rounded bg-red-600 text-white hover:bg-red-500 disabled:opacity-60 transition">
                            {cancellingId === order._id ? 'Cancelling...' : 'Cancel'}
                          </button>
                        )}
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/70" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-[#0b0b0b] border border-white/10 rounded-2xl p-6 w-[90%] max-w-md z-70 shadow-[0_40px_120px_rgba(0,0,0,0.9)]">
            <h3 className="text-lg font-bold mb-2">Cancel Order</h3>
            <p className="text-sm text-zinc-300 mb-4">Are you sure you want to cancel this order?</p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 rounded-md bg-[#111] text-zinc-300 border border-white/10"
              >
                No
              </button>
              <button
                onClick={() => cancelOrder(selectedCancelId)}
                className="px-4 py-2 rounded-md bg-red-600 text-white font-bold"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

                        {!order.isDelivered && !isCancelled && (
                          <>
                            {showShip && (
                              <button onClick={() => updateStatus(order._id, 'Shipped')} disabled={updatingId === order._id} className="inline-flex items-center px-3 py-1.5 text-[12px] rounded bg-blue-500 text-white hover:bg-blue-400 disabled:opacity-60 transition">
                                {updatingId === order._id ? 'Updating...' : 'Shipped'}
                              </button>
                            )}

                            {showOutForDelivery && (
                              <button onClick={() => updateStatus(order._id, 'Out for Delivery')} disabled={updatingId === order._id} className="inline-flex items-center px-3 py-1.5 text-[12px] rounded bg-yellow-400 text-black hover:bg-yellow-300 disabled:opacity-60 transition">
                                {updatingId === order._id ? 'Updating...' : 'Out for Delivery'}
                              </button>
                            )}

                            {showDelivered && (
                              <button onClick={() => updateStatus(order._id, 'Delivered')} disabled={updatingId === order._id} className="inline-flex items-center px-3 py-1.5 text-[12px] rounded bg-green-500 text-white hover:bg-green-400 disabled:opacity-60 transition">
                                {updatingId === order._id ? 'Updating...' : 'Delivered'}
                              </button>
                            )}
                          </>
                        )}

                        <Link to={`/order/${order._id}`}>
                          <button className="inline-flex items-center px-3 py-1.5 text-[12px] rounded bg-gray-700 text-gray-100 hover:bg-gray-600 transition">
                            Details
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </section>
      </div>

      {/* FILTER OVERLAY - unchanged */}
      {filterOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end md:items-start justify-center md:justify-end bg-black/40 backdrop-blur-sm"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="w-full max-w-md md:w-72 rounded-t-xl md:rounded-2xl bg-[#020617] border border-white/10 shadow-[0_18px_40px_rgba(0,0,0,0.9)] p-4 text-xs text-gray-200 relative m-4 md:m-8"
            onClick={(e) => e.stopPropagation()}
          >
            <button type="button" onClick={() => setFilterOpen(false)} className="absolute top-3 right-3 text-gray-500 hover:text-yellow-400 transition">
              <X size={16} />
            </button>

            <div className="mb-4 mt-2">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Status</p>
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
                    className={`px-2.5 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.16em] text-center ${filterStatus === opt.value ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="text-[10px] uppercase tracking-[0.2em] text-gray-400 mb-2">Payment</p>
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
                    className={`px-2.5 py-1.5 rounded-full border text-[10px] uppercase tracking-[0.16em] ${filterPayment === opt.value ? 'border-yellow-500 bg-yellow-500/20 text-yellow-300' : 'border-white/10 text-gray-300 hover:border-yellow-500 hover:text-yellow-200'}`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button type="button" onClick={() => { setFilterStatus('all'); setFilterPayment('all'); }} className="w-full text-[10px] uppercase tracking-[0.22em] text-gray-300 hover:text-yellow-400 mt-1">
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* toast */}
      {toast && (
        <div className="fixed right-6 bottom-6 z-50 md:right-6 md:bottom-6 left-0 md:left-auto md:translate-x-0">
          <div className="mx-auto md:mx-0 inline-block px-4 py-2 rounded-lg bg-black/90 border border-white/10 text-sm text-gray-200 shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;

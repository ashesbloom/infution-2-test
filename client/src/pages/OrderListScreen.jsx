// client/src/pages/OrderListScreen.jsx

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import { X, Check, Filter } from 'lucide-react';

const OrderListScreen = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);

  // ⭐ FILTER STATES
  const [filterOpen, setFilterOpen] = useState(false);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPayment, setFilterPayment] = useState('all');
  const [filterUser, setFilterUser] = useState('all'); // NEW

  const [toast, setToast] = useState(null);

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCancelId, setSelectedCancelId] = useState(null);

  // ⭐ PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 25;

  const config =
    user && user.token
      ? { headers: { Authorization: `Bearer ${user.token}` } }
      : {};

  // ⭐ FETCH ORDERS
  const fetchOrders = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/api/orders', config);

     
      setOrders(data || []);
    } catch (err) {
      setError(err.response ? err.response.data.message : err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.isAdmin) fetchOrders();
  }, [user]);

  // ⭐ TOAST
  const showToast = (msg, ms = 3000) => {
    setToast(msg);
    setTimeout(() => setToast(null), ms);
  };

  // ⭐ UPDATE ORDER STATUS
  const updateStatus = async (orderId, status) => {
    try {
      setUpdatingId(orderId);
      await api.put(`/api/orders/${orderId}/status`, { status }, config);

    
      await fetchOrders();
      showToast(`Order ${orderId.substring(19)} updated to "${status}".`);
    } catch (err) {
      alert(err?.response?.data?.message || err?.message);
    } finally {
      setUpdatingId(null);
    }
  };

  // ⭐ CANCEL ORDER FLOW
  const promptCancel = (orderId) => {
    setSelectedCancelId(orderId);
    setShowConfirm(true);
  };

  const cancelOrder = async (orderId) => {
    try {
      setCancellingId(orderId);
      // Ensure this URL and endpoint path exactly match the backend PUT /api/orders/:id/cancel
      await api.put(`/api/orders/${orderId}/cancel`, {}, config);

      await fetchOrders();
      showToast(`Order ${orderId.substring(19)} cancelled and stock released.`);
    } catch (err) {
      showToast(err?.response?.data?.message || err?.message);
    } finally {
      setCancellingId(null);
      setShowConfirm(false);
    }
  };

  // ⭐ STATUS BADGE
  const renderStatusBadge = (status) => {
    const text = status || 'Processing';
    let base =
      'inline-block px-3 py-1 rounded-full text-[12px] font-semibold border ';

    switch (text) {
      case 'Shipped':
        return (
          <span className={base + 'bg-blue-900/60 text-blue-300 border-blue-500/30'}>
            {text}
          </span>
        );
      case 'Out for Delivery':
        return (
          <span className={base + 'bg-emerald-100 text-emerald-600 border-emerald-500/30'}>
            {text}
          </span>
        );
      case 'Delivered':
        return (
          <span className={base + 'bg-green-900/50 text-green-300 border-green-400/30'}>
            {text}
          </span>
        );
      case 'Cancelled':
        return (
          <span className={base + 'bg-red-100 text-red-600 border-red-400/30'}>
            {text}
          </span>
        );
      default:
        return (
          <span className={base + 'bg-gray-800 text-gray-500 border-gray-300'}>
            {text}
          </span>
        );
    }
  };
  // ⭐ SORT NEWEST FIRST
const sortedOrders = [...orders].sort(
  (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
);


  // ⭐ FILTER LOGIC (auto-cancel deleted users)
 const filteredOrders = sortedOrders.filter((order) => {

    const statusText =
      !order.user || !order.user.name
        ? 'Cancelled'
        : order.status || 'Processing';

    const paymentText =
      order.paymentMethod === 'COD'
        ? 'COD'
        : order.isPaid
        ? 'Prepaid'
        : 'Pending';

    const isDeletedUser = !order.user || !order.user.name;

    // Status filter
    if (filterStatus !== 'all' && statusText !== filterStatus) return false;

    // Payment filter
    if (filterPayment !== 'all' && paymentText !== filterPayment) return false;

    // User filter
    if (filterUser === 'active' && isDeletedUser) return false;
    if (filterUser === 'deleted' && !isDeletedUser) return false;

    return true;
  });

  // ⭐ AUTO RETURN TO PAGE 1 IF CURRENT PAGE EMPTY
  useEffect(() => {
    const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
    if (currentPage > totalPages && totalPages > 0) {
      setCurrentPage(1);
    }
  }, [filteredOrders]);

  // ⭐ PAGINATION CALC
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);

  // UNAUTHORIZED
  if (!user || !user.isAdmin) {
    return (
      <div className="min-h-screen w-full bg-white text-red-500 flex items-center justify-center">
        Unauthorized
        </div>
    );
  }

  // LOADING
  if (loading)
    return (
      <div className="min-h-screen w-full bg-white text-gray-500 flex items-center justify-center">
        Loading orders...
      </div>
    );

  // ERROR
  if (error)
    return (
      <div className="min-h-screen w-full bg-white text-red-500 flex items-center justify-center">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-white text-gray-800">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 pt-6 pb-10">

        <Link to="/admin/dashboard">
          <button className="mb-5 inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-500 border border-gray-300 hover:bg-gray-700">
            ← Back
          </button>
        </Link>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Orders{" "}
            <span className="text-emerald-500 text-base">
              ({filteredOrders.length})
            </span>
          </h1>

          <button
            type="button"
            onClick={() => setFilterOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500 text-emerald-600 bg-gray-100 text-[11px] font-semibold uppercase tracking-[0.25em] hover:bg-emerald-500/10 transition"
          >
            <Filter size={14} />
            Filter
          </button>
        </div>

        {/* DESKTOP TABLE */}
        <div className="hidden md:block w-full rounded-2xl bg-gray-50 border border-gray-200 shadow-xl overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Payment</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Delivered</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>

            <tbody>
              {currentOrders.map((order, idx) => {
                const statusText =
                  !order.user || !order.user.name
                    ? "Cancelled"
                    : order.status || "Processing";

                const canCancel =
                  statusText !== "Cancelled" &&
                  !order.isDelivered &&
                  !["Shipped", "Out for Delivery", "Delivered"].includes(statusText);

                const showShip = statusText === "Processing";
                const showOut = statusText === "Processing" || statusText === "Shipped";
                const showDelivered =
                  ["Processing", "Shipped", "Out for Delivery"].includes(statusText);

                return (
                  <tr
                    key={order._id}
                    className={`border-t border-gray-200 ${idx % 2 ? "bg-gray-50/80" : "bg-gray-50"} hover:bg-gray-100`}
                  >
                    <td className="px-6 py-3 text-gray-600 text-sm">{order._id.substring(19)}</td>
                    <td className="px-6 py-3 text-gray-500 text-sm">
                      {order.user?.name || "Deleted User"}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-sm">
                      {order.createdAt.substring(0, 10)}
                    </td>
                    <td className="px-6 py-3 text-gray-500 text-sm">₹{order.totalPrice}</td>

                    <td className="px-6 py-3 text-center">
                      {order.paymentMethod === "COD" ? (
                        <span className="px-3 py-1 rounded-full text-[11px] bg-gray-500/20 text-gray-700 border border-gray-500/50">COD</span>
                      ) : order.isPaid ? (
                        <span className="px-3 py-1 rounded-full text-[11px] bg-green-500/20 text-green-300 border border-green-600/50">Prepaid</span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] bg-red-500/20 text-red-600 border border-red-600/50">Pending</span>
                      )}
                    </td>

                    <td className="px-6 py-3 text-center">
                      {order.isDelivered ? <Check className="text-green-500 mx-auto" /> : <X className="text-red-500 mx-auto" />}
                    </td>

                    <td className="px-6 py-3 text-center">
                      {renderStatusBadge(statusText)}
                    </td>

                    <td className="px-6 py-3 space-x-2">
                      {canCancel && (
                        <button
                          onClick={() => promptCancel(order._id)}
                          disabled={cancellingId === order._id}
                          className="px-3 py-1 text-[11px] bg-red-600 text-gray-800 rounded disabled:opacity-50"
                        >
                          {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}

                      {showShip && (
                        <button
                          onClick={() => updateStatus(order._id, "Shipped")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1 text-[11px] bg-blue-500 text-gray-800 rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Shipped"}
                        </button>
                      )}

                      {showOut && (
                        <button
                          onClick={() => updateStatus(order._id, "Out for Delivery")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1 text-[11px] bg-emerald-500 text-black rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Out for Delivery"}
                        </button>
                      )}

                      {showDelivered && (
                        <button
                          onClick={() => updateStatus(order._id, "Delivered")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1 text-[11px] bg-green-500 text-gray-800 rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Delivered"}
                        </button>
                      )}

                      <Link to={`/order/${order._id}`}>
                        <button className="px-4 py-1 mt-2 text-[11px] bg-gray-700 text-gray-800 rounded hover:bg-gray-600">
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

        {/* MOBILE VERSION */}
        <div className="md:hidden space-y-4 mt-6">
          {currentOrders.map((order) => {
            const statusText =
              !order.user || !order.user.name ? "Cancelled" : order.status || "Processing";

            const canCancel =
              statusText !== "Cancelled" &&
              !order.isDelivered &&
              !["Shipped", "Out for Delivery", "Delivered"].includes(statusText);

            const showShip = statusText === "Processing";
            const showOut = statusText === "Processing" || statusText === "Shipped";
            const showDelivered =
              ["Processing", "Shipped", "Out for Delivery"].includes(statusText);

            const firstItem = order.orderItems?.[0];

            return (
              <div key={order._id} className="bg-[#0d0d0d] border border-gray-200 rounded-2xl p-4 shadow-lg">
                <div className="flex gap-3 items-start">
                  <img
                    src={firstItem?.image || "/images/placeholder.png"}
                    className="w-20 h-20 object-contain rounded-md bg-gray-100 p-2"
                  />

                  <div className="flex-1">
                    <h3 className="font-bold text-sm text-gray-600">
                      {firstItem?.name}
                    </h3>

                    <p className="text-xs text-gray-500">
                      {order.user?.name || "Deleted User"}
                    </p>

                    <div className="mt-2">{renderStatusBadge(statusText)}</div>

                    <div className="grid grid-cols-2 gap-2 mt-3 text-xs text-gray-500">
                      <div><span className="text-gray-500">Date:</span> {order.createdAt.substring(0, 10)}</div>
                      <div><span className="text-gray-500">Items:</span> {order.orderItems?.length}</div>
                      <div><span className="text-gray-500">Payment:</span> {order.paymentMethod === "COD" ? "COD" : order.isPaid ? "Prepaid" : "Pending"}</div>
                      <div><span className="text-gray-500">Delivered:</span> {order.isDelivered ? "Yes" : "No"}</div>
                    </div>

                    <div className="flex flex-wrap gap-2 mt-4">
                      {canCancel && (
                        <button
                          onClick={() => promptCancel(order._id)}
                          disabled={cancellingId === order._id}
                          className="px-3 py-1.5 bg-red-600 text-gray-800 text-[12px] rounded disabled:opacity-50"
                        >
                          {cancellingId === order._id ? "Cancelling..." : "Cancel"}
                        </button>
                      )}

                      {showShip && (
                        <button
                          onClick={() => updateStatus(order._id, "Shipped")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1.5 bg-blue-500 text-gray-800 text-[12px] rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Shipped"}
                        </button>
                      )}

                      {showOut && (
                        <button
                          onClick={() => updateStatus(order._id, "Out for Delivery")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1.5 bg-emerald-500 text-black text-[12px] rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Out for Delivery"}
                        </button>
                      )}

                      {showDelivered && (
                        <button
                          onClick={() => updateStatus(order._id, "Delivered")}
                          disabled={updatingId === order._id}
                          className="px-3 py-1.5 bg-green-500 text-gray-800 text-[12px] rounded disabled:opacity-50"
                        >
                          {updatingId === order._id ? "Updating..." : "Delivered"}
                        </button>
                      )}

                      <Link to={`/order/${order._id}`}>
                        <button className="px-3 py-1.5 bg-gray-700 text-gray-800 text-[12px] rounded">Details</button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 mt-10">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-800 text-gray-800 rounded-lg disabled:opacity-40"
          >
            ← Previous
          </button>

          <span className="text-gray-500 text-sm">
            Page {currentPage} / {Math.ceil(filteredOrders.length / ordersPerPage)}
          </span>

          <button
            onClick={() =>
              setCurrentPage((prev) =>
                Math.min(prev + 1, Math.ceil(filteredOrders.length / ordersPerPage))
              )
            }
            disabled={indexOfLastOrder >= filteredOrders.length}
            className="px-4 py-2 bg-gray-800 text-gray-800 rounded-lg disabled:opacity-40"
          >
            Next →
          </button>
        </div>

      </div>
      {/* CANCEL CONFIRM MODAL */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 bg-gray-50/80 flex items-center justify-center">
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 w-[90%] max-w-md">
            <h3 className="text-lg font-bold mb-2">Cancel Order</h3>
            <p className="text-sm text-gray-500 mb-4">
              Are you sure you want to cancel this order?
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-4 py-2 bg-gray-100 text-gray-500 border border-gray-200 rounded-md"
              >
                No
              </button>

              <button
                onClick={() => cancelOrder(selectedCancelId)}
                className="px-4 py-2 bg-red-600 text-gray-800 font-bold rounded-md"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ⭐ FILTER POPUP (Mobile Center Popup) */}
      {filterOpen && (
        <div
          className="fixed inset-0 bg-gray-600/50 z-40 flex items-center justify-center p-4"
          onClick={() => setFilterOpen(false)}
        >
          <div
            className="bg-[#030712] w-full max-w-xs p-4 rounded-2xl border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-gray-600 text-sm font-semibold">Filters</h3>
              <button onClick={() => setFilterOpen(false)}>
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* STATUS FILTER */}
            <p className="uppercase text-xs text-gray-500 mb-1">Status</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                "all",
                "Processing",
                "Shipped",
                "Out for Delivery",
                "Delivered",
                "Cancelled",
              ].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterStatus(opt)}
                  className={`px-2 py-1 rounded border ${
                    filterStatus === opt
                      ? "border-emerald-500 text-emerald-600"
                      : "border-white/20 text-gray-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* PAYMENT FILTER */}
            <p className="uppercase text-xs text-gray-500 mb-1">Payment</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["all", "COD", "Prepaid", "Pending"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterPayment(opt)}
                  className={`px-2 py-1 rounded border ${
                    filterPayment === opt
                      ? "border-emerald-500 text-emerald-600"
                      : "border-white/20 text-gray-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* USER STATUS FILTER */}
            <p className="uppercase text-xs text-gray-500 mb-1">User Status</p>
            <div className="grid grid-cols-2 gap-2 mb-4">
              {["all", "active", "deleted"].map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilterUser(opt)}
                  className={`px-2 py-1 rounded border ${
                    filterUser === opt
                      ? "border-emerald-500 text-emerald-600"
                      : "border-white/20 text-gray-500"
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>

            {/* RESET FILTER */}
            <button
              onClick={() => {
                setFilterStatus("all");
                setFilterPayment("all");
                setFilterUser("all");
              }}
              className="text-emerald-500 text-xs"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast && (
        <div className="fixed bottom-6 right-6 bg-gray-100 border border-gray-200 text-gray-800 px-4 py-2 rounded-lg">
          {toast}
        </div>
      )}
    </div>
  );
};

export default OrderListScreen;
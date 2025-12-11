import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Trash2, Edit, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProductListScreen = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Delete modal state
  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get('/api/products', config);
        setProducts(data);
        setLoading(false);
      } catch (err) {
        setError(err.response ? err.response.data.message : err.message);
        setLoading(false);
      }
    };

    if (user && user.isAdmin) {
      fetchProducts();
    } else {
      setError('You are not authorized to view this page.');
      setLoading(false);
    }
  }, [user]);

  // Delete Handler
  const deleteHandler = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/products/${id}`, config);
      setProducts((prev) => prev.filter((product) => product._id !== id));
    } catch (err) {
      alert(err.response ? err.response.data.message : err.message);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-xs rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black px-4 py-3 shadow-xl shadow-yellow-500/15">
          <p className="text-xs sm:text-sm text-gray-300 animate-pulse tracking-wide text-center">
            Loading products...
          </p>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen w-full bg-black flex items-center justify-center px-4">
        <div className="w-full max-w-xs rounded-2xl border border-red-500/60 bg-red-900/20 px-4 py-3 shadow-lg shadow-red-500/30 text-center">
          <h2 className="mb-1 text-sm font-semibold text-red-300">
            Error loading products
          </h2>
          <p className="text-[11px] text-red-100">{error}</p>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen w-full bg-black text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-8 sm:px-6 lg:px-8">

        {/* 🔙 BACK BUTTON */}
        <div className="mb-5">
          <Link to="/admin/dashboard">
            <button className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              ← Back
            </button>
          </Link>
        </div>

        {/* Top bar */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.25em] text-gray-400 uppercase">
              Admin · Inventory
            </p>
            <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
              Products
              <span className="ml-2 text-xs text-gray-400">
                ({products.length})
              </span>
            </h1>
          </div>

          <Link to="/admin/product/create" className="self-start sm:self-auto">
            <button className="inline-flex items-center gap-2 rounded-full bg-[#f5b014] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-black shadow-[0_0_0_rgba(0,0,0,0)] transition-all hover:-translate-y-[1px] hover:bg-[#ffca3b] hover:shadow-[0_0_18px_rgba(245,176,20,0.7)]">
              <Plus size={14} />
              Create Product
            </button>
          </Link>
        </div>

        {/* List header pill */}
        <div className="mb-4 flex items-center justify-between rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-900/80 via-black to-gray-900/80 px-4 py-3 shadow-lg shadow-black/50">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-300">
              Product List
            </p>
            <p className="mt-1 text-[11px] text-gray-400">
              Manage, edit & delete products in your catalog.
            </p>
          </div>
          <span className="ml-3 rounded-full border border-gray-700 bg-black/70 px-3 py-1 text-[10px] text-gray-300">
            Total: <span className="text-[#f5b014]">{products.length}</span>
          </span>
        </div>

        {/* Product Cards */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="rounded-2xl border border-gray-800 bg-black/70 px-4 py-6 text-center text-sm text-gray-400">
              No products found.
            </div>
          ) : (
            <div className="grid gap-4 sm:gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product, idx) => (
                <article
                  key={product._id}
                  className="relative flex flex-col rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900/95 to-black/95 p-4 shadow-lg shadow-black/50 transition-transform duration-200 hover:-translate-y-1 hover:shadow-yellow-500/20"
                >
                  {/* ID + Category */}
                  <div className="mb-2 flex items-center justify-between gap-2">
                    <span className="rounded-full bg-black/70 px-2 py-1 text-[9px] font-mono text-gray-400 border border-gray-700">
                      #{product._id.substring(19)}
                    </span>
                    <span className="rounded-full bg-gray-900/80 px-2 py-1 text-[9px] text-gray-400 border border-gray-700">
                      {product.category || 'Uncategorized'}
                    </span>
                  </div>

                  {/* Name + Price */}
                  <div className="mb-3 flex flex-col gap-1">
                    <h2 className="text-sm font-semibold text-gray-100 line-clamp-2">
                      {product.name}
                    </h2>
                    <p className="text-xs text-gray-400">
                      Price:{' '}
                      <span className="font-semibold text-[#f5b014]">
                        ${product.price}
                      </span>
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between pt-2 border-t border-gray-800">
                    <div className="flex flex-col text-[10px] text-gray-500">
                      <span className="uppercase tracking-[0.18em] text-gray-400">
                        Actions
                      </span>
                      <span>Quick edit or delete product</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/admin/product/${product._id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-indigo-500/70 bg-indigo-500/10 text-indigo-300 text-xs shadow-sm transition hover:bg-indigo-500/20 hover:text-indigo-100 hover:shadow-[0_0_12px_rgba(129,140,248,0.7)]"
                      >
                        <Edit size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => {
                          setDeleteId(product._id);
                          setShowModal(true);
                        }}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-500/70 bg-red-500/10 text-red-400 text-xs shadow-sm transition hover:bg-red-500/20 hover:text-red-100 hover:shadow-[0_0_12px_rgba(248,113,113,0.7)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-xs rounded-2xl border border-yellow-500/40 bg-[#020617] p-5 text-center shadow-[0_0_25px_rgba(245,176,20,0.4)]">
            <h2 className="mb-2 text-lg font-bold text-[#f5b014]">
              Confirm Delete
            </h2>
            <p className="mb-5 text-[11px] text-gray-300">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>

            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await deleteHandler(deleteId);
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="flex-1 rounded-md bg-red-500 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white shadow-[0_0_15px_rgba(239,68,68,0.6)] transition hover:bg-red-400"
              >
                Delete
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="flex-1 rounded-md bg-gray-700 px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-white transition hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductListScreen;

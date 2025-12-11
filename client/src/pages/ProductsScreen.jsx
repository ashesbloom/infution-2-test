// client/src/pages/ProductsScreen.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Filter, X } from "lucide-react";

export default function ProductsScreen() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [maxPrice, setMaxPrice] = useState(100000);
  const [showFilters, setShowFilters] = useState(false);

  const categories = ["All", "Protein", "Pre-Workout", "Amino", "Vitamins", "Accessories"];

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        setProducts(data);
        setFiltered(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    let p = [...products];
    if (search.trim() !== "") p = p.filter((item) => item.name.toLowerCase().includes(search.toLowerCase()));
    if (category !== "All") p = p.filter((item) => item.category === category);
    p = p.filter((item) => Number(item.price) <= Number(maxPrice));
    setFiltered(p);
  }, [search, category, maxPrice, products]);

  useEffect(() => {
    document.body.style.overflow = showFilters ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showFilters]);

  return (
    <div className="min-h-screen w-full bg-black text-white px-4 py-8 md:px-10 pt-5">
      <div className="max-w-6xl mx-auto mb-10">
        <h1 className="text-2xl md:text-4xl font-black tracking-tight">
          Browse <span className="text-yellow-400">All Products</span>
        </h1>
        <p className="text-sm text-gray-400 mt-1">Explore our premium INFUSED Nutrition lineup.</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="hidden md:block bg-[#0b0b0b] border border-white/10 rounded-2xl p-5 h-fit shadow-[0_0_25px_rgba(0,0,0,0.8)]">
          <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-300 mb-4">Filters</h2>

          <div className="mb-6">
            <label className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Search</label>
            <input
              type="text"
              className="w-full mt-1 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
              placeholder="Search product..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <p className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Category</p>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full mt-1 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-2">
            <p className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Max Price: ₹{maxPrice}</p>
            <input
              type="range"
              min="500"
              max="10000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full accent-yellow-400"
            />
          </div>
        </aside>

        <section className="md:col-span-3">
          {loading ? (
            <p className="text-gray-300">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="text-gray-400 text-sm">No products found.</p>
          ) : (
            <div className="grid grid-cols-2  sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="bg-[#0d0d0d] border-yellow-300 text-yellow-400 border-opacity-40 shadow-[0_0_8px_rgba(245,176,20,0.6)] rounded-2xl p-4 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.6)] hover:-translate-y-1 hover:shadow-yellow-500/20 transition-all duration-300"
                >
                  <div className="w-full  flex justify-center">
                    <img src={product.image} alt={product.name} className="h-32 object-contain drop-shadow-[0_18px_30px_rgba(0,0,0,0.9)]" />
                  </div>

                  <h3 className="mt-4 text-sm font-semibold line-clamp-2">{product.name}</h3>

                  <p className="text-[11px] text-gray-400 mt-1">{product.category}</p>

                  <p className="mt-2 text-yellow-400 font-bold text-sm">₹{product.price}</p>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>

      <button
        onClick={() => setShowFilters(true)}
        aria-label="Open filters"
        className="fixed bottom-6 right-6 z-50 h-12 w-12 rounded-full flex items-center justify-center bg-black/70 border border-yellow-400 text-yellow-400 shadow-[0_0_12px_rgba(245,176,20,0.6)] hover:bg-black hover:border-yellow-300 hover:text-yellow-300 transition-all duration-300"
      >
        <Filter size={22} className="text-yellow-400"/>
      </button>

      {showFilters && (
        <>
          <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" onClick={() => setShowFilters(false)} />
          <div className="fixed right-0 top-0 z-50 h-full w-[92%] max-w-xs transform transition-transform duration-300 ease-in-out md:hidden">
            <div className="h-full bg-[#0b0b0b] border-l border-white/10 p-5 overflow-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold tracking-[0.2em] uppercase text-gray-300">Filters</h2>
                <button onClick={() => setShowFilters(false)} className="p-2 rounded-full bg-black/40 hover:bg-black/60">
                  <X size={18} />
                </button>
              </div>

              <div className="mb-6">
                <label className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Search</label>
                <input
                  type="text"
                  className="w-full mt-1 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
                  placeholder="Search product..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Category</p>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full mt-1 bg-[#111] border border-gray-700 rounded-lg px-3 py-2 text-sm focus:border-yellow-400 outline-none"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-6">
                <p className="text-[10px] uppercase text-gray-500 tracking-[0.2em]">Max Price: ₹{maxPrice}</p>
                <input
                  type="range"
                  min="500"
                  max="10000"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  className="w-full accent-yellow-400"
                />
              </div>

              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => {
                    setSearch("");
                    setCategory("All");
                    setMaxPrice(100000);
                  }}
                  className="flex-1 rounded-lg bg-gray-800 px-4 py-2 text-sm text-gray-200"
                >
                  Reset
                </button>
                <button onClick={() => setShowFilters(false)} className="flex-1 rounded-lg bg-[#f5b014] px-4 py-2 text-sm text-black">
                  Apply
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
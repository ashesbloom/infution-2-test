// client/src/pages/Home.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import HeroSlider from "../components/HeroSlider";
import FAQS_page from "./FAQS_page";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const { addToCart } = useCart();
  const [quantities, setQuantities] = useState({});
  const [heroQty, setHeroQty] = useState(1);
  const [addedMessage, setAddedMessage] = useState("");

  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  const navigate = useNavigate();

  const handleQuantityChange = (productId, value) => {
    setQuantities((prev) => ({
      ...prev,
      [productId]: Number(value),
    }));
  };

  const handleAddToCart = (product) => {
    const qty = quantities[product._id] || 1;
    addToCart(product, qty);

    setAddedMessage(`${product.name} added to cart`);
    setTimeout(() => setAddedMessage(""), 1500);
  };

  const handleHeroPurchase = (product) => {
    if (!product || isAdmin || product.countInStock === 0) return;
    addToCart(product, heroQty);
    navigate("/shipping");
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        setProducts(data);
      } catch (err) {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const highlightProduct =
    !loading && !error && products && products.length > 0
      ? products[0]
      : null;

  // scroll to FAQ / Contact section from footer
  const scrollToSupport = () => {
    const el = document.getElementById("faqs-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-black text-white relative overflow-x-hidden">
      {/* Toast for cart actions */}
      {addedMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#f5b014] text-black font-bold px-6 py-3 rounded-full shadow-[0_0_25px_rgba(245,176,20,0.7)] text-sm tracking-wide z-50 animate-fadeIn">
          {addedMessage}
        </div>
      )}

      {/* Line under navbar */}
      <div className="w-full h-[2px] relative mt-1 mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/40 via-yellow-300/90 to-yellow-500/40 rounded-full shadow-[0_0_12px_rgba(245,176,20,0.8)] opacity-50" />
      </div>

      {/* MAIN HERO SLIDER */}
      <div className="w-full px-3 sm:px-6 lg:px-10 overflow-x-hidden">
        <HeroSlider />
      </div>

      {/* ===================== LATEST PRODUCTS ===================== */}
      <section className="w-full bg-black px-4 md:px-8 lg:px-12 py-2 overflow-x-hidden">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Latest Drops
            </h2>

            {/* pill-style view all button */}
            <Link
              to="/products"
              className="self-start sm:self-auto px-8 py-3 rounded-full border border-yellow-500/70 bg-black/20 
                         text-yellow-300 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em]
                         hover:bg-yellow-500/10 hover:border-yellow-400 transition
                         shadow-[0_0_18px_rgba(255,205,50,0.25)] flex items-center gap-2"
            >
              View All Products ↗
            </Link>
          </div>

          {loading && <p>Loading...</p>}
          {error && <p className="text-red-500">{error}</p>}

          {/* compact grid cards like shopping apps */}
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {!loading &&
              !error &&
              products.map((p) => (
                <div
                  key={p._id}
                  className="relative group flex flex-col rounded-2xl bg-[#111111] overflow-hidden shadow-[0_16px_40px_rgba(0,0,0,0.85)] border border-black transition-all duration-500 hover:-translate-y-2  hover:border-yellow-400  hover:shadow-[0_0_30px_rgba(250,204,21,0.4)]">
                  {p.countInStock === 0 && (
                    <span className="absolute top-2 right-2 rounded-full bg-red-600 px-2.5 py-1 text-[0.55rem] sm:text-[0.6rem] font-semibold uppercase tracking-wide text-white z-10">
                      Out of Stock
                    </span>
                  )}

                  {/* IMAGE */}
                  <Link
                    to={`/product/${p._id}`}
                    className="bg-gradient-to-b from-[#1c1c1c] to-[#050505] flex items-center justify-center pt-3 pb-2 sm:pt-4 sm:pb-3"
                  >
                    <img
                      src={p.image}
                      alt={p.name}
                      className="relative h-20 w-auto sm:h-28 md:h-32 object-contain transition-all duration-500 group-hover:scale-110 drop-shadow-[0_16px_28px_rgba(0,0,0,0.9)]"                    />
                  </Link>

                  {/* CONTENT */}
                  <div className="flex flex-col gap-1.5 sm:gap-2 px-3 sm:px-4 pb-3 sm:pb-4">
                    <Link
                      to={`/product/${p._id}`}
                      className="text-[11px] sm:text-xs md:text-sm font-semibold tracking-wide text-white hover:text-yellow-400 line-clamp-2 min-h-[2.3em]"
                    >
                      {p.name}
                    </Link>

                    <p className="text-[10px] sm:text-xs text-gray-400">
                      {p.category}
                    </p>

                    <div className="flex items-baseline gap-1">
                      <span className="text-xs sm:text-sm font-bold text-yellow-300">
                        ₹{p.price}
                      </span>
                    </div>

                    {!isAdmin && (
                      <div className="mt-1.5 sm:mt-2 flex items-center justify-between gap-1.5">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[9px] sm:text-[10px] uppercase text-gray-400">
                            Qty
                          </span>
                          <select
                            value={quantities[p._id] || 1}
                            onChange={(e) =>
                              handleQuantityChange(p._id, e.target.value)
                            }
                            disabled={p.countInStock === 0}
                            className="bg-gray-900 text-white text-[9px] sm:text-[10px] rounded-md px-2 py-1 border border-gray-700 focus:border-yellow-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {Array.from({ length: 10 }, (_, i) => i + 1).map(
                              (x) => (
                                <option key={x} value={x}>
                                  {x}
                                </option>
                              )
                            )}
                          </select>
                        </div>

                        <button
                          onClick={() => handleAddToCart(p)}
                          disabled={p.countInStock === 0}
                          className="bg-yellow-400 text-black px-2.5 sm:px-3 py-1.5 text-[9px] sm:text-[10px] rounded-lg font-bold uppercase tracking-[0.18em] border border-yellow-400 hover:bg-yellow-300 transition disabled:opacity-40 disabled:cursor-not-allowed disabled:bg-transparent disabled:text-yellow-400"
                        >
                          {p.countInStock === 0 ? "Out" : "Add"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      </section>

      {/* ===================== FEATURED HERO (ADD TO CART + DISCOUNT) ===================== */}
      {highlightProduct && (
        <section className="w-full px-4 md:px-8 lg:px-12 pb-16 overflow-x-hidden">
          <div className="mx-auto max-w-7xl">
            <div className="rounded-[32px] sm:rounded-[40px] bg-gradient-to-br from-[#101010] via-[#060606] to-[#111] px-4 sm:px-12 py-10 sm:py-12 shadow-[0_40px_90px_rgba(0,0,0,0.9)] border border-white/10">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
                {/* LEFT IMAGE */}
                <div className="relative rounded-[28px] sm:rounded-[32px] bg-gradient-to-b from-[#1b1b1b] to-black px-6 sm:px-10 py-8 sm:py-10 shadow-[0_30px_80px_rgba(0,0,0,1)] border border-white/5 flex items-center justify-center overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#facc1545,transparent_60%)] blur-3xl" />

                  <img
                    src={highlightProduct.image}
                    alt={highlightProduct.name}
                    className="relative max-h-64 sm:max-h-[25rem] w-full object-contain drop-shadow-[0_24px_60px_rgba(0,0,0,0.95)]"
                  />

                  <div className="absolute top-4 left-4 sm:top-6 sm:left-6 bg-yellow-500 text-black px-3 sm:px-4 py-1 rounded-full text-[11px] sm:text-[12px] font-bold tracking-wide shadow-[0_0_15px_rgba(255,205,50,0.7)]">
                    {highlightProduct.discount || "20% OFF"}
                  </div>
                </div>

                {/* RIGHT CONTENT */}
                <div className="flex flex-col gap-5 sm:gap-6 pr-0 lg:pr-6">
                  <p className="text-[11px] sm:text-[12px] tracking-[0.35em] text-yellow-400 uppercase">
                    Premium Series
                  </p>

                  <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold leading-tight">
                    {highlightProduct.name.split(" ")[0]}{" "}
                    <span className="text-yellow-400">
                      {highlightProduct.name.split(" ").slice(1).join(" ")}
                    </span>
                  </h2>

                  <div className="flex items-center gap-2 text-xs sm:text-sm text-gray-300">
                    <div className="flex text-yellow-400">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                    <span className="text-[11px] sm:text-xs text-gray-400">
                      ({highlightProduct.numReviews || 1240} Reviews)
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3 sm:gap-4">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ₹{highlightProduct.price}
                    </span>
                    <span className="text-base sm:text-lg text-gray-500 line-through">
                      ₹
                      {highlightProduct.oldPrice ||
                        highlightProduct.price + 1200}
                    </span>
                  </div>

                  <p className="text-sm sm:text-base text-gray-300 leading-relaxed border-l-2 border-yellow-400 pl-3 sm:pl-4">
                    {highlightProduct.description ||
                      "Ultra-pure whey isolate with rapid absorption, no fillers, and extreme purity for serious performance."}
                  </p>

                  {!isAdmin && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 mt-3">
                      <div className="flex items-center rounded-2xl bg-[#050505] border border-gray-700 px-3 py-2 w-full sm:w-auto justify-between sm:justify-start">
                        <button
                          type="button"
                          onClick={() =>
                            setHeroQty((prev) => (prev > 1 ? prev - 1 : prev))
                          }
                          disabled={highlightProduct.countInStock === 0}
                          className="h-10 w-10 flex items-center justify-center text-2xl text-gray-300 disabled:text-gray-600"
                        >
                          –
                        </button>
                        <span className="mx-4 text-lg font-semibold">
                          {heroQty}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setHeroQty((prev) =>
                              highlightProduct.countInStock
                                ? Math.min(
                                    prev + 1,
                                    highlightProduct.countInStock
                                  )
                                : prev + 1
                            )
                          }
                          disabled={highlightProduct.countInStock === 0}
                          className="h-10 w-10 flex items-center justify-center text-2xl text-gray-300 disabled:text-gray-600"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => addToCart(highlightProduct, heroQty)}
                        disabled={highlightProduct.countInStock === 0}
                        className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-2xl border border-yellow-500 bg-black/40 text-yellow-300 text-[11px] sm:text-xs font-bold uppercase tracking-[0.3em] hover:bg-yellow-500/20 shadow-[0_0_20px_rgba(255,205,50,0.3)] disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Add to Cart
                      </button>

                      <button
                        type="button"
                        onClick={() => handleHeroPurchase(highlightProduct)}
                        disabled={highlightProduct.countInStock === 0}
className="w-full sm:w-auto px-8 sm:px-10 py-3 rounded-2xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.3em] shadow-[0_24px_50px_rgba(250,204,21,0.75)] hover:brightness-110 disabled:opacity-40 disabled:cursor-not-allowed hover:shadow-[0_0_40px_rgba(234,179,8,0.5)] shadow-none"                      >
                        Purchase Now
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ===================== BENEFITS SECTION (MATCH REFERENCE + LOGO) ===================== */}
      <section className="w-full px-4 md:px-8 lg:px-12 pb-20 overflow-x-hidden">
        <div className="mx-auto max-w-6xl space-y-12">
          {/* TOP 3 FEATURE CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[
              {
                title: "100% High Quality",
                desc: "Sourced from premium grass-fed whey. Lab tested for purity and potency.",
              },
              {
                title: "Free Shipping",
                desc: "Fast express delivery on orders over ₹999. Global access available.",
              },
              {
                title: "Money Back",
                desc: "30-day satisfaction guarantee. If you don’t see results, get a refund.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gradient-to-b from-[#151515] to-[#050505] border border-white/5 px-5 py-4 sm:px-7 sm:py-6 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center"
              >
                <h3 className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-yellow-400 uppercase mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-sm text-gray-300 leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* MAIN BENEFIT GRID */}
          <div className="rounded-[40px] bg-gradient-to-b from-[#0b0b0b] via-[#080808] to-[#020202] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.9)] px-4 sm:px-10 py-12 relative overflow-hidden">
            {/* BACKGROUND LOGO WATERMARK */}
            <img
              src="/infused_logo_big.png"
              alt="INFUSED"
              className="absolute inset-0 m-auto opacity-[0.05] w-[65%] pointer-events-none select-none object-contain"
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center relative z-10">
              {/* LEFT COLUMN FEATURES */}
              <div className="space-y-10 text-center lg:text-right">
                {[
                  {
                    title: "Fast Absorption",
                    desc: "Hydrolyzed isolates ensure rapid delivery to muscles post-workout.",
                    icon: "🏃‍♂️",
                  },
                  {
                    title: "High Energy",
                    desc: "Enriched with B-Vitamins to convert protein into usable energy.",
                    icon: "⚡",
                  },
                  {
                    title: "Bone Support",
                    desc: "Fortified with Calcium and Vitamin D for skeletal strength.",
                    icon: "🦴",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="h-10 w-10 rounded-full bg-yellow-400/10 border border-yellow-400/60 flex items-center justify-center text-yellow-300 text-lg">
                        {item.icon}
                      </div>
                    </div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-yellow-400 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              {/* CENTER BOTTLE */}
              <div className="flex items-center justify-center">
                <div className="relative bg-gradient-to-b from-[#1a1a1a] to-black px-10 py-10 rounded-[32px] shadow-[0_36px_90px_rgba(0,0,0,1)] border border-white/10">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#facc1540,transparent_70%)] blur-2xl" />
                  <img
                    src={highlightProduct?.image || "/product_image.png"}
                    alt="INFUSED Whey"
                    className="relative max-h-72 w-full object-contain drop-shadow-[0_26px_70px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>

              {/* RIGHT COLUMN FEATURES */}
              <div className="space-y-10 text-center lg:text-left">
                {[
                  {
                    title: "Lactose Free",
                    desc: "Double-filtered process removes 99% of lactose and impurities.",
                    icon: "🥛",
                  },
                  {
                    title: "Great Taste",
                    desc: "Award-winning flavor profile without unnecessary sweeteners.",
                    icon: "⭐",
                  },
                  {
                    title: "Fat Burner",
                    desc: "Added CLA and L-Carnitine to support metabolism management.",
                    icon: "🔥",
                  },
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="h-10 w-10 rounded-full bg-yellow-400/10 border border-yellow-400/60 flex items-center justify-center text-yellow-300 text-lg">
                        {item.icon}
                      </div>
                    </div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-yellow-400 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-300 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CONTACT (tabs) */}
      <FAQS_page />

      {/* ===================== MINIMAL FOOTER (HOME PAGE) ===================== */}
      <footer className="w-full border-t border-white/10 bg-[#050505] px-6 md:px-12 py-8 mt-10">
        <div className="mx-auto max-w-6xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          {/* Left Section */}
          <div className="flex-1 flex flex-col items-center sm:items-start gap-4">
           <p
                       
                       className="text-2xl md:text-3xl font-black italic tracking-tighter text-white group"
                     >
                       INFUSE
                       <span className="text-yellow-500 group-hover:drop-shadow-[0_0_10px_rgba(234,179,8,0.8)]">
                         D.
                       </span>
                     </p>

            <p className="text-[12px] sm:text-sm text-gray-300 max-w-xs text-center sm:text-left leading-relaxed">
              Clean. Potent. Performance-focused formulas built with integrity.
            </p>

            {/* Social Icons (FB Removed) */}
            <div className="flex items-center gap-3 mt-1">
              {["IG", "X"].map((label) => (
                <button
                  key={label}
                  className="h-9 w-9 rounded-full bg-[#0b0b0b] border border-white/10 flex items-center justify-center 
                       text-[11px] text-gray-300 hover:text-yellow-400 hover:border-yellow-500 transition"
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Verify Product Button */}
            <button
              onClick={() => (window.location.href = "/Verify")}
              className="mt-3 px-5 py-2 rounded-full bg-yellow-400 text-black font-semibold text-[12px] tracking-wide 
                   hover:bg-yellow-300 transition shadow-[0_0_15px_rgba(250,204,21,0.25)]"
            >
              ✔ Verify Your Product
            </button>
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col gap-5 items-center sm:items-end text-center sm:text-right">
            <div>
              <h3 className="text-[12px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-gray-200 mb-2">
                Contact
              </h3>

              <p className="text-[12px] sm:text-sm text-gray-300">
                <span className="text-gray-500 mr-1">Email:</span>
                <a
                  href="mailto:support@infused.com"
                  className="hover:text-yellow-400 transition"
                >
                  support@infused.com
                </a>
              </p>

              <p className="text-[12px] sm:text-sm text-gray-300">
                <span className="text-gray-500 mr-1">Phone:</span>
                <a
                  href="tel:+919999999999"
                  className="hover:text-yellow-400 transition"
                >
                  +91 99999 99999
                </a>
              </p>
            </div>

            <div>
              {/* ✅ About Us button: opens new page */}
              <button
                type="button"
                onClick={() => {
                  navigate("/about");
                  window.scrollTo(0, 0);
                }}
                className="text-[12px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-yellow-300 mb-2 hover:text-yellow-500 transition"
              >
                
                About Us
              </button>
<br></br>
              <button
                onClick={scrollToSupport}
                className="mt-3 text-[12px] sm:text-sm text-yellow-400 hover:text-yellow-300 underline underline-offset-4"
              >
                Support & FAQs
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-white/10">
          <p className="text-[11px] sm:text-[12px] text-gray-500 text-center">
            © 2024 Infused Supplements Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

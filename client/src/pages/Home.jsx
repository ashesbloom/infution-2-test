// client/src/pages/Home.jsx

import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import HeroSlider from "../components/HeroSlider";
import BrandSection from "../components/BrandSection";
import AccessoriesGrid from "../components/AccessoriesGrid";
import ExploreMoreToggle from "../components/ExploreMoreToggle";
import FAQS_page from "./FAQS_page";

// Brand configuration
const FEATURED_BRANDS = ['MuscleBlaze', 'Avvatar', 'Optimum Nutrition'];
const SECONDARY_BRANDS = ['My Fitness', 'AS-IT-IS', "Doctor's Choice"];
const ALL_BRANDS = [...FEATURED_BRANDS, ...SECONDARY_BRANDS];

// Helper function to group products by brand (flat array per brand)
const groupProductsByBrand = (products, brands) => {
  const grouped = {};

  brands.forEach((brand) => {
    grouped[brand] = [];
  });

  products.forEach((product) => {
    const brandName = product.brand || '';

    // Check if this brand is in our list (case-insensitive match)
    const matchedBrand = brands.find(
      (b) => b.toLowerCase() === brandName.toLowerCase()
    );

    if (matchedBrand && grouped[matchedBrand]) {
      // Only add non-accessory products to brand sections
      if (product.category?.toLowerCase() !== 'accessories') {
        grouped[matchedBrand].push(product);
      }
    }
  });

  return grouped;
};

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [addedMessage, setAddedMessage] = useState("");

  const { addToCart } = useCart();
  const { user: _user } = useAuth();
  const navigate = useNavigate();

  // Fetch products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        setProducts(data);
      } catch {
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Group products by brand (flat array per brand)
  const groupedProducts = useMemo(() => {
    return groupProductsByBrand(products, ALL_BRANDS);
  }, [products]);

  // Get accessories (products with category "Accessories")
  const accessories = useMemo(() => {
    return products.filter(
      (p) => p.category?.toLowerCase() === 'accessories'
    );
  }, [products]);

  // Handle add to cart with toast
  const handleAddToCart = (product, qty = 1) => {
    addToCart(product, qty);
    setAddedMessage(`${product.name} added to cart`);
    setTimeout(() => setAddedMessage(""), 1500);
  };

  // Scroll to FAQ section
  const scrollToSupport = () => {
    const el = document.getElementById("faqs-section");
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="min-h-screen w-full bg-white text-gray-800 relative overflow-x-hidden">
      {/* Toast for cart actions */}
      {addedMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#06a34f] text-white font-bold px-6 py-3 rounded-full shadow-[0_0_25px_rgba(6,163,79,0.7)] text-sm tracking-wide z-50 animate-fadeIn">
          {addedMessage}
        </div>
      )}

      {/* Line under navbar */}
      <div className="w-full h-[2px] relative mt-1 mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/40 via-emerald-400/90 to-emerald-500/40 rounded-full shadow-[0_0_12px_rgba(6,163,79,0.8)] opacity-50" />
      </div>

      {/* HERO SLIDER */}
      <div className="w-full px-3 sm:px-6 lg:px-10 overflow-x-hidden">
        <HeroSlider />
      </div>

      {/* MAIN CONTENT */}
      <div className="w-full px-4 md:px-8 lg:px-12 py-8">
        <div className="mx-auto max-w-7xl">
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#06a34f]"></div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-red-500 text-lg">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 px-6 py-2 bg-[#06a34f] text-white rounded-full font-semibold"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {/* Section Header */}
              <div className="text-center mb-12">
                <p className="text-[11px] tracking-[0.35em] text-[#06a34f] uppercase mb-2">
                  Premium Supplements
                </p>
                <h2 className="text-3xl sm:text-4xl font-black tracking-tight uppercase">
                  Shop by <span className="text-[#06a34f]">Brand</span>
                </h2>
                <p className="text-gray-500 text-sm mt-2 max-w-md mx-auto">
                  Explore top-quality supplements from the world's most trusted brands
                </p>
              </div>

              {/* FEATURED BRANDS */}
              <div className="space-y-6">
                {FEATURED_BRANDS.map((brand) => (
                  <div key={brand} className="pt-4 first:pt-0 border-t border-gray-200 first:border-t-0">
                    <BrandSection
                      brandName={brand}
                      products={groupedProducts[brand] || []}
                      onAddToCart={handleAddToCart}
                    />
                  </div>
                ))}
              </div>

              {/* EXPLORE MORE BRANDS (Collapsible) */}
              <ExploreMoreToggle
                brands={SECONDARY_BRANDS}
                groupedProducts={groupedProducts}
                onAddToCart={handleAddToCart}
              />

              {/* ACCESSORIES SECTION */}
              {accessories.length > 0 && (
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <AccessoriesGrid
                    products={accessories}
                    onAddToCart={handleAddToCart}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* BENEFITS SECTION */}
      <section className="w-full px-4 md:px-8 lg:px-12 pb-20 overflow-x-hidden">
        <div className="mx-auto max-w-7xl space-y-12">
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
                desc: "30-day satisfaction guarantee. If you don't see results, get a refund.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="rounded-2xl bg-gradient-to-b from-white to-gray-50 border border-gray-200 px-5 py-4 sm:px-7 sm:py-6 shadow-xl flex flex-col items-center text-center"
              >
                <h3 className="text-xs sm:text-sm font-semibold tracking-[0.25em] text-emerald-500 uppercase mb-2 sm:mb-3">
                  {item.title}
                </h3>
                <p className="text-[11px] sm:text-sm text-gray-500 leading-relaxed max-w-xs">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>

          {/* BENEFITS GRID */}
          <div className="rounded-[40px] bg-gradient-to-b from-white via-gray-50 to-white border border-gray-200 shadow-2xl px-4 sm:px-10 py-12 relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 items-center relative z-10">
              <div className="space-y-10 text-center lg:text-right">
                {[
                  { title: "Fast Absorption", desc: "Hydrolyzed isolates ensure rapid delivery to muscles post-workout.", icon: "🏃‍♂️" },
                  { title: "High Energy", desc: "Enriched with B-Vitamins to convert protein into usable energy.", icon: "⚡" },
                  { title: "Bone Support", desc: "Fortified with Calcium and Vitamin D for skeletal strength.", icon: "🦴" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-center lg:justify-end">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center text-emerald-600 text-lg">
                        {item.icon}
                      </div>
                    </div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-emerald-500 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-center">
                <div className="relative bg-gradient-to-b from-gray-50 to-gray-100 px-10 py-10 rounded-[32px] shadow-[0_36px_90px_rgba(0,0,0,1)] border border-gray-200">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#facc1540,transparent_70%)] blur-2xl" />
                  <img
                    src="/images/product_image.png"
                    alt="Premium Supplement"
                    className="relative max-h-72 w-full object-contain drop-shadow-[0_26px_70px_rgba(0,0,0,1)]"
                  />
                </div>
              </div>

              <div className="space-y-10 text-center lg:text-left">
                {[
                  { title: "Lactose Free", desc: "Double-filtered process removes 99% of lactose and impurities.", icon: "🥛" },
                  { title: "Great Taste", desc: "Award-winning flavor profile without unnecessary sweeteners.", icon: "⭐" },
                  { title: "Fat Burner", desc: "Added CLA and L-Carnitine to support metabolism management.", icon: "🔥" }
                ].map((item, i) => (
                  <div key={i} className="space-y-2">
                    <div className="flex items-center justify-center lg:justify-start">
                      <div className="h-10 w-10 rounded-full bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center text-emerald-600 text-lg">
                        {item.icon}
                      </div>
                    </div>
                    <p className="text-xs font-semibold tracking-[0.25em] text-emerald-500 uppercase">
                      {item.title}
                    </p>
                    <p className="mt-1 text-xs text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ + CONTACT */}
      <FAQS_page />

      {/* FOOTER */}
      <footer className="w-full border-t border-gray-200 bg-white px-4 md:px-8 lg:px-12 py-8 mt-10">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center sm:items-start justify-between gap-8">
          <div className="flex-1 flex flex-col items-center sm:items-start gap-4">
            <Link
              to="/"
              className="text-2xl md:text-3xl font-black italic tracking-tighter text-gray-800 group"
            >
              Nutry
              <span className="text-emerald-500">Health</span>
              <span className="text-emerald-500 text-[12px] ml-1">®</span>
            </Link>

            <p className="text-[12px] sm:text-sm text-gray-500 max-w-xs text-center sm:text-left leading-relaxed">
              Clean. Potent. Performance-focused formulas built with integrity.
            </p>

            <div className="flex items-center gap-3 mt-1">
              {["IG", "X"].map((label) => (
                <button
                  key={label}
                  className="h-9 w-9 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center 
                       text-[11px] text-gray-500 hover:text-emerald-500 hover:border-emerald-500 transition"
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => (window.location.href = "/Verify")}
              className="mt-3 px-5 py-2 rounded-full bg-emerald-500 text-black font-semibold text-[12px] tracking-wide 
                   hover:bg-emerald-400 transition shadow-[0_0_15px_rgba(250,204,21,0.25)]"
            >
              ✔ Verify Your Product
            </button>
          </div>

          <div className="flex-1 flex flex-col gap-5 items-center sm:items-end text-center sm:text-right">
            <div>
              <h3 className="text-[12px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-gray-600 mb-2">
                Contact
              </h3>
              <p className="text-[12px] sm:text-sm text-gray-500">
                <span className="text-gray-500 mr-1">Email:</span>
                <a
                  href="mailto:nutryhealthretail@gmail.com"
                  className="hover:text-emerald-500 transition"
                >
                  nutryhealthretail@gmail.com
                </a>
              </p>
              <p className="text-[12px] sm:text-sm text-gray-500">
                <span className="text-gray-500 mr-1">Phone:</span>
                <a
                  href="tel:+919140946739"
                  className="hover:text-emerald-500 transition"
                >
                  +91 9140946739
                </a>
              </p>
            </div>

            <div>
              <button
                type="button"
                onClick={() => {
                  navigate("/about");
                  window.scrollTo(0, 0);
                }}
                className="text-[12px] sm:text-sm font-semibold tracking-[0.22em] uppercase text-emerald-600 mb-2 hover:text-emerald-500 transition"
              >
                About Us
              </button>
              <br />
              <button
                onClick={scrollToSupport}
                className="mt-3 text-[12px] sm:text-sm text-emerald-500 hover:text-emerald-600 underline underline-offset-4"
              >
                Support & FAQs
              </button>
              <br />
              <button
                onClick={() => navigate("/terms")}
                className="mt-3 text-[12px] sm:text-sm text-emerald-500 hover:text-emerald-600 underline underline-offset-4"
              >
                Terms & Conditions
              </button>
              <br />
              <button
                type="button"
                onClick={() => {
                  navigate("/privacy");
                  window.scrollTo(0, 0);
                }}
                className="mt-3 text-[12px] sm:text-sm text-emerald-500 hover:text-emerald-600 underline underline-offset-4"
              >
                Privacy & Policy
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-4 border-t border-gray-200">
          <p className="text-[11px] sm:text-[12px] text-gray-500 text-center">
            © 2025 Nutry Health Supplements Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

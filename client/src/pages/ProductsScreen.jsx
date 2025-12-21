// client/src/pages/ProductsScreen.jsx
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link, useSearchParams } from "react-router-dom";
import { 
  Filter, 
  X, 
  Search, 
  SlidersHorizontal, 
  ChevronDown, 
  ChevronUp,
  ArrowUpDown,
  Package,
  RotateCcw
} from "lucide-react";
// Cart context available if needed
// import { useCart } from "../context/CartContext";

// Categories matching homepage
const CATEGORIES = ["Protein", "Creatine", "Mass Gainer", "Pre-workout", "Accessories"];

// Sort options
const SORT_OPTIONS = [
  { value: "default", label: "Default" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name-asc", label: "Name: A to Z" },
  { value: "name-desc", label: "Name: Z to A" },
  { value: "newest", label: "Newest First" },
];

export default function ProductsScreen() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  // Filter states
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 15000]);
  const [sortBy, setSortBy] = useState("default");
  const [inStockOnly, setInStockOnly] = useState(false);
  
  // Collapsible filter sections
  const [expandedSections, setExpandedSections] = useState({
    categories: true,
    brands: true,
    price: true,
    availability: false,
  });

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brands = [...new Set(products.map((p) => p.brand).filter(Boolean))];
    return brands.sort();
  }, [products]);

  // Get max price from products
  const maxProductPrice = useMemo(() => {
    if (products.length === 0) return 15000;
    return Math.max(...products.map((p) => p.price || 0));
  }, [products]);

  // Handle URL params for brand filter (from homepage "View All" buttons)
  useEffect(() => {
    const brandParam = searchParams.get("brand");
    if (brandParam) {
      setSelectedBrands((prev) => {
        if (!prev.includes(brandParam)) {
          return [brandParam];
        }
        return prev;
      });
    }
  }, [searchParams]);

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get("/api/products");
        setProducts(data);
      } catch (err) {
        console.error("Error fetching products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Search filter
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(searchLower) ||
          p.brand?.toLowerCase().includes(searchLower) ||
          p.category?.toLowerCase().includes(searchLower)
      );
    }

    // Category filter
    if (selectedCategories.length > 0) {
      result = result.filter((p) =>
        selectedCategories.some(
          (cat) => p.category?.toLowerCase() === cat.toLowerCase()
        )
      );
    }

    // Brand filter
    if (selectedBrands.length > 0) {
      result = result.filter((p) =>
        selectedBrands.some(
          (brand) => p.brand?.toLowerCase() === brand.toLowerCase()
        )
      );
    }

    // Price range filter
    result = result.filter(
      (p) => p.price >= priceRange[0] && p.price <= priceRange[1]
    );

    // In stock filter
    if (inStockOnly) {
      result = result.filter((p) => p.countInStock > 0);
    }

    // Sorting
    switch (sortBy) {
      case "price-asc":
        result.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case "price-desc":
        result.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case "name-asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name-desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      default:
        break;
    }

    return result;
  }, [products, search, selectedCategories, selectedBrands, priceRange, sortBy, inStockOnly]);

  // Toggle category selection
  const toggleCategory = (cat) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  // Toggle brand selection
  const toggleBrand = (brand) => {
    setSelectedBrands((prev) =>
      prev.includes(brand) ? prev.filter((b) => b !== brand) : [...prev, brand]
    );
  };

  // Toggle filter section
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceRange([0, maxProductPrice]);
    setSortBy("default");
    setInStockOnly(false);
    setSearchParams({});
  };

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (selectedCategories.length > 0) count++;
    if (selectedBrands.length > 0) count++;
    if (priceRange[0] > 0 || priceRange[1] < maxProductPrice) count++;
    if (inStockOnly) count++;
    return count;
  }, [selectedCategories, selectedBrands, priceRange, inStockOnly, maxProductPrice]);

  // Prevent body scroll when mobile filters open
  useEffect(() => {
    document.body.style.overflow = showMobileFilters ? "hidden" : "";
    return () => (document.body.style.overflow = "");
  }, [showMobileFilters]);

  // Filter sidebar content (shared between desktop and mobile)
  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Categories */}
      <div className="border-b border-white/10 pb-6">
        <button
          onClick={() => toggleSection("categories")}
          className="w-full flex items-center justify-between text-white font-semibold mb-4"
        >
          <span className="text-sm uppercase tracking-wider">Categories</span>
          {expandedSections.categories ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.categories && (
          <div className="space-y-2">
            {CATEGORIES.map((cat) => (
              <label
                key={cat}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => toggleCategory(cat)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedCategories.includes(cat)
                      ? "bg-[#06a34f] border-[#06a34f]"
                      : "border-white/30 group-hover:border-[#06a34f]/50"
                  }`}
                >
                  {selectedCategories.includes(cat) && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selectedCategories.includes(cat) ? "text-[#06a34f]" : "text-white/70"}`}>
                  {cat}
                </span>
                <span className="ml-auto text-xs text-white/30">
                  ({products.filter((p) => p.category?.toLowerCase() === cat.toLowerCase()).length})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brands */}
      <div className="border-b border-white/10 pb-6">
        <button
          onClick={() => toggleSection("brands")}
          className="w-full flex items-center justify-between text-white font-semibold mb-4"
        >
          <span className="text-sm uppercase tracking-wider">Brands</span>
          {expandedSections.brands ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.brands && (
          <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
            {availableBrands.map((brand) => (
              <label
                key={brand}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <div
                  onClick={() => toggleBrand(brand)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                    selectedBrands.includes(brand)
                      ? "bg-[#06a34f] border-[#06a34f]"
                      : "border-white/30 group-hover:border-[#06a34f]/50"
                  }`}
                >
                  {selectedBrands.includes(brand) && (
                    <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
                <span className={`text-sm ${selectedBrands.includes(brand) ? "text-[#06a34f]" : "text-white/70"}`}>
                  {brand}
                </span>
                <span className="ml-auto text-xs text-white/30">
                  ({products.filter((p) => p.brand === brand).length})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div className="border-b border-white/10 pb-6">
        <button
          onClick={() => toggleSection("price")}
          className="w-full flex items-center justify-between text-white font-semibold mb-4"
        >
          <span className="text-sm uppercase tracking-wider">Price Range</span>
          {expandedSections.price ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.price && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Min</label>
                <input
                  type="number"
                  value={priceRange[0]}
                  onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#06a34f]/50"
                  placeholder="₹0"
                />
              </div>
              <span className="text-white/30 mt-5">–</span>
              <div className="flex-1">
                <label className="text-xs text-white/40 mb-1 block">Max</label>
                <input
                  type="number"
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full bg-black/50 border border-white/10 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-[#06a34f]/50"
                  placeholder="₹15000"
                />
              </div>
            </div>
            <input
              type="range"
              min="0"
              max={maxProductPrice}
              value={priceRange[1]}
              onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-[#06a34f] cursor-pointer"
            />
            <div className="flex justify-between text-xs text-white/40">
              <span>₹{priceRange[0].toLocaleString()}</span>
              <span>₹{priceRange[1].toLocaleString()}</span>
            </div>
          </div>
        )}
      </div>

      {/* Availability */}
      <div className="pb-4">
        <button
          onClick={() => toggleSection("availability")}
          className="w-full flex items-center justify-between text-white font-semibold mb-4"
        >
          <span className="text-sm uppercase tracking-wider">Availability</span>
          {expandedSections.availability ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {expandedSections.availability && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <div
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                inStockOnly
                  ? "bg-[#06a34f] border-[#06a34f]"
                  : "border-white/30 group-hover:border-[#06a34f]/50"
              }`}
            >
              {inStockOnly && (
                <svg className="w-3 h-3 text-black" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <span className={`text-sm ${inStockOnly ? "text-[#06a34f]" : "text-white/70"}`}>
              In Stock Only
            </span>
          </label>
        )}
      </div>

      {/* Reset Button */}
      {activeFilterCount > 0 && (
        <button
          onClick={resetFilters}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium hover:bg-white/10 hover:text-white transition-all"
        >
          <RotateCcw size={16} />
          Reset All Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-black via-[#080808] to-black text-white">
      {/* Header Section */}
      <div className="w-full px-4 md:px-8 lg:px-12 pt-8 pb-6">
        <div className="max-w-7xl mx-auto">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-white/40 mb-4">
            <Link to="/" className="hover:text-[#06a34f] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white/70">Products</span>
          </div>
          
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight">
                All <span className="text-[#06a34f]">Products</span>
              </h1>
              <p className="text-white/50 mt-2 text-sm md:text-base">
                Explore our premium collection of supplements
              </p>
            </div>

            {/* Search Bar - Desktop */}
            <div className="hidden lg:flex items-center gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-80 bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#06a34f]/50 focus:shadow-[0_0_20px_rgba(6,163,79,0.1)] transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar + Sort - Mobile */}
      <div className="lg:hidden px-4 pb-4">
        <div className="max-w-7xl mx-auto space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search products..."
              className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 outline-none focus:border-[#06a34f]/50 transition-all"
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => setShowMobileFilters(true)}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-white/5 border border-white/10 rounded-xl text-white/70 text-sm font-medium"
            >
              <SlidersHorizontal size={16} />
              Filters
              {activeFilterCount > 0 && (
                <span className="bg-[#06a34f] text-white text-xs font-bold px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </button>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white/70 outline-none appearance-none cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value} className="bg-black">
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 md:px-8 lg:px-12 pb-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex gap-8">
            {/* Desktop Sidebar - visible on screens >= 1024px */}
            <aside className="hidden lg:flex w-72 flex-shrink-0">
              <div className="w-full sticky top-24 bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)] h-fit">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <SlidersHorizontal size={18} className="text-[#06a34f]" />
                    Filters
                  </h2>
                  {activeFilterCount > 0 && (
                    <span className="bg-[#06a34f] text-white text-xs font-bold px-2.5 py-1 rounded-full">
                      {activeFilterCount}
                    </span>
                  )}
                </div>
                {renderFilterContent()}
              </div>
            </aside>

            {/* Products Grid */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="hidden lg:flex items-center justify-between mb-6 pb-4 border-b border-white/10">
                <p className="text-white/50 text-sm">
                  Showing <span className="text-white font-semibold">{filteredProducts.length}</span> of{" "}
                  <span className="text-white font-semibold">{products.length}</span> products
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <ArrowUpDown size={16} className="text-white/40" />
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent border border-white/10 rounded-lg px-3 py-2 text-sm text-white/70 outline-none cursor-pointer hover:border-[#06a34f]/30 transition-colors"
                    >
                      {SORT_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value} className="bg-black">
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Active Filters Pills */}
              {(selectedCategories.length > 0 || selectedBrands.length > 0) && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedCategories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => toggleCategory(cat)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#06a34f]/10 border border-[#06a34f]/30 rounded-full text-[#06a34f] text-xs font-medium hover:bg-[#06a34f]/20 transition-colors"
                    >
                      {cat}
                      <X size={12} />
                    </button>
                  ))}
                  {selectedBrands.map((brand) => (
                    <button
                      key={brand}
                      onClick={() => toggleBrand(brand)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-medium hover:bg-blue-500/20 transition-colors"
                    >
                      {brand}
                      <X size={12} />
                    </button>
                  ))}
                </div>
              )}

              {/* Loading State */}
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                  <div className="w-12 h-12 border-2 border-[#06a34f]/30 border-t-[#06a34f] rounded-full animate-spin" />
                  <p className="text-white/50 mt-4">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Package size={48} className="text-white/20 mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">No products found</h3>
                  <p className="text-white/50 text-sm mb-6 max-w-md">
                    Try adjusting your filters or search terms to find what you're looking for.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 px-6 py-3 bg-[#06a34f] text-white rounded-xl font-semibold text-sm hover:bg-[#058a42] transition-colors"
                  >
                    <RotateCcw size={16} />
                    Reset Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                  {filteredProducts.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="group relative bg-gradient-to-b from-[#111] to-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden hover:border-[#06a34f]/40 hover:shadow-[0_0_30px_rgba(6,163,79,0.15)] transition-all duration-300"
                    >
                      {/* Category Badge */}
                      {product.category && (
                        <span className="absolute top-3 left-3 z-10 px-2.5 py-1 bg-black/80 text-[#06a34f] text-[10px] font-bold uppercase rounded-md border border-[#06a34f]/30 backdrop-blur-sm">
                          {product.category}
                        </span>
                      )}
                      
                      {/* Out of Stock Badge */}
                      {product.countInStock === 0 && (
                        <div className="absolute top-3 right-3 z-20 px-3 py-1.5 bg-red-600 text-white text-[10px] font-bold uppercase rounded-lg shadow-[0_0_15px_rgba(220,38,38,0.5)] border border-red-400/50">
                          Out of Stock
                        </div>
                      )}

                      {/* Image */}
                      <div className="relative h-40 md:h-48 bg-white/5 flex items-center justify-center p-4 overflow-hidden">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
                        />
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        {/* Brand */}
                        {product.brand && (
                          <p className="text-[10px] uppercase tracking-wider text-white/40 font-medium">
                            {product.brand}
                          </p>
                        )}
                        
                        {/* Name */}
                        <h3 className="text-sm font-semibold text-white line-clamp-2 group-hover:text-[#06a34f] transition-colors">
                          {product.name}
                        </h3>

                        {/* Price */}
                        <div className="flex items-center justify-between pt-2">
                          <p className="text-[#06a34f] font-bold text-lg">
                            ₹{product.price?.toLocaleString()}
                          </p>
                          {product.weight && (
                            <span className="text-xs text-white/40">{product.weight}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button (FAB) */}
      <button
        onClick={() => setShowMobileFilters(true)}
        className="fixed bottom-6 right-6 z-40 lg:hidden h-14 w-14 rounded-full flex items-center justify-center bg-[#06a34f] text-white shadow-[0_0_30px_rgba(6,163,79,0.5)] hover:shadow-[0_0_40px_rgba(6,163,79,0.7)] transition-all"
      >
        <Filter size={22} />
        {activeFilterCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-black text-[#06a34f] text-xs font-bold rounded-full flex items-center justify-center border border-[#06a34f]">
            {activeFilterCount}
          </span>
        )}
      </button>

      {/* Mobile Filter Drawer */}
      {showMobileFilters && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden"
            onClick={() => setShowMobileFilters(false)}
          />
          <div className="fixed right-0 top-0 z-50 h-full w-full max-w-sm bg-gradient-to-b from-[#111] to-[#080808] border-l border-white/10 transform transition-transform duration-300 lg:hidden">
            <div className="h-full flex flex-col">
              {/* Header */}
              <div className="flex items-center justify-between p-5 border-b border-white/10">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal size={18} className="text-[#06a34f]" />
                  Filters
                </h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Filter Content */}
              <div className="flex-1 overflow-y-auto p-5">
                {renderFilterContent()}
              </div>

              {/* Footer */}
              <div className="p-5 border-t border-white/10 bg-black/50">
                <div className="flex gap-3">
                  <button
                    onClick={resetFilters}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-white/70 text-sm font-medium"
                  >
                    Reset
                  </button>
                  <button
                    onClick={() => setShowMobileFilters(false)}
                    className="flex-1 py-3 rounded-xl bg-[#06a34f] text-white text-sm font-bold"
                  >
                    Show {filteredProducts.length} Products
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Custom Scrollbar Styles */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245, 176, 20, 0.3);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245, 176, 20, 0.5);
        }
      `}</style>
    </div>
  );
}

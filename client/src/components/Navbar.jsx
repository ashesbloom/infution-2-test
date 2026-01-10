// client/src/components/Navbar.jsx
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  ShoppingCart,
  User,
  LogOut,
  Home as HomeIcon,
  ShieldCheck,
  Search,
  X,
} from "lucide-react";
import axios from "axios";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { cartItems, openCart } = useCart();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // 🔍 Center popup search state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchProducts, setSearchProducts] = useState([]);

  const cartCount = cartItems.reduce(
    (acc, item) => acc + Number(item.qty || 0),
    0
  );

  const isAdmin = user?.isAdmin;
  const firstName = user?.name ? user.name.split(" ")[0] : "USER";

  // 🔗 refs for click-outside
  const mobileMenuRef = useRef(null);
  const mobileToggleRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
  };

  // Load all products once when search popup opens
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setSearchLoading(true);
        const { data } = await axios.get("/api/products");
        setSearchProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error(
          "Search products load failed:",
          err?.response?.data?.message || err.message
        );
      } finally {
        setSearchLoading(false);
      }
    };

    if (searchOpen && searchProducts.length === 0) {
      fetchProducts();
    }
  }, [searchOpen, searchProducts.length]);

  // Live filtered products (updates after every input)
  const filteredResults =
    searchTerm.trim().length === 0
      ? []
      : searchProducts.filter((p) =>
          (p.name || "")
            .toString()
            .toLowerCase()
            .includes(searchTerm.trim().toLowerCase())
        );

  // 🔥 CLICK OUTSIDE HANDLER for mobile menu
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!mobileMenuOpen) return;

      const menuEl = mobileMenuRef.current;
      const toggleEl = mobileToggleRef.current;

      // if click is NOT inside menu and NOT on toggle button → close
      if (
        menuEl &&
        !menuEl.contains(e.target) &&
        (!toggleEl || !toggleEl.contains(e.target))
      ) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  return (
    <>
      <nav className="w-full bg-white/95 backdrop-blur-md fixed top-0 left-0 right-0 z-50 border-b border-gray-200 shadow-lg shadow-gray-200/50 transition-all">
        <div className="py-4 md:py-5 px-4 sm:px-6 md:px-10 lg:px-16 flex items-center justify-between max-w-7xl mx-auto relative">
          {/* Logo */}
          <Link
            to="/"
            className="text-2xl md:text-3xl font-black italic tracking-tighter text-gray-800 group"
          >
            NUTRY
            <span className="text-[#06a34f]">
              HEALTH
            </span>
            <span className="text-[#06a34f] text-[12px] ml-1">
              ®
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex gap-8 items-center text-xs font-bold uppercase tracking-[0.3em] text-gray-600">
            <Link to="/" className="flex items-center gap-1 hover:text-[#06a34f]">
              <HomeIcon size={15} /> HOME
            </Link>

            <Link
              to="/verify"
              className="flex items-center gap-1 hover:text-[#06a34f]"
            >
              <ShieldCheck size={15} /> VERIFY
            </Link>

            <Link to="/products" className="hover:text-[#06a34f]">
              PRODUCTS
            </Link>

            {/* 🔍 Search button (opens popup) */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setUserMenuOpen(false);
              }}
              className="flex items-center gap-1 hover:text-[#06a34f]"
            >
              <Search size={15} /> SEARCH
            </button>

            {/* ADMIN MENU */}
            {isAdmin && (
              <>
                <Link to="/admin/dashboard" className="hover:text-[#06a34f]">
                  DASHBOARD
                </Link>

                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-red-500 text-red-500 rounded-sm uppercase text-[10px] hover:bg-red-500 hover:text-white transition flex items-center gap-1"
                >
                  <LogOut size={14} /> LOGOUT
                </button>
              </>
            )}

            {/* USER MENU */}
            {!isAdmin && (
              <>
                {/* Cart */}
                <button
                  onClick={openCart}
                  className="relative text-gray-500 hover:text-[#06a34f] transition"
                >
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    <span>CART</span>
                  </div>

                  <span className="absolute -top-2 -right-3 bg-[#06a34f] text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                    {cartCount}
                  </span>
                </button>

                {/* User Dropdown */}
                {user ? (
                  <div className="relative">
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="px-4 py-2 border border-[#06a34f] text-[#06a34f] rounded-sm uppercase text-[10px] tracking-[0.2em] hover:bg-[#06a34f] hover:text-gray-800 transition flex items-center gap-1"
                    >
                      HI, {firstName}
                      <span className="text-[8px]">
                        {userMenuOpen ? "▲" : "▼"}
                      </span>
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded shadow-xl text-xs font-bold uppercase z-50">
                        {/* 🟡 MY ORDERS FIRST */}
                        <button
                          onClick={() => {
                            navigate("/myorders");
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          MY ORDERS
                        </button>

                        <button
                          onClick={() => {
                            navigate("/profile");
                            setUserMenuOpen(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100"
                        >
                          MY PROFILE
                        </button>

                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 flex items-center gap-2 text-red-400"
                        >
                          <LogOut size={14} /> LOGOUT
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link to="/login">
                    <button className="px-6 py-2 border border-[#06a34f] text-[#06a34f] rounded-sm uppercase text-[10px] tracking-[0.25em] hover:bg-[#06a34f] hover:text-gray-800 transition">
                      <User size={16} /> LOGIN
                    </button>
                  </Link>
                )}
              </>
            )}
          </div>

          {/* MOBILE MENU TOGGLE + CART + HI USER + SEARCH */}
          <div className="lg:hidden flex items-center gap-4 text-gray-800">
            {/* Search icon for mobile */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(true);
                setMobileMenuOpen(false);
              }}
              className="p-1 rounded-sm text-gray-600 hover:text-[#06a34f]"
            >
              <Search className="h-5 w-5" />
            </button>

            {!isAdmin && (
              <button
                onClick={openCart}
                className="relative text-gray-500 hover:text-[#06a34f] transition"
              >
                <ShoppingCart className="h-6 w-6" />
                <span className="absolute -top-1.5 -right-2 bg-[#06a34f] text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              </button>
            )}

            {!isAdmin && (
              <>
                {user ? (
                  <span className="text-[11px] uppercase font-bold">
                    HI, {firstName}
                  </span>
                ) : (
                  <Link
                    to="/login"
                    className="text-[11px] uppercase font-bold hover:text-[#06a34f]"
                  >
                    LOGIN
                  </Link>
                )}
              </>
            )}

            {isAdmin && (
              <span className="text-[11px] uppercase font-bold text-gray-600">
                ADMIN
              </span>
            )}

            <button
              type="button"
              ref={mobileToggleRef}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="p-1 rounded-sm hover:text-[#06a34f]"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>

          {/* MOBILE DROPDOWN MENU */}
          {mobileMenuOpen && (
            <div
              ref={mobileMenuRef}
              className="lg:hidden absolute right-0 top-full mt-2 w-56 bg-white border border-gray-200 rounded shadow-xl shadow-gray-300/50 text-[11px] uppercase font-bold tracking-[0.15em] text-gray-700 py-3 px-4 space-y-3"
            >
              {/* Main nav */}
              <div className="flex flex-col gap-2">
                <Link
                  to="/"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#06a34f]"
                >
                  HOME
                </Link>
                <Link
                  to="/verify"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#06a34f]"
                >
                  VERIFY
                </Link>
                <Link
                  to="/products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="hover:text-[#06a34f]"
                >
                  PRODUCTS
                </Link>
                {/* ❌ SEARCH REMOVED FROM HERE */}
              </div>

              {/* Profile / Dashboard / Orders */}
              <div className="flex flex-col gap-2">
                {!isAdmin && user && (
                  <>
                    {/* 🟡 MY ORDERS FIRST */}
                    <button
                      onClick={() => {
                        navigate("/myorders");
                        setMobileMenuOpen(false);
                      }}
                      className="text-left hover:text-[#06a34f]"
                    >
                      MY ORDERS
                    </button>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setMobileMenuOpen(false);
                      }}
                      className="text-left hover:text-[#06a34f]"
                    >
                      MY PROFILE
                    </button>
                  </>
                )}

                {isAdmin && (
                  <button
                    onClick={() => {
                      navigate("/admin/dashboard");
                      setMobileMenuOpen(false);
                    }}
                    className="text-left hover:text-[#06a34f]"
                  >
                    DASHBOARD
                  </button>
                )}
              </div>

              {/* Auth action */}
              <div className="flex flex-col">
                {user ? (
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-left text-red-400 hover:text-red-300"
                  >
                    <LogOut size={14} /> LOGOUT
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1 text-left hover:text-[#06a34f]"
                  >
                    <User size={14} /> LOGIN
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 🔍 CENTER SEARCH POPUP */}
      {searchOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white/50 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl bg-white border border-[#06a34f]/40 shadow-[0_0_35px_rgba(6,163,79,0.4)] p-5 relative">
            {/* Close */}
            <button
              type="button"
              onClick={() => {
                setSearchOpen(false);
                setSearchTerm("");
              }}
              className="absolute top-3 right-3 text-gray-500 hover:text-[#06a34f] transition"
            >
              <X size={18} />
            </button>

            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-[#06a34f] mb-4">
              Search Products
            </h2>

            {/* Input */}
            <div className="mb-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <input
                  autoFocus
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Type product name..."
                  className="w-full bg-gray-50 border border-gray-300 rounded-full pl-9 pr-3 py-2.5 text-sm text-gray-900 placeholder:text-gray-500 focus:border-[#06a34f] focus:ring-1 focus:ring-[#06a34f] outline-none"
                />
              </div>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto mt-2 rounded-xl bg-gray-50 border border-gray-200">
              {searchLoading ? (
                <div className="px-4 py-3 text-xs text-gray-500">
                  Loading products...
                </div>
              ) : searchTerm.trim().length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-500">
                  Start typing to see products.
                </div>
              ) : filteredResults.length === 0 ? (
                <div className="px-4 py-3 text-xs text-gray-500">
                  No products found for{" "}
                  <span className="text-[#06a34f] font-semibold">
                    "{searchTerm}"
                  </span>
                  .
                </div>
              ) : (
                filteredResults.map((p) => (
                  <Link
                    key={p._id}
                    to={`/product/${p._id}`}
                    onClick={() => {
                      setSearchOpen(false);
                      setSearchTerm("");
                    }}
                    className="flex items-center gap-3 px-4 py-2.5 text-xs text-gray-800 hover:bg-emerald-50 border-b border-gray-100 last:border-b-0"
                  >
                    <div className="h-9 w-9 flex items-center justify-center rounded-md bg-gray-100 border border-gray-200 overflow-hidden">
                      {p.image ? (
                        <img
                          src={p.image}
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[9px] text-gray-500">
                          NO IMG
                        </span>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold line-clamp-1">{p.name}</p>
                      <p className="text-[10px] text-gray-500 line-clamp-1">
                        {p.category} · ₹{p.price}
                      </p>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;

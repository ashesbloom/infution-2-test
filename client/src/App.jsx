// client/src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

// Pages - Public
import Home from "./pages/Home";
import ProductDetails from "./pages/ProductDetails";
import Login from "./pages/Login";
import Register from "./pages/Register";
import VerifyScreen from "./pages/VerifyScreen";
import PaymentFailed from "./pages/PaymentFailed";
import ForgotPassword from "./pages/ForgotPassword";
import About_page from "./pages/aboutPage";
import TermsPage from "./pages/TandC";
import PrivacyPage from "./pages/PrivacyPolicy";



// NEW PAGE
import ProductsScreen from "./pages/ProductsScreen";

// Pages - Checkout
import ShippingScreen from "./pages/ShippingScreen";
import PaymentScreen from "./pages/PaymentScreen";
import PlaceOrderScreen from "./pages/PlaceOrderScreen";
import OrderScreen from "./pages/OrderScreen";
import MyOrdersScreen from "./pages/MyOrdersScreen";
import ProfileScreen from "./pages/ProfileScreen";

// Admin
import AdminDashboard from "./pages/AdminDashboard";
import ProductListScreen from "./pages/ProductListScreen";
import ProductEditScreen from "./pages/ProductEditScreen";
import ProductCreateScreen from "./pages/ProductCreateScreen";
import OrderListScreen from "./pages/OrderListScreen";
import UserListScreen from "./pages/UserListScreen";
import AuthCodeScreen from "./pages/AuthCodeScreen";

import AdminRoute from "./components/AdminRoute";
import CartSidebar from "./components/CartSidebar";
import Navbar from "./components/Navbar";

// hooks
import { useCart } from "./context/CartContext";
import { useAuth } from "./context/AuthContext";

export default function App() {
  const { isCartOpen, closeCart } = useCart();
  const { user } = useAuth();
  const isAdmin = user?.isAdmin;

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      {/* Fixed Navbar */}
      <Navbar />

      {/* Cart Sidebar – hidden for admin */}
      {!isAdmin && <CartSidebar isOpen={isCartOpen} onClose={closeCart} />}

      {/* Main content padded so navbar doesn't overlap */}
      <main className="pt-20 md:pt-24">
        <Routes>

          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify" element={<VerifyScreen />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/about" element={<About_page />} />
          <Route path="/terms" element={<TermsPage />} />
          <Route path="/privacy" element={<PrivacyPage />} />
         
          {/* NEW PRODUCTS PAGE */}
          <Route path="/products" element={<ProductsScreen />} />

          {/* User */}
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/myorders" element={<MyOrdersScreen />} />

          {/* Checkout (blocked for admin) */}
          <Route
            path="/shipping"
            element={
              isAdmin ? <Navigate to="/admin/dashboard" replace /> : <ShippingScreen />
            }
          />
          <Route
            path="/payment"
            element={
              isAdmin ? <Navigate to="/admin/dashboard" replace /> : <PaymentScreen />
            }
          />
          <Route
            path="/placeorder"
            element={
              isAdmin ? <Navigate to="/admin/dashboard" replace /> : <PlaceOrderScreen />
            }
          />

          {/* Orders */}
          <Route path="/order/:id" element={<OrderScreen />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />

          {/* Admin */}
          <Route path="/admin" element={<AdminRoute />}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="productlist" element={<ProductListScreen />} />
            <Route path="product/create" element={<ProductCreateScreen />} />
            <Route path="product/:id/edit" element={<ProductEditScreen />} />
            <Route path="orderlist" element={<OrderListScreen />} />
            <Route path="userlist" element={<UserListScreen />} />
            <Route path="authcodes" element={<AuthCodeScreen />} />
          </Route>
        </Routes>
      </main>
    </div>
  );
}

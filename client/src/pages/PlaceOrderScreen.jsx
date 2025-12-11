// client/src/pages/PlaceOrderScreen.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const { cartItems, selectedItems, clearCart, openCart } = useCart();
  const { user } = useAuth();

  const [sdkReady, setSdkReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [placing, setPlacing] = useState(false); // prevents double submits

  // Prefetched Razorpay key
  const [razorpayKey, setRazorpayKey] = useState(null);

  const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));
  const paymentMethod = localStorage.getItem("paymentMethod") || "Razorpay";

  // Use selected items for this page (fallback to all cart items if none selected)
  const items = selectedItems.length > 0 ? selectedItems : cartItems;
  const hasItems = items.length > 0;

  // Redirect if no shipping
  useEffect(() => {
    if (!shippingAddress) navigate("/shipping");
  }, [shippingAddress, navigate]);

  // Login guard
  useEffect(() => {
    if (!user) navigate("/login?redirect=/placeorder");
  }, [user, navigate]);

  // Load Razorpay script & prefetch key
  useEffect(() => {
    let mounted = true;

    const addRazorpayScript = () => {
      const script = document.createElement("script");
      script.type = "text/javascript";
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setSdkReady(true);
      document.body.appendChild(script);
    };

    if (!window.Razorpay) addRazorpayScript();
    else setSdkReady(true);

    // prefetch key so we don't wait for it on button click
    const fetchKey = async () => {
      try {
        const token = user?.token;
        const config = {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        };
        const { data } = await axios.get("/api/orders/config/razorpay", config);
        const key = data.key || data;
        if (!mounted) return;
        setRazorpayKey(key);
      } catch (err) {
        console.warn("Razorpay key prefetch failed:", err?.message || err);
      }
    };

    fetchKey();

    return () => {
      mounted = false;
    };
  }, [user]);

  // Auto hide both toasts
  useEffect(() => {
    if (!successMessage && !failureMessage) return;
    const t = setTimeout(() => {
      setSuccessMessage("");
      setFailureMessage("");
    }, 3000);
    return () => clearTimeout(t);
  }, [successMessage, failureMessage]);

  // Price helpers (based on items)
  const itemsPrice = addDecimals(
    items.reduce((acc, i) => acc + Number(i.price) * Number(i.qty), 0)
  );
  const shippingPrice = addDecimals(itemsPrice > 500 ? 0 : 50);
  const taxPrice = addDecimals(Number((itemsPrice * 0.18).toFixed(2)));
  const totalPrice = (
    Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)
  ).toFixed(2);

  // Axios config
  const token = user?.token;
  const config = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
  };

  const handleError = (label, err) => {
    console.error(`${label} error:`, err);
    setFailureMessage(
      err?.response?.data?.message ||
        err?.message ||
        `Error during ${label}`
    );
  };

  // Build order using selected items
  const buildOrderPayload = (method) => ({
    orderItems: items.map((item) => ({
      name: item.name,
      qty: item.qty,
      image: item.image,
      price: item.price,
      product: item.product || item._id,
    })),
    shippingAddress: {
      fullName: shippingAddress.name,
      address: shippingAddress.address,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: shippingAddress.country || "India",
      phone: shippingAddress.mobile,
    },
    paymentMethod: method,
    itemsPrice: Number(itemsPrice),
    shippingPrice: Number(shippingPrice),
    taxPrice: Number(taxPrice),
    totalPrice: Number(totalPrice),
  });

  // Razorpay handler
  const placeOrderHandler = async () => {
    // prevent multiple clicks
    if (placing) return;
    setPlacing(true);

    try {
      if (!token) {
        setPlacing(false);
        return navigate("/login?redirect=/placeorder");
      }
      if (!hasItems) {
        setFailureMessage("No items selected. Please select items in cart.");
        setPlacing(false);
        return;
      }

      setFailureMessage("");
      setSuccessMessage("");

      const payload = buildOrderPayload("Razorpay");

      // create order on server (this endpoint will create DB order)
      const { data: createdOrder } = await axios.post(
        "/api/orders",
        payload,
        config
      );

      // create razorpay order on server (kept separate to avoid breaking server)
      let key = razorpayKey;
      if (!key) {
        const { data: keyData } = await axios.get("/api/orders/config/razorpay", config);
        key = keyData.key || keyData;
        setRazorpayKey(key);
      }

      const { data: rOrder } = await axios.post(
        "/api/orders/razorpay",
        { amount: createdOrder.totalPrice },
        config
      );

      const options = {
        key,
        amount: rOrder.amount,
        currency: rOrder.currency,
        name: "INFUSED Supplements",
        description: "Order Payment",
        order_id: rOrder.id,
        handler: async function (response) {
          try {
            // On successful payment, mark order paid
            await axios.put(
              `/api/orders/${createdOrder._id}/pay`,
              {
                id: response.razorpay_payment_id,
                status: "COMPLETED",
                update_time: String(Date.now()),
                email_address: user.email,
              },
              config
            );

            // show success and go
            setSuccessMessage("Order placed successfully!");
            clearCart();
            navigate(`/order/${createdOrder._id}`);
          } catch (err) {
            handleError("payment verify", err);
            setPlacing(false);
          }
        },
        prefill: {
          name: shippingAddress.name,
          email: user.email,
          contact: shippingAddress.mobile,
        },
        theme: { color: "#f5b014" },
        modal: {
          ondismiss: () =>
            setFailureMessage("Payment cancelled by user."),
        },
      };

      // create rzp instance and attach failure handler to reset placing on fail
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        console.error("Razorpay payment.failed:", res.error);
        setFailureMessage(
          "Payment failed or cancelled. You can try again or choose COD."
        );
        // allow user to retry after failure
        setPlacing(false);
      });

      // open the modal
      rzp.open();
    } catch (err) {
      handleError("Razorpay order", err);
      setPlacing(false);
    }
  };

  // COD handler
  const codOrderHandler = async () => {
    // prevent multiple clicks
    if (placing) return;
    setPlacing(true);
    try {
      if (!token) {
        setPlacing(false);
        return navigate("/login?redirect=/placeorder");
      }
      if (!hasItems) {
        setFailureMessage("No items selected. Please select items in cart.");
        setPlacing(false);
        return;
      }

      setFailureMessage("");
      setSuccessMessage("Placing COD order…");

      const payload = buildOrderPayload("COD");
      const { data: createdOrder } = await axios.post(
        "/api/orders",
        payload,
        config
      );

      // immediate success UX — show message, clear cart, navigate
      setSuccessMessage("Order placed successfully!");
      clearCart();
      navigate(`/order/${createdOrder._id}`);
      // no placing=false: navigation leaves the page
    } catch (err) {
      setSuccessMessage("");
      handleError("COD order", err);
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      {/* Toasts */}
      {successMessage && (
        <div className="fixed top-24 left-0 right-0 z-50 flex justify-center mx-2 pointer-events-none">
          <div className="max-w-md w-full bg-emerald-500 text-white px-5 py-3 rounded-full text-sm md:text-base font-semibold shadow-[0_0_25px_rgba(16,185,129,0.7)] text-center">
            {successMessage}
          </div>
        </div>
      )}

      {failureMessage && (
        <div className="fixed top-24 left-0 right-0 z-50 flex justify-center mx-2 pointer-events-none">
          <div className="max-w-md w-full bg-red-500 text-white px-5 py-3 rounded-full text-sm md:text-base font-semibold shadow-[0_0_25px_rgba(239,68,68,0.7)] text-center">
            {failureMessage}
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Step Indicator */}
        <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] md:text-xs font-semibold tracking-[0.18em] text-center">
          <button
            type="button"
            onClick={openCart}
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            1 · CART
          </button>
          <span className="text-zinc-600">·</span>
          <button
            type="button"
            onClick={() => navigate("/shipping")}
            className="text-emerald-400 hover:text-emerald-300 cursor-pointer"
          >
            2 · SHIPPING
          </button>
          <span className="text-zinc-600">·</span>
          <span className="text-yellow-400 border-b border-yellow-400 pb-0.5">
            3 · REVIEW &amp; PAY
          </span>
        </div>

        {/* Header */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2">
            Review <span className="text-[#f5b014]">Your Order</span>
          </h1>
          <p className="text-zinc-400 text-xs md:text-sm max-w-xl">
            Confirm your shipping details, check your items, and complete
            your payment securely.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Shipping Card */}
            <div className="bg-[#0a0a0a] p-5 md:p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl md:text-2xl font-bold uppercase text-zinc-200">
                  Shipping
                </h2>
                <button
                  type="button"
                  onClick={() => navigate("/shipping")}
                  className="text-[10px] md:text-xs uppercase tracking-[0.18em] text-yellow-400 hover:text-yellow-300 cursor-pointer"
                >
                  Edit
                </button>
              </div>

              <div className="mt-4 text-sm md:text-base text-zinc-300 leading-relaxed">
                <p className="font-semibold text-white text-base md:text-lg">
                  {shippingAddress?.name}
                </p>
                <p className="mt-1">
                  {shippingAddress?.address}, {shippingAddress?.city},{" "}
                  {shippingAddress?.state} - {shippingAddress?.postalCode}
                </p>
                <p className="mt-1 text-yellow-400 font-medium">
                  +91 {shippingAddress?.mobile}
                </p>
              </div>
            </div>

            {/* Items Card */}
            <div className="bg-[#0a0a0a] p-5 md:p-6 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
              <h2 className="text-xl md:text-2xl font-bold uppercase text-zinc-200 mb-4">
                Items
              </h2>

              {!hasItems ? (
                <p className="text-sm md:text-base text-zinc-400">
                  No items selected.{" "}
                  <button
                    type="button"
                    onClick={openCart}
                    className="text-yellow-400 hover:text-yellow-300 underline underline-offset-2"
                  >
                    Open your cart and select items.
                  </button>
                </p>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center gap-4 border-b border-white/5 pb-3 last:border-b-0"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl bg-black border border-white/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="min-w-0">
                          <Link
                            to={`/product/${item._id}`}
                            className="text-sm md:text-base font-semibold text-white hover:text-yellow-400 line-clamp-2"
                          >
                            {item.name}
                          </Link>
                          <p className="text-[11px] text-zinc-500 mt-1">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-xs md:text-sm flex-shrink-0">
                        <p className="text-zinc-400">
                          {item.qty} × ₹{item.price}
                        </p>
                        <p className="font-semibold text-white">
                          ₹{(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Summary */}
          <div className="w-full">
            <div className="bg-[#111111] p-5 md:p-6 rounded-2xl shadow-[0_0_35px_rgba(245,176,20,0.35)] border border-yellow-500/30 lg:sticky lg:top-28">
              <h2 className="text-xl md:text-2xl font-black mb-5 uppercase text-zinc-200">
                Order Summary
              </h2>

              <div className="space-y-3 text-sm md:text-base">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Items</span>
                  <strong className="text-white">
                    ₹{Number(itemsPrice).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Shipping</span>
                  <strong className="text-white">
                    ₹{Number(shippingPrice).toLocaleString("en-IN")}
                  </strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-zinc-400">Tax (18%)</span>
                  <strong className="text-white">
                    ₹{Number(taxPrice).toLocaleString("en-IN")}
                  </strong>
                </div>
              </div>

              <div className="border-t border-white/10 mt-4 pt-4 flex justify-between items-center">
                <span className="text-[10px] md:text-xs uppercase tracking-[0.25em] text-zinc-400">
                  Total
                </span>
                <span className="text-xl md:text-2xl font-black text-[#f5b014]">
                  ₹{Number(totalPrice).toLocaleString("en-IN")}
                </span>
              </div>

              {/* Buttons */}
              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={placeOrderHandler}
                  disabled={!sdkReady || !hasItems || placing}
                  className="w-full bg-[#f5b014] text-black font-bold text-sm md:text-base py-3 rounded-xl 
                  hover:bg-[#ffcb3d] shadow-[0_0_25px_rgba(245,176,20,0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? "Processing…" : "Pay via Razorpay"}
                </button>

                <button
                  onClick={codOrderHandler}
                  disabled={!hasItems || placing}
                  className="w-full bg-black text-white font-bold text-sm md:text-base py-3 rounded-xl border border-white/20 
                  hover:bg-zinc-900 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? "Processing…" : "Cash on Delivery (COD)"}
                </button>
              </div>

              <p className="text-[10px] md:text-xs text-zinc-500 text-center mt-3">
                100% Secure Payments via Razorpay · UPI · Cards · Netbanking
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;

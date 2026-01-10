// client/src/pages/PlaceOrderScreen.jsx
import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";

import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

const addDecimals = (num) => (Math.round(num * 100) / 100).toFixed(2);

const PlaceOrderScreen = () => {
  const navigate = useNavigate();
  const { cartItems, selectedItems, clearCart } = useCart();
  const { user } = useAuth();

  const [sdkReady, setSdkReady] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [failureMessage, setFailureMessage] = useState("");
  const [placing, setPlacing] = useState(false);
  const [razorpayKey, setRazorpayKey] = useState(null);

  const shippingAddress = JSON.parse(localStorage.getItem("shippingAddress"));
  // const paymentMethod = localStorage.getItem("paymentMethod") || "Razorpay";

  const items = selectedItems.length > 0 ? selectedItems : cartItems;
  const hasItems = items.length > 0;

  useEffect(() => {
    if (!shippingAddress) navigate("/shipping");
  }, [shippingAddress, navigate]);

  useEffect(() => {
    if (!user) navigate("/login?redirect=/placeorder");
  }, [user, navigate]);

  useEffect(() => {
    let mounted = true;

    const addRazorpayScript = () => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setSdkReady(true);
      document.body.appendChild(script);
    };

    if (!window.Razorpay) addRazorpayScript();
    else setSdkReady(true);

    const fetchKey = async () => {
      try {
       
       const { data } = await api.get('/api/orders/config/razorpay');



        const key = data.key || data;
        if (!mounted) return;
        setRazorpayKey(key);
      } catch (err) {
        console.warn("Razorpay key prefetch failed:", err?.message || err);
      }
    };

    fetchKey();
    return () => (mounted = false);
  }, [user]);

  useEffect(() => {
    if (!successMessage && !failureMessage) return;
    const timer = setTimeout(() => {
      setSuccessMessage("");
      setFailureMessage("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [successMessage, failureMessage]);

  const itemsPrice = addDecimals(
    items.reduce((acc, i) => acc + Number(i.price) * Number(i.qty), 0)
  );
  const shippingPrice = addDecimals(itemsPrice > 500 ? 0 : 50);
  const taxPrice = addDecimals(Number((itemsPrice * 0.18).toFixed(2)));
  const totalPrice = (
    Number(itemsPrice) + Number(shippingPrice) + Number(taxPrice)
  ).toFixed(2);

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
      err?.response?.data?.message || err?.message || `Error during ${label}`
    );
  };

  const refundStock = async (orderId) => {
    try {
      await api.put(
  `/api/orders/${orderId}/cancel`,

 
);

      console.log(`Stock refunded for Order ID: ${orderId}`);
    } catch (err) {
      console.error("Failed to refund stock:", err);
    }
  };

  const buildOrderPayload = (method) => {
    // Validate all items have required fields
    const validItems = items.filter(item => item && item._id && item.name && item.price);
    
    if (validItems.length !== items.length) {
      console.warn('Some cart items are invalid and were filtered out');
    }
    
    return {
      orderItems: validItems.map((item) => ({
        name: item.name,
        qty: item.qty || 1,
        image: item.image || '',
        price: item.price,
        product: item._id,  // Product ID from the cart item
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
    };
  };

  const placeOrderHandler = async () => {
    if (placing) return;
    setPlacing(true);

    let createdOrder = null;

    try {
      if (!user) {
  setPlacing(false);
  return navigate("/login?redirect=/placeorder");
}

      if (!hasItems) {
        setFailureMessage("No items selected.");
        setPlacing(false);
        return;
      }

      const payload = buildOrderPayload("Razorpay");

      const { data } = await api.post(
  "/api/orders",
  payload,
  
);

      createdOrder = data;

      let key = razorpayKey;
      if (!key) {
        const { data: keyResp } = await api.get(
  "/api/orders/config/razorpay",

);

        key = keyResp.key || keyResp;
        setRazorpayKey(key);
      }

      const { data: rOrder } = await api.post(
  "/api/orders/razorpay",
  { amount: createdOrder.totalPrice },
 
);


      const options = {
        key,
        amount: rOrder.amount,
        currency: rOrder.currency,
        name: "Nutry Health Supplements",
        description: "Order Payment",
        order_id: rOrder.id,

        handler: async function (response) {
          try {
           await api.put(
  `/api/orders/${createdOrder._id}/pay`,
  {
    id: response.razorpay_payment_id,
    status: "COMPLETED",
    update_time: String(Date.now()),
    email_address: user.email,
  },
  
);


            setSuccessMessage("Order placed successfully!");
            clearCart();
            navigate(`/order/${createdOrder._id}`);
          } catch (err) {
            handleError("payment verify", err);
            await refundStock(createdOrder._id);
            setPlacing(false);
          }
        },

        prefill: {
          name: shippingAddress.name,
          email: user.email,
          contact: shippingAddress.mobile,
        },

        theme: { color: "#06a34f" },

        // ⭐ UPDATED CANCEL HANDLER
        modal: {
          ondismiss: async () => {
            setFailureMessage("Payment cancelled.");

            await refundStock(createdOrder._id);

            navigate("/"); // ⭐ redirect to home

            setPlacing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      // ⭐ UPDATED FAILURE HANDLER
      rzp.on("payment.failed", async (res) => {
        console.error("Failed:", res.error);

        setFailureMessage("Payment failed.");

        await refundStock(createdOrder._id);

        navigate("/"); // ⭐ redirect to home

        setPlacing(false);
      });

      rzp.open();
    } catch (err) {
      handleError("Razorpay order", err);
      setPlacing(false);
    }
  };

  const codOrderHandler = async () => {
    if (placing) return;
    setPlacing(true);

    try {
      const payload = buildOrderPayload("COD");

      const { data: createdOrder } = await api.post(
  "/api/orders",
  payload,
  
);


      setSuccessMessage("Order placed successfully!");
      clearCart();
      navigate(`/order/${createdOrder._id}`);
    } catch (err) {
      handleError("COD order", err);
      setPlacing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-800 overflow-x-hidden">
      {successMessage && (
        <div className="fixed top-24 left-0 right-0 z-50 flex justify-center mx-2">
          <div className="max-w-md w-full bg-emerald-500 text-white px-5 py-3 rounded-full text-sm font-semibold text-center">
            {successMessage}
          </div>
        </div>
      )}

      {failureMessage && (
        <div className="fixed top-24 left-0 right-0 z-50 flex justify-center mx-2">
          <div className="max-w-md w-full bg-red-500 text-gray-800 px-5 py-3 rounded-full text-sm font-semibold text-center">
            {failureMessage}
          </div>
        </div>
      )}

      <div className="w-full max-w-5xl mx-auto px-4 py-8 space-y-8">
        <h1 className="text-3xl md:text-4xl font-black uppercase mb-2">
          Review <span className="text-[#06a34f]">Your Order</span>
        </h1>
        <div className="text-gray-500 text-xs md:text-sm max-w-xl">
          Confirm your details and complete your payment securely.
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold">Shipping</h2>
                <button
                  onClick={() => navigate("/shipping")}
                  className="text-emerald-500 text-xs"
                >
                  Edit
                </button>
              </div>

              <div className="mt-4 text-sm text-gray-600">
                <p className="font-semibold text-gray-800 text-base">
                  {shippingAddress?.name}
                </p>
                <p className="mt-1">
                  {shippingAddress?.address}, {shippingAddress?.city},{" "}
                  {shippingAddress?.state} - {shippingAddress?.postalCode}
                </p>
                <p className="mt-1 text-emerald-500 font-medium">
                  +91 {shippingAddress?.mobile}
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Items</h2>

              {!hasItems ? (
                <p>No items selected.</p>
              ) : (
                <div className="space-y-4">
                  {items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center border-b border-gray-200 pb-3"
                    >
                      <div className="flex items-center gap-4">
                        <img
                 src={
    item.image?.startsWith("http")
      ? item.image
      : `${import.meta.env.VITE_API_BASE_URL}${item.image}`
  }
  className="w-16 h-16 rounded-xl object-contain"
  alt={item.name}
/>

                        <div>
                          <Link
                            to={`/product/${item._id}`}
                            className="text-sm text-gray-800 hover:text-emerald-500"
                          >
                            {item.name}
                          </Link>
                          <p className="text-xs text-gray-500">
                            Qty: {item.qty}
                          </p>
                        </div>
                      </div>

                      <div className="text-right text-sm">
                        <p className="text-gray-500">
                          {item.qty} × ₹{item.price}
                        </p>
                        <p className="font-semibold text-gray-800">
                          ₹{(item.qty * item.price).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="w-full">
            <div className="bg-gray-50 p-6 rounded-2xl border border-emerald-500/30 shadow-[0_0_35px_rgba(6,163,79,0.35)]">
              <h2 className="text-xl font-black mb-5">Order Summary</h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Items</span>
                  <strong>₹{itemsPrice}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping</span>
                  <strong>₹{shippingPrice}</strong>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-500">Tax (18%)</span>
                  <strong>₹{taxPrice}</strong>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-4 pt-4 flex justify-between items-center">
                <span className="text-xs text-gray-500">Total</span>
                <span className="text-2xl font-black text-[#06a34f]">
                  ₹{totalPrice}
                </span>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <button
                  onClick={placeOrderHandler}
                  disabled={!sdkReady || !hasItems || placing}
                  className="w-full bg-[#06a34f] text-white font-bold text-sm py-3 rounded-xl 
                  hover:bg-[#058a42] shadow-[0_0_25px_rgb(6,163,79_/_0.6)] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? "Processing…" : "Pay via Razorpay"}
                </button>

                <button
                  onClick={codOrderHandler}
                  disabled={!hasItems || placing}
                  className="w-full bg-white text-gray-800 font-bold text-sm py-3 rounded-xl border border-white/20 
                  hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {placing ? "Processing…" : "Cash on Delivery (COD)"}
                </button>
              </div>

              <p className="text-xs text-gray-500 text-center mt-3">
                100% Secure Payments via Razorpay
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlaceOrderScreen;

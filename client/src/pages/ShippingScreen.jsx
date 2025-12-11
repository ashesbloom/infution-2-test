// client/src/pages/ShippingScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShippingScreen = () => {
  const navigate = useNavigate();

  // Load saved data
  const savedAddress =
    JSON.parse(localStorage.getItem("shippingAddress")) || {};

  // State Variables
  const [name, setName] = useState(savedAddress.name || "");
  const [address, setAddress] = useState(savedAddress.address || "");
  const [city, setCity] = useState(savedAddress.city || "");
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || "");
  const [country, setCountry] = useState(savedAddress.country || "");
  const [state, setState] = useState(savedAddress.state || "");
  const [mobile, setMobile] = useState(savedAddress.mobile || "");

  const [pinLoading, setPinLoading] = useState(false);

  // Auto-fetch City & State logic
  useEffect(() => {
    const fetchLocation = async () => {
      if (postalCode.length === 6) {
        setPinLoading(true);
        try {
          const { data } = await axios.get(
            `https://api.postalpincode.in/pincode/${postalCode}`
          );

          if (data[0].Status === "Success") {
            const details = data[0].PostOffice[0];
            setCity(details.District);
            setState(details.State);
            setCountry("India");
          }
          setPinLoading(false);
        } catch (error) {
          console.error(error);
          setPinLoading(false);
        }
      }
    };

    fetchLocation();
  }, [postalCode]);

  const submitHandler = (e) => {
    e.preventDefault();

    // Save Address Details
    localStorage.setItem(
      "shippingAddress",
      JSON.stringify({ name, address, city, postalCode, country, state, mobile })
    );

    // Auto-select Razorpay
    localStorage.setItem("paymentMethod", "Razorpay");

    // Jump to Place Order
    navigate("/placeorder");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-black text-white flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.9)] px-6 sm:px-8 py-8 md:py-10">

        {/* ✅ BACK BUTTON INSIDE THE CARD */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a] transition text-sm"
        >
          ← Back
        </button>

        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.35em] text-yellow-400 uppercase mb-2">
            Checkout · Step 1 / 2
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Shipping <span className="text-[#f5b014]">Address</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-zinc-400">
            Enter your delivery details. Pincode will auto-fill your city and
            state when valid.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={submitHandler} className="space-y-5">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter recipient's name"
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="House No, Street, Landmark"
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              required
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              placeholder="10-digit mobile number"
              pattern="[0-9]{10}"
              maxLength="10"
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* Postal Code */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Pincode <span className="text-red-500">*</span>
              </label>
              {pinLoading && (
                <span className="text-[10px] text-yellow-400 uppercase tracking-[0.18em]">
                  Fetching details...
                </span>
              )}
            </div>
            <input
              type="text"
              required
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              maxLength="6"
              placeholder="e.g. 110001"
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white placeholder:text-zinc-500"
            />
          </div>

          {/* City & State */}
          <div className="flex flex-col md:flex-row gap-4">
            {/* City */}
            <div className="w-full md:w-1/2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white"
              />
            </div>

            {/* State */}
            <div className="w-full md:w-1/2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white"
              />
            </div>
          </div>

          {/* Country */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#f5b014] focus:outline-none text-sm px-4 py-2.5 text-white"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 w-full bg-[#f5b014] hover:bg-[#ffca3b] text-black font-black text-xs tracking-[0.3em] uppercase py-3 rounded-lg shadow-[0_0_25px_rgba(245,176,20,0.7)] transition"
          >
            Proceed to Pay
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;

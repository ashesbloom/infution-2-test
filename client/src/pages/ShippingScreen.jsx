// client/src/pages/ShippingScreen.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const ShippingScreen = () => {
  const navigate = useNavigate();

  const savedAddress =
    JSON.parse(localStorage.getItem("shippingAddress")) || {};

  const [name, setName] = useState(savedAddress.name || "");
  const [address, setAddress] = useState(savedAddress.address || "");
  const [city, setCity] = useState(savedAddress.city || "");
  const [postalCode, setPostalCode] = useState(savedAddress.postalCode || "");
  const [country, setCountry] = useState(savedAddress.country || "");
  const [state, setState] = useState(savedAddress.state || "");
  const [mobile, setMobile] = useState(savedAddress.mobile || "");
  const [pinLoading, setPinLoading] = useState(false);
  const [pinError, setPinError] = useState("");
  const [isValidPin, setIsValidPin] = useState(false);

  useEffect(() => {
    const fetchLocation = async () => {
      setPinError("");
      setIsValidPin(false);

      if (postalCode.length === 6) {
        const upPrefixes = ["20", "21", "22", "23", "24", "25", "26", "27"];

        // ❌ Not a UP Pincode
        if (!upPrefixes.some((pref) => postalCode.startsWith(pref))) {
          setPinError(
            "We are not serviceable in your area... We will reach you soon... Thank you!"
          );
          setCity("");
          setState("");
          setCountry("");
          return;
        }

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
            setIsValidPin(true);
          } else {
            setPinError("Invalid Pincode");
          }
        } catch (error) {
          setPinError("Unable to fetch location");
        }
        setPinLoading(false);
      }
    };

    fetchLocation();
  }, [postalCode]);

  const submitHandler = (e) => {
    e.preventDefault();

    if (!isValidPin) return;

    localStorage.setItem(
      "shippingAddress",
      JSON.stringify({ name, address, city, postalCode, country, state, mobile })
    );

    localStorage.setItem("paymentMethod", "Razorpay");

    navigate("/placeorder");
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] w-full bg-black text-white flex items-center justify-center px-4 pb-10">
      <div className="w-full max-w-xl bg-[#050505] border border-white/10 rounded-3xl shadow-[0_0_35px_rgba(0,0,0,0.9)] px-6 sm:px-8 py-8 md:py-10">

        {/* BACK */}
        <button
          onClick={() => navigate(-1)}
          className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#111] text-white border border-white/10 hover:bg-[#1a1a1a] transition text-sm"
        >
          ← Back
        </button>

        {/* HEADER */}
        <div className="mb-8">
          <p className="text-[11px] tracking-[0.35em] text-emerald-500 uppercase mb-2">
            Checkout · Step 1 / 2
          </p>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight">
            Shipping <span className="text-[#06a34f]">Address</span>
          </h1>
          <p className="mt-2 text-xs md:text-sm text-zinc-400">
            Enter your delivery details. Only Uttar Pradesh pincodes are serviceable.
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={submitHandler} className="space-y-5">
          
          {/* NAME */}
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
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
            />
          </div>

          {/* ADDRESS */}
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
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
            />
          </div>

          {/* MOBILE */}
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
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
            />
          </div>

          {/* PINCODE */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400">
                Pincode <span className="text-red-500">*</span>
              </label>
              {pinLoading && (
                <span className="text-[10px] text-emerald-500 uppercase tracking-[0.18em]">
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
              placeholder="e.g. 221001"
              className={`w-full rounded-lg bg-[#101010] border ${
                pinError ? "border-emerald-400" : "border-zinc-700"
              } focus:border-[#06a34f] text-sm px-4 py-2.5 text-white`}
            />

            {/* CLEAN ERROR MESSAGE */}
            {pinError && (
              <div className="mt-2 text-[11px] text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 px-3 py-2 rounded-lg">
                {pinError}
              </div>
            )}
          </div>

          {/* CITY + STATE */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="w-full md:w-1/2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
              />
            </div>

            <div className="w-full md:w-1/2">
              <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
              />
            </div>
          </div>

          {/* COUNTRY */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-[0.2em] text-zinc-400 mb-2">
              Country <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-lg bg-[#101010] border border-zinc-700 focus:border-[#06a34f] text-sm px-4 py-2.5 text-white"
            />
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={!isValidPin}
            className={`mt-4 w-full text-black font-black text-xs tracking-[0.3em] uppercase py-3 rounded-lg shadow-[0_0_25px_rgba(6,163,79,0.7)] transition
              ${
                isValidPin
                  ? "bg-[#06a34f] hover:bg-[#058a42]"
                  : "bg-gray-600 cursor-not-allowed opacity-60"
              }`}
          >
            {isValidPin ? "Proceed to Pay" : "Enter Valid UP Pincode"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ShippingScreen;

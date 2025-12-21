// client/src/pages/VerifyScreen.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const VerifyScreen = () => {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setResult(null);

    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter your authenticity code.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        "/api/authcodes/verify",
        {
          code: trimmed,
          markUsed: false,
        }
      );
      setResult(data);
    } catch (err) {
      // 🔥 ALWAYS SHOW YOUR CUSTOM MESSAGE
      setError(
        "The code you entered does not match any verified Nutry Health product."
      );
    } finally {
      setLoading(false);
    }
  };

  const renderResultCard = () => {
    if (!result) return null;

    if (result.valid) {
      return (
        <div className="mt-4 rounded-xl border border-green-500/70 bg-green-900/20 px-4 py-3 text-sm text-green-100">
          <h3 className="mb-1 text-green-300 font-semibold">
            ✅ Genuine Nutry Health Product....
          </h3>
          <p>{result.message}</p>

          {result.productId && (
            <p className="mt-2 text-xs text-green-200/80">
              Linked Product ID:{" "}
              <span className="font-mono">{result.productId}</span>
            </p>
          )}
        </div>
      );
    }

    return (
      <div className="mt-4 rounded-xl border border-red-500/70 bg-red-900/30 px-4 py-3 text-sm text-red-100">
        <h3 className="mb-1 text-red-300 font-semibold">
          ⚠ The code you entered does not match any verified Nutry Health
          product.
        </h3>

        <p>
          {result?.message ||
            "Please double-check the code printed on your product's cap."}
        </p>

        {result?.usedAt && (
          <p className="mt-2 text-xs text-red-200/80">
            This code was already used on{" "}
            {new Date(result.usedAt).toLocaleString()}.
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen w-full bg-black text-gray-100">
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 pt-2 pb-6 sm:px-6 lg:px-8">
        {/* Back Link */}
        <div className="mb-4 text-xs text-gray-400">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 cursor-pointer hover:text-[#06a34f] transition-colors"
          >
            <span className="text-lg">←</span> Back to Home
          </button>
        </div>

        {/* Header */}
        <header className="mb-6">
          <p className="text-xs tracking-[0.25em] text-gray-400 uppercase">
            Nutry Health
          </p>

          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight">
            <span className="block text-white">VERIFY</span>
            <span className="block bg-gradient-to-r from-[#06a34f] to-emerald-500 bg-clip-text text-transparent">
              AUTHENTICITY
            </span>
          </h1>

          <p className="mt-3 text-sm text-gray-400 max-w-lg">
            Enter the unique 12-character code found below the cap of your
            Nutry Health product to confirm its authenticity.
          </p>
        </header>

        {/* MAIN CARD */}
        <main className="flex flex-col items-center flex-1">
          <div className="w-full max-w-sm sm:max-w-lg md:max-w-3xl rounded-2xl border border-gray-800 bg-gradient-to-b from-gray-900 to-black p-4 sm:p-6 shadow-xl shadow-emerald-500/10">
            {/* Error above input */}
            {error && (
              <div className="mb-3 w-full rounded-lg border border-red-500 bg-red-900/40 px-4 py-2 text-center text-sm text-red-200 font-medium shadow">
                ⚠ {error}
              </div>
            )}

            {/* Input Section */}
            <p className="text-xs tracking-wider text-[#06a34f] uppercase font-semibold">
              12-Character Verification Code
            </p>
            <p className="text-xs text-gray-400 mb-3">
              Enter the code exactly as printed on the seal.
            </p>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="rounded-xl border border-gray-700 bg-black p-3 sm:p-4 shadow-inner">
                <input
                  type="text"
                  maxLength="12"
                  placeholder="A1B2-C3D4-E5F6"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  className="w-full bg-transparent text-center text-base sm:text-lg tracking-[0.25em] font-semibold text-gray-100 placeholder:text-gray-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 sm:py-3 rounded-xl bg-[#06a34f] hover:bg-emerald-500 transition text-white font-semibold tracking-wide text-xs sm:text-sm disabled:opacity-60"
              >
                {loading ? "Verifying..." : "VERIFY PRODUCT NOW"}
              </button>
            </form>

            {renderResultCard()}
          </div>

          {/* Bottom Info Card */}
          <div className="w-full max-w-sm sm:max-w-lg md:max-w-3xl mt-8 rounded-2xl border border-gray-800 bg-gradient-to-r from-gray-950 to-black px-4 sm:px-6 py-5 sm:py-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 flex items-center justify-center rounded-full bg-emerald-500/10 text-xl">
                📦
              </div>

              <div className="flex-1">
                <p className="text-xs font-semibold tracking-[0.2em] text-[#06a34f] uppercase">
                  Code Location
                </p>

                <p className="text-xs text-gray-400 mt-1">
                  Look for the 12-character alphanumeric code printed under the
                  cap.
                </p>

                <ul className="mt-3 space-y-1 text-xs text-gray-400">
                  <li className="flex gap-2">
                    <span className="text-[#06a34f]">•</span> Near the printed
                    MFG / EXP date.
                  </li>
                  <li className="flex gap-2">
                    <span className="text-[#06a34f]">•</span> Do not share your
                    code publicly.
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default VerifyScreen;

import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthCodeScreen = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [tab, setTab] = useState("generate"); // generate | list | verify

  // Generate
  const [count, setCount] = useState(100);
  const [length, setLength] = useState(12);
  const [productId, setProductId] = useState("");

  // List
  const [codes, setCodes] = useState([]);
  const [filterUsed, setFilterUsed] = useState("");
  const [loadingList, setLoadingList] = useState(false);

  // Verify
  const [verifyCode, setVerifyCode] = useState("");
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);

  // Messages
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingGenerate, setLoadingGenerate] = useState(false);

  useEffect(() => {
    if (!user || !user.isAdmin) {
      navigate("/login");
    }
  }, [user, navigate]);

  const config = {
    headers: {
      Authorization: `Bearer ${user?.token}`,
      "Content-Type": "application/json",
    },
  };

  // -------- Generate --------
  const generateCodes = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoadingGenerate(true);
      const { data } = await axios.post(
        "/api/authcodes/generate",
        {
          count: Number(count),
          length: Number(length),
          productId: productId || null,
        },
        config
      );
      setMessage(`${data.message} (Total: ${data.total})`);
    } catch (err) {
      setError(err.response?.data?.message || "Error generating codes");
    } finally {
      setLoadingGenerate(false);
    }
  };

  // -------- List --------
  const fetchCodes = async () => {
    try {
      setLoadingList(true);
      const params = {};
      if (filterUsed) params.used = filterUsed;

      const { data } = await axios.get("/api/authcodes", {
        params,
        ...config,
      });

      setCodes(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error loading codes");
    } finally {
      setLoadingList(false);
    }
  };

  // -------- Verify --------
  const verifyHandler = async (e) => {
    e.preventDefault();
    setError("");
    setVerifyResult(null);

    if (!verifyCode.trim()) {
      setError("Please enter a code to verify");
      return;
    }

    try {
      setVerifyLoading(true);
      const { data } = await axios.post("/api/authcodes/verify", {
        code: verifyCode,
        markUsed: true,
      });
      setVerifyResult(data);
    } catch (err) {
      setError(err.response?.data?.message || "Error verifying code");
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-bold mb-4">Authenticity Codes Admin</h2>

      {message && (
        <div className="mb-4 rounded bg-green-100 text-green-800 px-4 py-2 text-sm">
          {message}
        </div>
      )}
      {error && (
        <div className="mb-4 rounded bg-red-100 text-red-800 px-4 py-2 text-sm">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded text-sm font-semibold ${
            tab === "generate"
              ? "bg-emerald-500 text-black"
              : "bg-gray-800 text-gray-200"
          }`}
          onClick={() => setTab("generate")}
        >
          Generate
        </button>
        <button
          className={`px-4 py-2 rounded text-sm font-semibold ${
            tab === "list"
              ? "bg-emerald-500 text-black"
              : "bg-gray-800 text-gray-200"
          }`}
          onClick={() => {
            setTab("list");
            fetchCodes();
          }}
        >
          List / Export
        </button>
        <button
          className={`px-4 py-2 rounded text-sm font-semibold ${
            tab === "verify"
              ? "bg-emerald-500 text-black"
              : "bg-gray-800 text-gray-200"
          }`}
          onClick={() => setTab("verify")}
        >
          Verify
        </button>
      </div>

      {/* -------- Generate Tab -------- */}
      {tab === "generate" && (
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Generate Codes</h3>
          <form onSubmit={generateCodes} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Count</label>
              <input
                type="number"
                min="1"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
                value={count}
                onChange={(e) => setCount(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">Code Length</label>
              <input
                type="number"
                min="4"
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
                value={length}
                onChange={(e) => setLength(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm mb-1">
                Product ID (optional – link codes to product)
              </label>
              <input
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={loadingGenerate}
              className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-60"
            >
              {loadingGenerate ? "Generating…" : "Generate Codes"}
            </button>
          </form>
        </div>
      )}

      {/* -------- List Tab -------- */}
      {tab === "list" && (
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Codes List</h3>
            <button
              onClick={() => window.open("/api/authcodes/export", "_blank")}
              className="px-3 py-1 rounded bg-green-500 text-black text-sm font-semibold hover:bg-green-400"
            >
              Export CSV
            </button>
          </div>

          <div className="flex gap-2 mb-4">
            <select
              className="px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
              value={filterUsed}
              onChange={(e) => setFilterUsed(e.target.value)}
            >
              <option value="">Used & Unused</option>
              <option value="false">Unused</option>
              <option value="true">Used</option>
            </select>
            <button
              onClick={fetchCodes}
              className="px-3 py-2 rounded bg-gray-700 text-sm hover:bg-gray-600"
            >
              Apply
            </button>
          </div>

          {loadingList ? (
            <p className="text-sm text-gray-400">Loading…</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-700 text-gray-300">
                    <th className="text-left py-2 px-2">Code</th>
                    <th className="text-left py-2 px-2">Product</th>
                    <th className="text-left py-2 px-2">Used</th>
                    <th className="text-left py-2 px-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {codes.length === 0 && (
                    <tr>
                      <td
                        colSpan="4"
                        className="py-3 px-2 text-gray-500 text-center"
                      >
                        No codes found.
                      </td>
                    </tr>
                  )}
                  {codes.map((c) => (
                    <tr
                      key={c._id}
                      className="border-b border-gray-800 hover:bg-gray-800/40"
                    >
                      <td className="py-2 px-2 font-mono text-xs">{c.code}</td>
                      <td className="py-2 px-2 text-xs">
                        {c.productId || "-"}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {c.used ? "Yes" : "No"}
                      </td>
                      <td className="py-2 px-2 text-xs">
                        {c.createdAt
                          ? new Date(c.createdAt).toLocaleString()
                          : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* -------- Verify Tab -------- */}
      {tab === "verify" && (
        <div className="bg-gray-900 rounded-lg p-6 shadow">
          <h3 className="text-lg font-semibold mb-4">Verify Code</h3>
          <form onSubmit={verifyHandler} className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Code</label>
              <input
                className="w-full px-3 py-2 rounded bg-gray-800 border border-gray-700 text-sm"
                value={verifyCode}
                onChange={(e) => setVerifyCode(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={verifyLoading}
              className="px-4 py-2 rounded bg-emerald-500 text-black font-semibold text-sm hover:bg-emerald-400 disabled:opacity-60"
            >
              {verifyLoading ? "Verifying…" : "Verify"}
            </button>
          </form>

          {verifyResult && (
            <div className="mt-4 rounded bg-gray-800 px-4 py-3 text-xs font-mono text-gray-100">
              <pre>{JSON.stringify(verifyResult, null, 2)}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuthCodeScreen;

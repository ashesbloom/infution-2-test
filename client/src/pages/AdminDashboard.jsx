import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, ShoppingBag, LogOut, Key, RefreshCw, Copy } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const AdminDashboard = () => {
  const { user, logout, updateUser } = useAuth();

  const [generatedToken, setGeneratedToken] = useState('');
  const [isMarkingUsed, setIsMarkingUsed] = useState(false);
  const [markUsedChecked, setMarkUsedChecked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopyToken = () => {
    if (generatedToken && generatedToken !== 'No Code Generated Yet') {
      navigator.clipboard
        .writeText(generatedToken)
        .then(() => {
          setCopySuccess(true);
          setTimeout(() => setCopySuccess(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy token: ', err);
        });
    }
  };

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const { data } = await axios.get('/api/admin/auth-code', {
          headers: { Authorization: `Bearer ${user?.token}` },
        });
        setGeneratedToken(data.token || '');
      } catch (err) {
        console.error('Failed to fetch auth token:', err);
      }
    };

    if (user?.isAdmin) fetchToken();
  }, [user]);

  const showTokenCard = user?.isAdmin;

  const handleGenerateToken = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setCopySuccess(false);

      const { data } = await axios.post(
        '/api/admin/generate-token',
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setGeneratedToken(data.token || '');
      setMarkUsedChecked(false);
    } catch (err) {
      console.error('Failed to generate token:', err);
      setError('Generation failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkUsed = async () => {
    if (!generatedToken) return;

    setIsMarkingUsed(true);

    try {
      await axios.put(
        '/api/admin/auth-code/mark-used',
        { code: generatedToken },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setMarkUsedChecked(true);
    } catch (err) {
      console.error('Failed to mark code used:', err);
    }

    setIsMarkingUsed(false);
  };

  return (
    // ⬇️ smaller top padding here
    <div className="min-h-screen w-full bg-zinc-950 text-white overflow-x-hidden pt-10 pb-10">
      {/* ⬇️ and smaller top padding inside */}
      <div className="max-w-7xl mx-auto px-6 md:px-16 pt-3 pb-10">
        <div className="bg-zinc-900/80 rounded-2xl shadow-2xl border border-white/10 px-6 sm:px-10 py-8">
          <h2 className="text-2xl sm:text-3xl font-extrabold mb-4 text-gray-300 italic tracking-tighter">
            Admin <span className="text-yellow-500">Dashboard</span>
          </h2>

          <p className="text-sm sm:text-base md:text-lg mb-8 text-gray-400">
            Welcome back, {user ? user.name : 'Administrator'}...Start Managing products, orders, and user accounts.
          </p>

          {showTokenCard && (
            <div className="mb-10 p-6 sm:p-8 bg-zinc-800/50 border border-yellow-500/30 rounded-xl shadow-lg">
              <h3 className="text-xl sm:text-2xl font-black italic uppercase mb-4 text-yellow-500">
                Product Authentication Code
              </h3>

              <p className="text-gray-400 mb-4 text-sm sm:text-base">
                Generate a unique code to print on INFUSED products for verification.
              </p>

              <div className="relative mb-4">
                <div className="bg-black/50 p-4 rounded-lg border border-white/10 text-center font-mono text-lg sm:text-xl tracking-widest text-yellow-400">
                  {generatedToken ? generatedToken : 'No Code Generated Yet'}
                </div>
                {generatedToken && generatedToken !== 'No Code Generated Yet' && (
                  <button
                    onClick={handleCopyToken}
                    className={`absolute top-1/2 right-2 transform -translate-y-1/2 p-2 rounded-full transition-all duration-300 ${
                      copySuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-zinc-700 text-gray-400 hover:bg-zinc-600'
                    }`}
                    title={copySuccess ? 'Copied!' : 'Copy to Clipboard'}
                  >
                    <Copy size={18} />
                  </button>
                )}
              </div>

              {error && <p className="text-red-400 text-xs mt-2 text-center">{error}</p>}
              {copySuccess && (
                <p className="text-green-400 text-sm mt-2 text-center font-bold">
                  Token copied successfully!
                </p>
              )}

              <button
                onClick={handleGenerateToken}
                disabled={isLoading}
                className="w-full bg-yellow-500 text-black py-3 rounded-md font-black uppercase tracking-wide
                            hover:bg-yellow-400 hover:shadow-[0_0_18px_rgba(245,158,11,0.7)] transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <RefreshCw size={18} className="animate-spin" /> Fetching Code...
                  </>
                ) : (
                  <>
                    <Key size={18} /> Generate Auth Code
                  </>
                )}
              </button>

              {generatedToken && (
                <div className="mt-4 flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={markUsedChecked}
                    onChange={handleMarkUsed}
                    disabled={isMarkingUsed}
                    className="w-5 h-5 accent-yellow-500 cursor-pointer"
                  />
                  <span className="text-gray-300 text-sm sm:text-base">
                    Mark this code as used (cannot be generated again)
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-zinc-800/50 p-6 sm:p-8 rounded-xl border border-yellow-500/30
                            flex flex-col justify-between transition-all duration-300 group
                            hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
            >
              <div>
                <ShoppingBag
                  size={32}
                  className="text-yellow-500 mb-3 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xl sm:text-2xl font-black italic uppercase mb-2">
                  Product Management
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  Add, edit, or delete products and update inventory stock.
                </p>
              </div>
              <Link to="/admin/productlist" className="mt-6">
                <button
                  className="w-full bg-yellow-500 text-black py-3 rounded-md 
                                font-black text-sm uppercase tracking-wide hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                >
                  <Package size={18} /> Manage Products
                </button>
              </Link>
            </div>

            <div className="bg-zinc-800/50 p-6 sm:p-8 rounded-xl border border-yellow-500/30
                            flex flex-col justify-between transition-all duration-300 group
                            hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
            >
              <div>
                <Package
                  size={32}
                  className="text-yellow-500 mb-3 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xl sm:text-2xl font-black italic uppercase mb-2">
                  Order Management
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  View and update the status of all customer orders.
                </p>
              </div>
              <Link to="/admin/orderlist" className="mt-6">
                <button
                  className="w-full bg-yellow-500 text-black py-3 rounded-md 
                                font-black text-sm uppercase tracking-wide hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                >
                  <Package size={18} /> View Orders
                </button>
              </Link>
            </div>

            <div className="bg-zinc-800/50 p-6 sm:p-8 rounded-xl border border-yellow-500/30
                            flex flex-col justify-between transition-all duration-300 group
                            hover:-translate-y-1 hover:shadow-[0_0_35px_rgba(245,158,11,0.4)]"
            >
              <div>
                <Users
                  size={32}
                  className="text-yellow-500 mb-3 group-hover:scale-105 transition-transform"
                />
                <h3 className="text-xl sm:text-2xl font-black italic uppercase mb-2">
                  User Management
                </h3>
                <p className="text-gray-400 text-sm sm:text-base">
                  Review and manage registered user accounts.
                </p>
              </div>
              <Link to="/admin/userlist" className="mt-6">
                <button
                  className="w-full bg-yellow-500 text-black py-3 rounded-md 
                                font-black text-sm uppercase tracking-wide hover:bg-yellow-400 transition-all flex items-center justify-center gap-2"
                >
                  <Users size={18} /> Manage Users
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

// client/src/pages/ProfileScreen.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = () => {
  const { user, setUser } = useAuth();

  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');

  const [loading, setLoading] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [totalOrders, setTotalOrders] = useState(0);
  const [deliveredCount, setDeliveredCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [loadingStats, setLoadingStats] = useState(true);

  const [createdAt, setCreatedAt] = useState('');

  // Redirect protection
  if (!user) {
    window.location.href = '/login';
  }

  const config = {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${user?.token}`,
    },
  };

  // Helper: derive date from Mongo ObjectId if createdAt missing
  const deriveCreatedFromId = (id) => {
    if (!id || typeof id !== 'string' || id.length < 8) return '';
    const tsHex = id.substring(0, 8);
    const ts = parseInt(tsHex, 16);
    if (Number.isNaN(ts)) return '';
    return new Date(ts * 1000).toISOString();
  };

  // Fetch profile (name, email, createdAt)
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const { data } = await axios.get('/api/users/profile', config);

        setName(data.name || '');
        setEmail(data.email || '');

        const apiCreatedAt = data.createdAt;
        const fallback = deriveCreatedFromId(data._id);
        setCreatedAt(apiCreatedAt || fallback || user?.createdAt || '');
      } catch (err) {
        setError(
          err?.response?.data?.message || 'Failed to load profile details.'
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    if (user?.token) {
      fetchProfile();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fetch order stats (total, delivered, pending)
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const { data } = await axios.get('/api/orders/myorders', config);

        const orders = Array.isArray(data) ? data : [];

        const delivered = orders.filter(
          (o) => o.isDelivered === true || o.status === 'Delivered'
        ).length;

        const total = orders.length;
        const pending = total - delivered;

        setTotalOrders(total);
        setDeliveredCount(delivered);
        setPendingCount(pending);
      } catch (err) {
        console.error(
          'Failed to load order stats:',
          err?.response?.data?.message || err.message
        );
      } finally {
        setLoadingStats(false);
      }
    };

    if (user?.token) {
      fetchStats();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const submitHandler = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);

      await axios.put(
        '/api/users/profile',
        {
          name,
        },
        config
      );

      setSuccess('Profile updated successfully.');

      const updatedUser = {
        ...user,
        name,
      };

      if (setUser) {
        setUser(updatedUser);
      }
      localStorage.setItem('userInfo', JSON.stringify(updatedUser));
    } catch (err) {
      setError(
        err?.response?.data?.message || 'Failed to update profile.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-white text-gray-800 flex items-center justify-center">
        Loading profile...
      </div>
    );
  }

  let createdDateText = 'Not available';

  if (createdAt) {
    const d = new Date(createdAt);
    if (!isNaN(d.getTime())) {
      createdDateText = d.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }
  }

  return (
    <div className="min-h-screen w-full bg-white text-gray-800">
      {/* ⬇️ reduced top padding here */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-10">
        <h1 className="text-2xl md:text-3xl font-black mb-4 tracking-tight">
          My Profile
        </h1>

        {error && (
          <div className="mb-4 bg-red-50 text-red-600 px-4 py-2 rounded-lg border border-red-500/50 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-lg border border-emerald-500/50 text-sm">
            {success}
          </div>
        )}

        {/* BASIC INFO ONLY */}
        <form
          onSubmit={submitHandler}
          className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8 space-y-8"
        >
          <div>
            <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 uppercase tracking-[0.15em] text-gray-700">
              Basic Information
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-[0.2em] text-gray-500">
                Name
              </label>
              <input
                type="text"
                className="w-full bg-gray-50 border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-[#06a34f]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-xs font-semibold mb-2 uppercase tracking-[0.2em] text-gray-500">
                Email
              </label>
              <input
                type="email"
                className="w-full bg-gray-100 border border-gray-200 rounded px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                value={email}
                disabled
              />
              <p className="text-[10px] text-gray-500 mt-1">
                Email is used for login and cannot be changed.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#06a34f] hover:bg-[#058a42] text-gray-800 font-black py-3 rounded-md text-xs uppercase tracking-[0.3em] disabled:opacity-60 transition shadow-[0_0_25px_rgba(6,163,79,0.6)]"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>

        {/* ACCOUNT STATS SECTION */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-200 shadow-lg p-6 md:p-7">
          <h2 className="text-lg md:text-xl font-semibold uppercase tracking-[0.18em] text-gray-700 border-b border-gray-200 pb-3">
            Order Overview
          </h2>

          <p className="mt-2 text-[11px] md:text-xs text-gray-500 italic">
            Since you created your account on{' '}
            <span className="text-emerald-500">{createdDateText}</span>
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* TOTAL ORDERS */}
            <div className="bg-gray-50 border border-gray-300 rounded-xl px-4 py-4 flex flex-col justify-between shadow-[0_0_18px_rgba(255,255,255,0.08)]">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gray-500">
                Total Orders
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-gray-800">
                  {loadingStats ? '—' : totalOrders}
                </span>
              </div>
            </div>

            {/* DELIVERED */}
            <div className="bg-gray-50 border border-emerald-500/40 rounded-xl px-4 py-4 flex flex-col justify-between shadow-[0_0_22px_rgba(16,185,129,0.25)]">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gray-500">
                Delivered
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-emerald-600">
                  {loadingStats ? '—' : deliveredCount}
                </span>
              </div>
            </div>

            {/* PENDING */}
            <div className="bg-gray-50 border border-emerald-500/40 rounded-xl px-4 py-4 flex flex-col justify-between shadow-[0_0_22px_rgba(6,163,79,0.25)]">
              <span className="text-[10px] md:text-[11px] uppercase tracking-[0.25em] text-gray-500">
                Pending
              </span>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-3xl md:text-4xl font-black text-[#06a34f]">
                  {loadingStats ? '—' : pendingCount}
                </span>
              </div>
              <p className="mt-2 text-[10px] text-gray-500">
                Orders that haven&apos;t been marked as delivered yet.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileScreen;

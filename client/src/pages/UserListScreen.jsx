import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Check, X, Trash2, Copy } from 'lucide-react';

const UserListScreen = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: userInfo } = useAuth();

  const [showModal, setShowModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [copySuccessId, setCopySuccessId] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError('');
        const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
        const { data } = await axios.get('/api/users', config);
        setUsers(data);
      } catch (err) {
        console.error('Fetch users error:', err.response?.data || err.message);
        setError(err.response?.data?.message || 'Failed to load users.');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo && userInfo.isAdmin) fetchUsers();
    else {
      setLoading(false);
      setError('Admin access required.');
    }
  }, [userInfo]);

  useEffect(() => {
  window.scrollTo(0, 0);
}, []);

useEffect(() => {
  if (!loading) window.scrollTo(0, 0);
}, [loading]);


  const deleteHandler = async (id) => {
    try {
      const config = { headers: { Authorization: `Bearer ${userInfo.token}` } };
      await axios.delete(`/api/users/${id}`, config);
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err) {
      console.error('Delete user error:', err.response?.data || err.message);
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  const copyToClipboard = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopySuccessId(id);
      setTimeout(() => setCopySuccessId(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const shortId = (id) => {
    if (!id) return '';
    if (id.length <= 14) return id;
    return `${id.slice(0, 8)}...${id.slice(-6)}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-black text-gray-300 flex items-center justify-center">
        Loading users...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-black text-red-500 flex items-center justify-center px-4 text-center">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-black text-white overflow-x-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-16">
       
       <div className="mb-5">
          <Link to="/admin/dashboard">
            <button className="inline-flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-[11px] font-bold uppercase tracking-[0.16em] text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white transition-all hover:shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              ← Back
            </button>
          </Link>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 tracking-tight text-yellow-400">
          Users
        </h1>

        {users.length === 0 ? (
          <p className="text-gray-300 text-sm">No users found.</p>
        ) : (
          <>
            {/* -----------------------
                DESKTOP / TABLE (md+)
                ----------------------- */}
            <div className="hidden md:block w-full rounded-2xl bg-[#050814] border border-white/10 shadow-xl">
              <div className="overflow-hidden rounded-2xl">
                <table className="w-full table-auto">
                  <thead className="bg-[#0b1220]">
                    <tr>
                      <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">ID</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Email</th>
                      <th className="px-3 sm:px-6 py-3 text-left text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Admin</th>
                      <th className="px-3 sm:px-6 py-3 text-right text-[10px] sm:text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user._id} className={`border-t border-white/5 transition-all ${idx % 2 === 0 ? 'bg-[#050814]' : 'bg-[#050814]/80'} hover:bg-[#0f172a] hover:shadow-[0_0_18px_rgba(15,23,42,0.9)]`}>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200">{user._id}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-200">{user.name}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm text-gray-300">{user.email}</td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-xs sm:text-sm">
                          {user.isAdmin ? <Check className="text-green-500" size={18} /> : <X className="text-red-500" size={18} />}
                        </td>
                        <td className="px-3 sm:px-6 py-3 whitespace-nowrap text-right text-xs sm:text-sm">
                          <div className="inline-flex items-center gap-2">
                            {!user.isAdmin && (
                              <button
                                onClick={() => {
                                  setDeleteId(user._id);
                                  setShowModal(true);
                                }}
                                className="inline-flex items-center justify-center rounded-md p-1.5 text-red-500 hover:text-red-300 hover:shadow-[0_0_12px_rgba(248,113,113,0.8)] transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* -----------------------
                MOBILE / CARD LIST (sm)
                ----------------------- */}
            <div className="md:hidden space-y-4">
              {users.map((u) => (
                <div key={u._id} className="bg-[#050814] border border-white/8 rounded-xl p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-extrabold text-gray-200 truncate">{u.name || '—'}</h3>
                        {u.isAdmin ? <span className="text-green-400 text-xs font-bold">ADMIN</span> : null}
                      </div>

                      <p className="text-xs text-gray-300 mt-1 truncate">{u.email}</p>

                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span className="font-mono text-[12px] text-yellow-400 break-all">{shortId(u._id)}</span>
                        <button
                          onClick={() => copyToClipboard(u._id, u._id)}
                          className="p-1 rounded-md hover:bg-zinc-900 transition"
                          title="Copy full ID"
                        >
                          <Copy size={14} className="text-gray-300" />
                        </button>
                        {copySuccessId === u._id && <span className="text-green-400 text-xs font-bold">Copied</span>}
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {!u.isAdmin && (
                        <button
                          onClick={() => {
                            setDeleteId(u._id);
                            setShowModal(true);
                          }}
                          className="inline-flex items-center justify-center rounded-md p-2 bg-red-600/10 hover:bg-red-600/20 transition text-red-400"
                          title="Delete User"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}


                      <div className="mt-1">
                        {u.isAdmin ? <Check className="text-green-500" size={16} /> : <X className="text-red-500" size={16} />}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-[#0b1220] border border-white/10 rounded-xl shadow-[0_0_25px_rgba(245,176,20,0.4)] w-80 max-w-[90%] p-6 text-center">
            <h2 className="text-xl font-bold text-yellow-400 mb-2">Confirm Delete</h2>
            <p className="text-gray-300 text-sm mb-6">Are you sure you want to delete this user?</p>

            <div className="flex justify-center gap-4">
              <button
                onClick={async () => {
                  await deleteHandler(deleteId);
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="bg-red-500 hover:bg-red-400 px-4 py-2 rounded-md text-white font-bold shadow-[0_0_15px_rgba(239,68,68,0.6)] transition"
              >
                Delete
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setDeleteId(null);
                }}
                className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded-md text-white font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserListScreen;
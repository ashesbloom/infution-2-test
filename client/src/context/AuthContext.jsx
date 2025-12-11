import { createContext, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Load user from localStorage
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('userInfo');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const navigate = useNavigate();

  // LOGIN — now also expects hideAdminTokenCard if backend sends it
  const login = (userData) => {
    const finalUser = {
      ...userData,
      hideAdminTokenCard: userData.hideAdminTokenCard || false,
    };

    localStorage.setItem('userInfo', JSON.stringify(finalUser));
    setUser(finalUser);
  };

  // Update user (used when toggling hideAdminTokenCard)
  const updateUser = (updatedFields) => {
    const updatedUser = { ...user, ...updatedFields };
    setUser(updatedUser);
    localStorage.setItem('userInfo', JSON.stringify(updatedUser));
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem('userInfo');
    setUser(null);
    navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        logout,
        updateUser, // ⭐ NEW (needed for token-card hide toggle)
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

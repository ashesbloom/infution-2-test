import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate, Outlet } from 'react-router-dom';

const AdminRoute = () => {
  const { user } = useAuth();
  
  // Check if user exists and if user.isAdmin is true
  const isAdmin = user && user.isAdmin;

  // If the user is an admin, render the child routes/components (Outlet).
  // Otherwise, redirect them to the login page.
  return isAdmin ? <Outlet /> : <Navigate to="/login" replace />;
};

export default AdminRoute;
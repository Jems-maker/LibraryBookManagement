import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import StudentLayout from './layouts/StudentLayout';
import Login from './pages/auth/Login';
import AdminLogin from './pages/auth/AdminLogin';
import Register from './pages/auth/Register';
import Dashboard from './pages/student/Dashboard';
import Profile from './pages/student/Profile';
import BorrowedBooks from './pages/student/BorrowedBooks';
import History from './pages/student/History';

import AdminLayout from './layouts/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import Books from './pages/admin/Books';
import Students from './pages/admin/Students';
import Requests from './pages/admin/Requests';
import Scanner from './pages/admin/Scanner';
import Awards from './pages/admin/Awards';
import Settings from './pages/admin/Settings';
import Categories from './pages/admin/Categories';
import Authors from './pages/admin/Authors';
import Publishers from './pages/admin/Publishers';
import Courses from './pages/admin/Courses';
import Reports from './pages/admin/Reports';
export default function App() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
      <Route path="/login" element={<Login />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route path="/register" element={<Register />} />

      {/* Student Routes */}
      <Route element={<ProtectedRoute><StudentLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/borrowed-books" element={<BorrowedBooks />} />
        <Route path="/history" element={<History />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminLayout /></ProtectedRoute>}>
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="books" element={<Books />} />
        <Route path="students" element={<Students />} />
        <Route path="requests" element={<Requests />} />
        <Route path="scanner" element={<Scanner />} />
        <Route path="categories" element={<Categories />} />
        <Route path="authors" element={<Authors />} />
        <Route path="publishers" element={<Publishers />} />
        <Route path="courses" element={<Courses />} />
        <Route path="reports" element={<Reports />} />
        <Route path="awards" element={<Awards />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

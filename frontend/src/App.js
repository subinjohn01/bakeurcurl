import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

// Pages
import HomePage from './pages/HomePage';
import ServicesPage from './pages/ServicesPage';
import ProductsPage from './pages/ProductsPage';
import BookingPage from './pages/BookingPage';
import ContactPage from './pages/ContactPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerDashboard from './pages/CustomerDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminBookings from './pages/admin/AdminBookings';
import AdminServices from './pages/admin/AdminServices';
import AdminProducts from './pages/admin/AdminProducts';
import AdminStaff from './pages/admin/AdminStaff';
import AdminQueries from './pages/admin/AdminQueries';
import StaffDashboard from './pages/StaffDashboard';

// Protected Route
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
    const hasRole = roles.some(r => {
      if (r === 'admin') return user?.role === 'admin';
      if (r === 'staff') return user?.role === 'admin' || user?.role === 'staff';
      if (r === 'customer') return user?.role === 'customer';
      return false;
    });
    if (!hasRole) return <Navigate to="/" replace />;
  }

  return children;
};

// Public pages layout (with Navbar + Footer)
const PublicLayout = ({ children }) => (
  <>
    <Navbar />
    <main style={{ paddingTop: 68, flex: 1 }}>{children}</main>
    <Footer />
  </>
);

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicLayout><HomePage /></PublicLayout>} />
      <Route path="/services" element={<PublicLayout><ServicesPage /></PublicLayout>} />
      <Route path="/products" element={<PublicLayout><ProductsPage /></PublicLayout>} />
      <Route path="/book" element={<PublicLayout><BookingPage /></PublicLayout>} />
      <Route path="/contact" element={<PublicLayout><ContactPage /></PublicLayout>} />
      <Route path="/login" element={<PublicLayout><LoginPage /></PublicLayout>} />
      <Route path="/register" element={<PublicLayout><RegisterPage /></PublicLayout>} />

      {/* Customer protected */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <PublicLayout><CustomerDashboard /></PublicLayout>
          </ProtectedRoute>
        }
      />

      {/* Admin protected */}
      <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/bookings" element={<ProtectedRoute requiredRole={['admin', 'staff']}><AdminBookings /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminStaff /></ProtectedRoute>} />
      <Route path="/admin/queries" element={<ProtectedRoute requiredRole={['admin', 'staff']}><AdminQueries /></ProtectedRoute>} />

      {/* Staff */}
      <Route path="/staff" element={<ProtectedRoute requiredRole="staff"><StaffDashboard /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#231812' }}>
          <AppRoutes />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(40,26₹8,0.95)',
              color: '#fff',
              border: '1px solid rgba(168₹22,81,0.3)',
              backdropFilter: 'blur(20px)',
              borderRadius: 12,
              fontFamily: "'Inter', sans-serif",
            },
            success: { iconTheme: { primary: '#34D399', secondary: '#231812' } },
            error: { iconTheme: { primary: '#F87171', secondary: '#231812' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

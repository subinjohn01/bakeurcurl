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
import AdminCustomers from './pages/admin/AdminCustomers';
import AdminServices from './pages/admin/AdminServices';
import AdminProducts from './pages/admin/AdminProducts';
import AdminStaff from './pages/admin/AdminStaff';
import AdminQueries from './pages/admin/AdminQueries';
import AdminLoyalty from './pages/admin/AdminLoyalty';
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
      <Route path="/admin/customers" element={<ProtectedRoute requiredRole="admin"><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/services" element={<ProtectedRoute requiredRole="admin"><AdminServices /></ProtectedRoute>} />
      <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
      <Route path="/admin/staff" element={<ProtectedRoute requiredRole="admin"><AdminStaff /></ProtectedRoute>} />
      <Route path="/admin/loyalty" element={<ProtectedRoute requiredRole="admin"><AdminLoyalty /></ProtectedRoute>} />
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
          gutter={12}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#231812',
              color: '#FBF6EE',
              border: '1.5px solid rgba(241,213,146,0.35)',
              borderRadius: '12px',
              padding: '12px 18px',
              fontSize: '14px',
              fontWeight: 500,
              boxShadow: '0 12px 35px rgba(0,0,0,0.7)',
              fontFamily: "'Inter', sans-serif",
            },
            success: {
              style: {
                border: '1.5px solid rgba(52,211,153,0.5)',
              },
              iconTheme: { primary: '#34D399', secondary: '#231812' },
            },
            error: {
              duration: 5000,
              style: {
                background: '#2A1713',
                color: '#FFF5F5',
                border: '1.5px solid rgba(248,113,113,0.5)',
              },
              iconTheme: { primary: '#F87171', secondary: '#2A1713' },
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;

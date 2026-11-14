import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home/Home';
import FindBlood from './pages/FindBlood/FindBlood';
import Requests from './pages/Requests/Requests';
import UserLogin from './pages/UserAuth/UserLogin';
import UserRegister from './pages/UserAuth/UserRegister';
import UserDashboard from './pages/UserDashboard/UserDashboard';
import HospitalLogin from './pages/HospitalAuth/HospitalLogin';
import HospitalRegister from './pages/HospitalAuth/HospitalRegister';
import HospitalDashboard from './pages/HospitalDashboard/HospitalDashboard';
import HospitalInventory from './pages/Inventory/HospitalInventory';
import HospitalVerifyDonation from './pages/HospitalVerifyDonation/HospitalVerifyDonation';
import DonorPoints from './pages/DonorPoints/DonorPoints';
import DonationHistory from './pages/DonationHistory/DonationHistory';
import CertificateGallery from './pages/Certificates/CertificateGallery';
import VerifyCertificate from './pages/Certificates/VerifyCertificate';
import BloodReports from './pages/Reports/BloodReports';
import NotificationsPage from './pages/Notifications/NotificationsPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import NotFound from './pages/NotFound/NotFound';

// Protected Route Helpers
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, role, loading } = useAuth();
  if (loading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastProvider>
          <div className="min-h-screen flex flex-col bg-[#F4F7FB] text-[#172B3A] selection:bg-crimson-red selection:text-white">
            <div className="demo-mode-banner"><AlertTriangle size={16}/><strong>DEMO MODE</strong><span>Sample data only — this is not a real blood service.</span><details><summary>Demo sign-ins</summary><span>Donor: donor@example.com / Donor@1234</span><span>Hospital: apollo.delhi@bloodconnect.org / Hospital@1234</span><span>Admin: admin@bloodconnect.org / Admin@1234</span></details><button onClick={() => { localStorage.removeItem('bdc_demo_data'); window.location.reload(); }}>Reset demo data</button></div><Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/find-blood" element={<FindBlood />} />
                <Route path="/requests" element={<Requests />} />
                <Route path="/reports" element={<BloodReports />} />
                <Route path="/verify-certificate/:certificateId" element={<VerifyCertificate />} />

                {/* User Auth */}
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />

                {/* Donor Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <UserDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donor-points"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonorPoints />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/donations"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <DonationHistory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/certificates"
                  element={
                    <ProtectedRoute allowedRoles={['donor']}>
                      <CertificateGallery />
                    </ProtectedRoute>
                  }
                />

                {/* Hospital Auth & Protected Routes */}
                <Route path="/hospital/login" element={<HospitalLogin />} />
                <Route path="/hospital/register" element={<HospitalRegister />} />
                <Route
                  path="/hospital/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <HospitalDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/inventory"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <HospitalInventory />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/verify-donation"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <HospitalVerifyDonation />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/hospital/requests"
                  element={
                    <ProtectedRoute allowedRoles={['hospital']}>
                      <Requests />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Portal */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['superadmin', 'admin']}><AdminDashboard /></ProtectedRoute>} />

                {/* In-app Notifications */}
                <Route path="/notifications" element={<NotificationsPage />} />

                {/* 404 Fallback */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;


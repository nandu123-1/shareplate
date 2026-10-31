import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { DemoAccountBar } from './components/layout/DemoAccountBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { AvailableFoodPage } from './pages/AvailableFoodPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { ImpactPage } from './pages/ImpactPage';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Donor Pages
import { DonorDashboard } from './pages/donor/DonorDashboard';
import { CreateListingPage } from './pages/donor/CreateListingPage';
import { DonorRequestsPage } from './pages/donor/DonorRequestsPage';
import { DonorPickupsPage } from './pages/donor/DonorPickupsPage';

// Recipient Pages
import { RecipientDashboard } from './pages/recipient/RecipientDashboard';
import { RecipientRequestsPage } from './pages/recipient/RecipientRequestsPage';
import { RecipientPickupsPage } from './pages/recipient/RecipientPickupsPage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Auth Guard
import { useAuth } from './context/AuthContext';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0B1110] text-[#F8FAFC] selection:bg-forest-900 selection:text-forest-100 transition-colors duration-200">
      <ScrollToTop />
      {/* Instant Hackathon Demo Role Switcher Bar */}
      <DemoAccountBar />

      {/* Sticky Glass Navbar */}
      <Navbar />

      {/* Main Content Viewport */}
      <main className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<AvailableFoodPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/impact" element={<ImpactPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Donor Routes */}
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/create-listing" element={<CreateListingPage />} />
          <Route path="/donor/requests" element={<DonorRequestsPage />} />
          <Route path="/donor/pickups" element={<DonorPickupsPage />} />

          {/* Recipient Routes */}
          <Route path="/recipient/dashboard" element={<RecipientDashboard />} />
          <Route path="/recipient/requests" element={<RecipientRequestsPage />} />
          <Route path="/recipient/pickups" element={<RecipientPickupsPage />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<AdminUsersPage />} />
          <Route path="/admin/reports" element={<AdminReportsPage />} />
          <Route path="/admin/audit-logs" element={<AdminAuditLogsPage />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* Editorial Footer */}
      <Footer />
    </div>
  );
}

export default App;

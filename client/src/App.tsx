import { ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import BaseLayout from './modules/shared/layouts/BaseLayout';
import Landing from './modules/public/pages/Landing';
import Login from './modules/public/pages/Login';
import Register from './modules/public/pages/Register';
import ForgotPassword from './modules/public/pages/ForgotPassword';
import OtpVerification from './modules/public/pages/OtpVerification';
import AdminDashboard from './modules/admin/pages/AdminDashboard';
import ApartmentManagement from './modules/admin/pages/ApartmentManagement';
import UserManagement from './modules/admin/pages/UserManagement';
import ComplaintsPage from './modules/shared/pages/ComplaintsPage';
import TechnicianDashboard from './modules/technician/pages/TechnicianDashboard';
import AdminPaymentsPage from './modules/admin/pages/AdminPaymentsPage';
import BillServiceChargePage from './modules/admin/pages/BillServiceChargePage';
import TenantDashboard from './modules/tenant/pages/TenantDashboard';
import MyLease from './modules/tenant/pages/MyLease';
import Payments from './modules/tenant/pages/Payments';
import MyComplaints from './modules/tenant/pages/MyComplaints';
import SubmitComplaint from './modules/tenant/pages/SubmitComplaint';
import MyDocuments from './modules/tenant/pages/MyDocuments';
import Profile from './modules/tenant/pages/Profile';
import Settings from './modules/tenant/pages/Settings';
import Notifications from './modules/tenant/pages/Notifications';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';
import { getDefaultPathForRole, getStoredAuthUser, UserRole } from './helpers/auth';

function PublicOnlyRoute({ children }: { children: ReactNode }) {
  const user = getStoredAuthUser();
  if (!user) {
    return <>{children}</>;
  }

  return <Navigate to={getDefaultPathForRole(user.role)} replace />;
}

function ProtectedLayoutRoute() {
  const user = getStoredAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <BaseLayout>
      <Outlet />
    </BaseLayout>
  );
}

function RoleGuard({ role, children }: { role: UserRole; children: ReactNode }) {
  const user = getStoredAuthUser();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== role) {
    return <Navigate to={getDefaultPathForRole(user.role)} replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <>
      <Routes>
        {/* public marketing routes */}
        <Route path="/" element={<Landing />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicOnlyRoute>
              <Register />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/forgot-password"
          element={
            <PublicOnlyRoute>
              <ForgotPassword />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/verify-otp"
          element={
            <PublicOnlyRoute>
              <OtpVerification />
            </PublicOnlyRoute>
          }
        />

        {/* authenticated dashboard area uses a layout with sidebar/header */}
        <Route element={<ProtectedLayoutRoute />}>
          <Route
            path="/admin"
            element={
              <RoleGuard role="admin">
                <AdminDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/apartments"
            element={
              <RoleGuard role="admin">
                <ApartmentManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/complaints"
            element={
              <RoleGuard role="admin">
                <ComplaintsPage role="Admin" />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/users"
            element={
              <RoleGuard role="admin">
                <UserManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/payments"
            element={
              <RoleGuard role="admin">
                <AdminPaymentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/bill-service-charge"
            element={
              <RoleGuard role="admin">
                <BillServiceChargePage />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant"
            element={
              <RoleGuard role="tenant">
                <TenantDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/lease"
            element={
              <RoleGuard role="tenant">
                <MyLease />
              </RoleGuard>
            }
          />
          <Route path="/tenant/lease/:id" element={<Navigate to="/tenant/lease" replace />} />
          <Route
            path="/tenant/documents"
            element={
              <RoleGuard role="tenant">
                <MyDocuments />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/payments"
            element={
              <RoleGuard role="tenant">
                <Payments />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/complaints/new"
            element={
              <RoleGuard role="tenant">
                <SubmitComplaint />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/complaints"
            element={
              <RoleGuard role="tenant">
                <MyComplaints />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/profile"
            element={
              <RoleGuard role="tenant">
                <Profile />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/settings"
            element={
              <RoleGuard role="tenant">
                <Settings />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/notifications"
            element={
              <RoleGuard role="tenant">
                <Notifications />
              </RoleGuard>
            }
          />
          <Route
            path="/technician"
            element={
              <RoleGuard role="technician">
                <TechnicianDashboard />
              </RoleGuard>
            }
          />
          <Route
            path="/technician/complaints"
            element={
              <RoleGuard role="technician">
                <ComplaintsPage role="Technician" />
              </RoleGuard>
            }
          />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          error: {
            duration: 5000,
          },
        }}
      />
    </>
  );
}

export default App;

import { ReactNode } from 'react';
import { Navigate, Outlet, Route, Routes } from 'react-router-dom';
import BaseLayout from './views/BaseLayout';
import Landing from './views/Landing';
import Login from './views/Login';
import Register from './views/Register';
import ForgotPassword from './views/ForgotPassword';
import OtpVerification from './views/OtpVerification';
import AdminDashboard from './views/AdminDashboard';
import TenantDashboard from './views/TenantDashboard';
import ApartmentManagement from './views/ApartmentManagement';
import UserManagement from './views/UserManagement';
import ComplaintsPage from './views/ComplaintsPage';
import DocumentsPage from './views/DocumentsPage';
import TechnicianDashboard from './views/TechnicianDashboard';
import TenantPaymentsPage from './views/TenantPaymentsPage';
import AdminPaymentsPage from './views/AdminPaymentsPage';
import BillServiceChargePage from './views/BillServiceChargePage';
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
          <Route path="/tenant/lease" element={<Navigate to="/tenant" replace />} />
          <Route path="/tenant/lease/:id" element={<Navigate to="/tenant" replace />} />
          <Route
            path="/tenant/documents"
            element={
              <RoleGuard role="tenant">
                <DocumentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/payments"
            element={
              <RoleGuard role="tenant">
                <TenantPaymentsPage />
              </RoleGuard>
            }
          />
          <Route
            path="/tenant/complaints"
            element={
              <RoleGuard role="tenant">
                <ComplaintsPage role="Tenant" />
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

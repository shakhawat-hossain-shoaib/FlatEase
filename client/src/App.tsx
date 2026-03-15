import { Outlet, Route, Routes } from 'react-router';
import BaseLayout from './views/BaseLayout';
import Landing from './views/Landing';
import Login from './views/Login';
import AdminDashboard from './views/AdminDashboard';
import TenantDashboard from './views/TenantDashboard';
import ApartmentManagement from './views/ApartmentManagement';
import ComplaintsPage from './views/ComplaintsPage';
import LeaseDetailsPage from './views/LeaseDetailsPage';
import DocumentsPage from './views/DocumentsPage';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Routes>
        {/* public marketing routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />

        {/* authenticated dashboard area uses a layout with sidebar/header */}
        <Route
          element={
            <BaseLayout>
              <Outlet />
            </BaseLayout>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/apartments" element={<ApartmentManagement />} />
          <Route path="/admin/lease" element={<LeaseDetailsPage role="Admin" />} />
          <Route path="/admin/lease/:id" element={<LeaseDetailsPage role="Admin" />} />
          <Route path="/admin/complaints" element={<ComplaintsPage role="Admin" />} />
          <Route path="/tenant" element={<TenantDashboard />} />
          <Route path="/tenant/lease" element={<LeaseDetailsPage role="Tenant" />} />
          <Route path="/tenant/lease/:id" element={<LeaseDetailsPage role="Tenant" />} />
          <Route path="/tenant/documents" element={<DocumentsPage />} />
          <Route path="/tenant/complaints" element={<ComplaintsPage role="Tenant" />} />
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

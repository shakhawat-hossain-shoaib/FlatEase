import { Outlet, Route, Routes } from 'react-router-dom';
import BaseLayout from './views/BaseLayout';
import Landing from './views/Landing';
import Login from './views/Login';
import Register from './views/Register';
import AdminDashboard from './views/AdminDashboard';
import TenantDashboard from './views/TenantDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* public marketing routes */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute allowedRole="admin">
              <BaseLayout>
                <Outlet />
              </BaseLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/admin" element={<AdminDashboard />} />
        </Route>

        <Route
          element={
            <ProtectedRoute allowedRole="tenant">
              <BaseLayout>
                <Outlet />
              </BaseLayout>
            </ProtectedRoute>
          }
        >
          <Route path="/tenant" element={<TenantDashboard />} />
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
    </AuthProvider>
  );
}

export default App;

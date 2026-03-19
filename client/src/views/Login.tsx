import { useState } from 'react';
import { Button, Container, Form, Alert } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsBuilding } from 'react-icons/bs';
import axios from 'axios';
import api, { AuthResponse } from '../api';
import { useAuth } from '../context/useAuth';

type LoginErrorResponse = {
  message?: string;
};

export default function Login() {
  const [role, setRole] = useState<'Admin' | 'Tenant'>('Admin');
  const [input, setInput] = useState({ email: 'admin@flatease.com', password: 'password' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  // Change default credentials based on the role toggle for demo purposes
  const handleRoleChange = (selectedRole: 'Admin' | 'Tenant') => {
    setRole(selectedRole);
    if (selectedRole === 'Admin') {
      setInput({ email: 'admin@flatease.com', password: 'password' });
    } else {
      setInput({ email: 'tenant@flatease.com', password: 'password' });
    }
    setError(''); // Clear errors on tab switch
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Call Laravel API
      const response = await api.post<AuthResponse>('/auth/login', {
        email: input.email,
        password: input.password,
        role: role.toLowerCase(),
      });

      login(response.data);

      // 2. Navigate using authenticated user role from backend
      if (response.data.user.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/tenant');
      }
    } catch (err: unknown) {
      // Show error from backend or fallback message
      if (axios.isAxiosError<LoginErrorResponse>(err)) {
        setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
      } else {
        setError('Invalid credentials. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#e8f0ff' }}>
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <div className="text-center mb-4">
          <BsBuilding size={56} className="mb-2 text-primary" />
          <h3 className="fw-bold">FlatEase</h3>
          <p className="text-muted">Modern Apartment Management System</p>
        </div>
        <div className="card p-5 shadow">
          <h5 className="mb-2 fw-bold">Welcome Back</h5>
          <p className="text-muted mb-4">Sign in to access your account</p>

          {/* Error Alert */}
          {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}

          <div className="mb-4">
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="admin-role"
                checked={role === 'Admin'}
                onChange={() => handleRoleChange('Admin')}
              />
              <label className="btn btn-outline-primary rounded-start" htmlFor="admin-role">
                Admin
              </label>
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="tenant-role"
                checked={role === 'Tenant'}
                onChange={() => handleRoleChange('Tenant')}
              />
              <label className="btn btn-outline-primary rounded-end" htmlFor="tenant-role">
                Tenant
              </label>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label className="fw-semibold text-secondary small">Email Address</Form.Label>
              <Form.Control
                type="email"
                placeholder="john@example.com"
                name="email"
                value={input.email}
                onChange={handleChange}
                required
                className="border-0 bg-light rounded-3 py-2 px-3 focus-ring focus-ring-primary"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicPassword">
              <Form.Label className="fw-semibold text-secondary small">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="border-0 bg-light rounded-3 py-2 px-3 focus-ring focus-ring-primary"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold rounded-3 shadow-sm" disabled={loading}>
              {loading ? 'Signing in...' : `Sign in as ${role}`}
            </Button>

            <div className="text-center text-muted mt-3" style={{ fontSize: '0.85rem' }}>
              Demo: Pre-filled credentials
            </div>
          </Form>
          <div className="mt-4 text-center">
            <span className="text-muted small">
              Don't have an account? <a href="/register" className="text-decoration-none fw-bold text-primary">Register here</a>
            </span>
          </div>
        </div>
      </div>
    </Container>
  );
}
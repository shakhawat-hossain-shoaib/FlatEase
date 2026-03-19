import { useState } from 'react';
import { Button, Container, Form, Alert, Spinner } from 'react-bootstrap';
import { useNavigate, Link } from 'react-router-dom';
import { BsBuilding } from 'react-icons/bs';
import axios from 'axios';
import api, { AuthResponse } from '../api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/useAuth';

type RegisterErrorResponse = {
  message?: string;
  email?: string[];
  password?: string[];
};

export default function Register() {
  const [role, setRole] = useState<'admin' | 'tenant'>('tenant');
  const [input, setInput] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleRoleChange = (selectedRole: 'admin' | 'tenant') => {
    setRole(selectedRole);
    setError('');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (input.password !== input.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      const response = await api.post<AuthResponse>('/auth/register', {
        name: input.name,
        email: input.email,
        password: input.password,
        role: role,
      });

      // Show success toast
      toast.success('Registration successful!');

      // Auto-login after successful signup
      if (response.data.access_token) {
        login(response.data);
        if (response.data.user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/tenant');
        }
      } else {
        navigate('/login');
      }
    } catch (err: unknown) {
      // Handle Laravel validation errors or generic errors
      let errorMsg = 'Registration failed. Please try again.';

      if (axios.isAxiosError<RegisterErrorResponse>(err)) {
        const data = err.response?.data;
        errorMsg =
          data?.email?.[0] ||
          data?.password?.[0] ||
          data?.message ||
          errorMsg;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container fluid className="d-flex align-items-center justify-content-center" style={{ minHeight: '100vh', background: '#e8f0ff' }}>
      <div className="w-100" style={{ maxWidth: '450px' }}>
        <div className="text-center mb-4">
          <BsBuilding size={56} className="mb-2 text-primary" />
          <h3 className="fw-bold">FlatEase</h3>
          <p className="text-muted">Modern Apartment Management System</p>
        </div>
        <div className="card p-5 shadow border-0 rounded-4">
          <h5 className="mb-2 fw-bold text-center">Create an Account</h5>
          <p className="text-muted mb-4 text-center">Join FlatEase to manage your properties</p>

          {/* Error Alert */}
          {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}

          <div className="mb-4">
            <div className="btn-group w-100 shadow-sm" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="tenant-role"
                checked={role === 'tenant'}
                onChange={() => handleRoleChange('tenant')}
              />
              <label className="btn btn-outline-primary rounded-start px-4 py-2 fw-medium" htmlFor="tenant-role">
                Tenant
              </label>
              
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="admin-role"
                checked={role === 'admin'}
                onChange={() => handleRoleChange('admin')}
              />
              <label className="btn btn-outline-primary rounded-end px-4 py-2 fw-medium" htmlFor="admin-role">
                Admin
              </label>
            </div>
          </div>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicName">
              <Form.Label className="fw-semibold text-secondary small">Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                name="name"
                value={input.name}
                onChange={handleChange}
                required
                className="border-0 bg-light rounded-3 py-2 px-3 focus-ring focus-ring-primary"
              />
            </Form.Group>

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

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label className="fw-semibold text-secondary small">Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                minLength={6}
                className="border-0 bg-light rounded-3 py-2 px-3 focus-ring focus-ring-primary"
              />
            </Form.Group>

            <Form.Group className="mb-4" controlId="formBasicConfirmPassword">
              <Form.Label className="fw-semibold text-secondary small">Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                name="confirmPassword"
                value={input.confirmPassword}
                onChange={handleChange}
                required
                minLength={6}
                className="border-0 bg-light rounded-3 py-2 px-3 focus-ring focus-ring-primary"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold rounded-3 shadow-sm" disabled={loading}>
              {loading ? (
                <>
                  <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                  Creating account...
                </>
              ) : (
                `Register as ${role === 'admin' ? 'Admin' : 'Tenant'}`
              )}
            </Button>
            
          </Form>
          <div className="mt-4 text-center">
            <span className="text-muted small">
              Already have an account? <Link to="/login" className="text-decoration-none fw-bold text-primary">Login here</Link>
            </span>
          </div>
        </div>
      </div>
    </Container>
  );
}

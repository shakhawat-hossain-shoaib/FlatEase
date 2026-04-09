import { useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { BsBuilding, BsEye, BsEyeSlash } from 'react-icons/bs';
import ApiClient from '../api';
import { getDefaultPathForRole, setStoredAuthUser } from '../helpers/auth';

export default function Login() {
  const api = useMemo(() => new ApiClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    const response = await api.login(input.email, input.password);
    setIsSubmitting(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    setStoredAuthUser(response.user);

    const targetPath = response.redirectPath || getDefaultPathForRole(response.user.role);
    toast.success('Signed in successfully.');
    navigate(targetPath);
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

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                placeholder="john@example.com"
                name="email"
                value={input.email}
                onChange={handleChange}
                required
                className="border rounded-3 py-2"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label>Password</Form.Label>
              <InputGroup>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  required
                  className="border rounded-start-3 py-2"
                />
                <Button
                  type="button"
                  variant="outline-secondary"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <BsEyeSlash /> : <BsEye />}
                </Button>
              </InputGroup>
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </Button>
            <div className="text-center text-muted mt-3" style={{ fontSize: '0.85rem' }}>
              Use your registered email and password
            </div>
            <div className="mt-3 text-center">
              <small>
                <Link to="/forgot-password">Forgot password?</Link>
              </small>
            </div>
          </Form>
          <div className="mt-3 text-center">
            <small>
              Don't have an account? <Link to="/register">Register here</Link>
            </small>
          </div>
        </div>
      </div>
    </Container>
  );
}

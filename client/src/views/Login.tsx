import { useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';

import { BsBuilding } from 'react-icons/bs';

export default function Login() {
  const [role, setRole] = useState<'Admin' | 'Tenant'>('Admin');
  const [input, setInput] = useState({ email: 'admin@flatease.com', password: 'password' });
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // normally would call API to authenticate
    if (role === 'Admin') {
      navigate('/admin');
    } else {
      navigate('/tenant');
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

          <div className="mb-4">
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="role"
                id="admin-role"
                checked={role === 'Admin'}
                onChange={() => setRole('Admin')}
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
                onChange={() => setRole('Tenant')}
              />
              <label className="btn btn-outline-primary rounded-end" htmlFor="tenant-role">
                Tenant
              </label>
            </div>
          </div>

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
              <Form.Control
                type="password"
                placeholder="••••••••"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="border rounded-3 py-2"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold">
              Sign in as {role}
            </Button>
            <div className="text-center text-muted mt-3" style={{ fontSize: '0.85rem' }}>
              Demo: Pre-filled credentials
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

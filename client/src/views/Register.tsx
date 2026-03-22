import { useMemo, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsBuilding } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient from '../api';

type RegisterInput = {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export default function Register() {
  const navigate = useNavigate();
  const api = useMemo(() => new ApiClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState<RegisterInput>({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.password !== input.password_confirmation) {
      toast.error('Password confirmation does not match');
      return;
    }

    setIsSubmitting(true);
    const response = await api.register(
      input.name,
      input.email,
      input.password,
      input.password_confirmation
    );
    setIsSubmitting(false);

    if (!response?.success) {
      return;
    }

    toast.success('Registration successful. Please sign in.');
    navigate('/login');
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', background: '#e8f0ff' }}
    >
      <div className="w-100" style={{ maxWidth: '460px' }}>
        <div className="text-center mb-4">
          <BsBuilding size={56} className="mb-2 text-primary" />
          <h3 className="fw-bold">FlatEase</h3>
          <p className="text-muted">Create your tenant account</p>
        </div>
        <div className="card p-5 shadow">
          <h5 className="mb-2 fw-bold">Register</h5>
          <p className="text-muted mb-4">Fill in your details to get started</p>

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="formRegisterName">
              <Form.Label>Full Name</Form.Label>
              <Form.Control
                type="text"
                placeholder="John Doe"
                name="name"
                value={input.name}
                onChange={handleChange}
                required
                className="border rounded-3 py-2"
              />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegisterEmail">
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

            <Form.Group className="mb-3" controlId="formRegisterPassword">
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

            <Form.Group className="mb-3" controlId="formRegisterPasswordConfirmation">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="••••••••"
                name="password_confirmation"
                value={input.password_confirmation}
                onChange={handleChange}
                required
                className="border rounded-3 py-2"
              />
            </Form.Group>

            <Button variant="primary" type="submit" className="w-100 py-2 fw-bold" disabled={isSubmitting}>
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </Button>
          </Form>

          <div className="mt-3 text-center">
            <small>
              Already have an account? <Link to="/login">Sign in</Link>
            </small>
          </div>
        </div>
      </div>
    </Container>
  );
}

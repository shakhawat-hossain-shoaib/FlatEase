import { useMemo, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsBuilding, BsEnvelope, BsTelephone } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient from '../api';
import { storeOtpChallengeContext } from '../helpers/otp';

type RegisterInput = {
  name: string;
  email: string;
  phone: string;
  preferred_contact_method: 'email' | 'sms';
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
    phone: '',
    preferred_contact_method: 'email',
    password: '',
    password_confirmation: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (input.password !== input.password_confirmation) {
      toast.error('Password confirmation does not match');
      return;
    }

    if (input.password.length < 8) {
      toast.error('Password must be at least 8 characters.');
      return;
    }

    setIsSubmitting(true);
    const response = await api.register(
      input.name,
      input.email,
      input.password,
      input.password_confirmation,
      input.preferred_contact_method === 'sms' ? input.phone : undefined,
      input.preferred_contact_method
    );
    setIsSubmitting(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    if (!response.challenge_token) {
      toast.success(response.message || 'Registration successful.');
      navigate('/login');
      return;
    }

    storeOtpChallengeContext({
      challengeToken: response.challenge_token,
      purpose: 'registration_verification',
      channel: response.channel ?? input.preferred_contact_method,
      maskedDestination: response.masked_destination ?? input.email,
      expiresInSeconds: response.expires_in_seconds ?? 600,
      resendAvailableInSeconds: response.resend_available_in_seconds ?? 60,
      attemptsRemaining: response.attempts_remaining ?? 5,
      identifier: input.email,
      preferredContactMethod: input.preferred_contact_method,
    });

    toast.success('Registration successful. Enter the code we sent you.');
    navigate('/verify-otp');
  };

  return (
    <Container
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', background: '#e8f0ff' }}
    >
      <div className="w-100" style={{ maxWidth: '520px' }}>
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

            <Form.Group className="mb-3" controlId="formRegisterPhone">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                type="tel"
                placeholder="+8801xxxxxxxxx"
                name="phone"
                value={input.phone}
                onChange={handleChange}
                required={input.preferred_contact_method === 'sms'}
                className="border rounded-3 py-2"
              />
              <Form.Text className="text-muted d-flex align-items-center gap-1 mt-1">
                <BsTelephone /> Required only when SMS is selected.
              </Form.Text>
            </Form.Group>

            <Form.Group className="mb-3" controlId="formRegisterPreferredContactMethod">
              <Form.Label>Verification method</Form.Label>
              <Form.Select name="preferred_contact_method" value={input.preferred_contact_method} onChange={handleChange}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Form.Select>
              <Form.Text className="text-muted d-flex align-items-center gap-1 mt-1">
                <BsEnvelope /> Choose where your one-time code is delivered.
              </Form.Text>
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

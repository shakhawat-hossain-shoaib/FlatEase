import { useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsAt, BsLock, BsPerson, BsTelephone } from 'react-icons/bs';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
    <Container fluid className="login-page-shell d-flex align-items-center justify-content-center">
      <div className="login-card signup-card">
        <div className="login-brand-block">
          <h1 className="login-brand-title">Create Account</h1>
          <p className="login-brand-subtitle">Set up your tenant profile to continue with FlatEase</p>
        </div>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formRegisterName">
            <Form.Label className="login-label">Full Name</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsPerson />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                name="name"
                value={input.name}
                onChange={handleChange}
                required
                className="login-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRegisterEmail">
            <Form.Label className="login-label">Email</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsAt />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                name="email"
                value={input.email}
                onChange={handleChange}
                required
                className="login-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRegisterPhone">
            <Form.Label className="login-label">Phone</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsTelephone />
              </InputGroup.Text>
              <Form.Control
                type="tel"
                placeholder="+8801XXXXXXXXX"
                name="phone"
                value={input.phone}
                onChange={handleChange}
                required={input.preferred_contact_method === 'sms'}
                className="login-input-control"
              />
            </InputGroup>
            <Form.Text className="login-helper-text">Required only when SMS is selected.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRegisterPreferredContactMethod">
            <Form.Label className="login-label">Verification Method</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsAt />
              </InputGroup.Text>
              <Form.Select
                name="preferred_contact_method"
                value={input.preferred_contact_method}
                onChange={handleChange}
                className="login-select-control"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Form.Select>
            </InputGroup>
            <Form.Text className="login-helper-text">Choose where your one-time code is delivered.</Form.Text>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRegisterPassword">
            <Form.Label className="login-label">Password</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="login-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRegisterPasswordConfirmation">
            <Form.Label className="login-label">Confirm Password</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                name="password_confirmation"
                value={input.password_confirmation}
                onChange={handleChange}
                required
                className="login-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="login-register-row">
            <span>Already have an account?</span>{' '}
            <Link to="/login">Sign In</Link>
          </div>
        </Form>
      </div>
    </Container>
  );
}

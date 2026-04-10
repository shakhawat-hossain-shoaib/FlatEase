import { useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { BsAt, BsLock, BsPerson, BsTelephone } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient from '../api';
import { storeOtpChallengeContext } from '../helpers/otp';
import { BrandLogo } from '../../shared/components/BrandLogo';

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
    <Container fluid className="auth-page-shell">
      <div className="auth-page-background" />
      <div className="auth-card auth-card-wide">
        <div className="auth-brand-row">
          <BrandLogo to="/" compact showWordmark={false} />
          <div>
            <div className="auth-eyebrow">FlatEase</div>
            <h1 className="auth-title">Create your account</h1>
          </div>
        </div>

        <p className="auth-copy">Set up your tenant profile and start using FlatEase in a few minutes.</p>

        <Form onSubmit={handleSubmit} className="auth-form-stack">
          <Form.Group controlId="formRegisterName">
            <Form.Label>Full name</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsPerson />
              </InputGroup.Text>
              <Form.Control
                type="text"
                placeholder="Enter your full name"
                name="name"
                value={input.name}
                onChange={handleChange}
                required
                className="auth-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formRegisterEmail">
            <Form.Label>Email</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsAt />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Enter your email"
                name="email"
                value={input.email}
                onChange={handleChange}
                required
                className="auth-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formRegisterPhone">
            <Form.Label>Phone</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsTelephone />
              </InputGroup.Text>
              <Form.Control
                type="tel"
                placeholder="+8801XXXXXXXXX"
                name="phone"
                value={input.phone}
                onChange={handleChange}
                required={input.preferred_contact_method === 'sms'}
                className="auth-input-control"
              />
            </InputGroup>
            <Form.Text className="auth-helper-text">Required only when SMS is selected.</Form.Text>
          </Form.Group>

          <Form.Group controlId="formRegisterPreferredContactMethod">
            <Form.Label>Verification method</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsAt />
              </InputGroup.Text>
              <Form.Select
                name="preferred_contact_method"
                value={input.preferred_contact_method}
                onChange={handleChange}
                className="auth-select-control"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </Form.Select>
            </InputGroup>
            <Form.Text className="auth-helper-text">Choose where your one-time code is delivered.</Form.Text>
          </Form.Group>

          <Form.Group controlId="formRegisterPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Enter your password"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="auth-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group controlId="formRegisterPasswordConfirmation">
            <Form.Label>Confirm password</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type="password"
                placeholder="Confirm your password"
                name="password_confirmation"
                value={input.password_confirmation}
                onChange={handleChange}
                required
                className="auth-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account...' : 'Create Account'}
          </Button>

          <div className="auth-inline-links auth-inline-links-center">
            <span className="auth-muted-link">Already have an account?</span>
            <Link to="/login" className="auth-link-button auth-link-button-inline">
              Sign in
            </Link>
          </div>
        </Form>
      </div>
    </Container>
  );
}

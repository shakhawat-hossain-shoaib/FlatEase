import { useMemo, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { BsArrowLeft, BsShieldLock, BsTelephone } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import ApiClient from '../api';
import { storeOtpChallengeContext } from '../helpers/otp';

type ForgotPasswordInput = {
  identifier: string;
  preferred_contact_method: 'email' | 'sms';
};

export default function ForgotPassword() {
  const api = useMemo(() => new ApiClient(), []);
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState<ForgotPasswordInput>({
    identifier: '',
    preferred_contact_method: 'email',
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const response = await api.requestPasswordResetOtp(input.identifier, input.preferred_contact_method);
    setIsSubmitting(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    if (!response.challenge_token) {
      toast.success(response.message || 'If the account exists, a reset code was sent.');
      navigate('/login');
      return;
    }

    storeOtpChallengeContext({
      challengeToken: response.challenge_token,
      purpose: 'password_reset',
      channel: response.channel ?? input.preferred_contact_method,
      maskedDestination: response.masked_destination ?? input.identifier,
      expiresInSeconds: response.expires_in_seconds ?? 600,
      resendAvailableInSeconds: response.resend_available_in_seconds ?? 60,
      attemptsRemaining: response.attempts_remaining ?? 5,
      identifier: input.identifier,
      preferredContactMethod: input.preferred_contact_method,
    });

    toast.success('Reset code sent. Check your inbox or phone.');
    navigate('/verify-otp');
  };

  return (
    <Container fluid className="auth-page-shell">
      <div className="auth-page-background" />
      <div className="auth-card auth-card-wide">
        <div className="auth-brand-row">
          <div className="auth-brand-mark">
            <BsShieldLock />
          </div>
          <div>
            <div className="auth-eyebrow">FlatEase</div>
            <h1 className="auth-title">Reset your password</h1>
          </div>
        </div>

        <p className="auth-copy">We will send a one-time code to your chosen contact method.</p>

        <Form onSubmit={handleSubmit} className="auth-form-stack">
          <Form.Group controlId="resetIdentifier">
            <Form.Label>Email or phone</Form.Label>
            <Form.Control
              type="text"
              name="identifier"
              value={input.identifier}
              onChange={handleChange}
              placeholder="john@example.com or +8801..."
              required
            />
          </Form.Group>

          <Form.Group controlId="resetChannel">
            <Form.Label>Send code via</Form.Label>
            <Form.Select name="preferred_contact_method" value={input.preferred_contact_method} onChange={handleChange}>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
            </Form.Select>
          </Form.Group>

          <Button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Sending code...' : 'Send reset code'}
          </Button>
        </Form>

        <div className="auth-inline-links">
          <Link to="/login" className="auth-back-link">
            <BsArrowLeft /> Back to sign in
          </Link>
          <div className="auth-muted-link">
            <BsTelephone /> SMS requires Twilio credentials in the backend.
          </div>
        </div>
      </div>
    </Container>
  );
}
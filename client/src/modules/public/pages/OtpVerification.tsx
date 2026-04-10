import { useEffect, useMemo, useState } from 'react';
import { Button, Container, Form } from 'react-bootstrap';
import { BsArrowRepeat, BsShieldCheck, BsEnvelopeOpen, BsTelephone } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import ApiClient from '../api';
import { getDefaultPathForRole, setStoredAuthUser } from '../helpers/auth';
import { clearOtpChallengeContext, getOtpChallengeContext, storeOtpChallengeContext } from '../helpers/otp';
import { BrandLogo } from '../../shared/components/BrandLogo';

type OtpInput = {
  otp: string;
  password: string;
  password_confirmation: string;
};

export default function OtpVerification() {
  const api = useMemo(() => new ApiClient(), []);
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState(getOtpChallengeContext());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(challenge?.expiresInSeconds ?? 0);
  const [resendCooldown, setResendCooldown] = useState(challenge?.resendAvailableInSeconds ?? 0);
  const [input, setInput] = useState<OtpInput>({
    otp: '',
    password: '',
    password_confirmation: '',
  });

  useEffect(() => {
    const interval = window.setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInput((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const refreshChallenge = async () => {
    if (!challenge) {
      return;
    }

    const response = await api.getOtpStatus(challenge.challengeToken);

    if (response?.success && response.expires_in_seconds !== undefined) {
      setSecondsRemaining(response.expires_in_seconds);
      setResendCooldown(response.resend_available_in_seconds ?? 0);
      storeOtpChallengeContext({
        ...challenge,
        expiresInSeconds: response.expires_in_seconds,
        resendAvailableInSeconds: response.resend_available_in_seconds ?? 0,
        attemptsRemaining: response.attempts_remaining ?? challenge.attemptsRemaining,
      });
      setChallenge(getOtpChallengeContext());
    }
  };

  const handleResend = async () => {
    if (!challenge || resendCooldown > 0) {
      return;
    }

    setIsResending(true);
    const response = await api.resendOtp(challenge.challengeToken);
    setIsResending(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    storeOtpChallengeContext({
      challengeToken: response.challenge_token ?? challenge.challengeToken,
      purpose: challenge.purpose,
      channel: response.channel ?? challenge.channel,
      maskedDestination: response.masked_destination ?? challenge.maskedDestination,
      expiresInSeconds: response.expires_in_seconds ?? 600,
      resendAvailableInSeconds: response.resend_available_in_seconds ?? 60,
      attemptsRemaining: response.attempts_remaining ?? challenge.attemptsRemaining,
      identifier: challenge.identifier,
      preferredContactMethod: challenge.preferredContactMethod,
    });
    setChallenge(getOtpChallengeContext());
    setSecondsRemaining(response.expires_in_seconds ?? 600);
    setResendCooldown(response.resend_available_in_seconds ?? 60);
    toast.success('A new code has been sent.');
  };

  const handleRegistrationVerify = async () => {
    if (!challenge) {
      return;
    }

    setIsSubmitting(true);
    const response = await api.verifyOtp(challenge.challengeToken, input.otp);
    setIsSubmitting(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    clearOtpChallengeContext();
    if (response.user) {
      setStoredAuthUser(response.user);
    }

    toast.success('Account verified successfully.');
    navigate(response.user ? getDefaultPathForRole(response.user.role) : '/login');
  };

  const handlePasswordReset = async () => {
    if (!challenge) {
      return;
    }

    if (input.password !== input.password_confirmation) {
      toast.error('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    const response = await api.resetPasswordWithOtp({
      challenge_token: challenge.challengeToken,
      otp: input.otp,
      password: input.password,
      password_confirmation: input.password_confirmation,
    });
    setIsSubmitting(false);

    if (!response?.success) {
      if (response?.message) {
        toast.error(response.message);
      }
      return;
    }

    clearOtpChallengeContext();
    toast.success('Password updated successfully.');
    navigate('/login');
  };

  if (!challenge) {
    return (
      <Container fluid className="auth-page-shell">
        <div className="auth-page-background" />
        <div className="auth-card auth-card-wide text-center">
          <BsShieldCheck size={44} className="mb-3 text-primary" />
          <h1 className="auth-title">Verification session missing</h1>
          <p className="auth-copy">Start registration or password reset again to receive a fresh code.</p>
          <div className="d-flex gap-3 justify-content-center mt-4">
            <Link to="/register" className="btn btn-primary">Register</Link>
            <Link to="/forgot-password" className="btn btn-outline-secondary">Forgot password</Link>
          </div>
        </div>
      </Container>
    );
  }

  const isPasswordReset = challenge.purpose === 'password_reset';

  return (
    <Container fluid className="auth-page-shell">
      <div className="auth-page-background" />
      <div className="auth-card auth-card-wide">
        <div className="auth-brand-row">
            <BrandLogo to="/" compact showWordmark={false} />
          <div>
            <div className="auth-eyebrow">FlatEase</div>
            <h1 className="auth-title">Enter your one-time code</h1>
          </div>
        </div>

        <p className="auth-copy">
          We sent a code to {challenge.maskedDestination}. It expires in {Math.ceil(secondsRemaining / 60)} minute(s).
        </p>

        <div className="auth-chip-row">
          <span className="auth-chip">
            {challenge.channel === 'email' ? <BsEnvelopeOpen /> : <BsTelephone />} {challenge.channel.toUpperCase()}
          </span>
          <span className="auth-chip">{challenge.attemptsRemaining} attempts left</span>
        </div>

        <Form className="auth-form-stack" onSubmit={(e) => { e.preventDefault(); isPasswordReset ? handlePasswordReset() : handleRegistrationVerify(); }}>
          <Form.Group controlId="otpCode">
            <Form.Label>OTP code</Form.Label>
            <Form.Control
              type="text"
              inputMode="numeric"
              maxLength={6}
              name="otp"
              value={input.otp}
              onChange={handleChange}
              placeholder="123456"
              autoComplete="one-time-code"
              required
            />
          </Form.Group>

          {isPasswordReset ? (
            <>
              <Form.Group controlId="newPassword">
                <Form.Label>New password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={input.password}
                  onChange={handleChange}
                  placeholder="Enter a new password"
                  required
                />
              </Form.Group>
              <Form.Group controlId="confirmPassword">
                <Form.Label>Confirm password</Form.Label>
                <Form.Control
                  type="password"
                  name="password_confirmation"
                  value={input.password_confirmation}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                />
              </Form.Group>
            </>
          ) : null}

          <Button type="submit" className="auth-primary-button" disabled={isSubmitting || secondsRemaining === 0}>
            {isSubmitting ? 'Verifying...' : isPasswordReset ? 'Verify and reset password' : 'Verify account'}
          </Button>
        </Form>

        <div className="auth-inline-links justify-content-between">
          <button type="button" className="auth-link-button" onClick={handleResend} disabled={isResending || resendCooldown > 0}>
            <BsArrowRepeat /> {isResending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
          <button type="button" className="auth-link-button" onClick={refreshChallenge}>
            Refresh status
          </button>
        </div>

        <div className="auth-inline-links mt-4">
          <Link to="/login" className="auth-back-link">Back to sign in</Link>
        </div>
      </div>
    </Container>
  );
}
import { useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { BsApple, BsAt, BsEye, BsEyeSlash, BsGoogle, BsLock } from 'react-icons/bs';
import ApiClient from '../api';
import { getDefaultPathForRole, setStoredAuthUser } from '../helpers/auth';
import { BrandLogo } from '../../shared/components/BrandLogo';

export default function Login() {
  const api = useMemo(() => new ApiClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [input, setInput] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
    <Container fluid className="auth-page-shell">
      <div className="auth-page-background" />
      <div className="auth-card auth-card-wide">
        <div className="auth-brand-row">
          <BrandLogo to="/" compact showWordmark={false} />
          <div>
            <div className="auth-eyebrow">FlatEase</div>
            <h1 className="auth-title">Sign in to your account</h1>
          </div>
        </div>

        <p className="auth-copy">Access your dashboard, complaints, payments, and technician updates.</p>

        <Form onSubmit={handleSubmit} className="auth-form-stack">
          <Form.Group controlId="formBasicEmail">
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

          <Form.Group controlId="formBasicPassword">
            <Form.Label>Password</Form.Label>
            <InputGroup className="auth-input-group">
              <InputGroup.Text className="auth-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="auth-input-control auth-input-password"
              />
              <Button
                type="button"
                className="auth-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <div className="auth-inline-links auth-inline-links-split">
            <Form.Check
              id="remember-me"
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="auth-remember"
            />
            <Link to="/forgot-password" className="auth-muted-link auth-muted-link-action">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="auth-primary-button" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="auth-inline-links auth-inline-links-center">
            <span className="auth-muted-link">Don't have an account?</span>
            <Link to="/register" className="auth-link-button auth-link-button-inline">
              Create one
            </Link>
          </div>

          <div className="auth-or-divider">or continue with</div>

          <div className="auth-social-grid">
            <Button type="button" className="auth-social-btn" variant="light">
              <BsGoogle size={18} /> Google
            </Button>
            <Button type="button" className="auth-social-btn" variant="light">
              <BsApple size={18} /> Apple
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
}

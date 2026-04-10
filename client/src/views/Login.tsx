import { useMemo, useState } from 'react';
import { Button, Container, Form, InputGroup } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import { BsApple, BsAt, BsEye, BsEyeSlash, BsGoogle, BsLock } from 'react-icons/bs';
import ApiClient from '../api';
import { getDefaultPathForRole, setStoredAuthUser } from '../helpers/auth';

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
    <Container fluid className="login-page-shell d-flex align-items-center justify-content-center">
      <div className="login-card">
        <div className="login-brand-block">
          <h1 className="login-brand-title">FlatEase</h1>
          <p className="login-brand-subtitle">Sign in to your apartment management workspace</p>
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label className="login-label">Email</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsAt />
              </InputGroup.Text>
              <Form.Control
                type="email"
                placeholder="Enter your Email"
                name="email"
                value={input.email}
                onChange={handleChange}
                required
                className="login-input-control"
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-2" controlId="formBasicPassword">
            <Form.Label className="login-label">Password</Form.Label>
            <InputGroup className="login-input-group">
              <InputGroup.Text className="login-input-icon" aria-hidden="true">
                <BsLock />
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your Password"
                name="password"
                value={input.password}
                onChange={handleChange}
                required
                className="login-input-control login-input-password"
              />
              <Button
                type="button"
                className="login-visibility-btn"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <BsEyeSlash /> : <BsEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <div className="login-aux-row mb-4">
            <Form.Check
              id="remember-me"
              type="checkbox"
              label="Remember me"
              checked={rememberMe}
              onChange={(event) => setRememberMe(event.target.checked)}
              className="login-remember"
            />
            <Link to="/forgot-password" className="login-forgot-link">Forgot password?</Link>
          </div>

          <Button type="submit" className="login-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign In'}
          </Button>

          <div className="login-register-row">
            <span>Don't have an account?</span>{' '}
            <Link to="/register">Sign Up</Link>
          </div>

          <div className="login-or-divider">or continue with</div>

          <div className="login-social-grid">
            <Button type="button" className="login-social-btn" variant="light">
              <BsGoogle size={18} /> Google
            </Button>
            <Button type="button" className="login-social-btn" variant="light">
              <BsApple size={18} /> Apple
            </Button>
          </div>
        </Form>
      </div>
    </Container>
  );
}

import { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ApiClient from '../api';
import { DashboardLayout } from './DashboardLayout';

type RoleOption = 'admin' | 'tenant';

type FormState = {
  name: string;
  email: string;
  role: RoleOption;
  password: string;
  password_confirmation: string;
};

const INITIAL_FORM: FormState = {
  name: '',
  email: '',
  role: 'tenant',
  password: '',
  password_confirmation: '',
};

export default function AdminUserManagement() {
  const api = useMemo(() => new ApiClient(), []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const role = event.target.value as RoleOption;
    setForm((prev) => ({ ...prev, role }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (form.password !== form.password_confirmation) {
      toast.error('Password confirmation does not match.');
      return;
    }

    setIsSubmitting(true);
    const response = await api.createAdminUser(
      form.name,
      form.email,
      form.password,
      form.password_confirmation,
      form.role
    );
    setIsSubmitting(false);

    if (!response?.success) {
      return;
    }

    toast.success(`User ${response.user.email} created successfully.`);
    setForm(INITIAL_FORM);
  };

  return (
    <DashboardLayout role="Admin">
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid">
          <div className="mb-4">
            <h2 className="mb-1">User Management</h2>
            <p className="text-muted mb-0">Create admin or tenant accounts from the dashboard.</p>
          </div>

          <Row>
            <Col xs={12} lg={8} xl={6}>
              <Card className="p-4 shadow-sm">
                <h5 className="mb-3">Create New User</h5>

                <Form onSubmit={handleSubmit}>
                  <Form.Group className="mb-3" controlId="createUserName">
                    <Form.Label>Full Name</Form.Label>
                    <Form.Control
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter full name"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="createUserEmail">
                    <Form.Label>Email</Form.Label>
                    <Form.Control
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleInputChange}
                      required
                      placeholder="name@example.com"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="createUserRole">
                    <Form.Label>Role</Form.Label>
                    <Form.Select name="role" value={form.role} onChange={handleRoleChange}>
                      <option value="tenant">Tenant</option>
                      <option value="admin">Admin</option>
                    </Form.Select>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="createUserPassword">
                    <Form.Label>Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter password"
                    />
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="createUserPasswordConfirmation">
                    <Form.Label>Confirm Password</Form.Label>
                    <Form.Control
                      type="password"
                      name="password_confirmation"
                      value={form.password_confirmation}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm password"
                    />
                  </Form.Group>

                  <div className="d-flex gap-2">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating...' : 'Create User'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline-secondary"
                      onClick={() => setForm(INITIAL_FORM)}
                      disabled={isSubmitting}
                    >
                      Clear
                    </Button>
                  </div>
                </Form>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </DashboardLayout>
  );
}

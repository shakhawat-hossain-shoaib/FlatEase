import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { BsGear, BsShieldLock, BsBell, BsCheckCircle, BsPhone } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient, { CurrentUserEntity } from '../../api';
import { AdminEmptyState } from '../../shared/components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../shared/components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../shared/components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';

export default function Settings() {
  const api = useMemo(() => new ApiClient(), []);
  const [currentUser, setCurrentUser] = useState<CurrentUserEntity | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    preferred_contact_method: 'email',
    phone: '',
    email_notifications: true,
    sms_notifications: false,
  });

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const response = await api.getCurrentUser();

      if (!isMounted) {
        return;
      }

      setCurrentUser(response ?? null);
      setForm({
        preferred_contact_method: response?.preferred_contact_method ?? 'email',
        phone: response?.phone ?? '',
        email_notifications: true,
        sms_notifications: response?.preferred_contact_method === 'sms',
      });
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const handleChange = (field: keyof typeof form, value: string | boolean) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSave = async () => {
    if (form.preferred_contact_method === 'sms' && !form.phone.trim()) {
      toast.error('Phone number is required for SMS contact preference.');
      return;
    }

    setIsSaving(true);

    const response = await api.updateTenantProfile({
      preferred_contact_method: form.preferred_contact_method as 'email' | 'sms',
      phone: form.phone.trim() ? form.phone.trim() : null,
    });

    setIsSaving(false);

    if (!response?.success) {
      return;
    }

    toast.success(response.message || 'Settings updated successfully.');
    setCurrentUser(response.user);
    setForm({
      preferred_contact_method: response.user.preferred_contact_method ?? 'email',
      phone: response.user.phone ?? '',
      email_notifications: true,
      sms_notifications: response.user.preferred_contact_method === 'sms',
    });
  };

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Settings"
            subtitle="Adjust tenant communication preferences and account options."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading settings...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !currentUser && (
            <AdminEmptyState icon={BsGear} title="Settings unavailable" message="We could not load your account settings right now." />
          )}

          {!isLoading && currentUser && (
            <Row className="g-3">
              <Col xl={8}>
                <AdminSectionCard title="Communication Preferences">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Preferred Contact Method</Form.Label>
                      <Form.Select
                        value={form.preferred_contact_method}
                        onChange={(event) => handleChange('preferred_contact_method', event.target.value)}
                      >
                        <option value="email">Email</option>
                        <option value="sms">SMS</option>
                      </Form.Select>
                    </Col>
                    <Col md={6}>
                      <Form.Label>Phone Number</Form.Label>
                      <Form.Control
                        value={form.phone}
                        onChange={(event) => handleChange('phone', event.target.value)}
                        placeholder="Add or update your phone number"
                      />
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <div className="d-grid gap-3">
                    <Form.Check
                      type="switch"
                      id="email-notifications"
                      label="Receive email notifications"
                      checked={form.email_notifications}
                      onChange={(event) => handleChange('email_notifications', event.target.checked)}
                    />
                    <Form.Check
                      type="switch"
                      id="sms-notifications"
                      label="Receive SMS notifications"
                      checked={form.sms_notifications}
                      onChange={(event) => handleChange('sms_notifications', event.target.checked)}
                    />
                  </div>

                  <div className="mt-4 d-flex gap-2">
                    <Button onClick={() => void handleSave()} disabled={isSaving}>
                      <BsCheckCircle className="me-1" />
                      {isSaving ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setForm({
                          preferred_contact_method: currentUser.preferred_contact_method ?? 'email',
                          phone: currentUser.phone ?? '',
                          email_notifications: true,
                          sms_notifications: currentUser.preferred_contact_method === 'sms',
                        });
                      }}
                    >
                      Reset
                    </Button>
                  </div>
                </AdminSectionCard>
              </Col>

              <Col xl={4}>
                <div className="d-grid gap-3">
                  <Card className="admin-card border-0 h-100">
                    <Card.Body>
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <div className="bg-primary-subtle rounded-3 p-3">
                          <BsShieldLock className="text-primary" size={22} />
                        </div>
                        <div>
                          <h5 className="mb-1">Security</h5>
                          <p className="text-muted mb-0">Password changes and session management are handled by the backend auth flow.</p>
                        </div>
                      </div>
                      <Button variant="outline-primary" className="w-100" onClick={() => window.location.assign('/forgot-password')}>
                        Change Password
                      </Button>
                    </Card.Body>
                  </Card>

                  <Card className="admin-card border-0 h-100">
                    <Card.Body>
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <div className="bg-warning-subtle rounded-3 p-3">
                          <BsBell className="text-warning" size={22} />
                        </div>
                        <div>
                          <h5 className="mb-1">Portal Tips</h5>
                          <p className="text-muted mb-0">Keep your contact details current so payment and maintenance updates reach you on time.</p>
                        </div>
                      </div>
                      <div className="text-muted small d-grid gap-2">
                        <div className="d-flex align-items-center gap-2"><BsPhone /> Update your phone before submitting urgent complaints.</div>
                        <div className="d-flex align-items-center gap-2"><BsGear /> Use the sidebar to switch quickly between tenant sections.</div>
                      </div>
                    </Card.Body>
                  </Card>
                </div>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
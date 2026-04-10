import { useEffect, useMemo, useState } from 'react';
import { Card, Col, Form, Row, Spinner } from 'react-bootstrap';
import { BsEnvelope, BsGeoAlt, BsPerson, BsPersonLinesFill, BsTelephone } from 'react-icons/bs';
import ApiClient, { CurrentUserEntity, TenantMonthlyPaymentSummary } from '../../api';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDate, getActiveTenantAssignment } from '../tenantUtils';

export default function Profile() {
  const api = useMemo(() => new ApiClient(), []);
  const [currentUser, setCurrentUser] = useState<CurrentUserEntity | null>(null);
  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const [userResponse, summaryResponse] = await Promise.all([api.getCurrentUser(), api.getTenantCurrentPaymentSummary()]);

      if (!isMounted) {
        return;
      }

      setCurrentUser(userResponse ?? null);
      setSummary(summaryResponse ?? null);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const activeAssignment = getActiveTenantAssignment(currentUser);
  const tenantProfile = currentUser?.tenant_profile ?? currentUser?.tenantProfile ?? null;

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Profile"
            subtitle="Review your contact details, emergency contact, and active lease assignment."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading profile...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !currentUser && (
            <AdminEmptyState icon={BsPerson} title="Profile unavailable" message="We could not load your account profile right now." />
          )}

          {!isLoading && currentUser && (
            <Row className="g-3">
              <Col xl={8}>
                <AdminSectionCard title="Personal Information">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Full Name</Form.Label>
                      <Form.Control value={currentUser.name} disabled />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Email</Form.Label>
                      <Form.Control value={currentUser.email} disabled />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Phone</Form.Label>
                      <Form.Control value={currentUser.phone ?? tenantProfile?.phone ?? ''} disabled placeholder="No phone number saved" />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Preferred Contact</Form.Label>
                      <Form.Control value={currentUser.preferred_contact_method ?? 'email'} disabled />
                    </Col>
                  </Row>
                </AdminSectionCard>
              </Col>

              <Col xl={4}>
                <Card className="admin-card border-0 h-100">
                  <Card.Body>
                    <div className="d-flex align-items-start gap-3 mb-3">
                      <div className="bg-primary-subtle rounded-3 p-3">
                        <BsPersonLinesFill className="text-primary" size={22} />
                      </div>
                      <div>
                        <h5 className="mb-1">Tenant Snapshot</h5>
                        <p className="text-muted mb-0">Account and lease information</p>
                      </div>
                    </div>

                    <div className="admin-list-row py-3">
                      <div className="text-muted small">Unit</div>
                      <div className="fw-semibold">{activeAssignment?.unit?.unit_number ?? summary?.unit.unit_number ?? 'N/A'}</div>
                    </div>
                    <div className="admin-list-row py-3">
                      <div className="text-muted small">Building</div>
                      <div className="fw-semibold">{activeAssignment?.unit?.building?.name ?? summary?.unit.building_name ?? 'N/A'}</div>
                    </div>
                    <div className="admin-list-row py-3">
                      <div className="text-muted small">Lease End</div>
                      <div className="fw-semibold">{formatDate(activeAssignment?.lease_end_date)}</div>
                    </div>
                  </Card.Body>
                </Card>
              </Col>

              <Col xl={8}>
                <AdminSectionCard title="Emergency Contact">
                  <Row className="g-3">
                    <Col md={6}>
                      <Form.Label>Contact Name</Form.Label>
                      <Form.Control value={tenantProfile?.emergency_contact_name ?? ''} disabled placeholder="Not provided" />
                    </Col>
                    <Col md={6}>
                      <Form.Label>Contact Phone</Form.Label>
                      <Form.Control value={tenantProfile?.emergency_contact_phone ?? ''} disabled placeholder="Not provided" />
                    </Col>
                  </Row>
                </AdminSectionCard>
              </Col>

              <Col xl={4}>
                <AdminSectionCard title="Contact Summary">
                  <div className="d-grid gap-3">
                    <div className="d-flex align-items-start gap-3">
                      <BsEnvelope className="text-primary mt-1" />
                      <div>
                        <div className="fw-semibold">Primary Email</div>
                        <div className="text-muted small">Used for official notices and notifications</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-3">
                      <BsTelephone className="text-success mt-1" />
                      <div>
                        <div className="fw-semibold">Phone / Contact Method</div>
                        <div className="text-muted small">{currentUser.phone ?? 'No phone number saved'}</div>
                      </div>
                    </div>
                    <div className="d-flex align-items-start gap-3">
                      <BsGeoAlt className="text-warning mt-1" />
                      <div>
                        <div className="fw-semibold">Lease Start</div>
                        <div className="text-muted small">{formatDate(activeAssignment?.lease_start_date)}</div>
                      </div>
                    </div>
                  </div>
                </AdminSectionCard>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
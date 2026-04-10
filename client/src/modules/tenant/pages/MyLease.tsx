import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsCalendar2Check, BsCloudArrowDown, BsFileEarmarkText, BsHouseDoor, BsInfoCircle, BsPersonVcard, BsShieldLock } from 'react-icons/bs';
import ApiClient, { CurrentUserEntity, TenantDocumentChecklistItem, TenantMonthlyPaymentSummary } from '../../api';
import { AdminEmptyState } from '../../shared/components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../shared/components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../shared/components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDate, formatMoney, formatRelativeDays, getActiveTenantAssignment } from '../tenantUtils';

export default function MyLease() {
  const api = useMemo(() => new ApiClient(), []);
  const [currentUser, setCurrentUser] = useState<CurrentUserEntity | null>(null);
  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [checklist, setChecklist] = useState<TenantDocumentChecklistItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const [userResponse, summaryResponse, checklistResponse] = await Promise.all([
        api.getCurrentUser(),
        api.getTenantCurrentPaymentSummary(),
        api.getTenantDocumentChecklist(),
      ]);

      if (!isMounted) {
        return;
      }

      setCurrentUser(userResponse ?? null);
      setSummary(summaryResponse ?? null);
      setChecklist(checklistResponse ?? []);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const activeAssignment = getActiveTenantAssignment(currentUser);
  const leaseStart = activeAssignment?.lease_start_date ?? null;
  const leaseEnd = activeAssignment?.lease_end_date ?? null;
  const leaseAgeText = leaseEnd ? formatRelativeDays(leaseEnd) : 'Lease date unavailable';
  const leaseAgreement = checklist.find((item) => item.type_key.toLowerCase().includes('lease')) ?? null;
  const currency = summary?.currency ?? 'BDT';

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="My Lease"
            subtitle="Review your current lease, expiry date, renewal guidance, and agreement documents."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading lease details...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !activeAssignment && (
            <AdminEmptyState
              icon={BsHouseDoor}
              title="No active lease found"
              message="We could not find an active unit assignment for this account yet."
            />
          )}

          {!isLoading && activeAssignment && (
            <>
              <Card className="admin-card border-0 mb-4" style={{ borderLeft: '4px solid #eab308' }}>
                <Card.Body className="py-4 px-4 d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-warning-subtle rounded-3 p-3">
                      <BsCalendar2Check className="text-warning" size={22} />
                    </div>
                    <div>
                      <div className="text-muted mb-1">Lease expiry</div>
                      <h5 className="mb-1">{leaseEnd ? formatDate(leaseEnd) : 'N/A'}</h5>
                      <p className="text-muted mb-0">{leaseAgeText}. Request renewal support before the final 30 days.</p>
                    </div>
                  </div>
                  <Badge bg={leaseEnd ? 'warning' : 'secondary'} text={leaseEnd ? 'dark' : undefined} className="px-3 py-2">
                    {leaseEnd ? 'Renewal window active' : 'No expiry date'}
                  </Badge>
                </Card.Body>
              </Card>

              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-primary-subtle rounded-3 p-3">
                        <BsHouseDoor className="text-primary" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Unit Number</div>
                        <h4 className="mb-1">{activeAssignment.unit?.unit_number ?? 'N/A'}</h4>
                        <small className="text-muted">{[summary?.unit.floor_label, summary?.unit.building_name].filter(Boolean).join(' · ') || 'No building details available'}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-success-subtle rounded-3 p-3">
                        <BsPersonVcard className="text-success" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Lease Duration</div>
                        <h4 className="mb-1">{leaseStart && leaseEnd ? `${formatDate(leaseStart)} - ${formatDate(leaseEnd)}` : 'N/A'}</h4>
                        <small className="text-muted">Active assignment #{activeAssignment.id}</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-warning-subtle rounded-3 p-3">
                        <BsShieldLock className="text-warning" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Monthly Rent</div>
                        <h4 className="mb-1">{formatMoney(Number(activeAssignment.rent_amount ?? summary?.subtotal_rent ?? 0), currency)}</h4>
                        <small className="text-muted">Collected through the tenant payment flow</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col xl={7}>
                  <AdminSectionCard className="h-100" title="Lease Details">
                    <Row className="g-3">
                      <Col md={6}>
                        <div className="text-muted small mb-1">Lease Start Date</div>
                        <div className="fw-semibold">{formatDate(leaseStart)}</div>
                      </Col>
                      <Col md={6}>
                        <div className="text-muted small mb-1">Lease End Date</div>
                        <div className="fw-semibold">{formatDate(leaseEnd)}</div>
                      </Col>
                      <Col md={6}>
                        <div className="text-muted small mb-1">Building</div>
                        <div className="fw-semibold">{summary?.unit.building_name ?? 'N/A'}</div>
                      </Col>
                      <Col md={6}>
                        <div className="text-muted small mb-1">Floor</div>
                        <div className="fw-semibold">{summary?.unit.floor_label ?? 'N/A'}</div>
                      </Col>
                      <Col md={6}>
                        <div className="text-muted small mb-1">Area</div>
                        <div className="fw-semibold">{activeAssignment.unit?.area_sqft ? `${activeAssignment.unit.area_sqft} sq ft` : 'N/A'}</div>
                      </Col>
                      <Col md={6}>
                        <div className="text-muted small mb-1">Lease Status</div>
                        <div className="fw-semibold text-capitalize">{activeAssignment.status.replace('_', ' ')}</div>
                      </Col>
                    </Row>
                  </AdminSectionCard>
                </Col>

                <Col xl={5}>
                  <AdminSectionCard className="h-100" title="Renewal Guidance">
                    <div className="d-grid gap-3">
                      <div className="d-flex gap-3">
                        <div className="bg-info-subtle rounded-3 p-2 h-100">
                          <BsInfoCircle className="text-info" />
                        </div>
                        <div>
                          <div className="fw-semibold mb-1">Submit renewal interest early</div>
                          <div className="text-muted small">Contact management within 30 days of expiry to review new terms.</div>
                        </div>
                      </div>
                      <div className="d-flex gap-3">
                        <div className="bg-success-subtle rounded-3 p-2 h-100">
                          <BsCloudArrowDown className="text-success" />
                        </div>
                        <div>
                          <div className="fw-semibold mb-1">Keep the lease agreement handy</div>
                          <div className="text-muted small">The signed agreement below is the official record for your tenancy.</div>
                        </div>
                      </div>
                      <Button variant="outline-primary" onClick={() => window.location.assign('/tenant/documents')}>
                        View Documents
                      </Button>
                    </div>
                  </AdminSectionCard>
                </Col>

                <Col xl={12}>
                  <AdminSectionCard title="Lease Agreement Document">
                    {leaseAgreement?.latest_document ? (
                      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3">
                        <div>
                          <div className="fw-semibold mb-1">{leaseAgreement.label}</div>
                          <div className="text-muted small">Uploaded {formatDate(leaseAgreement.latest_document.created_at)} · {leaseAgreement.latest_document.status.replace('_', ' ')}</div>
                          <div className="text-muted small">Sensitive document stored with encrypted access controls.</div>
                        </div>
                        <Button variant="outline-primary" onClick={() => void api.openTenantDocument(leaseAgreement.latest_document!.id)}>
                          Open Lease PDF
                        </Button>
                      </div>
                    ) : (
                      <AdminEmptyState
                        icon={BsFileEarmarkText}
                        title="No lease agreement uploaded"
                        message="The signed lease agreement will appear here once it is available in your documents."
                        compact
                      />
                    )}
                  </AdminSectionCard>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Row, Spinner } from 'react-bootstrap';
import { DashboardLayout } from '../../shared/layouts/DashboardLayout';
import {
  BsCurrencyDollar,
  BsHouseDoor,
  BsBell,
} from 'react-icons/bs';
import ApiClient, { TenantMonthlyPaymentSummary } from '../api';

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function paymentBadgeVariant(status?: 'pending' | 'partially_paid' | 'paid' | 'overdue') {
  if (status === 'paid') {
    return 'success';
  }

  if (status === 'overdue') {
    return 'danger';
  }

  if (status === 'partially_paid') {
    return 'warning';
  }

  return 'secondary';
}

export default function TenantDashboard() {
  const api = useMemo(() => new ApiClient(), []);
  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const response = await api.getTenantCurrentPaymentSummary();

      if (!isMounted) {
        return;
      }

      setSummary(response ?? null);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const currency = summary?.currency ?? 'BDT';

  return (
    <DashboardLayout role="Tenant">
      <div style={{ background: '#f5f7fb', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <h3 className="h4 mb-4">Tenant Dashboard</h3>

          {isLoading && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="py-5 d-flex justify-content-center align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" />
                Loading dashboard...
              </Card.Body>
            </Card>
          )}

          {!isLoading && summary && (
            <>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-primary-subtle rounded-3 p-3">
                        <BsHouseDoor className="text-primary" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Unit Number</div>
                        <h4 className="mb-1">{summary.unit.unit_number ?? 'N/A'}</h4>
                        <small className="text-muted">
                          {[summary.unit.floor_label, summary.unit.building_name].filter(Boolean).join(' · ') || 'No assignment details'}
                        </small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-warning-subtle rounded-3 p-3">
                        <BsCurrencyDollar className="text-warning" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Next Payment</div>
                        <h4 className="mb-1">{formatMoney(summary.next_payment?.amount ?? summary.total_due, currency)}</h4>
                        <small className="text-muted">Due: {formatDate(summary.next_payment?.date ?? summary.due_date)}</small>
                        <div className="mt-2">
                          <Badge bg={paymentBadgeVariant(summary.next_payment?.status)}>
                            {(summary.next_payment?.status ?? 'pending').split('_').join(' ')}
                          </Badge>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="d-flex align-items-start gap-3">
                      <div className="bg-success-subtle rounded-3 p-3">
                        <BsBell className="text-success" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Notice</div>
                        <h4 className="mb-1">{summary.unread_notice_count ?? 0}</h4>
                        <small className="text-muted">Unread notices</small>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h5 className="mb-4">Recent Payments</h5>
                      <div>
                        {(summary.recent_payments ?? []).map((payment) => (
                          <div key={`${payment.month}-${payment.due_date}`} className="d-flex justify-content-between border-bottom py-3">
                            <div>
                              <h6 className="mb-1">{payment.month}</h6>
                              <small className="text-muted">Due: {formatDate(payment.due_date)}</small>
                            </div>
                            <div className="text-end">
                              <h6 className="mb-1">{formatMoney(payment.amount, currency)}</h6>
                              <Badge bg={paymentBadgeVariant(payment.status)}>
                                {payment.status.split('_').join(' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {(summary.recent_payments ?? []).length === 0 && (
                          <p className="text-muted mb-0">No recent payments found.</p>
                        )}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={6}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body className="p-4">
                      <h5 className="mb-4">Notices</h5>

                      <div className="d-grid gap-3">
                        {(summary.notices ?? []).map((notice) => (
                          <div key={notice.id} className="border rounded-3 p-3">
                            <div className="d-flex justify-content-between align-items-start gap-3">
                              <div>
                                <h6 className="mb-1 text-capitalize">{notice.title.split('_').join(' ')}</h6>
                                <small className="text-muted d-block">{notice.message || 'No details provided.'}</small>
                                <small className="text-muted">{formatDate(notice.created_at)}</small>
                              </div>
                              <Badge bg={notice.is_read ? 'secondary' : 'primary'}>
                                {notice.is_read ? 'Read' : 'Unread'}
                              </Badge>
                            </div>
                          </div>
                        ))}

                        {(summary.notices ?? []).length === 0 && <p className="text-muted mb-0">No notices available.</p>}
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}

          {!isLoading && !summary && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-4">
                <h5 className="mb-2">Dashboard data unavailable</h5>
                <p className="text-muted mb-0">We could not load your unit, payments, and notices right now.</p>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

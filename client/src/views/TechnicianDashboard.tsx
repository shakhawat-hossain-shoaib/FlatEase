import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { BsCashCoin, BsCheckCircle, BsClockHistory, BsTools, BsXCircle } from 'react-icons/bs';
import ApiClient, { ComplaintEntity, TechnicianEarningsResponse } from '../api';
import { DashboardLayout } from './DashboardLayout';

export default function TechnicianDashboard() {
  const api = useMemo(() => new ApiClient(), []);
  const [isLoading, setIsLoading] = useState(true);
  const [earnings, setEarnings] = useState<TechnicianEarningsResponse | null>(null);
  const [complaints, setComplaints] = useState<ComplaintEntity[]>([]);

  const loadDashboardData = useCallback(async () => {
    const [earningsResponse, complaintsResponse] = await Promise.all([
      api.getTechnicianEarnings(),
      api.getComplaints('Technician'),
    ]);

    setEarnings(earningsResponse ?? null);
    setComplaints(complaintsResponse?.data ?? []);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    void loadDashboardData();

    const timer = window.setInterval(() => {
      void loadDashboardData();
    }, 15000);

    return () => window.clearInterval(timer);
  }, [loadDashboardData]);

  const paymentRows = earnings?.payments ?? [];
  const summary = earnings?.summary;

  const resolvedJobs = complaints.filter((item) => item.status === 'resolved').length;

  const getStatusBadge = (status: string) => {
    if (status === 'successful') {
      return 'success';
    }

    if (status === 'pending') {
      return 'warning';
    }

    if (status === 'failed') {
      return 'danger';
    }

    return 'secondary';
  };

  const getStatusText = (status: string) => {
    if (status === 'successful') {
      return 'সফল';
    }

    return status.replace('_', ' ');
  };

  const formatMoney = (value: number, currency = 'BDT') => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency,
      maximumFractionDigits: 2,
    }).format(value ?? 0);
  };

  const formatDate = (value?: string | null) => {
    if (!value) {
      return 'N/A';
    }

    return new Date(value).toLocaleDateString();
  };

  return (
    <DashboardLayout role="Technician">
      <div className="technician-dashboard-shell">
        <div className="container-fluid py-1 technician-dashboard-enter">
          <div className="mb-4 technician-dashboard-hero">
            <h3 className="fw-bold mb-1">Technician Dashboard</h3>
            <p className="text-muted mb-0">Track active jobs, confirmed earnings, and recent payment status in one place.</p>
          </div>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="shadow-sm border-0 technician-summary-card technician-summary-card-info">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-info-subtle p-3 text-info">
                    <BsTools size={20} />
                  </div>
                  <div>
                    <div className="fw-semibold">Assigned Work Queue</div>
                    <div className="display-6 fw-bold mb-0">{complaints.length}</div>
                    <div className="text-muted small">Open Assigned Complaints</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-0 technician-summary-card technician-summary-card-warning">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-warning-subtle p-3 text-warning">
                    <BsClockHistory size={20} />
                  </div>
                  <div>
                    <div className="fw-semibold">Resolved Jobs</div>
                    <div className="display-6 fw-bold mb-0">{resolvedJobs}</div>
                    <div className="text-muted small">Completed maintenance tasks</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="shadow-sm border-0 technician-summary-card technician-summary-card-success h-100">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BsCashCoin className="text-success" />
                    <span className="text-muted">Total Earned</span>
                  </div>
                  <h4 className="mb-0">{formatMoney(summary?.total_earned ?? 0, summary?.currency ?? 'BDT')}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 technician-summary-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BsCheckCircle className="text-success" />
                    <span className="text-muted">Successful Payments</span>
                  </div>
                  <h4 className="mb-0">{summary?.successful_count ?? 0}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="shadow-sm border-0 technician-summary-card h-100">
                <Card.Body>
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <BsXCircle className="text-danger" />
                    <span className="text-muted">Failed Payments</span>
                  </div>
                  <h4 className="mb-0">{summary?.failed_count ?? 0}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="shadow-sm border-0 technician-payments-card">
            <Card.Header className="bg-white border-0 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="mb-0">Earnings and Payments</h5>
                <small className="text-muted">Auto-refresh every 15 seconds</small>
              </div>
              <Badge bg="primary" pill>
                Pending: {summary?.pending_count ?? 0}
              </Badge>
            </Card.Header>
            <Card.Body>
              {isLoading && (
                <div className="d-flex align-items-center gap-2 text-muted py-2">
                  <Spinner animation="border" size="sm" />
                  Loading technician earnings...
                </div>
              )}

              {!isLoading && paymentRows.length === 0 && (
                <div className="text-muted py-2">No payment records yet. Completed complaint payments will appear here.</div>
              )}

              {!isLoading && paymentRows.length > 0 && (
                <Table responsive hover className="align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Tenant</th>
                      <th>Issue</th>
                      <th>Amount</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paymentRows.map((payment) => (
                      <tr key={payment.id} className="technician-payment-row">
                        <td>
                          <div className="fw-semibold">{payment.tenant_name || 'N/A'}</div>
                          <small className="text-muted">{payment.building_name || 'Building N/A'}</small>
                        </td>
                        <td>{payment.complaint_title || 'Issue N/A'}</td>
                        <td>{formatMoney(payment.amount, payment.currency)}</td>
                        <td>{formatDate(payment.paid_at || payment.created_at)}</td>
                        <td>
                          <Badge bg={getStatusBadge(payment.status)}>{getStatusText(payment.status)}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

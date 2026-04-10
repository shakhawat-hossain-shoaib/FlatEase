import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { BsChatDots, BsFilter, BsSearch, BsSendCheck, BsShieldCheck } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ApiClient, { ComplaintEntity, ComplaintPriority, ComplaintStatus, ComplaintTechnicianPaymentEntity } from '../../api';
import { AdminEmptyState } from '../../shared/components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../shared/components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../shared/components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDate, getComplaintBadgeVariant, getComplaintStatusLabel } from '../tenantUtils';

function getPriorityVariant(priority: ComplaintPriority) {
  if (priority === 'high') {
    return 'danger';
  }

  if (priority === 'medium') {
    return 'warning';
  }

  return 'info';
}

export default function MyComplaints() {
  const api = useMemo(() => new ApiClient(), []);
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<ComplaintEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [isResolvingId, setIsResolvingId] = useState<number | null>(null);
  const [complaintPayments, setComplaintPayments] = useState<ComplaintTechnicianPaymentEntity[]>([]);
  const [showPayTechnicianModal, setShowPayTechnicianModal] = useState(false);
  const [payingComplaint, setPayingComplaint] = useState<ComplaintEntity | null>(null);
  const [technicianPayAmount, setTechnicianPayAmount] = useState('');
  const [isPayingTechnician, setIsPayingTechnician] = useState(false);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    const [response, complaintPaymentResponse] = await Promise.all([
      api.getComplaints('Tenant'),
      api.getTenantComplaintPayments(),
    ]);
    setComplaints(response?.data ?? []);
    setComplaintPayments(complaintPaymentResponse?.payments ?? []);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  const filteredComplaints = useMemo(() => {
    return complaints.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      if (!searchQuery.trim()) {
        return true;
      }

      const query = searchQuery.trim().toLowerCase();
      return [item.title, item.category, item.description, item.priority, item.status]
        .join(' ')
        .toLowerCase()
        .includes(query);
    });
  }, [complaints, searchQuery, statusFilter]);

  const resolvedCount = complaints.filter((item) => item.status === 'resolved').length;
  const openCount = complaints.length - resolvedCount;

  const latestPaymentByComplaint = useMemo(() => {
    const map = new Map<number, ComplaintTechnicianPaymentEntity>();

    complaintPayments.forEach((payment) => {
      const existing = map.get(payment.complaint_id);

      if (!existing) {
        map.set(payment.complaint_id, payment);
        return;
      }

      const existingTime = existing.created_at ? new Date(existing.created_at).getTime() : 0;
      const currentTime = payment.created_at ? new Date(payment.created_at).getTime() : 0;

      if (currentTime >= existingTime) {
        map.set(payment.complaint_id, payment);
      }
    });

    return map;
  }, [complaintPayments]);

  const getTechnicianPaymentBadgeVariant = (status: ComplaintTechnicianPaymentEntity['status']) => {
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

  const getTechnicianPaymentLabel = (status: ComplaintTechnicianPaymentEntity['status']) => {
    if (status === 'successful') {
      return 'Successful';
    }

    if (status === 'pending') {
      return 'Pending';
    }

    if (status === 'failed') {
      return 'Failed';
    }

    return 'Cancelled';
  };

  const handleMarkResolved = async (complaintId: number) => {
    setIsResolvingId(complaintId);
    const response = await api.markComplaintResolvedByTenant(complaintId);
    setIsResolvingId(null);

    if (!response) {
      return;
    }

    toast.success('Complaint marked as solved.');
    await loadComplaints();
  };

  const openPayTechnicianModal = (complaint: ComplaintEntity) => {
    const latestPayment = latestPaymentByComplaint.get(complaint.id);
    setPayingComplaint(complaint);
    setTechnicianPayAmount(latestPayment && latestPayment.amount > 0 ? String(latestPayment.amount) : '');
    setShowPayTechnicianModal(true);
  };

  const handlePayTechnician = async () => {
    if (!payingComplaint) {
      return;
    }

    const amount = Number.parseFloat(technicianPayAmount);
    if (Number.isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid payment amount.');
      return;
    }

    setIsPayingTechnician(true);
    const response = await api.initiateTenantTechnicianPayment(payingComplaint.id, amount);
    setIsPayingTechnician(false);

    if (!response?.gateway_url) {
      return;
    }

    setShowPayTechnicianModal(false);
    window.location.href = response.gateway_url;
  };

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="My Complaints"
            subtitle="Track your submitted complaints and monitor status updates from the maintenance team."
            action={
              <Button onClick={() => navigate('/tenant/complaints/new')}>
                <BsChatDots className="me-1" /> New Complaint
              </Button>
            }
          />

          <Row className="g-3 g-xl-4 mb-4">
            <Col md={4}>
              <Card className="admin-card admin-metric-card admin-kpi-accent-primary border-0 h-100">
                <Card.Body className="admin-dashboard-kpi-body">
                  <div className="admin-metric-label mb-2">Total Complaints</div>
                  <div className="admin-metric-value mb-1">{complaints.length}</div>
                  <small className="text-muted">All submitted requests</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card admin-metric-card admin-kpi-accent-warning border-0 h-100">
                <Card.Body className="admin-dashboard-kpi-body">
                  <div className="admin-metric-label mb-2">Open</div>
                  <div className="admin-metric-value mb-1">{openCount}</div>
                  <small className="text-muted">Pending, assigned, or in progress</small>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card admin-metric-card admin-kpi-accent-success border-0 h-100">
                <Card.Body className="admin-dashboard-kpi-body">
                  <div className="admin-metric-label mb-2">Resolved</div>
                  <div className="admin-metric-value mb-1">{resolvedCount}</div>
                  <small className="text-muted">Closed requests</small>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <AdminSectionCard className="mb-4" title="Filter Complaints">
            <Row className="g-3 align-items-end">
              <Col lg={7}>
                <Form.Label>Search</Form.Label>
                <div className="position-relative">
                  <BsSearch className="position-absolute top-50 translate-middle-y ms-3 text-muted" />
                  <Form.Control
                    type="search"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                    placeholder="Search by title, category, or description"
                    className="ps-5"
                  />
                </div>
              </Col>
              <Col lg={3}>
                <Form.Label>Status</Form.Label>
                <Form.Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ComplaintStatus | 'all')}>
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </Form.Select>
              </Col>
              <Col lg={2} className="d-flex align-items-end">
                <Button variant="outline-secondary" className="w-100" onClick={() => { setSearchQuery(''); setStatusFilter('all'); }}>
                  <BsFilter className="me-1" /> Clear
                </Button>
              </Col>
            </Row>
          </AdminSectionCard>

          <AdminSectionCard title="Complaint History">
            {isLoading && (
              <div className="d-flex align-items-center gap-2 text-muted py-3">
                <Spinner animation="border" size="sm" />
                Loading complaints...
              </div>
            )}

            {!isLoading && filteredComplaints.length === 0 && (
              <AdminEmptyState
                icon={BsChatDots}
                title="No complaints found"
                message="Try a different filter or submit a new complaint if you need support."
              />
            )}

            {!isLoading && filteredComplaints.length > 0 && (
              <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Technician Payment</th>
                    <th>Created</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
                      {(() => {
                        const technicianPayment = latestPaymentByComplaint.get(complaint.id);
                        const canShowPay = complaint.status === 'resolved' && technicianPayment?.status !== 'successful';

                        return (
                          <>
                      <td>
                        <div className="fw-semibold">{complaint.title}</div>
                        <small className="text-muted">{complaint.description.slice(0, 90)}{complaint.description.length > 90 ? '...' : ''}</small>
                      </td>
                      <td>{complaint.category}</td>
                      <td>
                        <Badge bg={getPriorityVariant(complaint.priority)}>{complaint.priority}</Badge>
                      </td>
                      <td>
                        <Badge bg={getComplaintBadgeVariant(complaint.status)}>{getComplaintStatusLabel(complaint.status)}</Badge>
                      </td>
                      <td>
                        {!technicianPayment ? (
                          <span className="text-muted small">No payment yet</span>
                        ) : (
                          <div className="d-flex flex-column gap-1">
                            <Badge bg={getTechnicianPaymentBadgeVariant(technicianPayment.status)} className="align-self-start">
                              {getTechnicianPaymentLabel(technicianPayment.status)}
                            </Badge>
                            <small className="text-muted">BDT {technicianPayment.amount.toFixed(2)}</small>
                          </div>
                        )}
                      </td>
                      <td>{formatDate(complaint.created_at)}</td>
                      <td className="text-end">
                        {complaint.status !== 'resolved' ? (
                          <Button
                            size="sm"
                            variant="outline-success"
                            onClick={() => void handleMarkResolved(complaint.id)}
                            disabled={isResolvingId === complaint.id}
                          >
                            <BsSendCheck className="me-1" />
                            {isResolvingId === complaint.id ? 'Updating...' : 'Mark Solved'}
                          </Button>
                        ) : (
                          <div className="d-inline-flex align-items-center gap-2">
                            {canShowPay ? (
                              <Button
                                size="sm"
                                variant="success"
                                onClick={() => openPayTechnicianModal(complaint)}
                                disabled={isPayingTechnician}
                              >
                                Pay Technician
                              </Button>
                            ) : null}
                            <Badge bg="success" className="badge-soft-success">
                              <BsShieldCheck className="me-1" /> Resolved
                            </Badge>
                          </div>
                        )}
                      </td>
                          </>
                        );
                      })()}
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </AdminSectionCard>

          <Modal show={showPayTechnicianModal} onHide={() => setShowPayTechnicianModal(false)} centered>
            <Modal.Header closeButton>
              <Modal.Title>Pay Technician</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <p className="mb-2">
                Complaint: <strong>{payingComplaint?.title ?? 'N/A'}</strong>
              </p>
              <Form.Group>
                <Form.Label>Amount (BDT)</Form.Label>
                <Form.Control
                  type="number"
                  min="1"
                  step="0.01"
                  placeholder="Enter amount"
                  value={technicianPayAmount}
                  onChange={(event) => setTechnicianPayAmount(event.target.value)}
                />
                <Form.Text className="text-muted">
                  You will be redirected to SSLCommerz for secure payment confirmation.
                </Form.Text>
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowPayTechnicianModal(false)} disabled={isPayingTechnician}>
                Cancel
              </Button>
              <Button variant="success" onClick={() => void handlePayTechnician()} disabled={isPayingTechnician}>
                {isPayingTechnician ? 'Redirecting...' : 'Continue to SSLCommerz'}
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </TenantLayout>
  );
}
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { BsChatDots, BsFilter, BsSearch, BsSendCheck, BsShieldCheck } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import ApiClient, { ComplaintEntity, ComplaintPriority, ComplaintStatus } from '../../api';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../components/admin/AdminSectionCard';
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
  const [complaints, setComplaints] = useState<ComplaintEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [isResolvingId, setIsResolvingId] = useState<number | null>(null);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getComplaints('Tenant');
    setComplaints(response?.data ?? []);
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

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="My Complaints"
            subtitle="Track your submitted complaints and monitor status updates from the maintenance team."
            action={
              <Button as={Link} to="/tenant/complaints/new">
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
                    <th>Created</th>
                    <th className="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((complaint) => (
                    <tr key={complaint.id}>
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
                          <Badge bg="success" className="badge-soft-success">
                            <BsShieldCheck className="me-1" /> Resolved
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </AdminSectionCard>
        </div>
      </div>
    </TenantLayout>
  );
}
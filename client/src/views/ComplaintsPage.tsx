import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { DashboardLayout } from './DashboardLayout';
import {
  BsChatDots,
  BsCheckCircle,
  BsClockHistory,
  BsExclamationCircle,
  BsExclamationTriangle,
  BsPlus,
  BsSend,
  BsTools,
  BsWrench,
} from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient, {
  AssignableUser,
  ComplaintCommentEntity,
  ComplaintEntity,
  ComplaintPriority,
  ComplaintStatus,
  ComplaintSummary,
} from '../api';

type UserRole = 'Admin' | 'Tenant';

interface ComplaintsPageProps {
  role: UserRole;
}

type StatusFormState = Record<number, { new_status: ComplaintStatus; reason: string }>;
type AssignFormState = Record<number, { assigned_technician_id: string; sla_due_at: string; reason: string }>;
type CommentFormState = Record<number, { comment: string; is_internal: boolean }>;

function getPriorityVariant(priority: ComplaintPriority) {
  switch (priority) {
    case 'high':
      return 'danger';
    case 'medium':
      return 'warning';
    case 'low':
      return 'info';
    default:
      return 'secondary';
  }
}

function getStatusVariant(status: ComplaintStatus) {
  switch (status) {
    case 'resolved':
      return 'success';
    case 'in_progress':
      return 'primary';
    case 'pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

function formatStatus(status: ComplaintStatus) {
  if (status === 'in_progress') {
    return 'In Progress';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPriority(priority: ComplaintPriority) {
  return priority.charAt(0).toUpperCase() + priority.slice(1);
}

function formatDateTime(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleString();
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  return new Date(value).toLocaleDateString();
}

export default function ComplaintsPage({ role }: ComplaintsPageProps) {
  const api = useMemo(() => new ApiClient(), []);
  const [complaints, setComplaints] = useState<ComplaintEntity[]>([]);
  const [summary, setSummary] = useState<ComplaintSummary | null>(null);
  const [assignableUsers, setAssignableUsers] = useState<AssignableUser[]>([]);
  const [commentsByComplaint, setCommentsByComplaint] = useState<Record<number, ComplaintCommentEntity[]>>({});
  const [statusForms, setStatusForms] = useState<StatusFormState>({});
  const [assignForms, setAssignForms] = useState<AssignFormState>({});
  const [commentForms, setCommentForms] = useState<CommentFormState>({});
  const [openCommentPanels, setOpenCommentPanels] = useState<Record<number, boolean>>({});
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ComplaintStatus>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | ComplaintPriority>('all');
  const [createForm, setCreateForm] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium' as ComplaintPriority,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const loadComplaints = useCallback(async () => {
    setIsLoading(true);
    const complaintResponse = await api.getComplaints(role);

    if (complaintResponse?.data) {
      setComplaints(complaintResponse.data);
    }

    if (role === 'Admin') {
      const [summaryResponse, assignableUsersResponse] = await Promise.all([
        api.getComplaintSummary(),
        api.getAssignableUsers(),
      ]);

      if (summaryResponse) {
        setSummary(summaryResponse);
      }

      if (assignableUsersResponse) {
        setAssignableUsers(assignableUsersResponse);
      }
    }

    setIsLoading(false);
  }, [api, role]);

  useEffect(() => {
    void loadComplaints();
  }, [loadComplaints]);

  const computedSummary = useMemo(() => {
    const total = complaints.length;
    const pending = complaints.filter((item) => item.status === 'pending').length;
    const in_progress = complaints.filter((item) => item.status === 'in_progress').length;
    const resolved = complaints.filter((item) => item.status === 'resolved').length;
    const high_priority = complaints.filter((item) => item.priority === 'high').length;

    return {
      total,
      pending,
      in_progress,
      resolved,
      high_priority,
    };
  }, [complaints]);

  const effectiveSummary = summary ?? computedSummary;

  const visibleComplaints = useMemo(() => {
    if (role !== 'Admin') {
      return complaints;
    }

    return complaints.filter((item) => {
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      if (priorityFilter !== 'all' && item.priority !== priorityFilter) {
        return false;
      }

      if (!searchQuery.trim()) {
        return true;
      }

      const q = searchQuery.trim().toLowerCase();
      const haystack = [
        item.title,
        item.category,
        item.description,
        item.tenant?.name ?? '',
        String(item.id),
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(q);
    });
  }, [complaints, priorityFilter, role, searchQuery, statusFilter]);

  const handleCreateComplaint = async () => {
    if (!createForm.title || !createForm.category || !createForm.description) {
      toast.error('Please complete all complaint fields.');
      return;
    }

    setIsSaving(true);
    const created = await api.createComplaint(createForm);
    setIsSaving(false);

    if (!created) {
      return;
    }

    toast.success('Complaint created successfully.');
    setCreateForm({ title: '', category: '', description: '', priority: 'medium' });
    setShowCreateModal(false);
    await loadComplaints();
  };

  const toggleCommentsPanel = async (complaintId: number) => {
    const willOpen = !openCommentPanels[complaintId];
    setOpenCommentPanels((prev) => ({ ...prev, [complaintId]: willOpen }));

    if (willOpen && !commentsByComplaint[complaintId]) {
      const comments = await api.getComplaintComments(complaintId);
      if (comments) {
        setCommentsByComplaint((prev) => ({ ...prev, [complaintId]: comments }));
      }
    }
  };

  const submitComment = async (complaintId: number) => {
    const form = commentForms[complaintId] ?? { comment: '', is_internal: false };
    if (!form.comment.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }

    const saved = await api.addComplaintComment(complaintId, {
      comment: form.comment,
      is_internal: form.is_internal,
    });

    if (!saved) {
      return;
    }

    const refreshed = await api.getComplaintComments(complaintId);
    if (refreshed) {
      setCommentsByComplaint((prev) => ({ ...prev, [complaintId]: refreshed }));
    }

    setCommentForms((prev) => ({
      ...prev,
      [complaintId]: { comment: '', is_internal: false },
    }));

    toast.success('Comment added.');
  };

  const submitStatusUpdate = async (complaintId: number) => {
    const form = statusForms[complaintId] ?? { new_status: 'in_progress', reason: '' };
    const updated = await api.updateComplaintStatus(complaintId, {
      new_status: form.new_status,
      reason: form.reason,
    });

    if (!updated) {
      return;
    }

    toast.success('Complaint status updated.');
    await loadComplaints();
  };

  const submitAssignment = async (complaintId: number) => {
    const form = assignForms[complaintId];
    if (!form || !form.assigned_technician_id) {
      toast.error('Please select a technician/admin.');
      return;
    }

    const updated = await api.assignComplaint(complaintId, {
      assigned_technician_id: Number(form.assigned_technician_id),
      sla_due_at: form.sla_due_at || undefined,
      reason: form.reason || undefined,
    });

    if (!updated) {
      return;
    }

    toast.success('Complaint assignment updated.');
    await loadComplaints();
  };

  const stats =
    role === 'Admin'
      ? [
          {
            label: 'Total Complaints',
            value: String(effectiveSummary.total),
            icon: BsExclamationCircle,
            iconClass: 'text-primary',
            bgClass: 'bg-primary-subtle',
          },
          {
            label: 'In Progress',
            value: String(effectiveSummary.in_progress),
            icon: BsClockHistory,
            iconClass: 'text-warning',
            bgClass: 'bg-warning-subtle',
          },
          {
            label: 'Pending',
            value: String(effectiveSummary.pending),
            icon: BsExclamationTriangle,
            iconClass: 'text-secondary',
            bgClass: 'bg-secondary-subtle',
          },
          {
            label: 'Resolved',
            value: String(effectiveSummary.resolved),
            icon: BsCheckCircle,
            iconClass: 'text-success',
            bgClass: 'bg-success-subtle',
          },
        ]
      : [
          {
            label: 'My Requests',
            value: String(effectiveSummary.total),
            icon: BsExclamationCircle,
            iconClass: 'text-primary',
            bgClass: 'bg-primary-subtle',
          },
          {
            label: 'In Progress',
            value: String(effectiveSummary.in_progress),
            icon: BsClockHistory,
            iconClass: 'text-warning',
            bgClass: 'bg-warning-subtle',
          },
          {
            label: 'Awaiting Action',
            value: String(effectiveSummary.pending),
            icon: BsExclamationTriangle,
            iconClass: 'text-secondary',
            bgClass: 'bg-secondary-subtle',
          },
          {
            label: 'Resolved',
            value: String(effectiveSummary.resolved),
            icon: BsCheckCircle,
            iconClass: 'text-success',
            bgClass: 'bg-success-subtle',
          },
        ];

  const title = role === 'Admin' ? 'Complaints Management' : 'My Complaints & Maintenance';
  const subtitle =
    role === 'Admin'
      ? 'Review tenant complaints, assign teams, and track maintenance progress.'
      : 'Track your submitted requests and follow maintenance updates.';

  return (
    <DashboardLayout role={role}>
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid py-1">
          <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="mb-1">{title}</h2>
              <p className="text-muted mb-0">{subtitle}</p>
            </div>
            {role !== 'Admin' && (
              <Button onClick={() => setShowCreateModal(true)}>
                <BsPlus className="me-2" />
                New Complaint
              </Button>
            )}
          </div>

          <Row className="g-3 mb-4">
            {stats.map((stat) => {
              const Icon = stat.icon;

              return (
                <Col key={stat.label} xs={6} lg={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex align-items-center gap-3">
                        <div className={`${stat.bgClass} rounded-3 p-3`}>
                          <Icon className={stat.iconClass} size={20} />
                        </div>
                        <div>
                          <div className="text-muted small">{stat.label}</div>
                          <div className="fs-4 fw-semibold">{stat.value}</div>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          {role === 'Admin' && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="py-3">
                <Row className="g-2 align-items-end">
                  <Col md={5}>
                    <Form.Label className="small text-muted mb-1">Search</Form.Label>
                    <Form.Control
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder="Search by id, title, category, tenant"
                    />
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small text-muted mb-1">Status</Form.Label>
                    <Form.Select
                      value={statusFilter}
                      onChange={(event) => setStatusFilter(event.target.value as 'all' | ComplaintStatus)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="resolved">Resolved</option>
                    </Form.Select>
                  </Col>
                  <Col md={3}>
                    <Form.Label className="small text-muted mb-1">Priority</Form.Label>
                    <Form.Select
                      value={priorityFilter}
                      onChange={(event) => setPriorityFilter(event.target.value as 'all' | ComplaintPriority)}
                    >
                      <option value="all">All Priorities</option>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </Form.Select>
                  </Col>
                  <Col md={1}>
                    <Button
                      variant="outline-secondary"
                      className="w-100"
                      onClick={() => {
                        setSearchQuery('');
                        setStatusFilter('all');
                        setPriorityFilter('all');
                      }}
                    >
                      Reset
                    </Button>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          )}

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
            </div>
          ) : visibleComplaints.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <Card.Body className="text-center py-5 text-muted">
                {role === 'Admin' && (searchQuery || statusFilter !== 'all' || priorityFilter !== 'all')
                  ? 'No complaints match your current filters.'
                  : 'No complaints found yet.'}
              </Card.Body>
            </Card>
          ) : (
            <div className="d-grid gap-4">
              {visibleComplaints.map((complaint) => {
                const complaintComments = commentsByComplaint[complaint.id] ?? [];
                const histories = [...(complaint.statusHistories ?? complaint.status_histories ?? [])].sort(
                  (a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime()
                );

                return (
                  <Card key={complaint.id} className="border-0 shadow-sm">
                    <Card.Header className="bg-white border-0 pb-0 pt-4 px-4">
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div className="d-flex gap-3">
                          <div
                            className={`rounded-3 p-3 h-100 ${
                              complaint.priority === 'high'
                                ? 'bg-danger-subtle'
                                : complaint.priority === 'medium'
                                  ? 'bg-warning-subtle'
                                  : 'bg-info-subtle'
                            }`}
                          >
                            <BsWrench
                              size={20}
                              className={
                                complaint.priority === 'high'
                                  ? 'text-danger'
                                  : complaint.priority === 'medium'
                                    ? 'text-warning'
                                    : 'text-info'
                              }
                            />
                          </div>
                          <div>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <h4 className="h5 mb-0">{complaint.title}</h4>
                              <Badge bg={getStatusVariant(complaint.status)}>{formatStatus(complaint.status)}</Badge>
                            </div>
                            {role === 'Admin' ? (
                              <>
                                <div className="text-muted small">
                                  #{complaint.id} · {complaint.category} · Reported {formatDate(complaint.created_at)}
                                </div>
                                <div className="text-muted small mt-1">
                                  Reported by {complaint.tenant?.name ?? 'Tenant'} · Assigned to{' '}
                                  {complaint.assignedTechnician?.name ?? complaint.assigned_technician?.name ?? 'Unassigned'}
                                </div>
                                <div className="text-muted small">SLA due by {formatDate(complaint.sla_due_at)}</div>
                              </>
                            ) : (
                              <div className="text-muted small">
                                Category: {complaint.category} · Submitted {formatDate(complaint.created_at)}
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <Badge bg={getPriorityVariant(complaint.priority)}>{formatPriority(complaint.priority)} Priority</Badge>
                        </div>
                      </div>
                    </Card.Header>
                    <Card.Body className="px-4 pb-4">
                      <div className="mb-3 text-secondary">{complaint.description}</div>

                      <div className="d-flex align-items-center gap-2 mb-3">
                        <BsClockHistory className="text-muted" />
                        <h5 className="h6 mb-0">Status Timeline</h5>
                      </div>

                      <div className="border-start border-2 ps-3 ms-2 mb-4">
                        <div className="d-grid gap-3">
                          {histories.length === 0 ? (
                            <div className="text-muted small">No status history yet.</div>
                          ) : (
                            histories.map((event, index) => {
                              const isCurrentStep = index === histories.length - 1;

                              return (
                                <div key={`${event.id}-${event.changed_at}`} className="position-relative">
                                  <span
                                    className={`position-absolute top-50 start-0 translate-middle rounded-circle border ${
                                      isCurrentStep ? 'bg-primary border-primary' : 'bg-white border-secondary'
                                    }`}
                                    style={{ width: '0.85rem', height: '0.85rem', marginLeft: '-1rem' }}
                                  />
                                  <div className="bg-light rounded-3 p-3">
                                    <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                                      <Badge bg="secondary" className="align-self-start">
                                        {formatStatus(event.new_status)}
                                      </Badge>
                                      <span className="text-muted small">{formatDateTime(event.changed_at)}</span>
                                    </div>
                                    {event.reason && <p className="mb-0 text-secondary">Reason: {event.reason}</p>}
                                  </div>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>

                      <div className="d-flex flex-wrap align-items-center gap-2 border-top pt-3">
                        <Button variant="outline-secondary" size="sm" onClick={() => toggleCommentsPanel(complaint.id)}>
                          <BsChatDots className="me-2" />
                          {openCommentPanels[complaint.id] ? 'Hide Comments' : 'Comments'}
                        </Button>

                        {role === 'Admin' && complaint.status !== 'resolved' && (
                          <>
                            <Button variant="outline-primary" size="sm" onClick={() => submitStatusUpdate(complaint.id)}>
                              Update Status
                            </Button>
                            <Button variant="outline-dark" size="sm" onClick={() => submitAssignment(complaint.id)}>
                              <BsTools className="me-2" />
                              Assign
                            </Button>
                          </>
                        )}

                        {complaint.status === 'resolved' && (
                          <Badge bg="success" className="ms-auto">
                            <BsCheckCircle className="me-1" />
                            Resolved
                          </Badge>
                        )}
                      </div>

                      {role === 'Admin' && complaint.status !== 'resolved' && (
                        <div className="row g-3 mt-2 border-top pt-3">
                          <div className="col-md-6">
                            <Form.Label className="small mb-1">Set Status</Form.Label>
                            <Form.Select
                              size="sm"
                              value={statusForms[complaint.id]?.new_status ?? complaint.status}
                              onChange={(event) =>
                                setStatusForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    new_status: event.target.value as ComplaintStatus,
                                    reason: prev[complaint.id]?.reason ?? '',
                                  },
                                }))
                              }
                            >
                              <option value="pending">Pending</option>
                              <option value="in_progress">In Progress</option>
                              <option value="resolved">Resolved</option>
                            </Form.Select>
                            <Form.Control
                              className="mt-2"
                              size="sm"
                              placeholder="Status change reason (optional)"
                              value={statusForms[complaint.id]?.reason ?? ''}
                              onChange={(event) =>
                                setStatusForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    new_status: prev[complaint.id]?.new_status ?? 'in_progress',
                                    reason: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>

                          <div className="col-md-6">
                            <Form.Label className="small mb-1">Assign User</Form.Label>
                            <Form.Select
                              size="sm"
                              value={assignForms[complaint.id]?.assigned_technician_id ?? ''}
                              onChange={(event) =>
                                setAssignForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    assigned_technician_id: event.target.value,
                                    sla_due_at: prev[complaint.id]?.sla_due_at ?? '',
                                    reason: prev[complaint.id]?.reason ?? '',
                                  },
                                }))
                              }
                            >
                              <option value="">Select admin/technician</option>
                              {assignableUsers.map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name} ({user.role})
                                </option>
                              ))}
                            </Form.Select>
                            <Form.Control
                              className="mt-2"
                              size="sm"
                              type="date"
                              value={assignForms[complaint.id]?.sla_due_at ?? ''}
                              onChange={(event) =>
                                setAssignForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    assigned_technician_id: prev[complaint.id]?.assigned_technician_id ?? '',
                                    sla_due_at: event.target.value,
                                    reason: prev[complaint.id]?.reason ?? '',
                                  },
                                }))
                              }
                            />
                            <Form.Control
                              className="mt-2"
                              size="sm"
                              placeholder="Assignment reason (optional)"
                              value={assignForms[complaint.id]?.reason ?? ''}
                              onChange={(event) =>
                                setAssignForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    assigned_technician_id: prev[complaint.id]?.assigned_technician_id ?? '',
                                    sla_due_at: prev[complaint.id]?.sla_due_at ?? '',
                                    reason: event.target.value,
                                  },
                                }))
                              }
                            />
                          </div>
                        </div>
                      )}

                      {openCommentPanels[complaint.id] && (
                        <div className="mt-3 border-top pt-3">
                          <h6 className="mb-3">Comments</h6>

                          {complaintComments.length === 0 ? (
                            <div className="text-muted small mb-3">No comments yet.</div>
                          ) : (
                            <div className="d-grid gap-2 mb-3">
                              {complaintComments.map((comment) => (
                                <div key={comment.id} className="bg-light rounded-3 p-2">
                                  <div className="small fw-semibold">
                                    {comment.user?.name ?? 'User'}
                                    {comment.is_internal ? ' (Internal)' : ''}
                                  </div>
                                  <div className="small text-secondary">{comment.comment}</div>
                                  <div className="small text-muted">{formatDateTime(comment.created_at)}</div>
                                </div>
                              ))}
                            </div>
                          )}

                          <Form.Group>
                            <Form.Control
                              as="textarea"
                              rows={2}
                              placeholder="Write a comment"
                              value={commentForms[complaint.id]?.comment ?? ''}
                              onChange={(event) =>
                                setCommentForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    comment: event.target.value,
                                    is_internal: prev[complaint.id]?.is_internal ?? false,
                                  },
                                }))
                              }
                            />
                          </Form.Group>

                          {role === 'Admin' && (
                            <Form.Check
                              className="mt-2"
                              type="checkbox"
                              label="Internal note (hidden from tenants)"
                              checked={commentForms[complaint.id]?.is_internal ?? false}
                              onChange={(event) =>
                                setCommentForms((prev) => ({
                                  ...prev,
                                  [complaint.id]: {
                                    comment: prev[complaint.id]?.comment ?? '',
                                    is_internal: event.target.checked,
                                  },
                                }))
                              }
                            />
                          )}

                          <Button className="mt-2" size="sm" onClick={() => submitComment(complaint.id)}>
                            <BsSend className="me-2" />
                            Post Comment
                          </Button>
                        </div>
                      )}
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Submit New Complaint</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Title</Form.Label>
            <Form.Control
              value={createForm.title}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="Short complaint title"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Category</Form.Label>
            <Form.Control
              value={createForm.category}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, category: event.target.value }))}
              placeholder="e.g., Plumbing, Electrical"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Priority</Form.Label>
            <Form.Select
              value={createForm.priority}
              onChange={(event) =>
                setCreateForm((prev) => ({
                  ...prev,
                  priority: event.target.value as ComplaintPriority,
                }))
              }
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={createForm.description}
              onChange={(event) => setCreateForm((prev) => ({ ...prev, description: event.target.value }))}
              placeholder="Describe the issue in detail"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={() => setShowCreateModal(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleCreateComplaint} disabled={isSaving}>
            {isSaving ? 'Submitting...' : 'Submit Complaint'}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

import { Button, Card, Col, Row, Badge } from 'react-bootstrap';
import { DashboardLayout } from './DashboardLayout';
import {
  BsChatDots,
  BsCheckCircle,
  BsClockHistory,
  BsExclamationCircle,
  BsExclamationTriangle,
  BsPlus,
  BsTools,
  BsWrench,
} from 'react-icons/bs';

type UserRole = 'Admin' | 'Tenant';

interface ComplaintsPageProps {
  role: UserRole;
}

interface ComplaintEvent {
  status: string;
  date: string;
  note: string;
}

interface Complaint {
  id: string;
  title: string;
  category: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'In Progress' | 'Pending' | 'Completed';
  reporter: string;
  unit: string;
  date: string;
  timeline: ComplaintEvent[];
}

const complaints: Complaint[] = [
  {
    id: 'C-2026-001',
    title: 'Kitchen sink leaking',
    category: 'Plumbing',
    priority: 'High',
    status: 'In Progress',
    reporter: 'John Doe',
    unit: 'A-301',
    date: 'Jan 10, 2026',
    timeline: [
      { status: 'Submitted', date: 'Jan 10, 2026 10:30 AM', note: 'Complaint received and assigned to maintenance team' },
      { status: 'Acknowledged', date: 'Jan 10, 2026 11:15 AM', note: 'Technician assigned to initial assessment' },
      { status: 'In Progress', date: 'Jan 11, 2026 09:00 AM', note: 'Inspection completed and replacement parts ordered' },
    ],
  },
  {
    id: 'C-2026-002',
    title: 'AC not cooling properly',
    category: 'HVAC',
    priority: 'Medium',
    status: 'Pending',
    reporter: 'Sarah Smith',
    unit: 'B-105',
    date: 'Jan 8, 2026',
    timeline: [
      { status: 'Submitted', date: 'Jan 8, 2026 03:20 PM', note: 'Complaint submitted through the resident portal' },
      { status: 'Under Review', date: 'Jan 9, 2026 10:00 AM', note: 'Facilities manager reviewed the issue and queued inspection' },
    ],
  },
  {
    id: 'C-2026-003',
    title: 'Broken window in bedroom',
    category: 'Repairs',
    priority: 'High',
    status: 'Completed',
    reporter: 'Mike Johnson',
    unit: 'C-204',
    date: 'Jan 5, 2026',
    timeline: [
      { status: 'Submitted', date: 'Jan 5, 2026 02:00 PM', note: 'Emergency repair request logged from tenant portal' },
      { status: 'In Progress', date: 'Jan 5, 2026 03:30 PM', note: 'Technician dispatched for same-day response' },
      { status: 'Completed', date: 'Jan 6, 2026 11:00 AM', note: 'Window replaced and sealed successfully' },
      { status: 'Verified', date: 'Jan 6, 2026 04:00 PM', note: 'Tenant confirmed that the repair was completed' },
    ],
  },
  {
    id: 'C-2026-004',
    title: 'Noisy neighbors complaint',
    category: 'Noise',
    priority: 'Low',
    status: 'Pending',
    reporter: 'Emma Wilson',
    unit: 'A-102',
    date: 'Jan 7, 2026',
    timeline: [
      { status: 'Submitted', date: 'Jan 7, 2026 11:00 PM', note: 'Noise complaint logged for overnight follow-up' },
    ],
  },
  {
    id: 'C-2026-005',
    title: 'Elevator malfunction',
    category: 'Building',
    priority: 'High',
    status: 'In Progress',
    reporter: 'Multiple Residents',
    unit: 'Tower A',
    date: 'Jan 9, 2026',
    timeline: [
      { status: 'Submitted', date: 'Jan 9, 2026 08:00 AM', note: 'Multiple residents reported the issue within minutes' },
      { status: 'Acknowledged', date: 'Jan 9, 2026 08:15 AM', note: 'Elevator service contractor was contacted immediately' },
      { status: 'In Progress', date: 'Jan 9, 2026 10:00 AM', note: 'Technician arrived on site and started repairs' },
    ],
  },
];

const stats = [
  {
    label: 'Total Complaints',
    value: '24',
    icon: BsExclamationCircle,
    iconClass: 'text-primary',
    bgClass: 'bg-primary-subtle',
  },
  {
    label: 'In Progress',
    value: '7',
    icon: BsClockHistory,
    iconClass: 'text-warning',
    bgClass: 'bg-warning-subtle',
  },
  {
    label: 'Pending',
    value: '5',
    icon: BsExclamationTriangle,
    iconClass: 'text-secondary',
    bgClass: 'bg-secondary-subtle',
  },
  {
    label: 'Resolved',
    value: '12',
    icon: BsCheckCircle,
    iconClass: 'text-success',
    bgClass: 'bg-success-subtle',
  },
];

function getPriorityVariant(priority: Complaint['priority']) {
  switch (priority) {
    case 'High':
      return 'danger';
    case 'Medium':
      return 'warning';
    case 'Low':
      return 'info';
    default:
      return 'secondary';
  }
}

function getStatusVariant(status: Complaint['status']) {
  switch (status) {
    case 'Completed':
      return 'success';
    case 'In Progress':
      return 'primary';
    case 'Pending':
      return 'warning';
    default:
      return 'secondary';
  }
}

export default function ComplaintsPage({ role }: ComplaintsPageProps) {
  const visibleComplaints =
    role === 'Tenant'
      ? complaints.filter((complaint) => complaint.reporter === 'John Doe' || complaint.unit === 'Tower A')
      : complaints;

  const title = role === 'Admin' ? 'Complaints & Maintenance' : 'My Complaints & Maintenance';
  const subtitle =
    role === 'Admin'
      ? 'Track and manage maintenance requests across the property.'
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
            <Button>
              <BsPlus className="me-2" />
              New Complaint
            </Button>
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

          <div className="d-grid gap-4">
            {visibleComplaints.map((complaint) => (
              <Card key={complaint.id} className="border-0 shadow-sm">
                <Card.Header className="bg-white border-0 pb-0 pt-4 px-4">
                  <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                    <div className="d-flex gap-3">
                      <div
                        className={`rounded-3 p-3 h-100 ${
                          complaint.priority === 'High'
                            ? 'bg-danger-subtle'
                            : complaint.priority === 'Medium'
                              ? 'bg-warning-subtle'
                              : 'bg-info-subtle'
                        }`}
                      >
                        <BsWrench
                          size={20}
                          className={
                            complaint.priority === 'High'
                              ? 'text-danger'
                              : complaint.priority === 'Medium'
                                ? 'text-warning'
                                : 'text-info'
                          }
                        />
                      </div>
                      <div>
                        <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                          <h4 className="h5 mb-0">{complaint.title}</h4>
                          <Badge bg={getStatusVariant(complaint.status)}>{complaint.status}</Badge>
                        </div>
                        <div className="text-muted small">
                          {complaint.id} · Unit {complaint.unit} · {complaint.category} · Reported {complaint.date}
                        </div>
                        {role === 'Admin' && (
                          <div className="text-muted small mt-1">Reported by {complaint.reporter}</div>
                        )}
                      </div>
                    </div>
                    <div>
                      <Badge bg={getPriorityVariant(complaint.priority)}>{complaint.priority} Priority</Badge>
                    </div>
                  </div>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <BsClockHistory className="text-muted" />
                    <h5 className="h6 mb-0">Status Timeline</h5>
                  </div>

                  <div className="border-start border-2 ps-3 ms-2 mb-4">
                    <div className="d-grid gap-3">
                      {complaint.timeline.map((event, index) => {
                        const isCurrentStep = index === complaint.timeline.length - 1;

                        return (
                          <div key={`${complaint.id}-${event.status}-${event.date}`} className="position-relative">
                            <span
                              className={`position-absolute top-50 start-0 translate-middle rounded-circle border ${
                                isCurrentStep ? 'bg-primary border-primary' : 'bg-white border-secondary'
                              }`}
                              style={{ width: '0.85rem', height: '0.85rem', marginLeft: '-1rem' }}
                            />
                            <div className="bg-light rounded-3 p-3">
                              <div className="d-flex flex-column flex-md-row justify-content-between gap-2 mb-2">
                                <Badge bg="secondary" className="align-self-start">
                                  {event.status}
                                </Badge>
                                <span className="text-muted small">{event.date}</span>
                              </div>
                              <p className="mb-0 text-secondary">{event.note}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="d-flex flex-wrap align-items-center gap-2 border-top pt-3">
                    <Button variant="outline-secondary" size="sm">
                      <BsChatDots className="me-2" />
                      Add Comment
                    </Button>
                    {role === 'Admin' && complaint.status !== 'Completed' && (
                      <>
                        <Button variant="outline-primary" size="sm">
                          Update Status
                        </Button>
                        <Button variant="outline-dark" size="sm">
                          <BsTools className="me-2" />
                          Assign Technician
                        </Button>
                      </>
                    )}
                    {complaint.status === 'Completed' && (
                      <Badge bg="success" className="ms-auto">
                        <BsCheckCircle className="me-1" />
                        Resolved
                      </Badge>
                    )}
                  </div>
                </Card.Body>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
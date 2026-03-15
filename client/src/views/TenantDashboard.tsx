import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import { DashboardLayout } from './DashboardLayout';
import {
  BsBell,
  BsCash,
  BsCurrencyDollar,
  BsExclamationCircle,
  BsFileEarmarkText,
  BsHouseDoor,
  BsPerson,
} from 'react-icons/bs';

const statCards = [
  {
    label: 'Next Payment',
    value: '$1,850',
    detail: 'Due: Feb 1, 2026',
    icon: BsCurrencyDollar,
    iconClass: 'text-primary',
    iconBg: 'bg-primary-subtle',
  },
  {
    label: 'Open Requests',
    value: '2',
    detail: '1 in progress',
    icon: BsExclamationCircle,
    iconClass: 'text-warning',
    iconBg: 'bg-warning-subtle',
  },
  {
    label: 'Documents',
    value: '8',
    detail: 'All secured',
    icon: BsFileEarmarkText,
    iconClass: 'text-success',
    iconBg: 'bg-success-subtle',
  },
  {
    label: 'Notifications',
    value: '3',
    detail: 'Unread',
    icon: BsPerson,
    iconClass: 'text-purple',
    iconBg: 'bg-light',
  },
];

const payments = [
  { month: 'January 2026', date: 'Jan 1, 2026', amount: '$1,850', status: 'Paid' },
  { month: 'December 2025', date: 'Dec 1, 2025', amount: '$1,850', status: 'Paid' },
  { month: 'November 2025', date: 'Nov 1, 2025', amount: '$1,850', status: 'Paid' },
  { month: 'October 2025', date: 'Oct 1, 2025', amount: '$1,850', status: 'Paid' },
];

const requests = [
  { title: 'Kitchen sink leak', time: '3 days ago', status: 'In Progress', priority: 'High' },
  { title: 'AC not cooling properly', time: '1 week ago', status: 'Pending', priority: 'Medium' },
];

export default function TenantDashboard() {
  return (
    <DashboardLayout role="Tenant">
      <div style={{ background: '#f5f7fb', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <h3 className="h4 mb-4">Welcome back, John Doe!</h3>

          <Card className="border-0 shadow-sm mb-4" style={{ borderLeft: '4px solid #3267ff' }}>
            <Card.Body className="py-4 px-4">
              <Row className="g-4 align-items-center">
                <Col md={4}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-primary-subtle rounded-3 p-3">
                      <BsHouseDoor className="text-primary" size={22} />
                    </div>
                    <div>
                      <div className="text-muted mb-1">Unit Number</div>
                      <h4 className="mb-0">A-301</h4>
                      <small className="text-muted">3 Bedroom, 2 Bath</small>
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-success-subtle rounded-3 p-3">
                      <BsBell className="text-success" size={22} />
                    </div>
                    <div>
                      <div className="text-muted mb-1">Lease Expiry</div>
                      <h4 className="mb-0">Dec 31, 2026</h4>
                      <small className="text-success">354 days remaining</small>
                    </div>
                  </div>
                </Col>

                <Col md={4}>
                  <div className="d-flex align-items-start gap-3">
                    <div className="bg-warning-subtle rounded-3 p-3">
                      <BsCash className="text-warning" size={22} />
                    </div>
                    <div>
                      <div className="text-muted mb-1">Monthly Rent</div>
                      <h4 className="mb-1">$1,850</h4>
                      <Badge bg="success-subtle" text="success" className="border border-success-subtle">
                        Paid
                      </Badge>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-4">
            {statCards.map((item) => {
              const Icon = item.icon;

              return (
                <Col key={item.label} xs={12} sm={6} xl={3}>
                  <Card className="h-100 border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-start">
                        <div>
                          <div className="text-muted mb-1">{item.label}</div>
                          <h2 className="h3 mb-1">{item.value}</h2>
                          <small className="text-muted">{item.detail}</small>
                        </div>
                        <div className={`${item.iconBg} rounded-3 p-3`}>
                          <Icon className={item.iconClass} size={22} />
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              );
            })}
          </Row>

          <Row className="g-3">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4">
                  <h5 className="mb-4">Recent Payments</h5>
                  <div>
                    {payments.map((payment) => (
                      <div key={payment.month} className="d-flex justify-content-between border-bottom py-3">
                        <div>
                          <h6 className="mb-1">{payment.month}</h6>
                          <small className="text-muted">{payment.date}</small>
                        </div>
                        <div className="text-end">
                          <h6 className="mb-1">{payment.amount}</h6>
                          <Badge bg="success-subtle" text="success" className="border border-success-subtle">
                            {payment.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="p-4 d-flex flex-column">
                  <h5 className="mb-4">Maintenance Requests</h5>

                  <div className="d-grid gap-3 mb-3">
                    {requests.map((request) => (
                      <div key={request.title} className="border rounded-3 p-3">
                        <div className="d-flex justify-content-between gap-3">
                          <div>
                            <h6 className="mb-2">{request.title}</h6>
                            <small className="text-muted">{request.time}</small>
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2">
                            <Badge bg={request.status === 'In Progress' ? 'dark' : 'secondary'}>{request.status}</Badge>
                            <Badge
                              bg="light"
                              text={request.priority === 'High' ? 'danger' : 'warning'}
                              className={`border ${request.priority === 'High' ? 'border-danger' : 'border-warning'}`}
                            >
                              {request.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Button variant="light" className="w-100 border mt-auto fw-semibold">
                    Submit New Request
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </DashboardLayout>
  );
}

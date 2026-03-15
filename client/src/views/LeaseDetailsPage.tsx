import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Badge, Button, Card, Col, ProgressBar, Row } from 'react-bootstrap';
import {
  BsCalendar3,
  BsCashStack,
  BsClockHistory,
  BsDownload,
  BsFileEarmarkText,
  BsHouseDoor,
  BsPencilSquare,
  BsPerson,
} from 'react-icons/bs';
import { DashboardLayout } from './DashboardLayout';

type UserRole = 'Admin' | 'Tenant';

interface LeaseDetailsPageProps {
  role: UserRole;
}

const lease = {
  id: 'L-2024-301',
  tenant: {
    fullName: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    tenantId: 'TN-2024-1234',
    moveInDate: 'January 1, 2024',
    emergencyContact: '(555) 987-6543',
  },
  property: {
    unitNumber: 'A-301',
    building: 'Tower A',
    type: '3 Bed, 2 Bath',
    squareFeet: '1,200 sq ft',
    floor: '3rd Floor',
    parking: 'Spot #A-25',
  },
  terms: {
    startDate: 'January 1, 2024',
    endDate: 'December 31, 2026',
    duration: '36 Months',
    monthlyRent: '$1,850',
    securityDeposit: '$2,500',
    petDeposit: '$500',
    paymentDue: '1st of Month',
  },
  additionalTerms: [
    'Utilities (water and electricity) included in rent',
    'One small pet allowed with additional deposit',
    'Access to building amenities including gym, pool, and parking',
    '30-day notice required for lease termination',
    'Automatic renewal option available with updated terms',
  ],
};

export default function LeaseDetailsPage({ role }: LeaseDetailsPageProps) {
  const { id } = useParams();

  const { daysRemaining, progressPercentage } = useMemo(() => {
    const expiryDate = new Date('2026-12-31T00:00:00');
    const today = new Date();
    const diffInMs = expiryDate.getTime() - today.getTime();
    const calculatedDaysRemaining = Math.max(0, Math.ceil(diffInMs / (1000 * 60 * 60 * 24)));
    const elapsedDays = Math.max(0, 365 - calculatedDaysRemaining);
    const calculatedProgress = Math.min(100, Math.max(0, (elapsedDays / 365) * 100));

    return {
      daysRemaining: calculatedDaysRemaining,
      progressPercentage: calculatedProgress,
    };
  }, []);

  const leaseId = id ?? lease.id;

  return (
    <DashboardLayout role={role}>
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid py-1">
          <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4">
            <div>
              <h2 className="mb-1">Lease Details</h2>
              <p className="text-muted mb-0">Lease Agreement #{leaseId}</p>
            </div>
            <div className="d-flex flex-wrap gap-2">
              <Button variant="outline-secondary">
                <BsDownload className="me-2" />
                Download
              </Button>
              {role === 'Admin' && (
                <Button>
                  <BsPencilSquare className="me-2" />
                  Edit
                </Button>
              )}
            </div>
          </div>

          <Card className="border-0 shadow-sm mb-4 overflow-hidden">
            <div className="border-start border-4 border-warning">
              <Card.Body className="p-4">
                <div className="d-flex flex-column flex-lg-row justify-content-between gap-4 mb-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="bg-warning-subtle rounded-3 p-3">
                      <BsClockHistory size={24} className="text-warning" />
                    </div>
                    <div>
                      <div className="text-muted small">Lease Expiring In</div>
                      <div className="display-6 fw-semibold lh-1 mt-1">
                        {daysRemaining} <span className="fs-5 text-muted">days</span>
                      </div>
                      <div className="text-muted small mt-2">Expires: {lease.terms.endDate}</div>
                    </div>
                  </div>
                  <div>
                    <Badge bg="warning" text="dark" className="px-3 py-2 fs-6">
                      Active
                    </Badge>
                  </div>
                </div>

                <div className="d-flex justify-content-between small mb-2">
                  <span className="text-muted">Lease Progress</span>
                  <span className="fw-medium text-dark">{Math.round(progressPercentage)}% Complete</span>
                </div>
                <ProgressBar now={progressPercentage} variant="warning" style={{ height: '0.75rem' }} />
              </Card.Body>
            </div>
          </Card>

          <Row className="g-4 mb-4">
            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <BsPerson className="text-primary" />
                    <h5 className="mb-0">Tenant Information</h5>
                  </div>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Full Name</div>
                      <div className="fw-medium">{lease.tenant.fullName}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Email</div>
                      <div className="fw-medium">{lease.tenant.email}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Phone</div>
                      <div className="fw-medium">{lease.tenant.phone}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Tenant ID</div>
                      <div className="fw-medium">{lease.tenant.tenantId}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Move-in Date</div>
                      <div className="fw-medium">{lease.tenant.moveInDate}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Emergency Contact</div>
                      <div className="fw-medium">{lease.tenant.emergencyContact}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>

            <Col lg={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Header className="bg-white border-0 pt-4 px-4">
                  <div className="d-flex align-items-center gap-2">
                    <BsHouseDoor className="text-primary" />
                    <h5 className="mb-0">Property Information</h5>
                  </div>
                </Card.Header>
                <Card.Body className="px-4 pb-4">
                  <Row className="g-3">
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Unit Number</div>
                      <div className="fw-medium">{lease.property.unitNumber}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Building</div>
                      <div className="fw-medium">{lease.property.building}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Type</div>
                      <div className="fw-medium">{lease.property.type}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Square Feet</div>
                      <div className="fw-medium">{lease.property.squareFeet}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Floor</div>
                      <div className="fw-medium">{lease.property.floor}</div>
                    </Col>
                    <Col sm={6}>
                      <div className="text-muted small mb-1">Parking</div>
                      <div className="fw-medium">{lease.property.parking}</div>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <div className="d-flex align-items-center gap-2">
                <BsFileEarmarkText className="text-primary" />
                <h5 className="mb-0">Lease Terms & Conditions</h5>
              </div>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <Row className="g-4 mb-4">
                <Col md={4}>
                  <div className="text-muted small mb-1">Lease Start Date</div>
                  <div className="fw-medium">{lease.terms.startDate}</div>
                </Col>
                <Col md={4}>
                  <div className="text-muted small mb-1">Lease End Date</div>
                  <div className="fw-medium">{lease.terms.endDate}</div>
                </Col>
                <Col md={4}>
                  <div className="text-muted small mb-1">Lease Duration</div>
                  <div className="fw-medium">{lease.terms.duration}</div>
                </Col>
              </Row>

              <div className="border-top pt-4 mb-4">
                <h6 className="mb-3">Financial Details</h6>
                <Row className="g-4">
                  <Col md={3} sm={6}>
                    <div className="d-flex align-items-center gap-2 mb-1 text-muted small">
                      <BsCashStack className="text-success" />
                      <span>Monthly Rent</span>
                    </div>
                    <div className="fs-4 fw-semibold">{lease.terms.monthlyRent}</div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-muted small mb-1">Security Deposit</div>
                    <div className="fs-5 fw-semibold">{lease.terms.securityDeposit}</div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-muted small mb-1">Pet Deposit</div>
                    <div className="fs-5 fw-semibold">{lease.terms.petDeposit}</div>
                  </Col>
                  <Col md={3} sm={6}>
                    <div className="text-muted small mb-1">Payment Due</div>
                    <div className="fs-5 fw-semibold">{lease.terms.paymentDue}</div>
                  </Col>
                </Row>
              </div>

              <div className="border-top pt-4">
                <h6 className="mb-3">Additional Terms</h6>
                <div className="d-grid gap-2">
                  {lease.additionalTerms.map((term) => (
                    <div key={term} className="d-flex align-items-start gap-2 text-secondary">
                      <span
                        className="bg-primary rounded-circle flex-shrink-0"
                        style={{ width: '0.45rem', height: '0.45rem', marginTop: '0.45rem' }}
                      />
                      <span>{term}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>

          {role === 'Admin' && (
            <Card className="border-0 shadow-sm">
              <Card.Header className="bg-white border-0 pt-4 px-4">
                <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2">
                  <div className="d-flex align-items-center gap-2">
                    <BsCalendar3 className="text-primary" />
                    <h5 className="mb-0">Renewal Options</h5>
                  </div>
                  <Badge bg="warning" text="dark">Action Required</Badge>
                </div>
              </Card.Header>
              <Card.Body className="px-4 pb-4">
                <div className="d-flex flex-column flex-sm-row gap-3">
                  <Button className="flex-fill">Send Renewal Offer</Button>
                  <Button variant="outline-secondary" className="flex-fill">Schedule Meeting</Button>
                  <Button variant="outline-primary" className="flex-fill">Generate New Lease</Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
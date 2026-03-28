import { Card, Col, Row } from 'react-bootstrap';
import { BsClockHistory, BsTools } from 'react-icons/bs';
import { DashboardLayout } from './DashboardLayout';

export default function TechnicianDashboard() {
  return (
    <DashboardLayout role="Technician">
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid py-1">
          <div className="mb-4">
            <h3 className="fw-bold mb-1">Technician Dashboard</h3>
            <p className="text-muted mb-0">Monitor assigned complaints and keep work status current.</p>
          </div>

          <Row className="g-3">
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-info-subtle p-3 text-info">
                    <BsTools size={20} />
                  </div>
                  <div>
                    <div className="fw-semibold">Assigned Work Queue</div>
                    <div className="text-muted small">Open Assigned Complaints to see your active tickets.</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="shadow-sm border-0">
                <Card.Body className="d-flex align-items-center gap-3">
                  <div className="rounded-circle bg-warning-subtle p-3 text-warning">
                    <BsClockHistory size={20} />
                  </div>
                  <div>
                    <div className="fw-semibold">Status Updates</div>
                    <div className="text-muted small">Set complaints to In Progress when work starts and Resolved when done.</div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </DashboardLayout>
  );
}

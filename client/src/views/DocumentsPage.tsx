import { Badge, Button, Card, Col, Row } from 'react-bootstrap';
import {
  BsCheckCircle,
  BsDownload,
  BsEye,
  BsFileEarmarkText,
  BsFolder,
  BsLock,
  BsShieldCheck,
} from 'react-icons/bs';
import { DashboardLayout } from './DashboardLayout';

interface DocumentItem {
  name: string;
  category: string;
  size: string;
  uploadedAt: string;
  status: 'Verified' | 'Active' | 'Completed';
}

const documentItems: DocumentItem[] = [
  { name: 'Lease Agreement', category: 'Contract', size: '2.4 MB', uploadedAt: 'Jan 1, 2024', status: 'Verified' },
  {
    name: 'Tenant ID Proof',
    category: 'Identity',
    size: '1.2 MB',
    uploadedAt: 'Jan 1, 2024',
    status: 'Verified',
  },
  {
    name: 'Income Verification',
    category: 'Financial',
    size: '850 KB',
    uploadedAt: 'Jan 1, 2024',
    status: 'Verified',
  },
  {
    name: 'Background Check',
    category: 'Verification',
    size: '450 KB',
    uploadedAt: 'Jan 1, 2024',
    status: 'Verified',
  },
  {
    name: 'Insurance Certificate',
    category: 'Insurance',
    size: '920 KB',
    uploadedAt: 'Jun 15, 2025',
    status: 'Active',
  },
  {
    name: 'Pet Agreement',
    category: 'Addendum',
    size: '340 KB',
    uploadedAt: 'Mar 10, 2024',
    status: 'Active',
  },
  {
    name: 'Move-in Inspection',
    category: 'Inspection',
    size: '3.1 MB',
    uploadedAt: 'Jan 1, 2024',
    status: 'Completed',
  },
  {
    name: 'Parking Agreement',
    category: 'Addendum',
    size: '290 KB',
    uploadedAt: 'Jan 1, 2024',
    status: 'Active',
  },
];

function getStatusBadge(status: DocumentItem['status']) {
  switch (status) {
    case 'Verified':
      return { bg: 'success-subtle', text: 'success', border: 'border-success-subtle' };
    case 'Active':
      return { bg: 'primary-subtle', text: 'primary', border: 'border-primary-subtle' };
    case 'Completed':
      return { bg: 'secondary-subtle', text: 'secondary', border: 'border-secondary-subtle' };
    default:
      return { bg: 'light', text: 'dark', border: 'border-light' };
  }
}

export default function DocumentsPage() {
  return (
    <DashboardLayout role="Tenant">
      <div style={{ background: '#f5f7fb', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <div className="mb-3">
            <h2 className="h3 mb-1">Secure Documents</h2>
            <p className="text-muted mb-0">All documents are encrypted and securely stored</p>
          </div>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Body className="py-3">
              <div className="d-flex align-items-start gap-3">
                <div className="bg-success-subtle p-2 rounded-3">
                  <BsShieldCheck className="text-success" />
                </div>
                <div>
                  <div className="fw-semibold text-success">256-bit Encryption Active</div>
                  <small className="text-success-emphasis">
                    All documents are encrypted with bank-level security. Only authorized users can access these files.
                  </small>
                </div>
              </div>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-3">
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block">Total Documents</small>
                    <h4 className="mb-0">8</h4>
                  </div>
                  <div className="bg-primary-subtle p-2 rounded-3">
                    <BsFileEarmarkText className="text-primary" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block">Verified</small>
                    <h4 className="mb-0">4</h4>
                  </div>
                  <div className="bg-success-subtle p-2 rounded-3">
                    <BsCheckCircle className="text-success" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block">Encrypted</small>
                    <h4 className="mb-0">8</h4>
                  </div>
                  <div className="bg-light p-2 rounded-3">
                    <BsLock className="text-purple" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3} sm={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body className="d-flex justify-content-between align-items-start">
                  <div>
                    <small className="text-muted d-block">Total Size</small>
                    <h4 className="mb-0">9.5 MB</h4>
                  </div>
                  <div className="bg-warning-subtle p-2 rounded-3">
                    <BsFolder className="text-warning" />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-3">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0">All Documents</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <div className="d-grid gap-2">
                {documentItems.map((item) => {
                  const style = getStatusBadge(item.status);

                  return (
                    <div key={item.name} className="border rounded-3 p-3">
                      <div className="d-flex flex-column flex-lg-row justify-content-between gap-3">
                        <div className="d-flex gap-3">
                          <div className="bg-light rounded-3 p-2 h-100">
                            <BsFileEarmarkText className="text-secondary" />
                          </div>
                          <div>
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <h6 className="mb-0">{item.name}</h6>
                              <Badge bg={style.bg} text={style.text} className={`border ${style.border}`}>
                                {item.status}
                              </Badge>
                            </div>
                            <small className="text-muted">
                              {item.category} • {item.size} • Uploaded: {item.uploadedAt}
                            </small>
                          </div>
                        </div>

                        <div className="d-flex gap-2">
                          <Button variant="light" size="sm" className="border d-flex align-items-center">
                            <BsEye className="me-1" /> View
                          </Button>
                          <Button variant="light" size="sm" className="border d-flex align-items-center">
                            <BsDownload className="me-1" /> Download
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0">Security & Privacy</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              <Row className="g-4">
                <Col md={6}>
                  <h6>Encryption Details</h6>
                  <ul className="mb-0 text-secondary ps-3">
                    <li>AES-256 bit encryption for all documents</li>
                    <li>Secure SSL/TLS connection for file transfers</li>
                    <li>Encrypted backup storage with redundancy</li>
                  </ul>
                </Col>
                <Col md={6}>
                  <h6>Access Control</h6>
                  <ul className="mb-0 text-secondary ps-3">
                    <li>Role-based access permissions</li>
                    <li>Audit trail for all document activities</li>
                    <li>Two-factor authentication enabled</li>
                  </ul>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
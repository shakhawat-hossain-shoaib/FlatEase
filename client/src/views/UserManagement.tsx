import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Modal, Row, Spinner } from 'react-bootstrap';
import { BsClipboard, BsEye, BsEyeSlash, BsPlus } from 'react-icons/bs';
import ApiClient, { BuildingEntity, CreateTenantWithAssignmentResponse, UnitEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';
import toast from 'react-hot-toast';

type FormData = {
  name: string;
  email: string;
  phone: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  nid_number: string;
  job_title: string;
  employer: string;
  building_id: string;
  unit_id: string;
  lease_start_date: string;
  lease_end_date: string;
  rent_amount: string;
};

export default function UserManagement() {
  const api = useMemo(() => new ApiClient(), []);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [buildings, setBuildings] = useState<BuildingEntity[]>([]);
  const [vacantUnits, setVacantUnits] = useState<UnitEntity[]>([]);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    nid_number: '',
    job_title: '',
    employer: '',
    building_id: '',
    unit_id: '',
    lease_start_date: '',
    lease_end_date: '',
    rent_amount: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const [successData, setSuccessData] = useState<CreateTenantWithAssignmentResponse | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoadingBuildings(true);
      const response = await api.getAdminBuildings();
      setBuildings(response ?? []);
      setIsLoadingBuildings(false);
    };
    void loadBuildings();
  }, [api]);

  const handleBuildingChange = async (buildingId: string) => {
    setFormData((prev) => ({ ...prev, building_id: buildingId, unit_id: '' }));

    if (!buildingId) {
      setVacantUnits([]);
      return;
    }

    setIsLoadingUnits(true);
    const vacant = await api.getVacantUnits(Number(buildingId));
    setVacantUnits(vacant ?? []);
    setIsLoadingUnits(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.unit_id) {
      toast.error('Please fill in required fields');
      return;
    }

    setIsLoading(true);
    const response = await api.createTenantWithAssignment({
      name: formData.name,
      email: formData.email,
      phone: formData.phone || undefined,
      emergency_contact_name: formData.emergency_contact_name || undefined,
      emergency_contact_phone: formData.emergency_contact_phone || undefined,
      nid_number: formData.nid_number || undefined,
      job_title: formData.job_title || undefined,
      employer: formData.employer || undefined,
      unit_id: Number(formData.unit_id),
      lease_start_date: formData.lease_start_date || undefined,
      lease_end_date: formData.lease_end_date || undefined,
      rent_amount: formData.rent_amount || undefined,
    });

    if (response?.success) {
      setSuccessData(response);
      setShowCreateModal(false);
      setShowSuccessModal(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        nid_number: '',
        job_title: '',
        employer: '',
        building_id: '',
        unit_id: '',
        lease_start_date: '',
        lease_end_date: '',
        rent_amount: '',
      });
      toast.success('Tenant created and assigned successfully!');
    }
    setIsLoading(false);
  };

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <DashboardLayout role="Admin">
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid py-4">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <div>
              <h2 className="mb-1">User Management</h2>
              <p className="text-muted mb-0">Create and manage tenant accounts</p>
            </div>
            <Button
              variant="primary"
              onClick={() => setShowCreateModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <BsPlus size={20} /> Create Tenant
            </Button>
          </div>

          <Card className="border-0 shadow-sm">
            <Card.Body className="text-center py-8">
              <p className="text-muted mb-0">Tenant management features coming soon...</p>
            </Card.Body>
          </Card>
        </div>
      </div>

      {/* Create Tenant Modal */}
      <Modal show={showCreateModal} onHide={() => setShowCreateModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Create New Tenant</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Full Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Enter tenant name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Email *</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter email"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>NID Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="nid_number"
                    value={formData.nid_number}
                    onChange={handleInputChange}
                    placeholder="Enter NID"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Job Title</Form.Label>
                  <Form.Control
                    type="text"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleInputChange}
                    placeholder="Enter job title"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Employer</Form.Label>
                  <Form.Control
                    type="text"
                    name="employer"
                    value={formData.employer}
                    onChange={handleInputChange}
                    placeholder="Enter employer name"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="emergency_contact_name"
                    value={formData.emergency_contact_name}
                    onChange={handleInputChange}
                    placeholder="Enter emergency contact name"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Emergency Contact Phone</Form.Label>
                  <Form.Control
                    type="tel"
                    name="emergency_contact_phone"
                    value={formData.emergency_contact_phone}
                    onChange={handleInputChange}
                    placeholder="Enter emergency contact phone"
                  />
                </Form.Group>
              </Col>
            </Row>

            <hr />

            <h6 className="mb-3">Unit Assignment</h6>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Building *</Form.Label>
                  {isLoadingBuildings ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <Form.Select
                      name="building_id"
                      value={formData.building_id}
                      onChange={(e) => void handleBuildingChange(e.target.value)}
                      required
                    >
                      <option value="">-- Select Building --</option>
                      {buildings.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit *</Form.Label>
                  {isLoadingUnits ? (
                    <Spinner animation="border" size="sm" />
                  ) : vacantUnits.length === 0 ? (
                    <Form.Control disabled placeholder="No vacant units available" />
                  ) : (
                    <Form.Select
                      name="unit_id"
                      value={formData.unit_id}
                      onChange={handleInputChange}
                      required
                    >
                      <option value="">-- Select Unit --</option>
                      {vacantUnits.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.unit_number} (Vacant)
                        </option>
                      ))}
                    </Form.Select>
                  )}
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lease Start Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="lease_start_date"
                    value={formData.lease_start_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Lease End Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="lease_end_date"
                    value={formData.lease_end_date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Monthly Rent</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    name="rent_amount"
                    value={formData.rent_amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowCreateModal(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={(e) => void handleSubmit(e as React.FormEvent)}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating...
              </>
            ) : (
              'Create & Assign'
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Success Modal */}
      <Modal show={showSuccessModal} onHide={() => setShowSuccessModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Tenant Created Successfully!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {successData && (
            <div>
              <div className="alert alert-success mb-4">
                <strong>Tenant assigned to unit {successData.assignment.unit_number}</strong>
              </div>

              <div className="mb-4">
                <h6 className="mb-3">Tenant Credentials</h6>
                <Card className="border">
                  <Card.Body>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Name</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="text"
                          readOnly
                          value={successData.tenant.name}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard(successData.tenant.name)}
                        >
                          <BsClipboard />
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold">Email</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type="email"
                          readOnly
                          value={successData.tenant.email}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard(successData.tenant.email)}
                        >
                          <BsClipboard />
                        </Button>
                      </div>
                    </Form.Group>

                    <Form.Group className="mb-0">
                      <Form.Label className="fw-semibold">Password</Form.Label>
                      <div className="d-flex gap-2">
                        <Form.Control
                          type={showPassword ? 'text' : 'password'}
                          readOnly
                          value={successData.tenant.password}
                        />
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          {showPassword ? <BsEyeSlash /> : <BsEye />}
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => copyToClipboard(successData.tenant.password)}
                        >
                          <BsClipboard />
                        </Button>
                      </div>
                    </Form.Group>
                  </Card.Body>
                </Card>
              </div>

              <div className="alert alert-info">
                <small>Share these credentials with the tenant. They can use the email and password to login and upload their required documents.</small>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="primary"
            onClick={() => setShowSuccessModal(false)}
          >
            Done
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

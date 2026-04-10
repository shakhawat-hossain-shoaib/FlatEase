import { useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { BsChatDots, BsInfoCircle, BsSend } from 'react-icons/bs';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ApiClient, { ComplaintPriority } from '../../api';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';

export default function SubmitComplaint() {
  const api = useMemo(() => new ApiClient(), []);
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    category: '',
    description: '',
    priority: 'medium' as ComplaintPriority,
  });

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((previous) => ({ ...previous, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.category.trim() || !form.description.trim()) {
      toast.error('Please complete all complaint fields.');
      return;
    }

    setIsSaving(true);
    const created = await api.createComplaint({
      title: form.title.trim(),
      category: form.category.trim(),
      description: form.description.trim(),
      priority: form.priority,
    });
    setIsSaving(false);

    if (!created) {
      return;
    }

    toast.success('Complaint submitted successfully.');
    navigate('/tenant/complaints');
  };

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Submit Complaint"
            subtitle="Report maintenance issues, apartment problems, or service concerns from the tenant portal."
          />

          <Row className="g-3">
            <Col xl={8}>
              <AdminSectionCard title="Complaint Details">
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Title</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.title}
                      onChange={(event) => handleChange('title', event.target.value)}
                      placeholder="Short summary of the issue"
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Category</Form.Label>
                    <Form.Control
                      type="text"
                      value={form.category}
                      onChange={(event) => handleChange('category', event.target.value)}
                      placeholder="Plumbing, electricity, noise, security, etc."
                    />
                  </Form.Group>

                  <Row className="g-3 mb-3">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label>Priority</Form.Label>
                        <Form.Select
                          value={form.priority}
                          onChange={(event) => handleChange('priority', event.target.value)}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <Form.Group className="mb-4">
                    <Form.Label>Description</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      value={form.description}
                      onChange={(event) => handleChange('description', event.target.value)}
                      placeholder="Describe the issue clearly, including timing, location, and any urgent details."
                    />
                  </Form.Group>

                  <div className="d-flex flex-wrap gap-2">
                    <Button onClick={() => void handleSubmit()} disabled={isSaving}>
                      <BsSend className="me-1" />
                      {isSaving ? 'Submitting...' : 'Submit Complaint'}
                    </Button>
                    <Button variant="outline-secondary" onClick={() => navigate('/tenant/complaints')}>
                      Cancel
                    </Button>
                  </div>
                </Form>
              </AdminSectionCard>
            </Col>

            <Col xl={4}>
              <Card className="admin-card border-0 h-100">
                <Card.Body>
                  <div className="d-flex align-items-start gap-3 mb-4">
                    <div className="bg-info-subtle rounded-3 p-3">
                      <BsChatDots className="text-info" size={22} />
                    </div>
                    <div>
                      <h5 className="mb-1">What happens next</h5>
                      <p className="text-muted mb-0">Your complaint will appear in My Complaints and move through the maintenance workflow.</p>
                    </div>
                  </div>

                  <div className="d-grid gap-3">
                    <div className="d-flex gap-3">
                      <div className="bg-warning-subtle rounded-3 p-2 h-100">
                        <BsInfoCircle className="text-warning" />
                      </div>
                      <div>
                        <div className="fw-semibold mb-1">Be specific</div>
                        <div className="text-muted small">Include the unit area, time, and any safety or access concerns.</div>
                      </div>
                    </div>
                    <div className="d-flex gap-3">
                      <div className="bg-success-subtle rounded-3 p-2 h-100">
                        <BsChatDots className="text-success" />
                      </div>
                      <div>
                        <div className="fw-semibold mb-1">Track progress</div>
                        <div className="text-muted small">You can monitor the status from the complaints list after submission.</div>
                      </div>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </div>
    </TenantLayout>
  );
}
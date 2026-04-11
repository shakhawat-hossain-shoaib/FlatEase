import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { BsCheckCircle, BsCloudArrowUp, BsFileEarmarkText, BsTrash } from 'react-icons/bs';
import ApiClient, { TenantDocumentChecklistItem, TenantDocumentEntity } from '../api';
import { DashboardLayout } from '../../shared/layouts/DashboardLayout';

function bytesToMb(sizeInBytes: number): string {
  return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getStatusBadge(status: TenantDocumentEntity['status']) {
  if (status === 'approved') {
    return { bg: 'success', label: 'Approved' };
  }

  if (status === 'rejected') {
    return { bg: 'danger', label: 'Rejected' };
  }

  if (status === 'under_review') {
    return { bg: 'warning', label: 'Under Review' };
  }

  return { bg: 'secondary', label: 'Uploaded' };
}

export default function DocumentsPage() {
  const api = useMemo(() => new ApiClient(), []);
  const [checklist, setChecklist] = useState<TenantDocumentChecklistItem[]>([]);
  const [documents, setDocuments] = useState<TenantDocumentEntity[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const [checklistResponse, docsResponse] = await Promise.all([
      api.getTenantDocumentChecklist(),
      api.getTenantDocuments(),
    ]);

    setChecklist(checklistResponse ?? []);
    setDocuments(docsResponse ?? []);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const requiredCount = checklist.filter((item) => item.is_required).length;
  const uploadedRequiredCount = checklist.filter((item) => item.is_required && item.uploaded).length;

  const onFilePick = (typeId: number, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setSelectedFiles((prev) => ({ ...prev, [typeId]: file }));
  };

  const upload = async (item: TenantDocumentChecklistItem) => {
    const file = selectedFiles[item.document_type_id];

    if (!file) {
      toast.error('Please select a file before uploading.');
      return;
    }

    const maxBytes = item.max_size_mb * 1024 * 1024;
    if (file.size > maxBytes) {
      toast.error(`File exceeds ${item.max_size_mb} MB limit for ${item.label}.`);
      return;
    }

    setUploadingTypeId(item.document_type_id);
    const response = await api.uploadTenantDocument(item.document_type_id, file);
    setUploadingTypeId(null);

    if (response) {
      toast.success(`${item.label} uploaded successfully.`);
      setSelectedFiles((prev) => ({ ...prev, [item.document_type_id]: null }));
      await refreshData();
    }
  };

  const deleteDocument = async (documentId: number) => {
    const response = await api.deleteTenantDocument(documentId);
    if (response?.success) {
      toast.success('Document deleted successfully.');
      await refreshData();
    }
  };

  return (
    <DashboardLayout role="Tenant">
      <div style={{ background: '#f5f7fb', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <div className="mb-4">
            <h2 className="h3 mb-1">Documents</h2>
            <p className="text-muted mb-0">
              Upload required identity and employment documents. Required completed: {uploadedRequiredCount}/{requiredCount}
            </p>
          </div>

          <Row className="g-3 mb-4">
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <small className="text-muted d-block">Required Documents</small>
                  <h4 className="mb-0">{requiredCount}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <small className="text-muted d-block">Uploaded</small>
                  <h4 className="mb-0">{documents.length}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0">Required Upload Checklist</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {isLoading && <p className="text-muted mb-0">Loading document requirements...</p>}

              {!isLoading && checklist.length === 0 && <p className="text-muted mb-0">No document types configured yet.</p>}

              <div className="d-grid gap-3">
                {checklist.map((item) => (
                  <Card key={item.document_type_id} className="border">
                    <Card.Body className="py-3">
                      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                        <div>
                          <div className="d-flex align-items-center gap-2 mb-1">
                            <h6 className="mb-0">{item.label}</h6>
                            {item.uploaded ? <BsCheckCircle className="text-success" /> : null}
                            <Badge bg={item.uploaded ? 'success' : 'secondary'}>{item.uploaded ? 'Uploaded' : 'Pending'}</Badge>
                          </div>
                          <small className="text-muted d-block">
                            Accepted: {item.allowed_mimes.join(', ')}
                          </small>
                          <small className="text-muted d-block">Max size: {item.max_size_mb} MB</small>
                        </div>

                        <div className="d-flex flex-column flex-sm-row gap-2">
                          <Form.Control
                            type="file"
                            accept={item.allowed_mimes.join(',')}
                            onChange={(event) => onFilePick(item.document_type_id, event)}
                          />
                          <Button
                            variant="primary"
                            onClick={() => void upload(item)}
                            disabled={uploadingTypeId === item.document_type_id}
                          >
                            <BsCloudArrowUp className="me-1" />
                            {uploadingTypeId === item.document_type_id ? 'Uploading...' : 'Upload'}
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 px-4">
              <h5 className="mb-0">My Uploaded Documents</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {documents.length === 0 && <p className="text-muted mb-0">No documents uploaded yet.</p>}

              <div className="d-grid gap-2">
                {documents.map((doc) => {
                  const type = doc.document_type ?? doc.documentType;
                  const badge = getStatusBadge(doc.status);

                  return (
                    <Card key={doc.id} className="border">
                      <Card.Body className="py-3">
                        <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3">
                          <div>
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <BsFileEarmarkText />
                              <span className="fw-semibold">{type?.label ?? 'Document'}</span>
                              <Badge bg={badge.bg}>{badge.label}</Badge>
                            </div>
                            <small className="text-muted d-block">{doc.original_filename}</small>
                            <small className="text-muted d-block">{bytesToMb(doc.file_size_bytes)}</small>
                            {doc.rejection_reason ? (
                              <small className="text-danger d-block">Rejection reason: {doc.rejection_reason}</small>
                            ) : null}
                          </div>

                          <div className="d-flex gap-2">
                            {doc.can_view !== false ? (
                              <Button
                                variant="outline-primary"
                                size="sm"
                                onClick={() => void api.openTenantDocument(doc.id)}
                              >
                                Open
                              </Button>
                            ) : (
                              <Button variant="outline-secondary" size="sm" disabled>
                                Admin Only
                              </Button>
                            )}
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => void deleteDocument(doc.id)}
                            >
                              <BsTrash className="me-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  );
                })}
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { ChangeEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Row } from 'react-bootstrap';
import { BsCheckCircle, BsCloudArrowUp, BsDownload, BsFileEarmarkText, BsShieldLock, BsTrash } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient, { TenantDocumentChecklistItem, TenantDocumentEntity } from '../../api';
import { AdminEmptyState } from '../../shared/components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../shared/components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../shared/components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDate } from '../tenantUtils';

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

export default function MyDocuments() {
  const api = useMemo(() => new ApiClient(), []);
  const [checklist, setChecklist] = useState<TenantDocumentChecklistItem[]>([]);
  const [documents, setDocuments] = useState<TenantDocumentEntity[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File | null>>({});
  const [uploadingTypeId, setUploadingTypeId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    const [checklistResponse, docsResponse] = await Promise.all([api.getTenantDocumentChecklist(), api.getTenantDocuments()]);

    setChecklist(checklistResponse ?? []);
    setDocuments(docsResponse ?? []);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const requiredCount = checklist.filter((item) => item.is_required).length;
  const uploadedRequiredCount = checklist.filter((item) => item.is_required && item.uploaded).length;
  const nidChecklist = checklist.find((item) => item.type_key.toLowerCase().includes('nid')) ?? null;
  const leaseChecklist = checklist.find((item) => item.type_key.toLowerCase().includes('lease')) ?? null;

  const onFilePick = (typeId: number, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    setSelectedFiles((previous) => ({ ...previous, [typeId]: file }));
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
      setSelectedFiles((previous) => ({ ...previous, [item.document_type_id]: null }));
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
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="My Documents"
            subtitle="View and manage your secure identity, lease, and supporting documents."
          />

          <Card className="admin-card border-0 mb-4">
            <Card.Body className="d-flex align-items-start gap-3">
              <div className="bg-success-subtle p-3 rounded-3">
                <BsShieldLock className="text-success" size={22} />
              </div>
              <div>
                <div className="fw-semibold text-success mb-1">Encrypted document storage is active</div>
                <small className="text-muted">All tenant documents are stored securely and can only be opened through the tenant portal.</small>
              </div>
            </Card.Body>
          </Card>

          <Row className="g-3 mb-4">
            <Col md={3}>
              <Card className="admin-card border-0 h-100">
                <Card.Body>
                  <small className="text-muted d-block">Required Documents</small>
                  <h4 className="mb-0">{requiredCount}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-card border-0 h-100">
                <Card.Body>
                  <small className="text-muted d-block">Uploaded Required</small>
                  <h4 className="mb-0">{uploadedRequiredCount}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-card border-0 h-100">
                <Card.Body>
                  <small className="text-muted d-block">Total Documents</small>
                  <h4 className="mb-0">{documents.length}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="admin-card border-0 h-100">
                <Card.Body>
                  <small className="text-muted d-block">Current Categories</small>
                  <h4 className="mb-0">{checklist.length}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Row className="g-3 mb-4">
            <Col lg={6}>
              <AdminSectionCard className="h-100" title="NID Status">
                {nidChecklist ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold mb-1">{nidChecklist.label}</div>
                        <div className="text-muted small">Accepted: {nidChecklist.allowed_mimes.join(', ')}</div>
                        <div className="text-muted small">Max size: {nidChecklist.max_size_mb} MB</div>
                      </div>
                      <Badge bg={nidChecklist.uploaded ? 'success' : 'secondary'}>{nidChecklist.uploaded ? 'Uploaded' : 'Pending'}</Badge>
                    </div>
                    {nidChecklist.latest_document ? (
                      <div className="admin-list-row py-3">
                        <div className="d-flex justify-content-between align-items-start gap-3">
                          <div>
                            <strong>{nidChecklist.latest_document.original_filename}</strong>
                            <div className="small text-muted">{bytesToMb(nidChecklist.latest_document.file_size_bytes)} · {formatDate(nidChecklist.latest_document.created_at)}</div>
                          </div>
                          <div className="d-flex gap-2">
                            <Button variant="outline-primary" size="sm" onClick={() => void api.openTenantDocument(nidChecklist.latest_document!.id)}>
                              Open
                            </Button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <AdminEmptyState icon={BsFileEarmarkText} title="No NID uploaded" message="Upload your NID to keep your tenant profile complete." compact />
                    )}
                  </div>
                ) : (
                  <AdminEmptyState icon={BsFileEarmarkText} title="No NID checklist" message="Document checklist is not configured yet." compact />
                )}
              </AdminSectionCard>
            </Col>

            <Col lg={6}>
              <AdminSectionCard className="h-100" title="Lease Agreement Status">
                {leaseChecklist ? (
                  <div className="d-flex flex-column gap-3">
                    <div className="d-flex justify-content-between align-items-start gap-3">
                      <div>
                        <div className="fw-semibold mb-1">{leaseChecklist.label}</div>
                        <div className="text-muted small">Stored with encrypted access controls</div>
                        <div className="text-muted small">Latest upload: {leaseChecklist.latest_document ? formatDate(leaseChecklist.latest_document.created_at) : 'N/A'}</div>
                      </div>
                      <Badge bg={leaseChecklist.uploaded ? 'success' : 'warning'}>{leaseChecklist.uploaded ? 'Available' : 'Pending'}</Badge>
                    </div>
                    {leaseChecklist.latest_document ? (
                      <div className="d-flex justify-content-between align-items-center gap-3">
                        <div>
                          <strong>{leaseChecklist.latest_document.original_filename}</strong>
                          <div className="small text-muted">{bytesToMb(leaseChecklist.latest_document.file_size_bytes)}</div>
                        </div>
                        <Button variant="outline-primary" size="sm" onClick={() => void api.openTenantDocument(leaseChecklist.latest_document!.id)}>
                          Open
                        </Button>
                      </div>
                    ) : (
                      <AdminEmptyState icon={BsShieldLock} title="No lease agreement uploaded" message="The lease agreement will be visible here once it is attached to your account." compact />
                    )}
                  </div>
                ) : (
                  <AdminEmptyState icon={BsShieldLock} title="No lease agreement checklist" message="Document checklist is not configured yet." compact />
                )}
              </AdminSectionCard>
            </Col>
          </Row>

          <AdminSectionCard className="mb-4" title="Required Upload Checklist">
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
                        <small className="text-muted d-block">Accepted: {item.allowed_mimes.join(', ')}</small>
                        <small className="text-muted d-block">Max size: {item.max_size_mb} MB</small>
                      </div>

                      <div className="d-flex flex-column flex-sm-row gap-2">
                        <Form.Control type="file" accept={item.allowed_mimes.join(',')} onChange={(event) => onFilePick(item.document_type_id, event)} />
                        <Button variant="primary" onClick={() => void upload(item)} disabled={uploadingTypeId === item.document_type_id}>
                          <BsCloudArrowUp className="me-1" />
                          {uploadingTypeId === item.document_type_id ? 'Uploading...' : 'Upload'}
                        </Button>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              ))}
            </div>
          </AdminSectionCard>

          <AdminSectionCard title="My Uploaded Documents">
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
                          {doc.rejection_reason ? <small className="text-danger d-block">Rejection reason: {doc.rejection_reason}</small> : null}
                        </div>

                        <div className="d-flex gap-2">
                          {doc.can_view !== false ? (
                            <Button variant="outline-primary" size="sm" onClick={() => void api.openTenantDocument(doc.id)}>
                              <BsDownload className="me-1" /> Open
                            </Button>
                          ) : (
                            <Button variant="outline-secondary" size="sm" disabled>
                              Admin Only
                            </Button>
                          )}
                          <Button variant="outline-danger" size="sm" onClick={() => void deleteDocument(doc.id)}>
                            <BsTrash className="me-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </Card.Body>
                  </Card>
                );
              })}
            </div>
          </AdminSectionCard>
        </div>
      </div>
    </TenantLayout>
  );
}
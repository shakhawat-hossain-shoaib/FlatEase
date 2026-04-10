import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { BsCashCoin, BsCreditCard2Front, BsPeople } from 'react-icons/bs';
import ApiClient, { AdminTenantPaymentOption, TenantPaymentRecordEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../components/admin/AdminSectionCard';
import toast from 'react-hot-toast';

function formatMoney(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) {
    return 'BDT 0.00';
  }

  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

function statusBadge(status: TenantPaymentRecordEntity['status']) {
  if (status === 'paid') {
    return 'success';
  }

  if (status === 'overdue') {
    return 'danger';
  }

  if (status === 'partially_paid') {
    return 'warning';
  }

  return 'secondary';
}

export default function AdminPaymentsPage() {
  const api = useMemo(() => new ApiClient(), []);

  const [tenants, setTenants] = useState<AdminTenantPaymentOption[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [payments, setPayments] = useState<TenantPaymentRecordEntity[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(true);
  const [isLoadingPayments, setIsLoadingPayments] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState<TenantPaymentRecordEntity | null>(null);
  const [amountPaid, setAmountPaid] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [transactionRef, setTransactionRef] = useState('');
  const [notes, setNotes] = useState('');
  const [markPaid, setMarkPaid] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const selectedTenant = tenants.find((tenant) => String(tenant.id) === selectedTenantId);

  useEffect(() => {
    const loadTenants = async () => {
      setIsLoadingTenants(true);
      try {
        const response = await api.getAdminTenantPaymentOptions();
        const items = response ?? [];
        setTenants(items);
        if (items.length > 0) {
          setSelectedTenantId(String(items[0].id));
        } else {
          setSelectedTenantId('');
        }
      } catch {
        setTenants([]);
        setSelectedTenantId('');
        toast.error('Failed to load tenants.');
      } finally {
        setIsLoadingTenants(false);
      }
    };

    void loadTenants();
  }, [api]);

  useEffect(() => {
    if (!selectedTenantId) {
      setPayments([]);
      return;
    }

    const loadPayments = async () => {
      setIsLoadingPayments(true);
      try {
        const response = await api.getAdminTenantPayments(Number(selectedTenantId));
        setPayments(response?.data ?? []);
      } catch {
        setPayments([]);
        toast.error('Failed to load payments.');
      } finally {
        setIsLoadingPayments(false);
      }
    };

    void loadPayments();
  }, [api, selectedTenantId]);

  const openEditModal = (payment: TenantPaymentRecordEntity) => {
    setEditingPayment(payment);
    setAmountPaid(String(payment.amount_paid ?? ''));
    setPaymentMethod(payment.payment_method ?? '');
    setTransactionRef(payment.transaction_ref ?? '');
    setNotes(payment.notes ?? '');
    setMarkPaid(false);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!editingPayment) {
      return;
    }

    const parsedAmountPaid = Number(amountPaid);
    if (!markPaid && (Number.isNaN(parsedAmountPaid) || parsedAmountPaid < 0)) {
      toast.error('Please enter a valid amount paid.');
      return;
    }

    setIsSaving(true);
    try {
      const response = await api.updateAdminPayment(editingPayment.id, {
        amount_paid: markPaid ? undefined : parsedAmountPaid,
        payment_method: paymentMethod || undefined,
        transaction_ref: transactionRef || undefined,
        notes: notes || undefined,
        mark_paid: markPaid,
      });

      if (response) {
        setPayments((prev) => prev.map((item) => (item.id === response.id ? response : item)));
        toast.success('Payment updated successfully.');
        setShowModal(false);
        setEditingPayment(null);
      }
    } catch {
      toast.error('Failed to update payment.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout role="Admin">
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Payment Management"
            subtitle="Manage tenant monthly payment records and payment status."
          />

          <AdminSectionCard className="mb-3" title="Tenant Selector">
              <Row className="g-3 align-items-end">
                <Col md={8} lg={6}>
                  <Form.Label>Select Tenant</Form.Label>
                  <Form.Select
                    value={selectedTenantId}
                    onChange={(event) => setSelectedTenantId(event.target.value)}
                    disabled={isLoadingTenants}
                  >
                    {isLoadingTenants && <option>Loading tenants...</option>}
                    {!isLoadingTenants && tenants.length === 0 && <option>No active tenant found</option>}
                    {!isLoadingTenants &&
                      tenants.map((tenant) => (
                        <option key={tenant.id} value={tenant.id}>
                          {tenant.name} ({tenant.email}) {tenant.unit_number ? `- Unit ${tenant.unit_number}` : ''}
                        </option>
                      ))}
                  </Form.Select>
                </Col>
                <Col md={4} lg={6}>
                  {selectedTenant && (
                    <div className="text-muted small d-flex align-items-center gap-2">
                      <BsPeople /> Tenant: <strong>{selectedTenant.name}</strong>
                    </div>
                  )}
                </Col>
              </Row>
          </AdminSectionCard>

          <AdminSectionCard title="Payment Ledger">

              {isLoadingPayments && (
                <div className="d-flex align-items-center gap-2 text-muted py-3">
                  <Spinner animation="border" size="sm" />
                  Loading payments...
                </div>
              )}

              {!isLoadingPayments && payments.length === 0 && (
                <AdminEmptyState
                  icon={BsCashCoin}
                  title="No payment records"
                  message="No payment records were found for the selected tenant."
                />
              )}

              {!isLoadingPayments && payments.length > 0 && (
                <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Due Date</th>
                      <th>Total</th>
                      <th>Paid</th>
                      <th>Status</th>
                      <th>Paid At</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td>{formatDate(payment.billing_month)}</td>
                        <td>{formatDate(payment.due_date)}</td>
                        <td>{formatMoney(payment.total_amount)}</td>
                        <td>{formatMoney(payment.amount_paid)}</td>
                        <td>
                          <Badge className={`text-capitalize badge-soft-${statusBadge(payment.status)}`}>
                            {payment.status.split('_').join(' ')}
                          </Badge>
                        </td>
                        <td>{formatDate(payment.paid_at)}</td>
                        <td className="text-end">
                          <Button size="sm" variant="outline-primary" onClick={() => openEditModal(payment)}>
                            Update
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              )}
          </AdminSectionCard>
        </div>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title className="d-flex align-items-center gap-2"><BsCreditCard2Front /> Update Payment</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Amount Paid</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={amountPaid}
                onChange={(event) => setAmountPaid(event.target.value)}
                disabled={markPaid}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Payment Method</Form.Label>
              <Form.Control
                type="text"
                value={paymentMethod}
                onChange={(event) => setPaymentMethod(event.target.value)}
                placeholder="Cash / Bank / bKash"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Transaction Reference</Form.Label>
              <Form.Control
                type="text"
                value={transactionRef}
                onChange={(event) => setTransactionRef(event.target.value)}
                placeholder="Optional transaction ID"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes"
              />
            </Form.Group>

            <Form.Check
              type="checkbox"
              id="mark-paid-checkbox"
              label="Mark as fully paid"
              checked={markPaid}
              onChange={(event) => setMarkPaid(event.target.checked)}
            />
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

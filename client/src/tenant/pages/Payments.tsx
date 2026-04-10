import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import toast from 'react-hot-toast';
import ApiClient, { TenantMonthlyPaymentSummary } from '../../api';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDate, formatMoney, getPaymentBadgeVariant } from '../tenantUtils';

export default function Payments() {
  const api = useMemo(() => new ApiClient(), []);
  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaying, setIsPaying] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentOption, setPaymentOption] = useState<'full' | 'partial'>('full');
  const [partialAmount, setPartialAmount] = useState('');

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const response = await api.getTenantCurrentPaymentSummary();

      if (!isMounted) {
        return;
      }

      setSummary(response ?? null);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment_status');
    const transactionId = params.get('tran_id');
    const rawAmount = params.get('amount');

    if (!paymentStatus) {
      return;
    }

    const paidAmount = rawAmount ? parseFloat(rawAmount) : NaN;

    if (paymentStatus === 'success') {
      toast.success(transactionId ? `Payment successful. Transaction: ${transactionId}` : 'Payment successful.');
    } else if (paymentStatus === 'failed') {
      toast.error(transactionId ? `Payment failed. Transaction: ${transactionId}` : 'Payment failed.');
    } else if (paymentStatus === 'cancelled') {
      toast('Payment was cancelled.');
    }

    params.delete('payment_status');
    params.delete('tran_id');
    params.delete('amount');
    const queryString = params.toString();
    window.history.replaceState({}, '', queryString ? `${window.location.pathname}?${queryString}` : window.location.pathname);
  }, []);

  const handleOpenPaymentModal = () => {
    if (!summary?.next_payment?.id) {
      toast.error('No payable record found for this month.');
      return;
    }

    if (summary.total_due <= 0 || summary.status === 'paid') {
      toast.success('This payment is already cleared.');
      return;
    }

    setPaymentOption('full');
    setPartialAmount('');
    setShowPaymentModal(true);
  };

  const handlePayNow = async () => {
    if (!summary?.next_payment?.id) {
      toast.error('No payable record found for this month.');
      return;
    }

    let payAmount: number | undefined;
    if (paymentOption === 'partial') {
      payAmount = parseFloat(partialAmount);
      if (isNaN(payAmount) || payAmount <= 0) {
        toast.error('Please enter a valid amount.');
        return;
      }
      if (payAmount > summary.total_due) {
        toast.error(`Amount cannot exceed BDT ${summary.total_due.toFixed(2)}`);
        return;
      }
    }

    setIsPaying(true);
    setShowPaymentModal(false);
    const response = await api.initiateTenantSslCommerzPayment(summary.next_payment.id, payAmount);
    setIsPaying(false);

    if (!response?.gateway_url) {
      return;
    }

    window.location.href = response.gateway_url;
  };

  const utilityRows = (summary?.charges ?? []).filter((item) => item.category === 'utility');

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Payments"
            subtitle="Review your billing summary, payment history, and complete payment through SSLCommerz."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading payment summary...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !summary && (
            <AdminEmptyState icon={BsCashStack} title="Payment summary unavailable" message="We could not load your tenant payment summary right now." />
          )}

          {!isLoading && summary && (
            <>
              <Row className="g-3 mb-4">
                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Billing Month</div>
                      <h5 className="mb-0">{summary.month}</h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Due Date</div>
                      <h5 className="mb-0">{formatDate(summary.due_date)}</h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="admin-card border-0 h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Total Due</div>
                      <h5 className="mb-0">{formatMoney(summary.total_due, summary.currency)}</h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col lg={8}>
                  <AdminSectionCard title="Charge Breakdown">
                    <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Type</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.charges.map((charge) => (
                          <tr key={charge.key}>
                            <td>{charge.label}</td>
                            <td>
                              <Badge
                                bg={
                                  charge.category === 'rent'
                                    ? 'primary'
                                    : charge.category === 'service'
                                    ? 'info'
                                    : 'secondary'
                                }
                              >
                                {charge.category}
                              </Badge>
                            </td>
                            <td className="text-end fw-semibold">{formatMoney(charge.amount, summary.currency)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </AdminSectionCard>
                </Col>

                <Col lg={4}>
                  <AdminSectionCard className="mb-3" title="Summary">
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Rent</span>
                      <span>{formatMoney(summary.subtotal_rent, summary.currency)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Utility</span>
                      <span>{formatMoney(summary.subtotal_utility, summary.currency)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span className="text-muted">Service Charge</span>
                      <span>{formatMoney(summary.subtotal_service ?? 0, summary.currency)}</span>
                    </div>
                    <hr />
                    <div className="d-flex justify-content-between fw-bold mb-3">
                      <span>Total Due</span>
                      <span>{formatMoney(summary.total_due, summary.currency)}</span>
                    </div>
                    <Button
                      variant="success"
                      className="w-100"
                      onClick={handleOpenPaymentModal}
                      disabled={isPaying || summary.total_due <= 0 || summary.status === 'paid'}
                    >
                      {isPaying ? 'Redirecting to SSLCommerz...' : 'Make Payment'}
                    </Button>
                  </AdminSectionCard>

                  <AdminSectionCard title="Unit">
                    <p className="mb-1">
                      <strong>{summary.unit.unit_number ?? 'N/A'}</strong>
                    </p>
                    <p className="text-muted mb-1">{summary.unit.floor_label ?? 'Floor N/A'}</p>
                    <p className="text-muted mb-0">{summary.unit.building_name ?? 'Building N/A'}</p>
                  </AdminSectionCard>
                </Col>

                <Col lg={12}>
                  <AdminSectionCard title="Payment History">
                    <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Month</th>
                          <th>Due Date</th>
                          <th>Amount</th>
                          <th>Status</th>
                          <th>Paid At</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(summary.recent_payments ?? []).map((payment) => (
                          <tr key={payment.id}>
                            <td>{payment.month}</td>
                            <td>{formatDate(payment.due_date)}</td>
                            <td>{formatMoney(payment.amount, summary.currency)}</td>
                            <td>
                              <Badge bg={getPaymentBadgeVariant(payment.status)}>{payment.status.split('_').join(' ')}</Badge>
                            </td>
                            <td>{payment.paid_at ? formatDate(payment.paid_at) : 'N/A'}</td>
                          </tr>
                        ))}
                        {(summary.recent_payments ?? []).length === 0 && (
                          <tr>
                            <td colSpan={5}>
                              <AdminEmptyState
                                icon={BsCashStack}
                                title="No payments found"
                                message="Payment history will appear here once records are generated."
                                compact
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </AdminSectionCard>
                </Col>
              </Row>

              {utilityRows.length === 0 && (
                <Card className="admin-card border-0 mt-3">
                  <Card.Body className="text-muted">No utility charges configured for this month.</Card.Body>
                </Card>
              )}

              <Modal show={showPaymentModal} onHide={() => setShowPaymentModal(false)} centered>
                <Modal.Header closeButton>
                  <Modal.Title>Choose Payment Type</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                  <Form>
                    <Form.Check
                      type="radio"
                      id="payment-full"
                      name="payment-type"
                      className="mb-2"
                      label={`Full Payment (${formatMoney(summary.total_due, summary.currency)})`}
                      checked={paymentOption === 'full'}
                      onChange={() => setPaymentOption('full')}
                    />
                    <Form.Check
                      type="radio"
                      id="payment-partial"
                      name="payment-type"
                      label="Partial Payment"
                      checked={paymentOption === 'partial'}
                      onChange={() => setPaymentOption('partial')}
                    />

                    {paymentOption === 'partial' && (
                      <div className="mt-3">
                        <Form.Label>Partial Amount</Form.Label>
                        <div className="input-group">
                          <span className="input-group-text">BDT</span>
                          <Form.Control
                            type="number"
                            min="0.01"
                            max={summary.total_due}
                            step="0.01"
                            placeholder={`Enter amount up to ${summary.total_due.toFixed(2)}`}
                            value={partialAmount}
                            onChange={(event) => setPartialAmount(event.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </Form>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={() => setShowPaymentModal(false)} disabled={isPaying}>
                    Cancel
                  </Button>
                  <Button variant="success" onClick={() => void handlePayNow()} disabled={isPaying}>
                    {isPaying ? 'Redirecting...' : 'Continue to SSLCommerz'}
                  </Button>
                </Modal.Footer>
              </Modal>
            </>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
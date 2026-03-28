import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import ApiClient, { TenantMonthlyPaymentSummary } from '../api';
import { DashboardLayout } from './DashboardLayout';

function formatMoney(amount: number, currency: string) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDate(value: string) {
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

export default function TenantPaymentsPage() {
  const api = useMemo(() => new ApiClient(), []);

  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      const response = await api.getTenantCurrentPaymentSummary();

      if (!isMounted) {
        return;
      }

      if (!response) {
        setSummary(null);
        setLoadError('Unable to load payment summary right now.');
        setIsLoading(false);
        return;
      }

      setSummary(response);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const utilityRows = (summary?.charges ?? []).filter((item) => item.category === 'utility');

  return (
    <DashboardLayout role="Tenant">
      <div style={{ background: '#f5f7fb', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <div className="d-flex flex-wrap justify-content-between align-items-center gap-3 mb-4">
            <div>
              <h3 className="h4 mb-1">Payments</h3>
              <p className="text-muted mb-0">Monthly rent and utility bill summary for your current lease.</p>
            </div>
            {summary && (
              <Badge bg={summary.status === 'paid' ? 'success' : 'warning'} className="px-3 py-2 text-uppercase">
                {summary.status}
              </Badge>
            )}
          </div>

          {isLoading && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-5 d-flex justify-content-center align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" />
                Loading payment summary...
              </Card.Body>
            </Card>
          )}

          {!isLoading && loadError && (
            <Card className="border-0 shadow-sm">
              <Card.Body className="py-4">
                <h5 className="mb-2">Payment data unavailable</h5>
                <p className="text-muted mb-0">{loadError}</p>
              </Card.Body>
            </Card>
          )}

          {!isLoading && summary && (
            <>
              <Row className="g-3 mb-3">
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Billing Month</div>
                      <h5 className="mb-0">{summary.month}</h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Due Date</div>
                      <h5 className="mb-0">{formatDate(summary.due_date)}</h5>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <div className="text-muted mb-1">Total Due</div>
                      <h5 className="mb-0">{formatMoney(summary.total_due, summary.currency)}</h5>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col lg={8}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h5 className="mb-3">Charge Breakdown</h5>
                      <Table responsive hover className="align-middle mb-0">
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
                                <Badge bg={charge.category === 'rent' ? 'primary' : 'secondary'}>
                                  {charge.category}
                                </Badge>
                              </td>
                              <td className="text-end fw-semibold">{formatMoney(charge.amount, summary.currency)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </Card.Body>
                  </Card>
                </Col>

                <Col lg={4}>
                  <Card className="border-0 shadow-sm mb-3">
                    <Card.Body>
                      <h6 className="mb-3">Summary</h6>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Rent</span>
                        <span>{formatMoney(summary.subtotal_rent, summary.currency)}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Utility</span>
                        <span>{formatMoney(summary.subtotal_utility, summary.currency)}</span>
                      </div>
                      <hr />
                      <div className="d-flex justify-content-between fw-bold">
                        <span>Total Due</span>
                        <span>{formatMoney(summary.total_due, summary.currency)}</span>
                      </div>
                    </Card.Body>
                  </Card>

                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="mb-3">Unit</h6>
                      <p className="mb-1">
                        <strong>{summary.unit.unit_number ?? 'N/A'}</strong>
                      </p>
                      <p className="text-muted mb-1">{summary.unit.floor_label ?? 'Floor N/A'}</p>
                      <p className="text-muted mb-0">{summary.unit.building_name ?? 'Building N/A'}</p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>

              {utilityRows.length === 0 && (
                <Card className="border-0 shadow-sm mt-3">
                  <Card.Body className="text-muted">No utility charges configured for this month.</Card.Body>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import ApiClient, { AdminDashboardSummary, AppNotificationEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';
import toast from 'react-hot-toast';

function formatMoney(value: number, currency: string) {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AdminDashboard() {
  const api = useMemo(() => new ApiClient(), []);
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [isSendingNotification, setIsSendingNotification] = useState(false);
  const [myNotifications, setMyNotifications] = useState<AppNotificationEntity[]>([]);

  useEffect(() => {
    const loadSummary = async () => {
      setIsLoading(true);
      const [summaryResponse, notificationResponse] = await Promise.all([
        api.getAdminDashboardSummary(),
        api.getNotifications(8),
      ]);
      setSummary(summaryResponse ?? null);
      setMyNotifications(notificationResponse?.data ?? []);
      setIsLoading(false);
    };

    void loadSummary();
  }, [api]);

  const handleCreateNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setIsSendingNotification(true);

    const response = await api.createAdminBroadcastNotification({
      title: notificationTitle.trim(),
      message: notificationMessage.trim(),
    });

    if (response?.success) {
      toast.success(response.message || 'Notification sent successfully.');
      setNotificationTitle('');
      setNotificationMessage('');

      const notificationResponse = await api.getNotifications(8);
      setMyNotifications(notificationResponse?.data ?? []);
    }

    setIsSendingNotification(false);
  };

  const currency = summary?.revenue_overview.currency ?? 'BDT';
  const stats = summary?.stats;

  return (
    <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
      <DashboardLayout role="Admin">
        <div className="container-fluid">
          <h2 className="mb-4">Admin Dashboard</h2>

          {isLoading && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading dashboard data...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !summary && (
            <Card className="border-0 shadow-sm mb-4">
              <Card.Body className="py-4 text-muted">Unable to load dashboard data.</Card.Body>
            </Card>
          )}

          {!isLoading && summary && (
            <>
              <Row className="g-3 mb-4">
                <Col sm={6} md={3}>
                  <Card className="p-3">
                    <h6>Total Tenants</h6>
                    <p className="h4 mb-0">{stats?.total_tenants ?? 0}</p>
                    <small className="text-muted">From users table</small>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="p-3">
                    <h6>Active Leases</h6>
                    <p className="h4 mb-0">{stats?.active_leases ?? 0}</p>
                    <small className="text-muted">Active tenant assignments</small>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="p-3">
                    <h6>Vacant Units</h6>
                    <p className="h4 mb-0">{stats?.vacant_units ?? 0}</p>
                    <small className="text-muted">Currently available</small>
                  </Card>
                </Col>
                <Col sm={6} md={3}>
                  <Card className="p-3">
                    <h6>Total Complaints</h6>
                    <p className="h4 mb-0">{stats?.total_complaints ?? 0}</p>
                    <small className="text-muted">All complaints</small>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <Card className="p-3 h-100">
                    <h6>Revenue Overview</h6>
                    <p className="text-muted mb-2">Expected monthly revenue by building</p>
                    <div className="fw-semibold mb-2">
                      Total Expected: {formatMoney(summary.revenue_overview.total_expected, currency)}
                    </div>
                    <Table responsive size="sm" className="mb-0 align-middle">
                      <thead>
                        <tr>
                          <th>Building</th>
                          <th>Leases</th>
                          <th className="text-end">Expected</th>
                        </tr>
                      </thead>
                      <tbody>
                        {summary.revenue_overview.by_building.map((row) => (
                          <tr key={row.building_id}>
                            <td>{row.building_name}</td>
                            <td>{row.active_leases}</td>
                            <td className="text-end">{formatMoney(row.total_expected, currency)}</td>
                          </tr>
                        ))}
                        {summary.revenue_overview.by_building.length === 0 && (
                          <tr>
                            <td colSpan={3} className="text-muted">No building revenue data available.</td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </Card>
                </Col>

                <Col md={6}>
                  <Card className="p-3 h-100">
                    <h6>Recent Activity</h6>
                    <ul className="list-unstyled mb-0">
                      {summary.recent_activity.map((item, index) => (
                        <li key={`${item.type}-${item.created_at}-${index}`} className="mb-2">
                          <strong>{item.title}</strong> - {item.description}
                          <div className="small text-muted">{item.meta} - {formatDate(item.created_at)}</div>
                        </li>
                      ))}
                      {summary.recent_activity.length === 0 && (
                        <li className="text-muted">No recent payment or complaint activity.</li>
                      )}
                    </ul>
                  </Card>
                </Col>
              </Row>

              <Row className="g-3 mt-4">
                <Col md={12} lg={8}>
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <h6 className="mb-3">Create Notification</h6>
                      <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                          type="text"
                          value={notificationTitle}
                          onChange={(event) => setNotificationTitle(event.target.value)}
                          placeholder="Enter notification title"
                        />
                      </Form.Group>
                      <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          value={notificationMessage}
                          onChange={(event) => setNotificationMessage(event.target.value)}
                          placeholder="Write message for all tenants"
                        />
                      </Form.Group>
                      <Button onClick={handleCreateNotification} disabled={isSendingNotification}>
                        {isSendingNotification ? 'Sending...' : 'Send To Tenants'}
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={12} lg={4}>
                  <Card className="border-0 shadow-sm h-100">
                    <Card.Body>
                      <h6 className="mb-3">My Notifications</h6>
                      <ul className="list-unstyled mb-0">
                        {myNotifications.map((item) => {
                          const title = item.data?.title || item.data?.type || 'Notification';
                          const message = item.data?.message || '';

                          return (
                            <li key={item.id} className="mb-2">
                              <strong>{title}</strong>
                              <div className="small text-muted">{message}</div>
                              <div className="small text-muted">{formatDate(item.created_at)}</div>
                            </li>
                          );
                        })}
                        {myNotifications.length === 0 && <li className="text-muted">No notifications yet.</li>}
                      </ul>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}

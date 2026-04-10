import { useEffect, useMemo, useState } from 'react';
import { Button, Card, Col, Form, Row, Spinner, Table } from 'react-bootstrap';
import { BsBell, BsBuilding, BsCashStack, BsChatDots, BsCurrencyDollar, BsPeople } from 'react-icons/bs';
import ApiClient, { AdminDashboardSummary, AppNotificationEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../components/admin/AdminSectionCard';
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
      try {
        const [summaryResponse, notificationResponse] = await Promise.all([
          api.getAdminDashboardSummary(),
          api.getNotifications(8),
        ]);
        setSummary(summaryResponse ?? null);
        setMyNotifications(notificationResponse?.data ?? []);
      } catch {
        setSummary(null);
        setMyNotifications([]);
        toast.error('Failed to load dashboard data.');
      } finally {
        setIsLoading(false);
      }
    };

    void loadSummary();
  }, [api]);

  const handleCreateNotification = async () => {
    if (!notificationTitle.trim() || !notificationMessage.trim()) {
      toast.error('Title and message are required.');
      return;
    }

    setIsSendingNotification(true);
    try {
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
    } catch {
      toast.error('Failed to send notification.');
    } finally {
      setIsSendingNotification(false);
    }
  };

  const currency = summary?.revenue_overview.currency ?? 'BDT';
  const stats = summary?.stats;
  const revenueRows = summary?.revenue_overview.by_building ?? [];
  const totalRentExpected = revenueRows.reduce((sum, row) => sum + row.rent_expected, 0);
  const totalUtilityExpected = revenueRows.reduce((sum, row) => sum + row.utility_expected, 0);
  const totalLeases = revenueRows.reduce((sum, row) => sum + row.active_leases, 0);
  const averageLeasePrice = totalLeases > 0 ? (totalRentExpected + totalUtilityExpected) / totalLeases : 0;
  const summaryCards = [
    {
      title: 'Total Tenants',
      value: stats?.total_tenants ?? 0,
      subtitle: 'From users table',
      icon: BsPeople,
      accentClass: 'admin-kpi-accent-primary',
    },
    {
      title: 'Active Leases',
      value: stats?.active_leases ?? 0,
      subtitle: 'Active tenant assignments',
      icon: BsCashStack,
      accentClass: 'admin-kpi-accent-info',
    },
    {
      title: 'Vacant Units',
      value: stats?.vacant_units ?? 0,
      subtitle: 'Currently available',
      icon: BsBuilding,
      accentClass: 'admin-kpi-accent-success',
    },
    {
      title: 'Total Complaints',
      value: stats?.total_complaints ?? 0,
      subtitle: 'All complaints',
      icon: BsChatDots,
      accentClass: 'admin-kpi-accent-warning',
    },
  ];

  return (
    <div className="admin-page-bg">
      <DashboardLayout role="Admin">
        <div className="container-fluid admin-page-container admin-dashboard-page">
          <AdminPageHeader
            title="Admin Dashboard"
            subtitle="Track operations, revenue, and resident engagement in one place."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading dashboard data...
              </Card.Body>
            </Card>
          )}

          {!isLoading && !summary && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="py-4">
                <AdminEmptyState
                  icon={BsBell}
                  title="Dashboard unavailable"
                  message="We could not load summary data right now. Please refresh in a moment."
                />
              </Card.Body>
            </Card>
          )}

          {!isLoading && summary && (
            <>
              <Row className="g-3 g-xl-4 mb-4">
                {summaryCards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Col key={item.title} sm={6} md={3}>
                      <Card className={`admin-card admin-metric-card admin-dashboard-kpi border-0 h-100 ${item.accentClass}`}>
                        <Card.Body className="admin-dashboard-kpi-body">
                          <div className="d-flex align-items-start justify-content-between gap-3 mb-3">
                            <div className="admin-metric-label">{item.title}</div>
                            <span className="admin-metric-icon">
                              <Icon size={16} />
                            </span>
                          </div>
                          <div className="admin-metric-value mb-1">{item.value}</div>
                          <small className="text-muted">{item.subtitle}</small>
                        </Card.Body>
                      </Card>
                    </Col>
                  );
                })}
              </Row>

              <Row className="g-3">
                <Col md={6}>
                  <AdminSectionCard
                    className="h-100 admin-dashboard-section"
                    title="Revenue Overview"
                    bodyClassName="pt-2"
                  >
                    <p className="text-muted mb-3">Expected monthly revenue by building</p>
                    <div className="fw-semibold mb-2">
                      Total Expected: {formatMoney(summary.revenue_overview.total_expected, currency)}
                    </div>
                    <Table responsive size="sm" className="admin-table admin-table-hover align-middle">
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
                            <td colSpan={3}>
                              <AdminEmptyState
                                icon={BsCashStack}
                                title="No revenue rows"
                                message="No building revenue data is available for this period."
                                compact
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </AdminSectionCard>
                </Col>

                <Col md={6}>
                  <AdminSectionCard className="h-100 admin-dashboard-section" title="Recent Activity" bodyClassName="pt-2">
                    <ul className="list-unstyled mb-0">
                      {summary.recent_activity.map((item, index) => (
                        <li key={`${item.type}-${item.created_at}-${index}`} className="admin-list-row">
                          <strong>{item.title}</strong> - {item.description}
                          <div className="small text-muted">{item.meta} - {formatDate(item.created_at)}</div>
                        </li>
                      ))}
                      {summary.recent_activity.length === 0 && (
                        <li>
                          <AdminEmptyState
                            icon={BsChatDots}
                            title="No recent activity"
                            message="Payment and complaint updates will show up here."
                            compact
                          />
                        </li>
                      )}
                    </ul>
                  </AdminSectionCard>
                </Col>
              </Row>

              <Row className="g-3 mt-4">
                <Col md={12}>
                  <AdminSectionCard
                    className="admin-dashboard-section"
                    title={
                      <span className="d-flex align-items-center gap-2">
                        <BsCurrencyDollar /> Pricing Breakdown
                      </span>
                    }
                  >
                    <Row className="g-3 mb-3">
                      <Col sm={6} lg={3}>
                        <div className="admin-pricing-kpi">
                          <small className="admin-metric-label d-block">Total Rent Expected</small>
                          <div className="fw-semibold">{formatMoney(totalRentExpected, currency)}</div>
                        </div>
                      </Col>
                      <Col sm={6} lg={3}>
                        <div className="admin-pricing-kpi">
                          <small className="admin-metric-label d-block">Total Utility Expected</small>
                          <div className="fw-semibold">{formatMoney(totalUtilityExpected, currency)}</div>
                        </div>
                      </Col>
                      <Col sm={6} lg={3}>
                        <div className="admin-pricing-kpi">
                          <small className="admin-metric-label d-block">Active Leases</small>
                          <div className="fw-semibold">{totalLeases}</div>
                        </div>
                      </Col>
                      <Col sm={6} lg={3}>
                        <div className="admin-pricing-kpi">
                          <small className="admin-metric-label d-block">Avg Price Per Lease</small>
                          <div className="fw-semibold">{formatMoney(averageLeasePrice, currency)}</div>
                        </div>
                      </Col>
                    </Row>

                    <Table responsive size="sm" className="admin-table admin-table-hover align-middle">
                      <thead>
                        <tr>
                          <th>Building</th>
                          <th className="text-end">Rent</th>
                          <th className="text-end">Utility</th>
                          <th className="text-end">Total</th>
                          <th className="text-end">Per Lease</th>
                        </tr>
                      </thead>
                      <tbody>
                        {revenueRows.map((row) => (
                          <tr key={`pricing-${row.building_id}`}>
                            <td>{row.building_name}</td>
                            <td className="text-end">{formatMoney(row.rent_expected, currency)}</td>
                            <td className="text-end">{formatMoney(row.utility_expected, currency)}</td>
                            <td className="text-end">{formatMoney(row.total_expected, currency)}</td>
                            <td className="text-end">
                              {formatMoney(row.active_leases > 0 ? row.total_expected / row.active_leases : 0, currency)}
                            </td>
                          </tr>
                        ))}
                        {revenueRows.length === 0 && (
                          <tr>
                            <td colSpan={5}>
                              <AdminEmptyState
                                icon={BsCurrencyDollar}
                                title="No pricing data"
                                message="Pricing metrics will appear once lease and building revenue data is available."
                                compact
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </AdminSectionCard>
                </Col>
                <Col md={12} lg={8}>
                  <AdminSectionCard title="Create Notification" className="admin-dashboard-section">
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
                      <Button onClick={handleCreateNotification} disabled={isSendingNotification} className="px-4">
                        {isSendingNotification ? 'Sending...' : 'Send To Tenants'}
                      </Button>
                  </AdminSectionCard>
                </Col>
                <Col md={12} lg={4}>
                  <AdminSectionCard className="h-100 admin-dashboard-section" title="My Notifications">
                      <ul className="list-unstyled mb-0">
                        {myNotifications.map((item) => {
                          const title = item.data?.title || item.data?.type || 'Notification';
                          const message = item.data?.message || '';

                          return (
                            <li key={item.id} className="admin-list-row">
                              <strong>{title}</strong>
                              <div className="small text-muted">{message}</div>
                              <div className="small text-muted">{formatDate(item.created_at)}</div>
                            </li>
                          );
                        })}
                        {myNotifications.length === 0 && (
                          <li>
                            <AdminEmptyState
                              icon={BsBell}
                              title="No notifications yet"
                              message="Broadcast notifications you send will appear here for quick review."
                              compact
                            />
                          </li>
                        )}
                      </ul>
                  </AdminSectionCard>
                </Col>
              </Row>
            </>
          )}
        </div>
      </DashboardLayout>
    </div>
  );
}

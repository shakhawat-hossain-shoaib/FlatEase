import { useEffect, useMemo, useState } from 'react';
import { Badge, Card, Col, Row, Spinner, Table } from 'react-bootstrap';
import { BsBell, BsCalendar2Event, BsCashStack, BsChatDots, BsExclamationTriangle, BsHouseDoor } from 'react-icons/bs';
import ApiClient, { ComplaintEntity, CurrentUserEntity, TenantMonthlyPaymentSummary } from '../../api';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import {
  formatDate,
  formatMoney,
  formatRelativeDays,
  getActiveTenantAssignment,
  getComplaintBadgeVariant,
  getComplaintStatusLabel,
  getPaymentBadgeVariant,
} from '../tenantUtils';

export default function TenantDashboard() {
  const api = useMemo(() => new ApiClient(), []);
  const [currentUser, setCurrentUser] = useState<CurrentUserEntity | null>(null);
  const [summary, setSummary] = useState<TenantMonthlyPaymentSummary | null>(null);
  const [complaints, setComplaints] = useState<ComplaintEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const load = async () => {
      setIsLoading(true);
      const [userResponse, summaryResponse, complaintResponse] = await Promise.all([
        api.getCurrentUser(),
        api.getTenantCurrentPaymentSummary(),
        api.getComplaints('Tenant'),
      ]);

      if (!isMounted) {
        return;
      }

      setCurrentUser(userResponse ?? null);
      setSummary(summaryResponse ?? null);
      setComplaints(complaintResponse?.data ?? []);
      setIsLoading(false);
    };

    void load();

    return () => {
      isMounted = false;
    };
  }, [api]);

  const activeAssignment = getActiveTenantAssignment(currentUser);
  const leaseEndDate = activeAssignment?.lease_end_date ?? null;
  const leaseExpiryText = formatRelativeDays(leaseEndDate);
  const openComplaints = complaints.filter((item) => item.status !== 'resolved').length;
  const unreadNotices = summary?.unread_notice_count ?? 0;
  const currency = summary?.currency ?? 'BDT';

  const cards = [
    {
      title: 'Unit',
      value: activeAssignment?.unit?.unit_number ?? summary?.unit.unit_number ?? 'N/A',
      subtitle: [activeAssignment?.unit?.floor?.floor_label ?? summary?.unit.floor_label, activeAssignment?.unit?.building?.name ?? summary?.unit.building_name]
        .filter(Boolean)
        .join(' · ') || 'No assignment details',
      icon: BsHouseDoor,
      accentClass: 'admin-kpi-accent-primary',
    },
    {
      title: 'Next Payment',
      value: summary ? formatMoney(summary.total_due, currency) : 'N/A',
      subtitle: summary?.due_date ? `Due ${formatDate(summary.due_date)}` : 'Payment summary unavailable',
      icon: BsCashStack,
      accentClass: 'admin-kpi-accent-warning',
    },
    {
      title: 'Lease Status',
      value: leaseEndDate ? leaseExpiryText : 'No expiry loaded',
      subtitle: leaseEndDate ? `Expires ${formatDate(leaseEndDate)}` : 'Lease data comes from the authenticated account',
      icon: BsCalendar2Event,
      accentClass: 'admin-kpi-accent-success',
    },
    {
      title: 'Open Complaints',
      value: String(openComplaints),
      subtitle: `${complaints.length} total requests submitted`,
      icon: BsChatDots,
      accentClass: 'admin-kpi-accent-info',
    },
  ];

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container admin-dashboard-page">
          <AdminPageHeader
            title="Tenant Dashboard"
            subtitle="Track your lease, payments, complaints, and notifications from one place."
          />

          {isLoading && (
            <Card className="admin-card border-0 mb-4">
              <Card.Body className="d-flex align-items-center gap-2 text-muted py-4">
                <Spinner animation="border" size="sm" />
                Loading tenant dashboard...
              </Card.Body>
            </Card>
          )}

          {!isLoading && (
            <>
              {leaseEndDate && (
                <Card className="admin-card border-0 mb-4" style={{ borderLeft: '4px solid #eab308' }}>
                  <Card.Body className="py-4 px-4 d-flex flex-column flex-lg-row justify-content-between gap-3 align-items-lg-center">
                    <div className="d-flex align-items-start gap-3">
                      <div className="bg-warning-subtle rounded-3 p-3">
                        <BsExclamationTriangle className="text-warning" size={22} />
                      </div>
                      <div>
                        <div className="text-muted mb-1">Lease reminder</div>
                        <h5 className="mb-1">{leaseExpiryText}</h5>
                        <p className="text-muted mb-0">Lease ends on {formatDate(leaseEndDate)}. Review renewal terms before the expiry date.</p>
                      </div>
                    </div>
                    <Badge bg={leaseEndDate ? 'warning' : 'secondary'} text={leaseEndDate ? 'dark' : undefined} className="px-3 py-2">
                      {leaseEndDate ? 'Renewal review needed' : 'No lease date'}
                    </Badge>
                  </Card.Body>
                </Card>
              )}

              <Row className="g-3 g-xl-4 mb-4">
                {cards.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Col key={item.title} sm={6} xl={3}>
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
                <Col xl={7}>
                  <AdminSectionCard className="h-100 admin-dashboard-section" title="Recent Complaints" bodyClassName="pt-2">
                    <Table responsive size="sm" className="admin-table admin-table-hover align-middle mb-0">
                      <thead>
                        <tr>
                          <th>Title</th>
                          <th>Category</th>
                          <th>Status</th>
                          <th className="text-end">Created</th>
                        </tr>
                      </thead>
                      <tbody>
                        {complaints.slice(0, 5).map((complaint) => (
                          <tr key={complaint.id}>
                            <td>
                              <div className="fw-semibold">{complaint.title}</div>
                              <small className="text-muted">Priority {complaint.priority}</small>
                            </td>
                            <td>{complaint.category}</td>
                            <td>
                              <Badge bg={getComplaintBadgeVariant(complaint.status)}>{getComplaintStatusLabel(complaint.status)}</Badge>
                            </td>
                            <td className="text-end">{formatDate(complaint.created_at)}</td>
                          </tr>
                        ))}
                        {complaints.length === 0 && (
                          <tr>
                            <td colSpan={4}>
                              <AdminEmptyState
                                icon={BsChatDots}
                                title="No complaints yet"
                                message="Your complaint history will appear here after you submit a request."
                                compact
                              />
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </AdminSectionCard>
                </Col>

                <Col xl={5}>
                  <AdminSectionCard className="h-100 admin-dashboard-section" title="Upcoming Payments" bodyClassName="pt-2">
                    <div className="fw-semibold mb-3">
                      {summary ? formatMoney(summary.total_due, currency) : 'No payment summary available'}
                    </div>
                    <div className="d-grid gap-3">
                      {(summary?.recent_payments ?? []).slice(0, 4).map((payment) => (
                        <div key={payment.id} className="admin-list-row py-3">
                          <div className="d-flex justify-content-between align-items-start gap-3">
                            <div>
                              <strong>{payment.month}</strong>
                              <div className="small text-muted">Due {formatDate(payment.due_date)}</div>
                            </div>
                            <div className="text-end">
                              <div className="fw-semibold">{formatMoney(payment.amount, currency)}</div>
                              <Badge bg={getPaymentBadgeVariant(payment.status)}>{payment.status.split('_').join(' ')}</Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                      {(summary?.recent_payments ?? []).length === 0 && (
                        <AdminEmptyState
                          icon={BsCashStack}
                          title="No recent payments"
                          message="Your payment history will show here once billing data is available."
                          compact
                        />
                      )}
                    </div>
                  </AdminSectionCard>
                </Col>

                <Col xl={12}>
                  <AdminSectionCard className="admin-dashboard-section" title="Notifications" bodyClassName="pt-2">
                    <Row className="g-3">
                      <Col lg={4}>
                        <div className="admin-pricing-kpi h-100">
                          <small className="admin-metric-label d-block">Unread Notifications</small>
                          <div className="fw-semibold">{unreadNotices}</div>
                          <div className="text-muted small mt-1">Recent notices from property management</div>
                        </div>
                      </Col>
                      <Col lg={8}>
                        <div className="d-grid gap-2">
                          {(summary?.notices ?? []).slice(0, 4).map((notice) => (
                            <div key={notice.id} className="admin-list-row py-3">
                              <div className="d-flex justify-content-between align-items-start gap-3">
                                <div>
                                  <strong>{notice.title}</strong>
                                  <div className="small text-muted">{notice.message || 'No details provided.'}</div>
                                </div>
                                <Badge bg={notice.is_read ? 'secondary' : 'primary'}>{notice.is_read ? 'Read' : 'Unread'}</Badge>
                              </div>
                            </div>
                          ))}
                          {(summary?.notices ?? []).length === 0 && (
                            <AdminEmptyState
                              icon={BsBell}
                              title="No notifications yet"
                              message="Tenant notices will appear here as soon as they are posted."
                              compact
                            />
                          )}
                        </div>
                      </Col>
                    </Row>
                  </AdminSectionCard>
                </Col>
              </Row>
            </>
          )}
        </div>
      </div>
    </TenantLayout>
  );
}
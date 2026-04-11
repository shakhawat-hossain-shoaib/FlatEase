import { useCallback, useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Row, Spinner } from 'react-bootstrap';
import { BsBell, BsCheck2Circle, BsEnvelopeOpen, BsEnvelopePaper } from 'react-icons/bs';
import ApiClient, { AppNotificationEntity } from '../../api';
import { AdminEmptyState } from '../../shared/components/admin/AdminEmptyState';
import { AdminPageHeader } from '../../shared/components/admin/AdminPageHeader';
import { AdminSectionCard } from '../../shared/components/admin/AdminSectionCard';
import { TenantLayout } from '../layout/TenantLayout';
import { formatDateTime } from '../tenantUtils';

export default function Notifications() {
  const api = useMemo(() => new ApiClient(), []);
  const [notifications, setNotifications] = useState<AppNotificationEntity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setIsLoading(true);
    const response = await api.getNotifications(50);
    setNotifications(response?.data ?? []);
    setIsLoading(false);
  }, [api]);

  useEffect(() => {
    void loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((notification) => notification.read_at === null).length;

  const markAsRead = async (notificationId: string) => {
    setUpdatingId(notificationId);
    const response = await api.markNotificationRead(notificationId);
    setUpdatingId(null);

    if (!response) {
      return;
    }

    setNotifications((previous) => previous.map((notification) => (notification.id === notificationId ? response : notification)));
  };

  return (
    <TenantLayout>
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader title="Notifications" subtitle="Read notices and mark them as seen from the tenant portal." />

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="admin-card border-0 h-100">
                <Card.Body className="d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <div className="text-muted mb-1">Total</div>
                    <h4 className="mb-0">{notifications.length}</h4>
                  </div>
                  <div className="bg-primary-subtle rounded-3 p-3">
                    <BsBell className="text-primary" size={22} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card border-0 h-100">
                <Card.Body className="d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <div className="text-muted mb-1">Unread</div>
                    <h4 className="mb-0">{unreadCount}</h4>
                  </div>
                  <div className="bg-warning-subtle rounded-3 p-3">
                    <BsEnvelopePaper className="text-warning" size={22} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card border-0 h-100">
                <Card.Body className="d-flex align-items-center justify-content-between gap-3">
                  <div>
                    <div className="text-muted mb-1">Read</div>
                    <h4 className="mb-0">{notifications.length - unreadCount}</h4>
                  </div>
                  <div className="bg-success-subtle rounded-3 p-3">
                    <BsEnvelopeOpen className="text-success" size={22} />
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <AdminSectionCard title="All Notifications">
            {isLoading && (
              <div className="d-flex align-items-center gap-2 text-muted py-3">
                <Spinner animation="border" size="sm" />
                Loading notifications...
              </div>
            )}

            {!isLoading && notifications.length === 0 && (
              <AdminEmptyState icon={BsBell} title="No notifications" message="You will see notices here once the property team sends updates." />
            )}

            {!isLoading && notifications.length > 0 && (
              <div className="d-grid gap-3">
                {notifications.map((notification) => (
                  <div key={notification.id} className="admin-list-row py-3">
                    <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-start gap-3">
                      <div>
                        <div className="d-flex align-items-center gap-2 mb-1">
                          <strong>{notification.data.title ?? notification.data.type ?? 'Notification'}</strong>
                          <Badge bg={notification.read_at ? 'secondary' : 'primary'}>{notification.read_at ? 'Read' : 'Unread'}</Badge>
                        </div>
                        <div className="text-muted small mb-1">{notification.data.message || 'No message provided.'}</div>
                        <div className="text-muted small">{formatDateTime(notification.created_at)}</div>
                      </div>
                      <div className="d-flex align-items-center gap-2">
                        {notification.read_at ? (
                          <Badge bg="success" className="badge-soft-success">
                            <BsCheck2Circle className="me-1" /> Seen
                          </Badge>
                        ) : (
                          <Button size="sm" variant="outline-primary" onClick={() => void markAsRead(notification.id)} disabled={updatingId === notification.id}>
                            {updatingId === notification.id ? 'Marking...' : 'Mark as Read'}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AdminSectionCard>
        </div>
      </div>
    </TenantLayout>
  );
}
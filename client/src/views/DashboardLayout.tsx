import { ReactNode, useMemo, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BsGrid,
  BsBuilding,
  BsPeople,
  BsFolder,
  BsFileEarmarkText,
  BsChatDots,
  BsBoxArrowRight,
} from 'react-icons/bs';
import ApiClient from '../api';
import { clearStoredAuthUser } from '../helpers/auth';

interface DashboardLayoutProps {
  role: 'Admin' | 'Tenant';
  children: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new ApiClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    // Make logout UX immediate: clear local auth state and navigate first.
    // Backend session invalidation is attempted after redirect.
    clearStoredAuthUser();
    navigate('/login', { replace: true });

    try {
      await api.logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const sidebarItems =
    role === 'Admin'
      ? [
          { label: 'Dashboard', icon: BsGrid, to: '/admin' },
          { label: 'Apartments & Tenants', icon: BsBuilding, to: '/admin/apartments' },
          { label: 'Users', icon: BsPeople, to: '/admin/users' },
          { label: 'Lease Details', icon: BsFileEarmarkText, to: '/admin/lease' },
          { label: 'Complaints', icon: BsChatDots, to: '/admin/complaints' },
        ]
      : [
          { label: 'Dashboard', icon: BsGrid, to: '/tenant' },
          { label: 'My Lease', icon: BsFileEarmarkText, to: '/tenant/lease' },
          { label: 'Documents', icon: BsFolder, to: '/tenant/documents' },
          { label: 'Complaints', icon: BsChatDots, to: '/tenant/complaints' },
        ];

  return (
    <div className="d-flex">
      <div
        className="bg-light p-3 border-end"
        style={{ width: '240px', minHeight: '100vh', position: 'fixed' }}
      >
        <h5 className="mb-4">FlatEase</h5>
        <ListGroup variant="flush">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <ListGroup.Item
                key={item.label}
                action
                active={isActive(item.to)}
                className="d-flex align-items-center"
                onClick={() => navigate(item.to)}
              >
                <Icon className="me-2" /> {item.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      <div className="flex-grow-1" style={{ marginLeft: '240px' }}>
        <header className="d-flex justify-content-end align-items-center gap-4 px-4 py-3 border-bottom bg-white">
          <span className="small text-muted mb-0">{role} Portal</span>
          <Button
            variant="link"
            className="d-inline-flex align-items-center gap-1 p-0 text-dark text-decoration-none fw-semibold"
            onClick={handleLogout}
            disabled={isLoggingOut}
          >
            <BsBoxArrowRight size={14} />
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

import { ReactNode, useEffect, useMemo, useState } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BsGrid,
  BsBuilding,
  BsPeople,
  BsCash,
  BsFolder,
  BsChatDots,
  BsBoxArrowRight,
  BsList,
} from 'react-icons/bs';
import ApiClient from '../api';
import { clearStoredAuthUser } from '../helpers/auth';
import { CommandPalette } from '../components/admin/CommandPalette';

interface DashboardLayoutProps {
  role: 'Admin' | 'Tenant' | 'Technician';
  children: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new ApiClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

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
          { label: 'Buildings & Tenants', icon: BsBuilding, to: '/admin/apartments' },
          { label: 'Users', icon: BsPeople, to: '/admin/users' },
          { label: 'Payments', icon: BsCash, to: '/admin/payments' },
          { label: 'Bill & Service Charge', icon: BsCash, to: '/admin/bill-service-charge' },
          { label: 'Complaints', icon: BsChatDots, to: '/admin/complaints' },
        ]
      : role === 'Technician'
      ? [
          { label: 'Dashboard', icon: BsGrid, to: '/technician' },
          { label: 'Assigned Complaints', icon: BsChatDots, to: '/technician/complaints' },
        ]
      : [
          { label: 'Dashboard', icon: BsGrid, to: '/tenant' },
          { label: 'Payments', icon: BsCash, to: '/tenant/payments' },
          { label: 'Documents', icon: BsFolder, to: '/tenant/documents' },
          { label: 'Complaints', icon: BsChatDots, to: '/tenant/complaints' },
        ];

  const isAdmin = role === 'Admin';

  const handleNavigate = (to: string) => {
    navigate(to);
  };

  return (
    <div className={`d-flex ${isAdmin ? 'admin-shell' : ''}`}>
      <div
        className={`admin-sidebar-overlay ${isSidebarOpen ? 'show' : ''}`}
        onClick={() => setIsSidebarOpen(false)}
        aria-hidden="true"
      />
      <div
        className={`bg-light p-3 border-end ${isAdmin ? 'admin-sidebar' : ''} ${isSidebarOpen ? 'sidebar-open' : ''}`}
        style={{ width: '250px', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}
      >
        <div className="admin-brand-lockup mb-4 px-2 mt-1">
          <h5 className="mb-0 admin-brand-wordmark">FlatEase</h5>
        </div>
        <ListGroup variant="flush">
          {sidebarItems.map((item) => {
            const Icon = item.icon;

            return (
              <ListGroup.Item
                key={item.label}
                action
                active={isActive(item.to)}
                className={`d-flex align-items-center ${isAdmin ? 'admin-sidebar-item' : ''}`}
                onClick={() => handleNavigate(item.to)}
              >
                <Icon className="me-2" /> {item.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      <div className="flex-grow-1">
        <header className={`d-flex justify-content-between align-items-center gap-3 px-4 py-3 border-bottom bg-white ${isAdmin ? 'admin-topbar' : ''}`}>
          <div className="d-flex align-items-center gap-2 admin-topbar-left">
            <Button
              type="button"
              variant="light"
              className="admin-sidebar-toggle d-lg-none"
              onClick={() => setIsSidebarOpen((prev) => !prev)}
              aria-label="Toggle sidebar"
            >
              <BsList size={20} />
            </Button>
            {isAdmin && <CommandPalette />}
          </div>
          <div className="d-flex align-items-center gap-3 admin-topbar-right">
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
          </div>
        </header>
        <main className="p-4 admin-content-main">{children}</main>
      </div>
    </div>
  );
}

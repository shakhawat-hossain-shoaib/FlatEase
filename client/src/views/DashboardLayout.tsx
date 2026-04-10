import { ReactNode, useMemo, useState } from 'react';
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

  return (
    <div className={`d-flex ${isAdmin ? 'admin-shell' : ''}`}>
      <div
        className={`bg-light p-3 border-end ${isAdmin ? 'admin-sidebar' : ''}`}
        style={{ width: '250px', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}
      >
        <div className="d-flex align-items-center gap-2 mb-4 px-2 mt-1">
          <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'var(--admin-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem' }}>
            F
          </div>
          <h5 className="mb-0 fw-bold" style={{ color: 'var(--admin-text-primary)' }}>FlatEase</h5>
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
                onClick={() => navigate(item.to)}
              >
                <Icon className="me-2" /> {item.label}
              </ListGroup.Item>
            );
          })}
        </ListGroup>
      </div>

      <div className="flex-grow-1">
        <header className={`d-flex justify-content-end align-items-center gap-4 px-4 py-3 border-bottom bg-white ${isAdmin ? 'admin-topbar' : ''}`}>
          {isAdmin && <CommandPalette />}
          <span className="small text-muted mb-0 ms-auto">{role} Portal</span>
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

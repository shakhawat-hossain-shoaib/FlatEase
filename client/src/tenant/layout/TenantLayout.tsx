import { ReactNode, useMemo, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import { BsBoxArrowRight } from 'react-icons/bs';
import ApiClient from '../../api';
import { clearStoredAuthUser } from '../../helpers/auth';
import { TenantSidebar } from './TenantSidebar';

interface TenantLayoutProps {
  children: ReactNode;
}

export function TenantLayout({ children }: TenantLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const api = useMemo(() => new ApiClient(), []);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    clearStoredAuthUser();
    navigate('/login', { replace: true });

    try {
      await api.logout();
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="d-flex admin-shell">
      <TenantSidebar activePath={location.pathname} onNavigate={navigate} />

      <div className="flex-grow-1">
        <header className="d-flex justify-content-end align-items-center gap-4 px-4 py-3 border-bottom bg-white admin-topbar">
          <span className="small text-muted mb-0 ms-auto">Tenant Portal</span>
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
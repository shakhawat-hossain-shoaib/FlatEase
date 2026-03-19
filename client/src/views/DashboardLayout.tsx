import { ReactNode } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { BsGrid, BsBuilding, BsFileEarmarkText, BsFileText, BsChatDots, BsCreditCard, BsBell, BsBoxArrowRight } from 'react-icons/bs';
import api from '../api';
import { useAuth } from '../context/useAuth';


interface DashboardLayoutProps {
  role: 'Admin' | 'Tenant';
  children: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Client session is still cleared on logout, even if request fails.
    }

    logout();
    navigate('/login');
  };

  return (
    <div className="d-flex">
      {role === 'Admin' && (
        <div
          className="bg-light p-3"
          style={{ width: '240px', minHeight: '100vh', position: 'fixed' }}
        >
          <h5 className="mb-4">FlatEase</h5>
          <ListGroup variant="flush">
            <ListGroup.Item action className="d-flex align-items-center">
              <BsGrid className="me-2" /> Dashboard
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsBuilding className="me-2" /> Apartments & Tenants
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsFileEarmarkText className="me-2" /> Lease Details
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsFileText className="me-2" /> Documents
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsChatDots className="me-2" /> Complaints
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsCreditCard className="me-2" /> Payments
            </ListGroup.Item>
            <ListGroup.Item action className="d-flex align-items-center">
              <BsBell className="me-2" /> Notifications
            </ListGroup.Item>
          </ListGroup>
        </div>
      )}
      <div className="flex-grow-1" style={{ marginLeft: role === 'Admin' ? '240px' : undefined }}>
        <header className="d-flex justify-content-end p-3 border-bottom">
          <span className="me-3">{role} Portal</span>
          <Button variant="link" className="d-flex align-items-center" onClick={handleLogout}>
            <BsBoxArrowRight className="me-1" /> Logout
          </Button>
        </header>
        <main className="p-4">{children}</main>
      </div>
    </div>
  );
}

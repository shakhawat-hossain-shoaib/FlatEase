import { ReactNode } from 'react';
import { ListGroup, Button } from 'react-bootstrap';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  BsGrid,
  BsBuilding,
  BsFileEarmarkText,
  BsChatDots,
  BsBoxArrowRight,
} from 'react-icons/bs';

interface DashboardLayoutProps {
  role: 'Admin' | 'Tenant';
  children: ReactNode;
}

export function DashboardLayout({ role, children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    navigate('/login');
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="d-flex">
      {role === 'Admin' && (
        <div
          className="bg-light p-3"
          style={{ width: '240px', minHeight: '100vh', position: 'fixed' }}
        >
          <h5 className="mb-4">FlatEase</h5>
          <ListGroup variant="flush">
            <ListGroup.Item
              action
              active={isActive('/admin')}
              className="d-flex align-items-center"
              onClick={() => navigate('/admin')}
            >
              <BsGrid className="me-2" /> Dashboard
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={isActive('/admin/apartments')}
              className="d-flex align-items-center"
              onClick={() => navigate('/admin/apartments')}
            >
              <BsBuilding className="me-2" /> Apartments & Tenants
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={isActive('/admin/lease')}
              className="d-flex align-items-center"
              onClick={() => navigate('/admin/lease')}
            >
              <BsFileEarmarkText className="me-2" /> Lease Details
            </ListGroup.Item>
            <ListGroup.Item
              action
              active={isActive('/admin/complaints')}
              className="d-flex align-items-center"
              onClick={() => navigate('/admin/complaints')}
            >
              <BsChatDots className="me-2" /> Complaints
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

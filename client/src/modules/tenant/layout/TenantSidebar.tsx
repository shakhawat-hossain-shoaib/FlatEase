import { ListGroup } from 'react-bootstrap';
import { BsBell, BsCash, BsChatDots, BsColumnsGap, BsFileEarmarkText, BsGear, BsPencilSquare, BsPerson, BsShieldLock } from 'react-icons/bs';
import { BrandLogo } from '../../shared/components/BrandLogo';

type SidebarItem = {
  label: string;
  icon: typeof BsColumnsGap;
  to: string;
};

const sidebarItems: SidebarItem[] = [
  { label: 'Dashboard', icon: BsColumnsGap, to: '/tenant' },
  { label: 'My Lease', icon: BsFileEarmarkText, to: '/tenant/lease' },
  { label: 'Payments', icon: BsCash, to: '/tenant/payments' },
  { label: 'Documents', icon: BsShieldLock, to: '/tenant/documents' },
  { label: 'Complaints', icon: BsChatDots, to: '/tenant/complaints' },
  { label: 'Submit Complaint', icon: BsPencilSquare, to: '/tenant/complaints/new' },
  { label: 'Profile', icon: BsPerson, to: '/tenant/profile' },
  { label: 'Settings', icon: BsGear, to: '/tenant/settings' },
  { label: 'Notifications', icon: BsBell, to: '/tenant/notifications' },
];

interface TenantSidebarProps {
  activePath: string;
  onNavigate: (path: string) => void;
}

export function TenantSidebar({ activePath, onNavigate }: TenantSidebarProps) {
  const isActive = (path: string) => activePath === path || activePath.startsWith(`${path}/`);

  return (
    <div
      className="bg-light p-3 border-end admin-sidebar"
      style={{ width: '250px', minHeight: '100vh', position: 'sticky', top: 0, flexShrink: 0 }}
    >
      <div className="d-flex align-items-center gap-2 mb-4 px-2 mt-1">
        <BrandLogo to="/tenant" compact showWordmark />
      </div>

      <ListGroup variant="flush">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <ListGroup.Item
              key={item.label}
              action
              active={isActive(item.to)}
              className="d-flex align-items-center admin-sidebar-item"
              onClick={() => onNavigate(item.to)}
            >
              <Icon className="me-2" /> {item.label}
            </ListGroup.Item>
          );
        })}
      </ListGroup>
    </div>
  );
}
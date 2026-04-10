import { ReactNode } from 'react';
import { Card } from 'react-bootstrap';

interface AdminSectionCardProps {
  title?: ReactNode;
  actions?: ReactNode;
  className?: string;
  bodyClassName?: string;
  children: ReactNode;
}

export function AdminSectionCard({
  title,
  actions,
  className = '',
  bodyClassName = '',
  children,
}: AdminSectionCardProps) {
  return (
    <Card className={`admin-card border-0 ${className}`.trim()}>
      {(title || actions) && (
        <Card.Header className="admin-card-header bg-transparent border-0 d-flex align-items-center justify-content-between gap-2">
          <div className="admin-section-title">{title}</div>
          {actions ? <div className="d-flex align-items-center gap-2">{actions}</div> : null}
        </Card.Header>
      )}
      <Card.Body className={`admin-card-body ${bodyClassName}`.trim()}>{children}</Card.Body>
    </Card>
  );
}

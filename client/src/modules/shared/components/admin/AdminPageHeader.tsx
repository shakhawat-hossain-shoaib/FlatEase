import { ReactNode } from 'react';

interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  action?: ReactNode;
}

export function AdminPageHeader({ title, subtitle, action }: AdminPageHeaderProps) {
  return (
    <div className="admin-page-header d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4">
      <div>
        <h2 className="admin-page-title mb-1">{title}</h2>
        <p className="admin-page-subtitle mb-0">{subtitle}</p>
      </div>
      {action ? <div className="admin-page-header-action">{action}</div> : null}
    </div>
  );
}

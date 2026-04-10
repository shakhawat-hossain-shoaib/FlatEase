import { IconType } from 'react-icons';

interface AdminEmptyStateProps {
  icon: IconType;
  title: string;
  message: string;
  compact?: boolean;
}

export function AdminEmptyState({ icon: Icon, title, message, compact = false }: AdminEmptyStateProps) {
  return (
    <div className={`admin-empty-state ${compact ? 'admin-empty-state-compact' : ''}`.trim()}>
      <div className="admin-empty-state-icon-wrap">
        <Icon size={18} />
      </div>
      <div className="admin-empty-state-title">{title}</div>
      <div className="admin-empty-state-message">{message}</div>
    </div>
  );
}

import { ComplaintStatus, CurrentUserEntity, UnitAssignmentEntity } from '../api';

export function formatMoney(value: number, currency = 'BDT') {
  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDate(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

export function formatDateTime(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('en-BD', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeDays(value?: string | null) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const today = new Date();
  const diffInDays = Math.ceil((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return 'Today';
  }

  if (diffInDays > 0) {
    return `${diffInDays} day${diffInDays === 1 ? '' : 's'} remaining`;
  }

  const overdueDays = Math.abs(diffInDays);
  return `${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`;
}

export function getActiveTenantAssignment(user: CurrentUserEntity | null | undefined): UnitAssignmentEntity | null {
  const assignments = user?.unit_assignments ?? user?.unitAssignments ?? [];

  return assignments.find((assignment) => assignment.status === 'active') ?? assignments[0] ?? null;
}

export function getPaymentBadgeVariant(status?: 'pending' | 'partially_paid' | 'paid' | 'overdue') {
  if (status === 'paid') {
    return 'success';
  }

  if (status === 'overdue') {
    return 'danger';
  }

  if (status === 'partially_paid') {
    return 'warning';
  }

  return 'secondary';
}

export function getComplaintBadgeVariant(status: ComplaintStatus) {
  if (status === 'resolved') {
    return 'success';
  }

  if (status === 'in_progress') {
    return 'primary';
  }

  if (status === 'assigned') {
    return 'info';
  }

  return 'warning';
}

export function getComplaintStatusLabel(status: ComplaintStatus) {
  if (status === 'in_progress') {
    return 'In Progress';
  }

  if (status === 'assigned') {
    return 'Assigned';
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}
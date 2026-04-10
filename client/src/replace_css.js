const fs = require('fs');
const file = '/home/shoaib/Documents/WEB/sd/FlatEase/client/src/index.css';
const content = fs.readFileSync(file, 'utf8');
const lines = content.split('\n');

const lineIndex = lines.findIndex(l => l.trim() === '/* admin design system (scoped) */');
if (lineIndex !== -1) {
    const keep = lines.slice(0, lineIndex).join('\n');
    const newCss = `/* admin design system (scoped) */
.admin-shell {
  --admin-bg: #f8fafc;
  --admin-surface: #ffffff;
  --admin-surface-soft: #f1f5f9;
  --admin-border: rgba(15, 23, 42, 0.05);
  --admin-border-strong: rgba(15, 23, 42, 0.1);
  --admin-text-primary: #0f172a;
  --admin-text-secondary: #334155;
  --admin-text-muted: #64748b;
  --admin-primary: #1d4ed8;
  --admin-primary-dark: #1e40af;
  --admin-primary-soft: rgba(29, 78, 216, 0.08);
  --admin-success: #16a34a;
  --admin-success-soft: rgba(22, 163, 74, 0.12);
  --admin-success-text: #166534;
  --admin-warning: #eab308;
  --admin-warning-soft: rgba(234, 179, 8, 0.15);
  --admin-warning-text: #854d0e;
  --admin-danger: #dc2626;
  --admin-danger-soft: rgba(220, 38, 38, 0.12);
  --admin-danger-text: #991b1b;
  --admin-info: #0284c7;
  --admin-info-soft: rgba(2, 132, 199, 0.12);
  --admin-info-text: #075985;
  --admin-radius-sm: 0.5rem;
  --admin-radius-md: 0.8rem;
  --admin-radius-lg: 1.25rem;
  --admin-radius-xl: 1.5rem;
  --admin-shadow-sm: 0 4px 6px -1px rgba(15, 23, 42, 0.05), 0 2px 4px -2px rgba(15, 23, 42, 0.05);
  --admin-shadow-md: 0 10px 15px -3px rgba(15, 23, 42, 0.05), 0 4px 6px -4px rgba(15, 23, 42, 0.05);
  --admin-shadow-lg: 0 20px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.05);
  --admin-shadow-intense: 0 25px 50px -12px rgba(15, 23, 42, 0.15);
  --admin-transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  --admin-transition-bounce: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.admin-page-bg {
  background-color: var(--admin-bg);
  background-image: radial-gradient(circle at top right, rgba(29, 78, 216, 0.03), transparent 400px),
    radial-gradient(circle at bottom left, rgba(14, 165, 233, 0.03), transparent 300px);
  min-height: 100vh;
  position: relative;
}

.admin-page-container {
  padding-top: 1.5rem;
  padding-bottom: 2.5rem;
  max-width: 1600px;
  margin: 0 auto;
}

.admin-page-title {
  font-size: 1.85rem;
  color: var(--admin-text-primary);
  font-weight: 700;
  letter-spacing: -0.02em;
  margin-bottom: 0.25rem;
}

.admin-page-subtitle {
  color: var(--admin-text-muted);
  font-size: 1.05rem;
  font-weight: 400;
}

/* Sidebar Navigation */
.admin-sidebar {
  background-color: var(--admin-surface) !important;
  border-right: 1px solid var(--admin-border) !important;
  z-index: 10;
  box-shadow: var(--admin-shadow-sm);
}

.admin-sidebar h5 {
  color: var(--admin-text-primary);
  letter-spacing: -0.01em;
  font-weight: 800;
  font-size: 1.35rem;
  padding-left: 0.5rem;
}

.admin-shell .admin-sidebar .list-group {
  gap: 0.25rem;
}

.admin-sidebar-item {
  border: 0 !important;
  border-radius: var(--admin-radius-md) !important;
  color: var(--admin-text-secondary) !important;
  font-weight: 500;
  transition: var(--admin-transition);
  padding: 0.8rem 1rem !important;
  margin-bottom: 0.2rem;
  background-color: transparent !important;
}

.admin-sidebar-item:hover {
  background-color: var(--admin-surface-soft) !important;
  color: var(--admin-text-primary) !important;
  transform: translateX(4px);
}

.admin-shell .admin-sidebar .list-group-item.active.admin-sidebar-item {
  background: var(--admin-primary-soft) !important;
  color: var(--admin-primary) !important;
  font-weight: 600;
  box-shadow: none;
}

.admin-shell .admin-sidebar .list-group-item.active.admin-sidebar-item::before {
  content: '';
  position: absolute;
  left: -8px;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 60%;
  background-color: var(--admin-primary);
  border-radius: 0 4px 4px 0;
}

/* Topbar */
.admin-topbar {
  background-color: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--admin-border) !important;
  position: sticky;
  top: 0;
  z-index: 9;
}

.admin-topbar .btn-link {
  transition: var(--admin-transition);
  color: var(--admin-text-secondary) !important;
}

.admin-topbar .btn-link:hover {
  color: var(--admin-danger) !important;
}

/* Modern Cards */
.admin-card {
  border-radius: var(--admin-radius-lg);
  box-shadow: var(--admin-shadow-sm);
  border: 1px solid var(--admin-border) !important;
  background: var(--admin-surface);
  transition: var(--admin-transition);
  overflow: hidden;
}

.admin-card-hover:hover,
.admin-card:hover {
  box-shadow: var(--admin-shadow-md);
  transform: translateY(-4px);
  border-color: rgba(29, 78, 216, 0.15) !important;
}

.admin-card-header {
  padding: 1.25rem 1.5rem 0.5rem 1.5rem;
  background: transparent;
  border-bottom: 0;
}

.admin-card-body {
  padding: 1.5rem;
}

.admin-section-title {
  color: var(--admin-text-primary);
  font-weight: 700;
  letter-spacing: -0.01em;
  font-size: 1.15rem;
}

/* Statutory/Metric KPI Cards */
.admin-metric-card {
  position: relative;
  overflow: hidden;
  padding: 1rem;
}

.admin-metric-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 3px;
  background: var(--admin-border-strong);
  transition: var(--admin-transition);
}

.admin-metric-card:hover::before {
  height: 100%;
  opacity: 0.02;
}

.admin-dashboard-kpi {
  border-radius: var(--admin-radius-lg);
  border: 1px solid var(--admin-border) !important;
}

.admin-kpi-accent-primary::before { background: var(--admin-primary); }
.admin-kpi-accent-info::before { background: var(--admin-info); }
.admin-kpi-accent-success::before { background: var(--admin-success); }
.admin-kpi-accent-warning::before { background: var(--admin-warning); }

.admin-dashboard-kpi-body {
  padding: 1.5rem;
}

.admin-metric-icon {
  width: 3rem;
  height: 3rem;
  border-radius: var(--admin-radius-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.admin-kpi-accent-primary .admin-metric-icon { background: var(--admin-primary-soft); color: var(--admin-primary); }
.admin-kpi-accent-info .admin-metric-icon { background: var(--admin-info-soft); color: var(--admin-info); }
.admin-kpi-accent-success .admin-metric-icon { background: var(--admin-success-soft); color: var(--admin-success); }
.admin-kpi-accent-warning .admin-metric-icon { background: var(--admin-warning-soft); color: var(--admin-warning); }

.admin-metric-label {
  color: var(--admin-text-secondary);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.admin-metric-value {
  color: var(--admin-text-primary);
  font-size: 2.25rem;
  line-height: 1.1;
  font-weight: 800;
  letter-spacing: -0.03em;
}

/* Tables */
.admin-table {
  margin-bottom: 0;
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
}

.admin-table thead th {
  border-top: 0;
  border-bottom: 2px solid var(--admin-border-strong);
  color: var(--admin-text-muted);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  padding: 1rem;
  white-space: nowrap;
}

.admin-table tbody td {
  border-top: 1px solid var(--admin-border);
  border-bottom: 0;
  color: var(--admin-text-primary);
  padding: 1.1rem 1rem;
  vertical-align: middle;
  font-size: 0.95rem;
  transition: var(--admin-transition);
}

.admin-table tbody tr {
  transition: var(--admin-transition);
}

.admin-table-hover tbody tr:hover {
  background-color: var(--admin-surface-soft);
}

.admin-table-hover tbody tr:hover td {
  color: var(--admin-primary-dark);
}

.admin-list-row {
  padding: 1rem 0;
  border-bottom: 1px solid var(--admin-border);
  transition: var(--admin-transition);
}

.admin-list-row:last-child {
  border-bottom: 0;
}

.admin-list-row:hover {
  background-color: var(--admin-surface-soft);
  border-radius: var(--admin-radius-sm);
  padding-left: 0.5rem;
  padding-right: 0.5rem;
}

/* Forms & Inputs */
.admin-shell .form-label {
  color: var(--admin-text-primary);
  font-weight: 600;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.admin-shell .form-control,
.admin-shell .form-select {
  border-radius: var(--admin-radius-md);
  border: 1px solid var(--admin-border-strong);
  min-height: 3rem;
  padding: 0.5rem 1rem;
  background-color: var(--admin-surface);
  color: var(--admin-text-primary);
  font-size: 0.95rem;
  transition: var(--admin-transition);
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.02);
}

.admin-shell .form-control::placeholder {
  color: var(--admin-text-muted);
}

.admin-shell textarea.form-control {
  min-height: auto;
}

.admin-shell .form-control:focus,
.admin-shell .form-select:focus {
  border-color: var(--admin-primary);
  box-shadow: 0 0 0 3px var(--admin-primary-soft), inset 0 1px 2px rgba(15, 23, 42, 0.02);
  outline: none;
}

/* Buttons */
.admin-shell .btn {
  border-radius: var(--admin-radius-md);
  padding: 0.6rem 1.25rem;
  font-weight: 600;
  font-size: 0.95rem;
  transition: var(--admin-transition-bounce);
  letter-spacing: 0.01em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.admin-shell .btn-sm {
  padding: 0.4rem 0.85rem;
  font-size: 0.85rem;
  border-radius: var(--admin-radius-sm);
}

.admin-shell .btn:active {
  transform: scale(0.97);
}

.admin-shell .btn-primary {
  background-color: var(--admin-primary);
  border-color: var(--admin-primary);
  color: #fff;
  box-shadow: 0 4px 6px -1px var(--admin-primary-soft);
}

.admin-shell .btn-primary:hover {
  background-color: var(--admin-primary-dark);
  border-color: var(--admin-primary-dark);
  box-shadow: 0 10px 15px -3px var(--admin-primary-soft);
  transform: translateY(-2px);
}

.admin-shell .btn-outline-primary {
  color: var(--admin-primary);
  border-color: var(--admin-primary);
  background-color: transparent;
}

.admin-shell .btn-outline-primary:hover {
  background-color: var(--admin-primary-soft);
  color: var(--admin-primary-dark);
  border-color: var(--admin-primary-dark);
}

.admin-shell .btn-danger {
  background-color: var(--admin-danger);
  border-color: var(--admin-danger);
  color: #fff;
  box-shadow: 0 4px 6px -1px var(--admin-danger-soft);
}

.admin-shell .btn-danger:hover {
  background-color: #b91c1c;
  border-color: #b91c1c;
  color: #fff;
  box-shadow: 0 10px 15px -3px var(--admin-danger-soft);
  transform: translateY(-2px);
}

.admin-shell .btn-outline-danger {
  color: var(--admin-danger);
  border-color: var(--admin-danger);
}

.admin-shell .btn-outline-danger:hover {
  background-color: var(--admin-danger-soft);
  color: #b91c1c;
}

/* Badges */
.admin-shell .badge {
  border-radius: 9999px;
  padding: 0.45rem 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
  font-size: 0.75rem;
  text-transform: capitalize;
  border: 1px solid transparent;
}

/* Soft Badge Utils */
.badge-soft-success {
  background-color: var(--admin-success-soft) !important;
  color: var(--admin-success-text) !important;
  border-color: rgba(22, 163, 74, 0.2) !important;
}

.badge-soft-warning {
  background-color: var(--admin-warning-soft) !important;
  color: var(--admin-warning-text) !important;
  border-color: rgba(234, 179, 8, 0.2) !important;
}

.badge-soft-danger {
  background-color: var(--admin-danger-soft) !important;
  color: var(--admin-danger-text) !important;
  border-color: rgba(220, 38, 38, 0.2) !important;
}

.badge-soft-info {
  background-color: var(--admin-info-soft) !important;
  color: var(--admin-info-text) !important;
  border-color: rgba(2, 132, 199, 0.2) !important;
}

.badge-soft-primary {
  background-color: var(--admin-primary-soft) !important;
  color: var(--admin-primary-dark) !important;
  border-color: rgba(29, 78, 216, 0.2) !important;
}

.badge-soft-secondary {
  background-color: var(--admin-surface-soft) !important;
  color: var(--admin-text-secondary) !important;
  border-color: var(--admin-border-strong) !important;
}

/* Empty States */
.admin-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--admin-surface-soft);
  border-radius: var(--admin-radius-lg);
  border: 1px dashed var(--admin-border-strong);
}

.admin-empty-state-compact {
  padding: 2rem 1.5rem;
}

.admin-empty-state-icon-wrap {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--admin-primary);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-sm);
  margin-bottom: 1.25rem;
  font-size: 1.5rem;
}

.admin-empty-state-title {
  color: var(--admin-text-primary);
  font-weight: 800;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
  letter-spacing: -0.01em;
}

.admin-empty-state-message {
  color: var(--admin-text-muted);
  max-width: 42ch;
  font-size: 0.95rem;
  line-height: 1.6;
}

/* Modals */
.admin-shell .modal-content {
  border: 0;
  border-radius: var(--admin-radius-xl);
  box-shadow: var(--admin-shadow-intense);
  overflow: hidden;
}

.admin-shell .modal-header {
  border-bottom: 1px solid var(--admin-border);
  padding: 1.5rem 1.75rem;
  background-color: var(--admin-surface-soft);
}

.admin-shell .modal-title {
  font-weight: 800;
  color: var(--admin-text-primary);
  letter-spacing: -0.02em;
}

.admin-shell .modal-body {
  padding: 1.75rem;
}

.admin-shell .modal-footer {
  border-top: 1px solid var(--admin-border);
  padding: 1.25rem 1.75rem;
  background-color: var(--admin-surface-soft);
}

.admin-pricing-kpi {
  border: 1px solid var(--admin-border);
  border-radius: var(--admin-radius-md);
  background: var(--admin-surface-soft);
  padding: 1.25rem;
  box-shadow: none;
  transition: var(--admin-transition);
}

.admin-pricing-kpi:hover {
  background: var(--admin-surface);
  border-color: var(--admin-border-strong);
  box-shadow: var(--admin-shadow-sm);
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .admin-card:hover {
    transform: none;
  }
  .admin-page-title {
    font-size: 1.5rem;
  }
}
`;
    fs.writeFileSync(file, keep + '\n' + newCss);
}

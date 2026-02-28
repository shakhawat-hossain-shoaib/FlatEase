import { DashboardLayout } from './DashboardLayout';

export default function TenantDashboard() {
  return (
    <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
      <DashboardLayout role="Tenant">
      <div className="container-fluid">
        <h2 className="mb-4">Tenant Dashboard</h2>
        <p>Welcome back! Here is your tenant portal.</p>
        {/* put some placeholder cards or info */}
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-3">
              <h6>My Lease</h6>
              <p className="mb-0">Unit A-301, expires 2026-07-01</p>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h6>Recent Payments</h6>
              <ul className="mb-0">
                <li>$1,200 – Mar 1, 2026</li>
                <li>$1,200 – Feb 1, 2026</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      </DashboardLayout>
    </div>
  );
}

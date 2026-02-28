import { DashboardLayout } from './DashboardLayout';
import { BsBuilding, BsFileEarmarkText, BsCreditCard, BsChatDots } from 'react-icons/bs';

export default function TenantDashboard() {
  return (
    <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
      <DashboardLayout role="Tenant">
      <div className="container-fluid">
        <h2 className="mb-4">Tenant Dashboard</h2>
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>My Unit</h6>
              <p className="h4 mb-0">A-301</p>
              <small className="text-muted">Building A, Floor 3</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Lease Status</h6>
              <p className="h4 mb-0">Active</p>
              <small className="text-success">Expires 2026-07-01</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Next Payment</h6>
              <p className="h4 mb-0">$1,200</p>
              <small className="text-muted">Due Apr 1, 2026</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Open Complaints</h6>
              <p className="h4 mb-0">1</p>
              <small className="text-danger">1 pending</small>
            </div>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-3">
              <h6>Payment Summary</h6>
              <p className="text-muted">This Year</p>
              <div className="progress mb-2" style={{ height: '10px' }}>
                <div className="progress-bar" style={{ width: '25%' }}></div>
              </div>
              <div className="d-flex justify-content-between">
                <small>Paid $3,600</small>
                <small className="text-muted">Remaining $10,800</small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h6>Recent Activity</h6>
              <ul className="list-unstyled mb-0">
                <li>
                  <strong>Payment received</strong> — $1,200 · Mar 1, 2026 <span className="text-muted float-end">Today</span>
                </li>
                <li>
                  <strong>Payment received</strong> — $1,200 · Feb 1, 2026 <span className="text-muted float-end">1 month ago</span>
                </li>
                <li>
                  <strong>Maintenance request</strong> — Plumbing issue <span className="text-muted float-end">2 weeks ago</span>
                </li>
                <li>
                  <strong>Lease renewed</strong> — Unit A-301 <span className="text-muted float-end">3 months ago</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
        {/* quick actions row */}
        <div className="row g-3 mt-4">
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsBuilding size={24} className="mb-2" />
              <div>My Unit</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsFileEarmarkText size={24} className="mb-2" />
              <div>View Lease</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsCreditCard size={24} className="mb-2" />
              <div>Make Payment</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsChatDots size={24} className="mb-2" />
              <div>File Complaint</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </div>
  );
}

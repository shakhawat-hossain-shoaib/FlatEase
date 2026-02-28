import { DashboardLayout } from './DashboardLayout';
import { BsBuilding, BsFileEarmarkText, BsCreditCard, BsChatDots } from 'react-icons/bs';

export default function AdminDashboard() {
  return (
    <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
      <DashboardLayout role="Admin">
      <div className="container-fluid">
        <h2 className="mb-4">Admin Dashboard</h2>
        <div className="row g-3 mb-4">
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Total Tenants</h6>
              <p className="h4 mb-0">248</p>
              <small className="text-success">+12% from last month</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Active Leases</h6>
              <p className="h4 mb-0">186</p>
              <small className="text-muted">94.5% occupancy</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Expiring Leases</h6>
              <p className="h4 mb-0">14</p>
              <small className="text-muted">Next 30 days</small>
            </div>
          </div>
          <div className="col-sm-6 col-md-3">
            <div className="card p-3">
              <h6>Open Complaints</h6>
              <p className="h4 mb-0">7</p>
              <small className="text-danger">3 urgent</small>
            </div>
          </div>
        </div>
        <div className="row g-3">
          <div className="col-md-6">
            <div className="card p-3">
              <h6>Revenue Overview</h6>
              <p className="text-muted">This Month</p>
              <div className="progress mb-2" style={{ height: '10px' }}>
                <div className="progress-bar" style={{ width: '84%' }}></div>
              </div>
              <div className="d-flex justify-content-between">
                <small>Collected $105,825</small>
                <small className="text-danger">Overdue $3,200</small>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card p-3">
              <h6>Recent Activity</h6>
              <ul className="list-unstyled mb-0">
                <li>
                  <strong>New lease signed</strong> — John Doe · Unit A-301 <span className="text-muted float-end">2 hrs ago</span>
                </li>
                <li>
                  <strong>Payment received</strong> — Sarah Smith · Unit B-105 <span className="text-muted float-end">5 hrs ago</span>
                </li>
                <li>
                  <strong>Maintenance request</strong> — Mike Johnson · Unit C-204 <span className="text-muted float-end">1 day ago</span>
                </li>
                <li>
                  <strong>Lease renewal</strong> — Emma Wilson · Unit A-102 <span className="text-muted float-end">2 days ago</span>
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
              <div>Add Tenant</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsFileEarmarkText size={24} className="mb-2" />
              <div>Create Lease</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsCreditCard size={24} className="mb-2" />
              <div>Record Payment</div>
            </div>
          </div>
          <div className="col-6 col-md-3">
            <div className="card p-3 text-center">
              <BsChatDots size={24} className="mb-2" />
              <div>View Complaints</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
    </div>
  );
}

import { useMemo, useState } from 'react';
import { DashboardLayout } from './DashboardLayout';
import { BsFilter, BsPlus, BsSearch } from 'react-icons/bs';
import { Button, Form, InputGroup, Table } from 'react-bootstrap';

interface Apartment {
  unit: string;
  tenant: string;
  bedrooms: number;
  rent: string;
  status: 'Occupied' | 'Vacant';
  lease: 'Active' | 'Expiring' | '-';
  expiry: string;
}

export default function ApartmentManagement() {
  const [search, setSearch] = useState('');

  const apartments = useMemo<Apartment[]>(
    () => [
      { unit: 'A-101', tenant: 'John Doe', bedrooms: 2, rent: '$1,650', status: 'Occupied', lease: 'Active', expiry: 'Dec 31, 2026' },
      { unit: 'A-102', tenant: 'Emma Wilson', bedrooms: 3, rent: '$1,950', status: 'Occupied', lease: 'Active', expiry: 'Mar 15, 2027' },
      { unit: 'A-103', tenant: '-', bedrooms: 2, rent: '$1,700', status: 'Vacant', lease: '-', expiry: '-' },
      { unit: 'A-201', tenant: 'Sarah Smith', bedrooms: 1, rent: '$1,350', status: 'Occupied', lease: 'Expiring', expiry: 'Feb 28, 2026' },
      { unit: 'A-202', tenant: 'Mike Johnson', bedrooms: 2, rent: '$1,650', status: 'Occupied', lease: 'Active', expiry: 'Aug 20, 2026' },
      { unit: 'A-203', tenant: '-', bedrooms: 3, rent: '$2,100', status: 'Vacant', lease: '-', expiry: '-' },
      { unit: 'A-301', tenant: 'John Doe', bedrooms: 3, rent: '$1,850', status: 'Occupied', lease: 'Active', expiry: 'Dec 31, 2026' },
      { unit: 'B-101', tenant: 'Lisa Brown', bedrooms: 2, rent: '$1,750', status: 'Occupied', lease: 'Active', expiry: 'Nov 10, 2026' },
      { unit: 'B-102', tenant: 'David Lee', bedrooms: 2, rent: '$1,680', status: 'Occupied', lease: 'Expiring', expiry: 'Jan 31, 2026' },
      { unit: 'B-103', tenant: '-', bedrooms: 1, rent: '$1,400', status: 'Vacant', lease: '-', expiry: '-' },
    ],
    []
  );

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return apartments;
    return apartments.filter(
      (apt) =>
        apt.unit.toLowerCase().includes(term) ||
        apt.tenant.toLowerCase().includes(term) ||
        apt.status.toLowerCase().includes(term)
    );
  }, [apartments, search]);

  return (
    <DashboardLayout role="Admin">
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div>
              <h2 className="mb-1">Apartment & Tenant Management</h2>
              <p className="text-muted">Manage all apartments and tenant information</p>
            </div>
            <Button>
              <BsPlus className="me-1" /> Add Unit
            </Button>
          </div>

          <div className="row gx-3 gy-3 mb-4">
            <div className="col-6 col-md-3">
              <div className="card p-3">
                <h6 className="mb-2">Total Units</h6>
                <p className="h3 mb-1">200</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card p-3">
                <h6 className="mb-2">Occupied</h6>
                <p className="h3 mb-1">186</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card p-3">
                <h6 className="mb-2">Vacant</h6>
                <p className="h3 mb-1">14</p>
              </div>
            </div>
            <div className="col-6 col-md-3">
              <div className="card p-3">
                <h6 className="mb-2">Expiring Soon</h6>
                <p className="h3 mb-1">8</p>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header d-flex flex-column flex-md-row gap-3 align-items-start align-items-md-center justify-content-between">
              <h5 className="mb-0">All Apartments</h5>
              <div className="d-flex gap-2 w-100 w-md-auto">
                <InputGroup className="flex-grow-1">
                  <InputGroup.Text>
                    <BsSearch />
                  </InputGroup.Text>
                  <Form.Control
                    placeholder="Search units or tenants..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </InputGroup>
                <Button variant="outline-secondary">
                  <BsFilter className="me-1" /> Filter
                </Button>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="table-responsive">
                <Table hover className="mb-0">
                  <thead className="bg-light">
                    <tr>
                      <th>Unit</th>
                      <th>Tenant</th>
                      <th>Bedrooms</th>
                      <th>Rent</th>
                      <th>Status</th>
                      <th>Lease</th>
                      <th>Expiry</th>
                      <th />
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((apt) => (
                      <tr key={apt.unit}>
                        <td className="align-middle">{apt.unit}</td>
                        <td className="align-middle">{apt.tenant}</td>
                        <td className="align-middle">{apt.bedrooms} BR</td>
                        <td className="align-middle">{apt.rent}</td>
                        <td className="align-middle">
                          <span className={`badge ${apt.status === 'Occupied' ? 'bg-success' : 'bg-secondary'}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td className="align-middle">
                          {apt.lease === 'Active' && <span className="badge bg-success">Active</span>}
                          {apt.lease === 'Expiring' && <span className="badge bg-warning text-dark">Expiring</span>}
                          {apt.lease === '-' && <span className="text-muted">-</span>}
                        </td>
                        <td className="align-middle">{apt.expiry}</td>
                        <td className="align-middle">
                          <div className="d-flex gap-2">
                            <Button variant="outline-secondary" size="sm">
                              Edit
                            </Button>
                            <Button variant="outline-danger" size="sm">
                              Delete
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
            <div className="card-footer d-flex justify-content-between align-items-center">
              <small className="text-muted">Showing 1 to {filtered.length} of {apartments.length} units</small>
              <div className="d-flex gap-2">
                <Button variant="outline-secondary" size="sm" disabled>
                  Previous
                </Button>
                <Button variant="outline-secondary" size="sm">
                  Next
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

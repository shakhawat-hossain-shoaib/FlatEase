import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { BsBuilding, BsFileEarmarkArrowUp, BsGrid, BsPencil, BsPerson, BsPlus, BsTelephone, BsTrash } from 'react-icons/bs';
import ApiClient, { BuildingEntity, CreateBuildingPayload, FloorEntity, TenantDocumentEntity, UnitEntity, UpdateBuildingPayload, UserEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../components/admin/AdminSectionCard';
import toast from 'react-hot-toast';

type UnitWithAssignment = UnitEntity & {
  activeAssignmentNormalized?: UnitEntity['active_assignment'];
};

export default function ApartmentManagement() {
  const api = useMemo(() => new ApiClient(), []);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(false);
  const [isLoadingGrid, setIsLoadingGrid] = useState(false);
  const [buildings, setBuildings] = useState<BuildingEntity[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<number | null>(null);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingEntity | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<UnitWithAssignment | null>(null);
  const [tenantDocuments, setTenantDocuments] = useState<TenantDocumentEntity[]>([]);
  const [isLoadingTenantDocuments, setIsLoadingTenantDocuments] = useState(false);
  const [availableTenants, setAvailableTenants] = useState<UserEntity[]>([]);
  const [isLoadingTenants, setIsLoadingTenants] = useState(false);
  const [selectedTenantForAssignment, setSelectedTenantForAssignment] = useState<number | ''>('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [isCreateBuildingModalOpen, setIsCreateBuildingModalOpen] = useState(false);
  const [isEditBuildingModalOpen, setIsEditBuildingModalOpen] = useState(false);
  const [isCreatingBuilding, setIsCreatingBuilding] = useState(false);
  const [isUpdatingBuilding, setIsUpdatingBuilding] = useState(false);
  const [isDeletingBuilding, setIsDeletingBuilding] = useState(false);
  const [createBuildingForm, setCreateBuildingForm] = useState<CreateBuildingPayload>({
    name: '',
    code: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
    total_floors: 4,
    units_per_floor: 4,
  });
  const [editBuildingForm, setEditBuildingForm] = useState<UpdateBuildingPayload>({
    name: '',
    code: '',
    address_line: '',
    city: '',
    state: '',
    postal_code: '',
    country: '',
  });

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoadingBuildings(true);
      const response = await api.getAdminBuildings();
      setBuildings(response ?? []);
      setIsLoadingBuildings(false);
    };

    void loadBuildings();
  }, [api]);

  useEffect(() => {
    if (!selectedBuildingId) {
      setSelectedBuilding(null);
      return;
    }

    const loadBuildingGrid = async () => {
      setIsLoadingGrid(true);
      const response = await api.getAdminBuilding(selectedBuildingId);
      setSelectedBuilding(response ?? null);
      setIsLoadingGrid(false);
    };

    void loadBuildingGrid();
  }, [api, selectedBuildingId]);

  const floors = (selectedBuilding?.floors ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order) as FloorEntity[];

  const refreshBuildingData = async (buildingIdToSelect?: number) => {
    const updatedBuildings = await api.getAdminBuildings();
    if (updatedBuildings) {
      setBuildings(updatedBuildings);

      const targetBuildingId = buildingIdToSelect ?? selectedBuildingId ?? null;
      setSelectedBuildingId(targetBuildingId);

      if (targetBuildingId) {
        const updated = await api.getAdminBuilding(targetBuildingId);
        setSelectedBuilding(updated ?? null);
      } else {
        setSelectedBuilding(null);
      }
    }
  };

  const totalUnits = useMemo(() => buildings.reduce((sum, item) => sum + (item.units_count ?? 0), 0), [buildings]);
  const totalOccupied = useMemo(() => buildings.reduce((sum, item) => sum + (item.occupied_units_count ?? 0), 0), [buildings]);
  const totalVacant = Math.max(0, totalUnits - totalOccupied);

  const openUnit = async (unit: UnitEntity) => {
    try {
      const activeAssignment = unit.active_assignment ?? unit.activeAssignment ?? null;
      const normalized: UnitWithAssignment = {
        ...unit,
        activeAssignmentNormalized: activeAssignment,
      };

      setSelectedUnit(normalized);
      setSelectedTenantForAssignment('');

      if (!activeAssignment?.tenant_user_id) {
        setTenantDocuments([]);
        // Load available tenants for assignment
        setIsLoadingTenants(true);
        const tenants = await api.getAssignableTenants();
        setAvailableTenants(tenants ?? []);
        setIsLoadingTenants(false);
        return;
      }

      setIsLoadingTenantDocuments(true);
      const response = await api.getAdminTenantDocuments(activeAssignment.tenant_user_id);
      setTenantDocuments(response ?? []);
      setIsLoadingTenantDocuments(false);
    } catch (error) {
      console.error('Error opening unit:', error);
      toast.error('Error loading unit details');
    }
  };

  const handleAssignTenant = async () => {
    if (!selectedUnit || !selectedTenantForAssignment) {
      toast.error('Please select a tenant');
      return;
    }

    setIsAssigning(true);
    const response = await api.assignTenantToUnit(selectedUnit.id, Number(selectedTenantForAssignment));
    
    if (response?.success) {
      toast.success('Tenant assigned successfully');
      setSelectedUnit(null);
      await refreshBuildingData(selectedBuildingId ?? undefined);
    }
    setIsAssigning(false);
  };

  const handleUnassignTenant = async () => {
    if (!selectedUnit?.activeAssignmentNormalized?.id) {
      toast.error('No assignment to remove');
      return;
    }

    setIsAssigning(true);
    const response = await api.unassignTenantFromUnit(selectedUnit.activeAssignmentNormalized.id);
    
    if (response?.success) {
      toast.success('Tenant unassigned successfully');
      setSelectedUnit(null);
      await refreshBuildingData(selectedBuildingId ?? undefined);
    }
    setIsAssigning(false);
  };

  const handleCreateBuilding = async () => {
    if (!createBuildingForm.name.trim()) {
      toast.error('Building name is required');
      return;
    }

    if (createBuildingForm.total_floors < 1 || createBuildingForm.units_per_floor < 1) {
      toast.error('Floor and unit count must be at least 1');
      return;
    }

    setIsCreatingBuilding(true);

    const payload: CreateBuildingPayload = {
      ...createBuildingForm,
      name: createBuildingForm.name.trim(),
      code: createBuildingForm.code?.trim() || undefined,
      address_line: createBuildingForm.address_line?.trim() || undefined,
      city: createBuildingForm.city?.trim() || undefined,
      state: createBuildingForm.state?.trim() || undefined,
      postal_code: createBuildingForm.postal_code?.trim() || undefined,
      country: createBuildingForm.country?.trim() || undefined,
    };

    const created = await api.createAdminBuilding(payload);

    if (created) {
      toast.success('Building created successfully');
      setIsCreateBuildingModalOpen(false);
      setCreateBuildingForm({
        name: '',
        code: '',
        address_line: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
        total_floors: 4,
        units_per_floor: 4,
      });
      setSelectedBuildingId(null);
      setSelectedBuilding(null);
      await refreshBuildingData();
    }

    setIsCreatingBuilding(false);
  };

  const handleDeleteBuilding = async () => {
    if (!selectedBuilding) {
      toast.error('Please select a building first');
      return;
    }

    const ok = window.confirm(
      `Delete building "${selectedBuilding.name}"? This will remove its floors and units permanently.`
    );

    if (!ok) {
      return;
    }

    setIsDeletingBuilding(true);
    const response = await api.deleteAdminBuilding(selectedBuilding.id);

    if (response?.success) {
      toast.success('Building deleted successfully');
      setSelectedBuildingId(null);
      setSelectedBuilding(null);
      await refreshBuildingData();
    }

    setIsDeletingBuilding(false);
  };

  const openEditBuildingModal = () => {
    if (!selectedBuilding) {
      toast.error('Please select a building first');
      return;
    }

    setEditBuildingForm({
      name: selectedBuilding.name ?? '',
      code: selectedBuilding.code ?? '',
      address_line: selectedBuilding.address_line ?? '',
      city: selectedBuilding.city ?? '',
      state: selectedBuilding.state ?? '',
      postal_code: selectedBuilding.postal_code ?? '',
      country: selectedBuilding.country ?? '',
    });
    setIsEditBuildingModalOpen(true);
  };

  const handleUpdateBuilding = async () => {
    if (!selectedBuilding) {
      toast.error('Please select a building first');
      return;
    }

    if (!editBuildingForm.name?.trim()) {
      toast.error('Building name is required');
      return;
    }

    setIsUpdatingBuilding(true);

    const payload: UpdateBuildingPayload = {
      name: editBuildingForm.name.trim(),
      code: editBuildingForm.code?.trim() || undefined,
      address_line: editBuildingForm.address_line?.trim() || undefined,
      city: editBuildingForm.city?.trim() || undefined,
      state: editBuildingForm.state?.trim() || undefined,
      postal_code: editBuildingForm.postal_code?.trim() || undefined,
      country: editBuildingForm.country?.trim() || undefined,
    };

    const updated = await api.updateAdminBuilding(selectedBuilding.id, payload);

    if (updated) {
      toast.success('Building info updated successfully');
      setIsEditBuildingModalOpen(false);
      await refreshBuildingData(selectedBuilding.id);
    }

    setIsUpdatingBuilding(false);
  };

  const selectedTenant = selectedUnit?.activeAssignmentNormalized?.tenant;
  const selectedTenantPhone = selectedTenant?.tenant_profile?.phone ?? selectedTenant?.tenantProfile?.phone;

  return (
    <DashboardLayout role="Admin">
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Building & Tenant Management"
            subtitle="Select a building to view floor-wise occupancy and tenant details."
          />

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="admin-card admin-metric-card border-0 h-100">
                <Card.Body>
                  <small className="admin-metric-label d-block">Buildings</small>
                  <h4 className="admin-metric-value mb-0">{buildings.length}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card admin-metric-card border-0 h-100">
                <Card.Body>
                  <small className="admin-metric-label d-block">Occupied Units</small>
                  <h4 className="admin-metric-value mb-0">{totalOccupied}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="admin-card admin-metric-card border-0 h-100">
                <Card.Body>
                  <small className="admin-metric-label d-block">Vacant Units</small>
                  <h4 className="admin-metric-value mb-0">{totalVacant}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <AdminSectionCard
            className="mb-4"
            title={<span className="d-flex align-items-center gap-2"><BsBuilding /> Buildings</span>}
            actions={<Button
                size="sm"
                variant="primary"
                onClick={() => setIsCreateBuildingModalOpen(true)}
                className="d-flex align-items-center gap-2"
              >
                <BsPlus /> Add Building
              </Button>}
          >
              {isLoadingBuildings && <div className="text-muted">Loading buildings...</div>}
              {!isLoadingBuildings && buildings.length === 0 && (
                <AdminEmptyState
                  icon={BsBuilding}
                  title="No buildings yet"
                  message="Create your first building to start assigning floors and units."
                  compact
                />
              )}

              <div className="d-flex flex-wrap gap-2">
                {buildings.map((building) => (
                  <Button
                    key={building.id}
                    variant={selectedBuildingId === building.id ? 'primary' : 'outline-primary'}
                    onClick={() => setSelectedBuildingId(building.id)}
                  >
                    {building.name}
                  </Button>
                ))}
              </div>
          </AdminSectionCard>

          {selectedBuilding && (
            <AdminSectionCard
              className="mb-4"
              title={<span className="d-flex align-items-center gap-2"><BsBuilding /> Building Info</span>}
              actions={<>
                  <Button
                    size="sm"
                    variant="outline-primary"
                    onClick={openEditBuildingModal}
                    disabled={isUpdatingBuilding}
                    className="d-flex align-items-center gap-2"
                  >
                    <BsPencil /> Edit Info
                  </Button>
                  <Button
                    size="sm"
                    variant="outline-danger"
                    onClick={handleDeleteBuilding}
                    disabled={isDeletingBuilding}
                    className="d-flex align-items-center gap-2"
                  >
                    <BsTrash /> {isDeletingBuilding ? 'Deleting...' : 'Delete Building'}
                  </Button>
              </>}
            >
                <Row className="g-3">
                  <Col md={4}>
                    <small className="text-muted d-block">Name</small>
                    <div className="fw-semibold">{selectedBuilding.name}</div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Code</small>
                    <div className="fw-semibold">{selectedBuilding.code || 'N/A'}</div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Total Floors</small>
                    <div className="fw-semibold">{selectedBuilding.total_floors}</div>
                  </Col>
                  <Col md={4}>
                    <small className="text-muted d-block">Total Units</small>
                    <div className="fw-semibold">{selectedBuilding.units_count ?? 0}</div>
                  </Col>
                  <Col md={8}>
                    <small className="text-muted d-block">Address</small>
                    <div className="fw-semibold">
                      {[
                        selectedBuilding.address_line,
                        selectedBuilding.city,
                        selectedBuilding.state,
                        selectedBuilding.postal_code,
                        selectedBuilding.country,
                      ]
                        .filter(Boolean)
                        .join(', ') || 'N/A'}
                    </div>
                  </Col>
                </Row>
            </AdminSectionCard>
          )}

          {!selectedBuilding && !isLoadingGrid && (
            <Card className="admin-card border-0">
              <Card.Body>
                <AdminEmptyState
                  icon={BsGrid}
                  title="No building selected"
                  message="Select a building from the list to view building details and the floor grid."
                />
              </Card.Body>
            </Card>
          )}

          {selectedBuilding && (
            <AdminSectionCard title={<span className="d-flex align-items-center gap-2"><BsGrid /> {`${selectedBuilding.name} - Floor Grid`}</span>}>
                {isLoadingGrid && <div className="text-muted">Loading floor/unit layout...</div>}
                {!isLoadingGrid && floors.length === 0 && (
                  <AdminEmptyState
                    icon={BsGrid}
                    title="No floors found"
                    message="No floor data was found for this building yet."
                    compact
                  />
                )}

                {!isLoadingGrid &&
                  floors.map((floor) => (
                    <div key={floor.id} className="mb-4">
                      <h6 className="mb-3">{floor.floor_label}</h6>
                      <Row className="g-3">
                        {(floor.units ?? []).map((unit) => {
                          const activeAssignment = unit.active_assignment ?? unit.activeAssignment ?? null;
                          const tenant = activeAssignment?.tenant;
                          const phone = tenant?.tenant_profile?.phone ?? tenant?.tenantProfile?.phone;
                          const isOccupied = unit.occupancy_status === 'occupied' && !!tenant;

                          return (
                            <Col key={unit.id} xs={12} sm={6} lg={3}>
                              <Card
                                className="h-100 admin-card border-0"
                                role="button"
                                onClick={() => void openUnit(unit)}
                                style={{ cursor: 'pointer' }}
                              >
                                <Card.Body>
                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                    <h6 className="mb-0">{unit.unit_number}</h6>
                                    <Badge className={isOccupied ? 'badge-soft-success' : 'badge-soft-secondary'}>
                                      {isOccupied ? 'Occupied' : 'Unassigned'}
                                    </Badge>
                                  </div>

                                  {isOccupied ? (
                                    <>
                                      <div className="fw-semibold">{tenant?.name}</div>
                                      <small className="text-muted d-block">{tenant?.email}</small>
                                      <small className="text-muted d-block">{phone ?? 'No phone on profile'}</small>
                                    </>
                                  ) : (
                                    <small className="text-muted">No tenant assigned to this unit.</small>
                                  )}
                                </Card.Body>
                              </Card>
                            </Col>
                          );
                        })}
                      </Row>
                    </div>
                  ))}
                </AdminSectionCard>
          )}
        </div>
      </div>

      <Modal show={selectedUnit !== null} onHide={() => setSelectedUnit(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Unit {selectedUnit?.unit_number} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedUnit ? (
            <p className="text-muted">Loading unit details...</p>
          ) : !selectedTenant ? (
            <div>
              <p className="text-muted mb-3">This unit is currently unassigned.</p>
              
              <h6 className="mb-3">Assign Tenant</h6>
              
              {isLoadingTenants ? (
                <p className="text-muted mb-0">Loading available tenants...</p>
              ) : availableTenants.length === 0 ? (
                <p className="text-muted mb-0">No available tenants to assign.</p>
              ) : (
                <Form.Group className="mb-3">
                  <Form.Label>Select Tenant</Form.Label>
                  <Form.Select 
                    value={selectedTenantForAssignment}
                    onChange={(e) => setSelectedTenantForAssignment(e.target.value ? Number(e.target.value) : '')}
                  >
                    <option value="">-- Choose a tenant --</option>
                    {availableTenants.map((tenant) => (
                      <option key={tenant.id} value={tenant.id}>
                        {tenant.name} ({tenant.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              )}
            </div>
          ) : (
            <>
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div>
                  <small className="text-muted d-block">Tenant</small>
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <BsPerson /> {selectedTenant?.name ?? 'Unknown'}
                  </div>
                </div>
                <div>
                  <small className="text-muted d-block">Contact</small>
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <BsTelephone /> {selectedTenantPhone ?? 'Not provided'}
                  </div>
                </div>
              </div>

              <h6 className="mb-3">Tenant Documents</h6>
              {isLoadingTenantDocuments && <p className="text-muted mb-0">Loading tenant documents...</p>}
              {!isLoadingTenantDocuments && tenantDocuments.length === 0 && (
                <p className="text-muted mb-0">No uploaded documents found for this tenant.</p>
              )}

              {!isLoadingTenantDocuments && tenantDocuments.length > 0 && (
                <div className="d-grid gap-2">
                  {tenantDocuments.map((doc) => {
                    const type = doc.document_type ?? doc.documentType;

                    return (
                      <Card key={doc.id} className="border">
                        <Card.Body className="py-3">
                          <div className="d-flex justify-content-between align-items-center gap-3">
                            <div>
                              <div className="fw-semibold">{type?.label ?? 'Document'}</div>
                              <small className="text-muted">{doc.original_filename}</small>
                            </div>
                            <div className="d-flex align-items-center gap-2">
                              <Badge className={doc.status === 'approved' ? 'badge-soft-success' : doc.status === 'rejected' ? 'badge-soft-danger' : 'badge-soft-secondary'}>
                                {doc.status}
                              </Badge>
                              <Button
                                size="sm"
                                variant="outline-primary"
                                onClick={() => void api.openAdminDocument(doc.id)}
                              >
                                <BsFileEarmarkArrowUp className="me-1" /> Open
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {!selectedTenant && availableTenants.length > 0 && (
            <Button
              variant="primary"
              onClick={handleAssignTenant}
              disabled={!selectedTenantForAssignment || isAssigning}
            >
              {isAssigning ? 'Assigning...' : 'Assign Tenant'}
            </Button>
          )}
          {selectedTenant && (
            <Button
              variant="danger"
              onClick={handleUnassignTenant}
              disabled={isAssigning}
            >
              {isAssigning ? 'Unassigning...' : 'Unassign Tenant'}
            </Button>
          )}
          <Button variant="secondary" onClick={() => setSelectedUnit(null)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isCreateBuildingModalOpen} onHide={() => setIsCreateBuildingModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add New Building</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Building Name *</Form.Label>
              <Form.Control
                value={createBuildingForm.name}
                onChange={(e) => setCreateBuildingForm((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. Mayder Doa Vila"
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Building Code</Form.Label>
              <Form.Control
                value={createBuildingForm.code ?? ''}
                onChange={(e) => setCreateBuildingForm((prev) => ({ ...prev, code: e.target.value }))}
                placeholder="e.g. MDV-1"
              />
            </Form.Group>

            <Row className="g-3 mb-3">
              <Col>
                <Form.Group>
                  <Form.Label>Total Floors *</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    value={createBuildingForm.total_floors}
                    onChange={(e) =>
                      setCreateBuildingForm((prev) => ({
                        ...prev,
                        total_floors: Math.max(1, Number(e.target.value) || 1),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Units Per Floor *</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    max={26}
                    value={createBuildingForm.units_per_floor}
                    onChange={(e) =>
                      setCreateBuildingForm((prev) => ({
                        ...prev,
                        units_per_floor: Math.max(1, Math.min(26, Number(e.target.value) || 1)),
                      }))
                    }
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={createBuildingForm.address_line ?? ''}
                onChange={(e) => setCreateBuildingForm((prev) => ({ ...prev, address_line: e.target.value }))}
                placeholder="House/Road/Area"
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={createBuildingForm.city ?? ''}
                    onChange={(e) => setCreateBuildingForm((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    value={createBuildingForm.country ?? ''}
                    onChange={(e) => setCreateBuildingForm((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsCreateBuildingModalOpen(false)} disabled={isCreatingBuilding}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreateBuilding} disabled={isCreatingBuilding}>
            {isCreatingBuilding ? 'Creating...' : 'Create Building'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={isEditBuildingModalOpen} onHide={() => setIsEditBuildingModalOpen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Building Info</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Building Name *</Form.Label>
              <Form.Control
                value={editBuildingForm.name ?? ''}
                onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, name: e.target.value }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Building Code</Form.Label>
              <Form.Control
                value={editBuildingForm.code ?? ''}
                onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, code: e.target.value }))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Address</Form.Label>
              <Form.Control
                value={editBuildingForm.address_line ?? ''}
                onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, address_line: e.target.value }))}
              />
            </Form.Group>

            <Row className="g-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>City</Form.Label>
                  <Form.Control
                    value={editBuildingForm.city ?? ''}
                    onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, city: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>State</Form.Label>
                  <Form.Control
                    value={editBuildingForm.state ?? ''}
                    onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, state: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row className="g-3 mt-1">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Postal Code</Form.Label>
                  <Form.Control
                    value={editBuildingForm.postal_code ?? ''}
                    onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, postal_code: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Country</Form.Label>
                  <Form.Control
                    value={editBuildingForm.country ?? ''}
                    onChange={(e) => setEditBuildingForm((prev) => ({ ...prev, country: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setIsEditBuildingModalOpen(false)} disabled={isUpdatingBuilding}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleUpdateBuilding} disabled={isUpdatingBuilding}>
            {isUpdatingBuilding ? 'Saving...' : 'Save Changes'}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

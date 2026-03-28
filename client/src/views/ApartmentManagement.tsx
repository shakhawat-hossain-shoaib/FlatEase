import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Modal, Row } from 'react-bootstrap';
import { BsBuilding, BsFileEarmarkArrowUp, BsGrid, BsPerson, BsTelephone } from 'react-icons/bs';
import ApiClient, { BuildingEntity, FloorEntity, TenantDocumentEntity, UnitEntity } from '../api';
import { DashboardLayout } from './DashboardLayout';

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

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoadingBuildings(true);
      const response = await api.getAdminBuildings();
      if (response && response.length > 0) {
        setBuildings(response);
        setSelectedBuildingId((current) => current ?? response[0].id);
      }
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

  const totalUnits = useMemo(() => buildings.reduce((sum, item) => sum + (item.units_count ?? 0), 0), [buildings]);
  const totalOccupied = useMemo(() => buildings.reduce((sum, item) => sum + (item.occupied_units_count ?? 0), 0), [buildings]);
  const totalVacant = Math.max(0, totalUnits - totalOccupied);

  const openUnit = async (unit: UnitEntity) => {
    const activeAssignment = unit.active_assignment ?? unit.activeAssignment ?? null;
    const normalized: UnitWithAssignment = {
      ...unit,
      activeAssignmentNormalized: activeAssignment,
    };

    setSelectedUnit(normalized);

    if (!activeAssignment?.tenant_user_id) {
      setTenantDocuments([]);
      return;
    }

    setIsLoadingTenantDocuments(true);
    const response = await api.getAdminTenantDocuments(activeAssignment.tenant_user_id);
    setTenantDocuments(response ?? []);
    setIsLoadingTenantDocuments(false);
  };

  const selectedTenant = selectedUnit?.activeAssignmentNormalized?.tenant;
  const selectedTenantPhone = selectedTenant?.tenant_profile?.phone ?? selectedTenant?.tenantProfile?.phone;

  return (
    <DashboardLayout role="Admin">
      <div style={{ background: '#e8f0ff', minHeight: '100vh' }}>
        <div className="container-fluid py-2">
          <div className="d-flex align-items-start justify-content-between mb-4">
            <div>
              <h2 className="mb-1">Building & Tenant Management</h2>
              <p className="text-muted mb-0">Select a building to view floor-wise unit occupancy and tenant details</p>
            </div>
          </div>

          <Row className="g-3 mb-4">
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <small className="text-muted d-block">Buildings</small>
                  <h4 className="mb-0">{buildings.length}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <small className="text-muted d-block">Occupied Units</small>
                  <h4 className="mb-0">{totalOccupied}</h4>
                </Card.Body>
              </Card>
            </Col>
            <Col md={4}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <small className="text-muted d-block">Vacant Units</small>
                  <h4 className="mb-0">{totalVacant}</h4>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center gap-2">
              <BsBuilding />
              <h5 className="mb-0">Buildings</h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {isLoadingBuildings && <div className="text-muted">Loading buildings...</div>}
              {!isLoadingBuildings && buildings.length === 0 && <div className="text-muted">No buildings found.</div>}

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
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Header className="bg-white border-0 pt-4 px-4 d-flex align-items-center gap-2">
              <BsGrid />
              <h5 className="mb-0">
                {selectedBuilding?.name ? `${selectedBuilding.name} - Floor Grid` : 'Floor Grid'}
              </h5>
            </Card.Header>
            <Card.Body className="px-4 pb-4">
              {isLoadingGrid && <div className="text-muted">Loading floor/unit layout...</div>}
              {!isLoadingGrid && floors.length === 0 && <div className="text-muted">No floor data found for this building.</div>}

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
                              className="h-100 border-0 shadow-sm"
                              role="button"
                              onClick={() => void openUnit(unit)}
                              style={{ cursor: 'pointer' }}
                            >
                              <Card.Body>
                                <div className="d-flex justify-content-between align-items-center mb-2">
                                  <h6 className="mb-0">{unit.unit_number}</h6>
                                  <Badge bg={isOccupied ? 'success' : 'secondary'}>
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
            </Card.Body>
          </Card>
        </div>
      </div>

      <Modal show={selectedUnit !== null} onHide={() => setSelectedUnit(null)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Unit {selectedUnit?.unit_number} Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {!selectedTenant && <p className="text-muted mb-0">This unit is currently unassigned.</p>}

          {selectedTenant && (
            <>
              <div className="d-flex flex-wrap gap-4 mb-4">
                <div>
                  <small className="text-muted d-block">Tenant</small>
                  <div className="fw-semibold d-flex align-items-center gap-2">
                    <BsPerson /> {selectedTenant.name}
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
                              <Badge bg={doc.status === 'approved' ? 'success' : doc.status === 'rejected' ? 'danger' : 'secondary'}>
                                {doc.status}
                              </Badge>
                              <Button
                                as="a"
                                href={api.getAdminDocumentDownloadUrl(doc.id)}
                                target="_blank"
                                rel="noreferrer"
                                size="sm"
                                variant="outline-primary"
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
      </Modal>
    </DashboardLayout>
  );
}

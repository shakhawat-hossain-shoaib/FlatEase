import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Form, Modal, Row, Spinner, Table } from 'react-bootstrap';
import { BsGear, BsListCheck } from 'react-icons/bs';
import toast from 'react-hot-toast';
import ApiClient, {
  BillChargeTypeEntity,
  BuildingChargeConfigEntity,
  BuildingEntity,
} from '../api';
import { DashboardLayout } from './DashboardLayout';
import { AdminEmptyState } from '../components/admin/AdminEmptyState';
import { AdminPageHeader } from '../components/admin/AdminPageHeader';
import { AdminSectionCard } from '../components/admin/AdminSectionCard';

function formatMoney(value: string | number) {
  const num = typeof value === 'string' ? Number(value) : value;
  if (Number.isNaN(num)) {
    return 'BDT 0.00';
  }

  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency: 'BDT',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
}

function formatDate(value?: string | null) {
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

export default function BillServiceChargePage() {
  const api = useMemo(() => new ApiClient(), []);

  const [buildings, setBuildings] = useState<BuildingEntity[]>([]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>('');
  const [chargeTypes, setChargeTypes] = useState<BillChargeTypeEntity[]>([]);
  const [configs, setConfigs] = useState<BuildingChargeConfigEntity[]>([]);
  const [isLoadingBuildings, setIsLoadingBuildings] = useState(true);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isMaterializing, setIsMaterializing] = useState(false);

  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newTypeName, setNewTypeName] = useState('');
  const [isSavingType, setIsSavingType] = useState(false);

  const [showConfigModal, setShowConfigModal] = useState(false);
  const [editingConfig, setEditingConfig] = useState<BuildingChargeConfigEntity | null>(null);
  const [selectedTypeId, setSelectedTypeId] = useState('');
  const [amount, setAmount] = useState('');
  const [recurrence, setRecurrence] = useState<'monthly' | 'one_time'>('monthly');
  const [effectiveFrom, setEffectiveFrom] = useState(() => new Date().toISOString().slice(0, 10));
  const [effectiveTo, setEffectiveTo] = useState('');
  const [billingMonth, setBillingMonth] = useState('');
  const [notes, setNotes] = useState('');
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const utilityTypes = chargeTypes.filter((type) => type.category === 'utility');
  const serviceTypes = chargeTypes.filter((type) => type.category === 'service');

  const utilityConfigs = configs.filter((config) => config.charge_type?.category === 'utility' && config.is_active);
  const serviceConfigs = configs.filter((config) => config.charge_type?.category === 'service' && config.is_active);

  useEffect(() => {
    const loadBuildings = async () => {
      setIsLoadingBuildings(true);
      const response = await api.getAdminBuildings();
      const items = response ?? [];
      setBuildings(items);
      if (items.length > 0) {
        setSelectedBuildingId(String(items[0].id));
      }
      setIsLoadingBuildings(false);
    };

    void loadBuildings();
  }, [api]);

  const loadChargeData = async (buildingId: number) => {
    setIsLoadingData(true);
    const response = await api.getAdminBillServiceCharges(buildingId);
    if (response) {
      setChargeTypes(response.charge_types ?? []);
      setConfigs(response.configs ?? []);
    } else {
      setChargeTypes([]);
      setConfigs([]);
    }
    setIsLoadingData(false);
  };

  useEffect(() => {
    if (!selectedBuildingId) {
      return;
    }

    void loadChargeData(Number(selectedBuildingId));
  }, [selectedBuildingId]);

  const handleCreateType = async () => {
    if (!selectedBuildingId) {
      toast.error('Select a building first.');
      return;
    }

    const trimmedName = newTypeName.trim();
    if (!trimmedName) {
      toast.error('Service charge type name is required.');
      return;
    }

    setIsSavingType(true);
    const response = await api.createAdminBillChargeType({
      building_id: Number(selectedBuildingId),
      display_name: trimmedName,
      category: 'service',
    });

    if (response) {
      toast.success('Service charge type created.');
      setShowTypeModal(false);
      setNewTypeName('');
      await loadChargeData(Number(selectedBuildingId));
    }

    setIsSavingType(false);
  };

  const resetConfigForm = () => {
    setEditingConfig(null);
    setSelectedTypeId('');
    setAmount('');
    setRecurrence('monthly');
    setEffectiveFrom(new Date().toISOString().slice(0, 10));
    setEffectiveTo('');
    setBillingMonth('');
    setNotes('');
  };

  const openCreateConfigModal = () => {
    resetConfigForm();
    setShowConfigModal(true);
  };

  const openEditConfigModal = (config: BuildingChargeConfigEntity) => {
    setEditingConfig(config);
    setSelectedTypeId(String(config.charge_type_id));
    setAmount(String(config.amount));
    setRecurrence(config.recurrence);
    setEffectiveFrom(config.effective_from.slice(0, 10));
    setEffectiveTo(config.effective_to ? config.effective_to.slice(0, 10) : '');
    setBillingMonth(config.billing_month ? config.billing_month.slice(0, 10) : '');
    setNotes(config.notes ?? '');
    setShowConfigModal(true);
  };

  const handleSaveConfig = async () => {
    if (!selectedBuildingId) {
      toast.error('Select a building first.');
      return;
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount) || parsedAmount < 0) {
      toast.error('Please enter a valid amount.');
      return;
    }

    if (!effectiveFrom) {
      toast.error('Effective from date is required.');
      return;
    }

    if (!editingConfig && !selectedTypeId) {
      toast.error('Please select a charge type.');
      return;
    }

    if (recurrence === 'one_time' && !billingMonth) {
      toast.error('Billing month is required for one-time charges.');
      return;
    }

    setIsSavingConfig(true);

    if (editingConfig) {
      const response = await api.updateAdminBillServiceChargeConfig(editingConfig.id, {
        amount: parsedAmount,
        recurrence,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || undefined,
        billing_month: billingMonth || undefined,
        notes: notes || undefined,
      });

      if (response) {
        toast.success('Charge configuration updated.');
        setShowConfigModal(false);
        await loadChargeData(Number(selectedBuildingId));
      }
    } else {
      const response = await api.createAdminBillServiceChargeConfig({
        building_id: Number(selectedBuildingId),
        charge_type_id: Number(selectedTypeId),
        amount: parsedAmount,
        recurrence,
        effective_from: effectiveFrom,
        effective_to: effectiveTo || undefined,
        billing_month: billingMonth || undefined,
        notes: notes || undefined,
      });

      if (response) {
        toast.success('Charge configuration created.');
        setShowConfigModal(false);
        await loadChargeData(Number(selectedBuildingId));
      }
    }

    setIsSavingConfig(false);
  };

  const handleDeactivateConfig = async (config: BuildingChargeConfigEntity) => {
    if (!window.confirm('Deactivate this charge configuration?')) {
      return;
    }

    const response = await api.deleteAdminBillServiceChargeConfig(config.id);
    if (response?.success) {
      toast.success('Configuration deactivated.');
      await loadChargeData(Number(selectedBuildingId));
    }
  };

  const handleDeleteCustomType = async (typeId: number) => {
    if (!window.confirm('Remove this custom service charge type?')) {
      return;
    }

    const response = await api.deleteAdminBillChargeType(typeId);
    if (response?.success) {
      toast.success('Charge type removed.');
      await loadChargeData(Number(selectedBuildingId));
    }
  };

  const handleMaterialize = async () => {
    if (!selectedBuildingId) {
      toast.error('Select a building first.');
      return;
    }

    const billingMonthValue = new Date().toISOString().slice(0, 10);

    setIsMaterializing(true);
    const response = await api.materializeAdminBillServiceCharges({
      building_id: Number(selectedBuildingId),
      billing_month: billingMonthValue,
    });

    if (response?.success) {
      toast.success(`Materialized for ${response.processed_assignments} active assignments.`);
    }

    setIsMaterializing(false);
  };

  return (
    <DashboardLayout role="Admin">
      <div className="admin-page-bg">
        <div className="container-fluid admin-page-container">
          <AdminPageHeader
            title="Bill & Service Charge"
            subtitle="Configure building-level utility bills and custom service charges."
            action={
              <Button variant="outline-primary" onClick={() => void handleMaterialize()} disabled={isMaterializing || !selectedBuildingId}>
              {isMaterializing ? 'Applying...' : 'Materialize Current Month'}
              </Button>
            }
          />

          <AdminSectionCard className="mb-3" title="Building & Charge Actions">
              <Row className="g-3 align-items-end">
                <Col md={8} lg={6}>
                  <Form.Label>Building</Form.Label>
                  <Form.Select
                    value={selectedBuildingId}
                    onChange={(event) => setSelectedBuildingId(event.target.value)}
                    disabled={isLoadingBuildings}
                  >
                    {isLoadingBuildings && <option>Loading buildings...</option>}
                    {!isLoadingBuildings && buildings.length === 0 && <option>No buildings available</option>}
                    {!isLoadingBuildings &&
                      buildings.map((building) => (
                        <option key={building.id} value={building.id}>
                          {building.name}
                        </option>
                      ))}
                  </Form.Select>
                </Col>
                <Col md={4} lg={6}>
                  <div className="d-flex gap-2 justify-content-md-end">
                    <Button variant="outline-secondary" onClick={() => setShowTypeModal(true)} disabled={!selectedBuildingId}>
                      New Custom Type
                    </Button>
                    <Button variant="primary" onClick={openCreateConfigModal} disabled={!selectedBuildingId}>
                      Add Charge Config
                    </Button>
                  </div>
                </Col>
              </Row>
          </AdminSectionCard>

          {isLoadingData && (
            <Card className="admin-card border-0 mb-3">
              <Card.Body className="d-flex align-items-center gap-2 text-muted">
                <Spinner animation="border" size="sm" />
                Loading charge data...
              </Card.Body>
            </Card>
          )}

          <Row className="g-3">
            <Col lg={6}>
              <AdminSectionCard className="h-100" title={<span className="d-flex align-items-center gap-2"><BsGear /> Fixed Utility Bills</span>}>
                  <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Effective</th>
                        <th>Recurrence</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {utilityConfigs.length === 0 && (
                        <tr>
                          <td colSpan={5}>
                            <AdminEmptyState
                              icon={BsListCheck}
                              title="No utility configs"
                              message="Add utility configurations to generate monthly billing items."
                              compact
                            />
                          </td>
                        </tr>
                      )}
                      {utilityConfigs.map((config) => (
                        <tr key={config.id}>
                          <td>{config.charge_type?.display_name ?? 'Utility'}</td>
                          <td>{formatMoney(config.amount)}</td>
                          <td>{formatDate(config.effective_from)}</td>
                          <td>
                            <Badge className={config.recurrence === 'monthly' ? 'badge-soft-primary' : 'badge-soft-secondary'}>{config.recurrence}</Badge>
                          </td>
                          <td className="text-end">
                            <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEditConfigModal(config)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => void handleDeactivateConfig(config)}>
                              Deactivate
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
              </AdminSectionCard>
            </Col>

            <Col lg={6}>
              <AdminSectionCard className="h-100 mb-3" title={<span className="d-flex align-items-center gap-2"><BsGear /> Custom Service Charges</span>}>
                  <Table responsive hover className="admin-table admin-table-hover align-middle mb-0">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Amount</th>
                        <th>Effective</th>
                        <th>Recurrence</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {serviceConfigs.length === 0 && (
                        <tr>
                          <td colSpan={5}>
                            <AdminEmptyState
                              icon={BsListCheck}
                              title="No custom service configs"
                              message="Create custom service charge types and link them here."
                              compact
                            />
                          </td>
                        </tr>
                      )}
                      {serviceConfigs.map((config) => (
                        <tr key={config.id}>
                          <td>{config.charge_type?.display_name ?? 'Service'}</td>
                          <td>{formatMoney(config.amount)}</td>
                          <td>{formatDate(config.effective_from)}</td>
                          <td>
                            <Badge className={config.recurrence === 'monthly' ? 'badge-soft-primary' : 'badge-soft-secondary'}>{config.recurrence}</Badge>
                          </td>
                          <td className="text-end">
                            <Button size="sm" variant="outline-primary" className="me-2" onClick={() => openEditConfigModal(config)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline-danger" onClick={() => void handleDeactivateConfig(config)}>
                              Deactivate
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
              </AdminSectionCard>

              <AdminSectionCard title="Available Custom Types">
                  <div className="d-flex flex-wrap gap-2">
                    {serviceTypes.filter((type) => !type.is_system).length === 0 && (
                      <AdminEmptyState
                        icon={BsListCheck}
                        title="No custom types"
                        message="Create a custom type to start configuring service charges."
                        compact
                      />
                    )}
                    {serviceTypes
                      .filter((type) => !type.is_system)
                      .map((type) => (
                        <div key={type.id} className="d-flex align-items-center gap-2 px-2 py-1 border rounded bg-light">
                          <span>{type.display_name}</span>
                          <Button size="sm" variant="outline-danger" onClick={() => void handleDeleteCustomType(type.id)}>
                            Remove
                          </Button>
                        </div>
                      ))}
                  </div>
              </AdminSectionCard>
            </Col>
          </Row>
        </div>
      </div>

      <Modal show={showTypeModal} onHide={() => setShowTypeModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>New Service Charge Type</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group>
            <Form.Label>Type Name</Form.Label>
            <Form.Control
              type="text"
              value={newTypeName}
              onChange={(event) => setNewTypeName(event.target.value)}
              placeholder="e.g. Security Guard, Lift Maintenance"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTypeModal(false)} disabled={isSavingType}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleCreateType()} disabled={isSavingType}>
            {isSavingType ? 'Saving...' : 'Save Type'}
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showConfigModal} onHide={() => setShowConfigModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{editingConfig ? 'Edit Charge Configuration' : 'New Charge Configuration'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="g-3">
            <Col md={6}>
              <Form.Label>Charge Type</Form.Label>
              <Form.Select
                value={selectedTypeId}
                onChange={(event) => setSelectedTypeId(event.target.value)}
                disabled={!!editingConfig}
              >
                <option value="">Select type</option>
                {utilityTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name} ({type.category})
                  </option>
                ))}
                {serviceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.display_name} ({type.category})
                  </option>
                ))}
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Amount</Form.Label>
              <Form.Control
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Recurrence</Form.Label>
              <Form.Select
                value={recurrence}
                onChange={(event) => setRecurrence(event.target.value as 'monthly' | 'one_time')}
              >
                <option value="monthly">Monthly</option>
                <option value="one_time">One-time</option>
              </Form.Select>
            </Col>
            <Col md={6}>
              <Form.Label>Billing Month (one-time)</Form.Label>
              <Form.Control
                type="date"
                value={billingMonth}
                onChange={(event) => setBillingMonth(event.target.value)}
                disabled={recurrence !== 'one_time'}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Effective From</Form.Label>
              <Form.Control
                type="date"
                value={effectiveFrom}
                onChange={(event) => setEffectiveFrom(event.target.value)}
              />
            </Col>
            <Col md={6}>
              <Form.Label>Effective To</Form.Label>
              <Form.Control
                type="date"
                value={effectiveTo}
                onChange={(event) => setEffectiveTo(event.target.value)}
              />
            </Col>
            <Col md={12}>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Optional notes"
              />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowConfigModal(false)} disabled={isSavingConfig}>
            Cancel
          </Button>
          <Button variant="primary" onClick={() => void handleSaveConfig()} disabled={isSavingConfig}>
            {isSavingConfig ? 'Saving...' : 'Save Configuration'}
          </Button>
        </Modal.Footer>
      </Modal>
    </DashboardLayout>
  );
}

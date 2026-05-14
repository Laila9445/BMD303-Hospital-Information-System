import { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Search, ChevronDown, Package } from 'lucide-react';
import { useBilling } from '../../../billing';
import { formatCurrency } from '../../../billing/billingUtils';
import { useAuth } from '../../../context/AuthContext';
import { getVisibleServices, getVisibleDepartments } from '../../../utils/roleBasedVisibility';

/* ─── Shared design tokens ─── */
const PageContainer = styled.div`
  padding: 8px 20px 20px 20px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 20px;

  h1 {
    font-size: 20px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 2px 0;
  }

  p {
    font-size: 12px;
    color: #6b7280;
    margin: 0;
  }
`;

const Card = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 16px;
  transition: box-shadow 0.2s;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #111827;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e5e7eb;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

const Input = styled.input`
  padding: 8px 12px;
  font-size: 13px;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.2s;

  &::placeholder {
    color: #9ca3af;
  }

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SelectWrapper = styled.div`
  position: relative;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px 28px 8px 12px;
  font-size: 13px;
  color: #111827;
  background-color: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  appearance: none;
  outline: none;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.08);
  }
`;

const SelectChevron = styled(ChevronDown)`
  position: absolute;
  right: 9px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #9ca3af;
`;

const FormActions = styled.div`
  display: flex;
  gap: 8px;
`;

const PrimaryButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 600;
  color: #ffffff;
  background-color: #2563eb;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  padding: 8px 18px;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const FiltersRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const SearchWrapper = styled.div`
  position: relative;
  flex: 1;
  min-width: 200px;
  max-width: 340px;
`;

const SearchIconEl = styled(Search)`
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
`;

const SearchInput = styled(Input)`
  width: 100%;
  padding-left: 34px;
  box-sizing: border-box;
`;

const FilterSelectWrapper = styled.div`
  position: relative;
`;

const FilterSelect = styled(Select)`
  width: auto;
  padding: 8px 28px 8px 12px;
`;

const TableCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Thead = styled.thead`
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e7eb;
`;

const Th = styled.th`
  padding: 12px 16px;
  text-align: ${({ $right }) => ($right ? 'right' : 'left')};
  font-size: 12px;
  font-weight: 600;
  color: #374151;
  letter-spacing: 0.02em;
  text-transform: uppercase;
`;

const Tbody = styled.tbody`
  & > tr {
    border-bottom: 1px solid #f3f4f6;
    transition: background-color 0.15s;

    &:last-child { border-bottom: none; }
    &:hover { background-color: #f9fafb; }
  }
`;

const Td = styled.td`
  padding: 13px 16px;
  vertical-align: middle;
  text-align: ${({ $right }) => ($right ? 'right' : 'left')};
`;

const ServiceName = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
`;

const DeptBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  background-color: #eff6ff;
  color: #1d4ed8;
  border: 1px solid #bfdbfe;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border-radius: 20px;
  border: 1px solid;

  ${({ $status }) =>
    $status === 'Active'
      ? `background-color: #ecfdf5; color: #065f46; border-color: #a7f3d0;`
      : `background-color: #f8fafc; color: #475569; border-color: #e2e8f0;`}
`;

const PriceText = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #111827;
`;

const DescriptionText = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
`;

/* Dropdown action menu */
const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`;

const OptionsButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 5px 10px;
  font-size: 12px;
  font-weight: 500;
  color: #374151;
  background-color: #f9fafb;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    background-color: #f3f4f6;
  }
`;

const DropdownMenu = styled.div`
  position: absolute;
  right: 0;
  margin-top: 4px;
  width: 148px;
  background-color: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  z-index: 20;
  overflow: hidden;
`;

const DropdownItem = styled.button`
  display: block;
  width: 100%;
  text-align: left;
  padding: 10px 14px;
  font-size: 13px;
  font-weight: 500;
  background: none;
  border: none;
  cursor: pointer;
  transition: background-color 0.15s;
  color: ${({ $danger }) => ($danger ? '#b91c1c' : '#374151')};

  &:hover {
    background-color: ${({ $danger }) => ($danger ? '#fef2f2' : '#f9fafb')};
    color: ${({ $danger }) => ($danger ? '#991b1b' : '#111827')};
  }

  & + & {
    border-top: 1px solid #f3f4f6;
  }
`;

const AlertBanner = styled.div`
  padding: 12px 16px;
  border-radius: 10px;
  border: 1px solid #fde68a;
  background-color: #fffbeb;
  margin-bottom: 16px;

  p {
    font-size: 13px;
    color: #92400e;
    margin: 0;
  }
`;

const EmptyCard = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 48px 24px;
  text-align: center;

  h3 {
    font-size: 15px;
    font-weight: 600;
    color: #111827;
    margin: 12px 0 4px 0;
  }

  p {
    font-size: 13px;
    color: #6b7280;
    margin: 0;
  }
`;

/* ─── Component ─── */
const BillingServices = () => {
  const { servicesState, addService, updateService, toggleService } = useBilling();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm]       = useState('');
  const [departmentFilter, setDeptFilter] = useState('All');
  const [formState, setFormState]         = useState({
    serviceName: '',
    department: 'Doctor',
    price: '',
    description: '',
  });
  const [editingId, setEditingId]         = useState(null);
  const [expandedMenu, setExpandedMenu]   = useState(null);

  const services = useMemo(() => servicesState.items || [], [servicesState.items]);

  const visibleServices = useMemo(
    () => getVisibleServices(services, user?.role),
    [services, user?.role]
  );

  const allowedDepartments = useMemo(
    () => getVisibleDepartments(user?.role),
    [user?.role]
  );

  const filteredServices = useMemo(
    () =>
      visibleServices.filter((s) => {
        const matchesSearch     = s.serviceName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesDepartment = departmentFilter === 'All' || s.department === departmentFilter;
        return matchesSearch && matchesDepartment;
      }),
    [visibleServices, searchTerm, departmentFilter]
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formState.serviceName || !formState.price) return;
    if (editingId) {
      await updateService(editingId, { ...formState, price: Number(formState.price) });
    } else {
      await addService({ ...formState, price: Number(formState.price), status: 'Active' });
    }
    setFormState({ serviceName: '', department: 'Doctor', price: '', description: '' });
    setEditingId(null);
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setFormState({
      serviceName: service.serviceName,
      department:  service.department,
      price:       service.price,
      description: service.description || '',
    });
    setExpandedMenu(null);
  };

  const handleToggleStatus = async (serviceId) => {
    await toggleService(serviceId);
    setExpandedMenu(null);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setFormState({ serviceName: '', department: 'Doctor', price: '', description: '' });
  };

  if (user?.role?.toLowerCase() === 'patient') {
    return (
      <PageContainer>
        <Header>
          <h1>Service Pricing</h1>
          <p>Manage clinic services and dynamic pricing</p>
        </Header>
        <AlertBanner>
          <p>
            <strong>Access Restricted:</strong> Patients cannot view internal service pricing.
          </p>
        </AlertBanner>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <h1>Service Pricing</h1>
        <p>Manage clinic services and dynamic pricing</p>
      </Header>

      {/* Add / Edit Form */}
      <Card>
        <CardTitle>{editingId ? 'Edit Service' : 'Add New Service'}</CardTitle>
        <form onSubmit={handleSubmit}>
          <FormGrid>
            <FormGroup>
              <Label>Service Name *</Label>
              <Input
                required
                value={formState.serviceName}
                onChange={(e) => setFormState((p) => ({ ...p, serviceName: e.target.value }))}
                placeholder="e.g. MRI Scan"
              />
            </FormGroup>

            <FormGroup>
              <Label>Department *</Label>
              <SelectWrapper>
                <Select
                  value={formState.department}
                  onChange={(e) => setFormState((p) => ({ ...p, department: e.target.value }))}
                >
                  {allowedDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </Select>
                <SelectChevron size={14} />
              </SelectWrapper>
            </FormGroup>

            <FormGroup>
              <Label>Price (EGP) *</Label>
              <Input
                type="number"
                required
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(e) => setFormState((p) => ({ ...p, price: e.target.value }))}
                placeholder="0"
              />
            </FormGroup>

            <FormGroup>
              <Label>Description</Label>
              <Input
                value={formState.description}
                onChange={(e) => setFormState((p) => ({ ...p, description: e.target.value }))}
                placeholder="Optional notes"
              />
            </FormGroup>
          </FormGrid>

          <FormActions>
            <PrimaryButton type="submit">
              {editingId ? 'Update Service' : 'Add Service'}
            </PrimaryButton>
            {editingId && (
              <SecondaryButton type="button" onClick={cancelEdit}>
                Cancel
              </SecondaryButton>
            )}
          </FormActions>
        </form>
      </Card>

      {/* Search & Filters */}
      <FiltersRow>
        <SearchWrapper>
          <SearchIconEl size={15} />
          <SearchInput
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by service name…"
          />
        </SearchWrapper>

        <FilterSelectWrapper>
          <FilterSelect
            value={departmentFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
          >
            <option value="All">All Departments</option>
            {allowedDepartments.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </FilterSelect>
          <SelectChevron size={14} />
        </FilterSelectWrapper>
      </FiltersRow>

      {/* Services Table */}
      {filteredServices.length === 0 ? (
        <EmptyCard>
          <Package size={28} color="#d1d5db" />
          <h3>No services found</h3>
          <p>Try adjusting your filters or add a new service above</p>
        </EmptyCard>
      ) : (
        <TableCard>
          <div style={{ overflowX: 'auto' }}>
            <Table>
              <Thead>
                <tr>
                  <Th>Service Name</Th>
                  <Th>Department</Th>
                  <Th $right>Price</Th>
                  <Th>Description</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </tr>
              </Thead>
              <Tbody>
                {filteredServices.map((service) => (
                  <tr key={service.id}>
                    <Td><ServiceName>{service.serviceName}</ServiceName></Td>
                    <Td><DeptBadge>{service.department}</DeptBadge></Td>
                    <Td $right><PriceText>{formatCurrency(service.price)}</PriceText></Td>
                    <Td><DescriptionText>{service.description || '—'}</DescriptionText></Td>
                    <Td>
                      <StatusBadge $status={service.status || 'Active'}>
                        {service.status || 'Active'}
                      </StatusBadge>
                    </Td>
                    <Td>
                      <DropdownWrapper>
                        <OptionsButton
                          onClick={() =>
                            setExpandedMenu(expandedMenu === service.id ? null : service.id)
                          }
                        >
                          Options
                          <ChevronDown size={13} />
                        </OptionsButton>
                        {expandedMenu === service.id && (
                          <DropdownMenu>
                            <DropdownItem onClick={() => handleEdit(service)}>
                              Edit Price
                            </DropdownItem>
                            <DropdownItem
                              $danger={service.status === 'Active'}
                              onClick={() => handleToggleStatus(service.id)}
                            >
                              {service.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </DropdownItem>
                          </DropdownMenu>
                        )}
                      </DropdownWrapper>
                    </Td>
                  </tr>
                ))}
              </Tbody>
            </Table>
          </div>
        </TableCard>
      )}
    </PageContainer>
  );
};

export default BillingServices;

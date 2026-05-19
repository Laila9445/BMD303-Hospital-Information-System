import { useState, useEffect } from 'react';
import styled from 'styled-components';
import toast from 'react-hot-toast';
import Card, { CardHeader, CardBody } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { PlusIcon, BeakerIcon, UserCircleIcon, TrashIcon, PencilIcon } from '@heroicons/react/24/outline';
import mockDatabase from '../../api/mockDatabase';

const PageContainer = styled.div`
  padding: 32px;
  background-color: #f9fafb;
  min-height: 100vh;
`;

const Header = styled.div`
  margin-bottom: 32px;
  
  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #111827;
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 16px;
    color: #6b7280;
    margin: 0;
  }
`;

const ActionButton = styled(Button)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PrescriptionCard = styled(Card)`
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const PatientInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 12px;
  background-color: #eff6ff;
  border-radius: 8px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 16px;
`;

const InfoItem = styled.div`
  padding: 12px;
  background-color: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #2563eb;
  
  label {
    display: block;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 4px;
  }
  
  .value {
    font-size: 14px;
    color: #111827;
    font-weight: 500;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch(props.status) {
      case 'Active': return '#dcfce7';
      case 'Completed': return '#e5e7eb';
      case 'Cancelled': return '#fef3c7';
      default: return '#eff6ff';
    }
  }};
  color: ${props => {
    switch(props.status) {
      case 'Active': return '#15803d';
      case 'Completed': return '#374151';
      case 'Cancelled': return '#92400e';
      default: return '#1d4ed8';
    }
  }};
`;

const DoctorPrescriptions = () => {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAddingPrescription, setIsAddingPrescription] = useState(false);
  const [newPrescription, setNewPrescription] = useState({
    patientId: '',
    medicationName: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: '',
    instructions: '',
    notes: '',
    status: 'Active'
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  
  // Orthopedic-specific common prescriptions
  const orthopedicMedications = [
    { name: 'Paracetamol', dosages: ['500mg', '1000mg'], frequencies: ['Every 6 hours', 'Twice daily', 'Three times daily'], durations: [3, 5, 7, 10, 14] },
    { name: 'Ibuprofen', dosages: ['200mg', '400mg', '600mg'], frequencies: ['Every 8 hours', 'Three times daily', 'Twice daily'], durations: [5, 7, 10, 14, 21] },
    { name: 'Diclofenac', dosages: ['50mg', '75mg', '100mg'], frequencies: ['Twice daily', 'Three times daily', 'Once daily (SR)'], durations: [7, 10, 14, 21, 30] },
    { name: 'Naproxen', dosages: ['250mg', '500mg'], frequencies: ['Twice daily', 'Every 12 hours'], durations: [7, 10, 14, 21] },
    { name: 'Celecoxib', dosages: ['100mg', '200mg'], frequencies: ['Once daily', 'Twice daily'], durations: [14, 21, 30, 60] },
    { name: 'Tramadol', dosages: ['50mg', '100mg'], frequencies: ['Every 6 hours', 'Every 4-6 hours', 'Twice daily'], durations: [3, 5, 7, 10] },
    { name: 'Cyclobenzaprine', dosages: ['5mg', '10mg'], frequencies: ['Three times daily', 'At bedtime'], durations: [7, 10, 14, 21] },
    { name: 'Gabapentin', dosages: ['100mg', '300mg', '400mg'], frequencies: ['Three times daily', 'Twice daily', 'At bedtime'], durations: [14, 21, 30, 60] },
    { name: 'Pregabalin', dosages: ['75mg', '150mg', '300mg'], frequencies: ['Twice daily', 'Three times daily'], durations: [14, 21, 30, 60] },
    { name: 'Omeprazole', dosages: ['20mg', '40mg'], frequencies: ['Once daily', 'Twice daily'], durations: [14, 21, 30, 60] },
    { name: 'Calcium + Vitamin D', dosages: ['500mg/200IU', '600mg/400IU'], frequencies: ['Twice daily', 'Once daily'], durations: [30, 60, 90, 180] },
    { name: 'Glucosamine', dosages: ['500mg', '1500mg'], frequencies: ['Three times daily', 'Once daily'], durations: [30, 60, 90, 180] }
  ];
  
  const commonQuantities = [
    '1 tablet', '2 tablets', '3 tablets', '4 tablets', '5 tablets', 
    
  ];
  
  const commonInstructions = [
    'Take after meals',
    'Take with food',
    'Take on empty stomach',
    'Take at bedtime',
    'Take with plenty of water',
  ];

  useEffect(() => {
    loadPrescriptions();
  }, []);

  const loadPrescriptions = async () => {
    try {
      setLoading(true);
      const allPrescriptions = mockDatabase.prescriptions.findAll();
      
      // Enrich with patient names
      const enriched = allPrescriptions.map(rx => {
        const patient = mockDatabase.users.findAll().find(u => String(u.userId) === String(rx.patientId));
        return {
          ...rx,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown'
        };
      });
      
      setPrescriptions(enriched);
    } catch (error) {
      console.error('Error loading prescriptions:', error);
      toast.error('Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  const handleAddPrescription = () => {
    if (!newPrescription.patientId || !newPrescription.medicationName) {
      toast.error('Please fill in required fields');
      return;
    }

    try {
      const prescriptionData = {
        ...newPrescription,
        patientId: Number(newPrescription.patientId),
        doctorId: 1, // Current logged-in doctor
        doctorName: 'Dr. Ahmed Nabil',
        prescriptionDate: new Date().toISOString().split('T')[0],
        status: 'Active'
      };

      const created = mockDatabase.prescriptions.create(prescriptionData);
      toast.success('Prescription added successfully!');
      setIsAddingPrescription(false);
      loadPrescriptions();
      
      // Reset form
      setNewPrescription({
        patientId: '',
        medicationName: '',
        dosage: '',
        frequency: '',
        duration: '',
        quantity: '',
        instructions: '',
        notes: '',
        status: 'Active'
      });
    } catch (error) {
      console.error('Error creating prescription:', error);
      toast.error('Failed to add prescription');
    }
  };

  const handleDeletePrescription = (id) => {
    if (!window.confirm('Are you sure you want to delete this prescription?')) {
      return;
    }

    try {
      mockDatabase.prescriptions.delete(id);
      toast.success('Prescription deleted successfully!');
      loadPrescriptions();
    } catch (error) {
      console.error('Error deleting prescription:', error);
      toast.error('Failed to delete prescription');
    }
  };

  // Common dosages for general use
  const commonDosages = ['250mg', '500mg', '750mg', '1000mg'];
  const commonFrequencies = ['Once daily', 'Twice daily', 'Three times daily', 'Every 8 hours', 'Every 12 hours', 'At bedtime'];
  const commonDurations = [3, 5, 7, 10, 14, 21, 30];

  // Handle medication selection and auto-populate common values
  const handleMedicationSelect = (medName) => {
    const med = orthopedicMedications.find(m => m.name === medName);
    if (med) {
      setNewPrescription(prev => ({
        ...prev,
        medicationName: med.name,
        dosage: med.dosages[0], // Default to first dosage
        frequency: med.frequencies[0], // Default to first frequency
        duration: med.durations[0] // Default to first duration
      }));
    } else {
      setNewPrescription(prev => ({
        ...prev,
        medicationName: medName
      }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return Number.isNaN(date.getTime()) ? 'Unknown' : date.toLocaleDateString();
  };

  const filteredPrescriptions = prescriptions.filter(rx => {
    // Filter by selected patient ID first
    if (selectedPatientId) {
      const matchesPatient = String(rx.patientId) === String(selectedPatientId);
      if (!matchesPatient) return false;
    }

    // Then apply search text filter
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;

    const patientName = (rx.patientName || '').toLowerCase();
    const medicationName = (rx.medicationName || '').toLowerCase();

    return (
      patientName.includes(query) ||
      medicationName.includes(query) ||
      String(rx.patientId).includes(query)
    );
  });

  // Get all patients for dropdown
  const allPatients = mockDatabase.users.findAll().filter(u => u.role === 'Patient');

  return (
    <PageContainer>
      <Header>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Prescriptions</h1>
            <p>Manage and view all prescriptions</p>
          </div>
          {!isAddingPrescription && (
            <ActionButton 
              variant="primary" 
              onClick={() => setIsAddingPrescription(true)}
            >
              <PlusIcon style={{ width: '20px', height: '20px' }} />
              Add Prescription
            </ActionButton>
          )}
        </div>
      </Header>

      <Card size="large">
        <CardHeader>
          <h3>All Prescriptions</h3>
        </CardHeader>
        <CardBody>
          {isAddingPrescription ? (
            <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '8px', marginBottom: '20px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontSize: '18px', fontWeight: '600' }}>Add New Prescription</h3>
              
              <InfoGrid>
                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Patient <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={newPrescription.patientId}
                    onChange={(e) => setNewPrescription({...newPrescription, patientId: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select patient...</option>
                    {allPatients.map(patient => (
                      <option key={patient.userId} value={patient.userId}>
                        {patient.firstName} {patient.lastName} (ID: {patient.userId})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Medication Name <span style={{ color: '#dc2626' }}>*</span>
                  </label>
                  <select
                    value={newPrescription.medicationName}
                    onChange={(e) => handleMedicationSelect(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select medication...</option>
                    {orthopedicMedications.map(med => (
                      <option key={med.name} value={med.name}>
                        {med.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Dosage
                  </label>
                  <select
                    value={newPrescription.dosage}
                    onChange={(e) => setNewPrescription({...newPrescription, dosage: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select dosage...</option>
                    {(orthopedicMedications.find(m => m.name === newPrescription.medicationName)?.dosages || commonDosages).map(dose => (
                      <option key={dose} value={dose}>{dose}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Frequency
                  </label>
                  <select
                    value={newPrescription.frequency}
                    onChange={(e) => setNewPrescription({...newPrescription, frequency: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select frequency...</option>
                    {(orthopedicMedications.find(m => m.name === newPrescription.medicationName)?.frequencies || commonFrequencies).map(freq => (
                      <option key={freq} value={freq}>{freq}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Duration (days)
                  </label>
                  <select
                    value={newPrescription.duration}
                    onChange={(e) => setNewPrescription({...newPrescription, duration: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select duration...</option>
                    {(orthopedicMedications.find(m => m.name === newPrescription.medicationName)?.durations || commonDurations).map(dur => (
                      <option key={dur} value={dur}>{dur} days</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Quantity
                  </label>
                  <select
                    value={newPrescription.quantity}
                    onChange={(e) => setNewPrescription({...newPrescription, quantity: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select quantity...</option>
                    {commonQuantities.map(qty => (
                      <option key={qty} value={qty}>{qty}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Instructions
                  </label>
                  <select
                    value={newPrescription.instructions}
                    onChange={(e) => setNewPrescription({...newPrescription, instructions: e.target.value})}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="">Select instructions...</option>
                    {commonInstructions.map(inst => (
                      <option key={inst} value={inst}>{inst}</option>
                    ))}
                  </select>
                </div>

                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{ fontSize: '13px', color: '#374151', marginBottom: '6px', display: 'block' }}>
                    Notes
                  </label>
                  <textarea
                    value={newPrescription.notes}
                    onChange={(e) => setNewPrescription({...newPrescription, notes: e.target.value})}
                    placeholder="Additional notes..."
                    rows={2}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px',
                      resize: 'vertical'
                    }}
                  />
                </div>
              </InfoGrid>

              <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                <Button variant="primary" onClick={handleAddPrescription}>
                  Save Prescription
                </Button>
                <Button variant="secondary" onClick={() => setIsAddingPrescription(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : null}

          <div style={{ marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search by patient name, ID, or medication..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              style={{
                width: '240px',
                padding: '10px 12px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px'
              }}
            >
              <option value="">Filter by patient (all)</option>
              {allPatients.map(patient => (
                <option key={patient.userId} value={patient.userId}>
                  {patient.firstName} {patient.lastName} (ID: {patient.userId})
                </option>
              ))}
            </select>
            {selectedPatientId && (
              <button
                onClick={() => setSelectedPatientId('')}
                style={{
                  background: 'transparent',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '10px 16px',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                Clear filter
              </button>
            )}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              Loading prescriptions...
            </div>
          ) : filteredPrescriptions.length > 0 ? (
            <div style={{ display: 'grid', gap: '16px' }}>
              {filteredPrescriptions.map((rx) => (
                <PrescriptionCard key={rx.prescriptionId}>
                  <CardBody>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                      <PatientInfo>
                        <UserCircleIcon style={{ width: '40px', height: '40px', color: '#2563eb' }} />
                        <div>
                          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
                            {rx.patientName || 'Unknown Patient'}
                          </h3>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#6b7280' }}>
                            ID: {rx.patientId} • Prescribed on {formatDate(rx.prescriptionDate)}
                          </p>
                        </div>
                      </PatientInfo>
                      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <StatusBadge status={rx.status}>{rx.status}</StatusBadge>
                        <button
                          onClick={() => handleDeletePrescription(rx.prescriptionId)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            padding: '8px',
                            borderRadius: '6px',
                            color: '#dc2626'
                          }}
                          title="Delete prescription"
                        >
                          <TrashIcon style={{ width: '18px', height: '18px' }} />
                        </button>
                      </div>
                    </div>

                    <div style={{ fontSize: '18px', fontWeight: '600', color: '#2563eb', marginBottom: '16px' }}>
                      💊 {rx.medicationName || rx.medications?.[0]?.name || 'Unknown medication'}
                    </div>

                    <InfoGrid>
                      <InfoItem>
                        <label>Dosage</label>
                        <div className="value">
                        {rx.dosage || rx.medications?.[0]?.dosage || '-'}
                      </div>
                      </InfoItem>
                      <InfoItem>
                        <label>Frequency</label>
                        <div className="value">
                        {rx.frequency || rx.medications?.[0]?.frequency || '-'}
                      </div>
                      </InfoItem>
                      <InfoItem>
                        <label>Duration</label>
                        <div className="value">
                        {rx.duration ? `${rx.duration} days` : (rx.medications?.[0]?.duration ? `${rx.medications[0].duration} days` : '-')}
                      </div>
                      </InfoItem>
                      <InfoItem>
                        <label>Quantity</label>
                        <div className="value">
                        {rx.quantity || rx.medications?.[0]?.quantity || '-'}
                      </div>
                      </InfoItem>
                    </InfoGrid>

                    {(rx.instructions || rx.notes) && (
                      <div style={{ marginTop: '16px', padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
                        {rx.instructions && (
                          <div style={{ marginBottom: '8px' }}>
                            <strong style={{ fontSize: '13px', color: '#374151' }}>Instructions: </strong>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>{rx.instructions}</span>
                          </div>
                        )}
                        {rx.notes && (
                          <div>
                            <strong style={{ fontSize: '13px', color: '#374151' }}>Notes: </strong>
                            <span style={{ fontSize: '13px', color: '#6b7280' }}>{rx.notes}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardBody>
                </PrescriptionCard>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
              <BeakerIcon style={{ width: '64px', height: '64px', margin: '0 auto 16px' }} />
              <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>No Prescriptions Yet</h3>
              <p>No prescriptions have been added yet.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </PageContainer>
  );
};

export default DoctorPrescriptions;

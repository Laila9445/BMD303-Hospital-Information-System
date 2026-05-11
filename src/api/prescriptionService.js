import apiClient from './apiClient';

const USE_MOCK_ON_ERROR = false;

const prescriptionService = {
  // Create a prescription
  createPrescription: async (prescriptionData) => {
    const response = await apiClient.post('/api/Prescriptions', prescriptionData);
    return response.data;
  },

  // Create bulk prescriptions
  createBulkPrescriptions: async (prescriptionsData) => {
    const response = await apiClient.post('/api/Prescriptions/bulk', prescriptionsData);
    return response.data;
  },

  // Get patient's prescriptions
  getMyPrescriptions: async () => {
    const response = await apiClient.get('/api/Prescriptions/my-prescriptions');
    return response.data;
  },

  // Get doctor prescriptions
  getDoctorPrescriptions: async (doctorId) => {
    const response = await apiClient.get(`/api/Prescriptions/doctor/${doctorId}`);
    return response.data;
  },

  // Get prescription details
  getPrescriptionDetails: async (prescriptionId) => {
    const response = await apiClient.get(`/api/Prescriptions/${prescriptionId}`);
    return response.data;
  },

  // Generate prescription PDF
  generatePrescriptionPdf: async (prescriptionId) => {
    const response = await apiClient.get(`/api/Prescriptions/${prescriptionId}/pdf`);
    return response.data;
  },

  // Send prescription to patient
  sendPrescriptionToPatient: async (prescriptionId) => {
    const response = await apiClient.post(`/api/Prescriptions/${prescriptionId}/send`);
    return response.data;
  },
};

export default prescriptionService;

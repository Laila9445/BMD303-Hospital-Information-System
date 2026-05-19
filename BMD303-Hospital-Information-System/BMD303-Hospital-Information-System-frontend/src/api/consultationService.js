import apiClient from './apiClient';

const consultationService = {
  // Start a consultation
  startConsultation: async (appointmentId) => {
    const response = await apiClient.post('/api/Consultations/start', { appointmentId });
    return response.data;
  },

  // Update consultation
  updateConsultation: async (consultationId, consultationData) => {
    const response = await apiClient.put(`/api/Consultations/${consultationId}`, consultationData);
    return response.data;
  },

  // End consultation
  endConsultation: async (consultationId) => {
    const response = await apiClient.put(`/api/Consultations/${consultationId}/end`);
    return response.data;
  },

  // Get consultation details
  getConsultationDetails: async (consultationId) => {
    const response = await apiClient.get(`/api/Consultations/${consultationId}`);
    return response.data;
  },

  // Get patient consultation history
  getPatientConsultationHistory: async () => {
    const response = await apiClient.get('/api/Consultations/patient/history');
    return response.data;
  },

  // Get doctor's patient consultation history
  getDoctorPatientConsultationHistory: async (patientId) => {
    const response = await apiClient.get(`/api/Consultations/doctor/patient-history/${patientId}`);
    return response.data;
  },
};

export default consultationService;

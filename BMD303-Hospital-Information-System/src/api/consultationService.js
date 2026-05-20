import apiClient from './apiClient';
import { unwrapList } from './apiUtils';

const consultationService = {
  getDoctorPending: async () => {
    const response = await apiClient.get('/api/Consultations/doctor/pending');
    return unwrapList(response.data);
  },

  startConsultation: async (appointmentId) => {
    const response = await apiClient.post('/api/Consultations/start', { appointmentId });
    return response.data;
  },
};

export default consultationService;

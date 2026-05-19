import apiClient from './apiClient';
import { unwrapApiResponse, unwrapList } from './apiUtils';

const appointmentService = {
  getAvailableSlots: async (doctorId, startDate, endDate) => {
    const response = await apiClient.get('/api/Appointments/available-slots', {
      params: { doctorId, startDate, endDate },
    });
    return unwrapList(response.data);
  },

  bookAppointment: async (appointmentData) => {
    const response = await apiClient.post('/api/Appointments/book', appointmentData);
    return unwrapApiResponse(response.data);
  },

  rescheduleAppointment: async (appointmentId, newTimeSlotId) => {
    const response = await apiClient.put('/api/Appointments/reschedule', {
      appointmentId,
      newTimeSlotId,
    });
    return response.data;
  },

  cancelAppointment: async (appointmentId, cancellationReason) => {
    const response = await apiClient.put('/api/Appointments/cancel', {
      appointmentId,
      cancellationReason,
    });
    return response.data;
  },

  getMyAppointments: async () => {
    const response = await apiClient.get('/api/Appointments/my-appointments');
    return unwrapList(response.data);
  },

  getDoctorAppointments: async (date = null) => {
    const params = date ? { date } : {};
    const response = await apiClient.get('/api/Appointments/doctor-appointments', { params });
    return unwrapList(response.data);
  },

  createAppointment: async (appointmentData) => {
    const response = await apiClient.post('/api/Appointments/create', appointmentData);
    return unwrapApiResponse(response.data);
  },

  getAppointmentDetails: async (appointmentId) => {
    const response = await apiClient.get(`/api/Appointments/${appointmentId}`);
    return unwrapApiResponse(response.data);
  },
};

export default appointmentService;

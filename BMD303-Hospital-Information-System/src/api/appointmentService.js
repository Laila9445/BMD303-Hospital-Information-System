import apiClient from './apiClient';

const appointmentService = {
  // Get available time slots for a doctor
  getAvailableSlots: async (doctorId, startDate, endDate) => {
    const response = await apiClient.get('/api/Appointments/available-slots', {
      params: { doctorId, startDate, endDate },
    });
    return response.data;
  },

  // Book an appointment
  bookAppointment: async (appointmentData) => {
    const response = await apiClient.post('/api/Appointments/book', appointmentData);
    return response.data;
  },

  // Reschedule appointment
  rescheduleAppointment: async (appointmentId, newTimeSlotId) => {
    const response = await apiClient.put('/api/Appointments/reschedule', {
      appointmentId,
      newTimeSlotId,
    });
    return response.data;
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId, cancellationReason) => {
    const response = await apiClient.put('/api/Appointments/cancel', {
      appointmentId,
      cancellationReason,
    });
    return response.data;
  },

  // Get patient's appointments
  getMyAppointments: async () => {
    const response = await apiClient.get('/api/Appointments/my-appointments');
    return response.data;
  },

  // Get doctor appointments (for doctor view)
  getDoctorAppointments: async () => {
    const response = await apiClient.get('/api/Appointments/doctor-appointments');
    return response.data;
  },

  // Create appointment (for admin/doctor)
  createAppointment: async (appointmentData) => {
    const response = await apiClient.post('/api/Appointments/create', appointmentData);
    return response.data;
  },

  // Get appointment details by ID
  getAppointmentDetails: async (appointmentId) => {
    const response = await apiClient.get(`/api/Appointments/${appointmentId}`);
    return response.data;
  },
};

export default appointmentService;

import apiClient from './apiClient';

const USE_MOCK_ON_ERROR = false;

const doctorService = {
  // Get all doctors (for patient view)
  getAllDoctors: async () => {
    const response = await apiClient.get('/api/Doctors');
    return response.data;
  },

  // Get doctor profile
  getProfile: async () => {
    const response = await apiClient.get('/api/Doctors/profile');
    return response.data;
  },

  // Update doctor profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/Doctors/profile', profileData);
    return response.data;
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await apiClient.get('/api/Doctors/appointments/today');
    return response.data;
  },

  // Get appointments for specific date
  getAppointments: async (date) => {
    const response = await apiClient.get('/api/Doctors/appointments', {
      params: { date },
    });
    return response.data;
  },

  // Search patients
  searchPatients: async (query) => {
    const response = await apiClient.get('/api/Doctors/patients/search', {
      params: { query },
    });
    return response.data;
  },

  // Get patient record by ID
  getPatientRecord: async (patientId) => {
    const response = await apiClient.get(`/api/Doctors/patients/${patientId}`);
    return response.data;
  },

  // Get patient medical images
  getPatientMedicalImages: async (patientId) => {
    const response = await apiClient.get(`/api/Doctors/patients/${patientId}/images`);
    return response.data;
  },

  // Create schedule
  createSchedule: async (scheduleData) => {
    const response = await apiClient.post('/api/Doctors/schedule', scheduleData);
    return response.data;
  },

  // Get doctor schedules
  getSchedules: async () => {
    const response = await apiClient.get('/api/Doctors/schedule');
    return response.data;
  },

  // Delete schedule
  deleteSchedule: async (scheduleId) => {
    const response = await apiClient.delete(`/api/Doctors/schedule/${scheduleId}`);
    return response.data;
  },
};

export default doctorService;

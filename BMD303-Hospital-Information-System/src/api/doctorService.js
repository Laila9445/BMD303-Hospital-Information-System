import apiClient from './apiClient';
import { unwrapList, unwrapApiResponse } from './apiUtils';

const USE_MOCK_ON_ERROR = false;

const doctorService = {
  // Get all doctors (for patient view)
  getAllDoctors: async () => {
    const response = await apiClient.get('/api/Doctors');
    return unwrapList(response.data);
  },

  /** Orthopedics physicians for patient self-booking (single clinic doctor). */
  getBookableDoctors: async () => {
    const response = await apiClient.get('/api/Doctors', {
      params: { forPatientBooking: true },
    });
    return unwrapList(response.data);
  },

  // Get doctor profile
  getProfile: async () => {
    const response = await apiClient.get('/api/Doctors/profile');
    return unwrapApiResponse(response.data);
  },

  // Update doctor profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/Doctors/profile', profileData);
    return response.data;
  },

  // Get today's appointments
  getTodayAppointments: async () => {
    const response = await apiClient.get('/api/Doctors/appointments/today');
    return unwrapList(response.data);
  },

  // Get appointments for specific date
  getAppointments: async (date) => {
    const response = await apiClient.get('/api/Doctors/appointments', {
      params: { date },
    });
    return response.data;
  },

  // List all patients
  getAllPatients: async () => {
    const response = await apiClient.get('/api/Doctors/patients');
    return unwrapList(response.data);
  },

  // Search patients
  searchPatients: async (query) => {
    const response = await apiClient.get('/api/Doctors/patients/search', {
      params: { query },
    });
    return unwrapList(response.data);
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

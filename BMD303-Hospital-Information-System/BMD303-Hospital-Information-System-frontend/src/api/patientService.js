import apiClient from './apiClient';

const patientService = {
  // Get all patients (for doctor view)
  getAllPatients: async () => {
    const response = await apiClient.get('/api/Patients');
    return response.data;
  },

  // Get patient profile
  getProfile: async () => {
    const response = await apiClient.get('/api/Patients/profile');
    return response.data;
  },

  // Update patient profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/Patients/profile', profileData);
    return response.data;
  },

  // Get patient's medical history
  getMedicalHistory: async () => {
    const response = await apiClient.get('/api/Patients/medical-history');
    return response.data;
  },

  // Update patient's medical history
  updateMedicalHistory: async (medicalHistoryData) => {
    const response = await apiClient.put('/api/Patients/medical-history', medicalHistoryData);
    return response.data;
  },

  // Get patient's appointments
  getAppointments: async () => {
    const response = await apiClient.get('/api/Patients/appointments');
    return response.data;
  },

  // Get patient's prescriptions
  getPrescriptions: async () => {
    const response = await apiClient.get('/api/Patients/prescriptions');
    return response.data;
  },

  // Get patient's medical images
  getMedicalImages: async () => {
    const response = await apiClient.get('/api/Patients/medical-images');
    return response.data;
  },

  // Upload medical image
  uploadMedicalImage: async (imageFile, description) => {
    const formData = new FormData();
    formData.append('file', imageFile);
    formData.append('description', description);
    
    const response = await apiClient.post('/api/Patients/medical-images/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get consultation history
  getConsultationHistory: async () => {
    const response = await apiClient.get('/api/Consultations/patient/history');
    return response.data;
  },

  // Get patient dashboard stats
  getDashboardStats: async () => {
    const response = await apiClient.get('/api/Patients/dashboard-stats');
    return response.data;
  },
};

export default patientService;

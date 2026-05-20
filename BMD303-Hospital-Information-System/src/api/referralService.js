import apiClient from './apiClient';
import { unwrapApiResponse, unwrapList, getApiErrorMessage } from './apiUtils';

const referralService = {
  createReferral: async (referralData) => {
    const response = await apiClient.post('/api/Referrals', referralData);
    return unwrapApiResponse(response.data);
  },

  getDoctorReferrals: async (doctorId, status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/api/Referrals/doctor/${doctorId}`, { params });
    return unwrapList(response.data);
  },

  getMyReferrals: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/Referrals/my-referrals', { params });
    return unwrapList(response.data);
  },

  getPatientReferrals: async (patientExternalId) => {
    const response = await apiClient.get(`/api/Referrals/patient/${patientExternalId}`);
    return unwrapList(response.data);
  },

  getReferralDetails: async (referralId) => {
    const response = await apiClient.get(`/api/Referrals/${referralId}`);
    return unwrapApiResponse(response.data);
  },

  updateReferralStatus: async (referralId, payload) => {
    const response = await apiClient.put(`/api/Referrals/${referralId}/status`, payload);
    return unwrapApiResponse(response.data);
  },

  getLinkedAppointment: async (referralId) => {
    const response = await apiClient.get(`/api/Referrals/${referralId}/appointment`);
    return unwrapApiResponse(response.data);
  },

  getReferralStats: async () => {
    const response = await apiClient.get('/api/Referrals/stats');
    return unwrapApiResponse(response.data);
  },

  getPhysioReferrals: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/Physio/referrals', { params });
    return unwrapList(response.data);
  },

  getRadiologyReferrals: async (status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get('/api/Radiology/referrals', { params });
    return unwrapList(response.data);
  },

  getApiErrorMessage,
};

export default referralService;

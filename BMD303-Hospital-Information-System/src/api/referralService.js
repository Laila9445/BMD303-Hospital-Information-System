import apiClient from './apiClient';

const USE_MOCK_ON_ERROR = false;

const referralService = {
  // Create a referral
  createReferral: async (referralData) => {
    try {
      console.log('Creating referral with data:', referralData);
      const response = await apiClient.post('/api/Referrals', referralData);
      console.log('Referral creation response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Referral creation error:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      throw error;
    }
  },

  // Get doctor's referrals
  getDoctorReferrals: async (doctorId, status = null) => {
    const params = status ? { status } : {};
    const response = await apiClient.get(`/api/Referrals/doctor/${doctorId}`, { params });
    return response.data;
  },

  // Get patient's referrals
  getPatientReferrals: async (patientExternalId) => {
    const response = await apiClient.get(`/api/Referrals/patient/${patientExternalId}`);
    return response.data;
  },

  // Get referral details
  getReferralDetails: async (referralId) => {
    const response = await apiClient.get(`/api/Referrals/${referralId}`);
    return response.data;
  },

  // Update referral status
  updateReferralStatus: async (referralId, status) => {
    const response = await apiClient.put(`/api/Referrals/${referralId}/status`, { status });
    return response.data;
  },

  // Send referral to external system
  sendToExternalSystem: async (referralId) => {
    const response = await apiClient.post(`/api/Referrals/${referralId}/send`);
    return response.data;
  },
};

export default referralService;

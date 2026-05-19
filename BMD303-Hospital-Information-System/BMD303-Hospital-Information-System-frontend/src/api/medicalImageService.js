import apiClient from './apiClient';
import { unwrapApiResponse, unwrapList } from './apiUtils';

const medicalImageService = {
  uploadImage: async (patientId, imageFile, imageType, description = '') => {
    const formData = new FormData();
    formData.append('File', imageFile);
    formData.append('ImageType', imageType);
    if (description) {
      formData.append('Description', description);
    }

    const response = await apiClient.post(
      `/api/MedicalImages/upload/${patientId}`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrapApiResponse(response.data);
  },

  getAllImages: async () => {
    const response = await apiClient.get('/api/MedicalImages');
    return unwrapList(response.data);
  },

  downloadImage: async (imageId) => {
    const response = await apiClient.get(`/api/MedicalImages/${imageId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  deleteImage: async (imageId) => {
    const response = await apiClient.delete(`/api/MedicalImages/${imageId}`);
    return unwrapApiResponse(response.data);
  },
};

export default medicalImageService;

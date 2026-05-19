import apiClient from './apiClient';

const medicalImageService = {
  // Upload medical image
  uploadImage: async (imageFile, imageType, description) => {
    const formData = new FormData();
    formData.append('File', imageFile);
    formData.append('ImageType', imageType);
    formData.append('Description', description);
    
    const response = await apiClient.post('/api/MedicalImages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Get all medical images
  getAllImages: async () => {
    const response = await apiClient.get('/api/MedicalImages');
    return response.data;
  },

  // Download medical image
  downloadImage: async (imageId) => {
    const response = await apiClient.get(`/api/MedicalImages/${imageId}/download`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Delete medical image
  deleteImage: async (imageId) => {
    const response = await apiClient.delete(`/api/MedicalImages/${imageId}`);
    return response.data;
  },
};

export default medicalImageService;

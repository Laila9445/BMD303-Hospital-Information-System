import apiClient from './apiClient';
import { unwrapList } from './apiUtils';

const patientService = {
  getAllPatients: async (department = 'doctor') => {
    const path =
      department === 'radiology'
        ? '/api/Radiology/patients'
        : department === 'physio'
          ? '/api/Physio/patients'
          : '/api/Doctors/patients';

    const response = await apiClient.get(path);
    return unwrapList(response.data);
  },
};

export default patientService;

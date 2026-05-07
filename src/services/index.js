import api from './api';

export const authService = {
    login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        if (response.data.access_token) {
            localStorage.setItem('token', response.data.access_token);
        }
        return response.data;
    },

    logout: () => {
        localStorage.removeItem('token');
    },

    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },

    getToken: () => {
        return localStorage.getItem('token');
    },

    isAuthenticated: () => {
        return !!localStorage.getItem('token');
    }
};

export const patientService = {
    getAllPatients: async () => {
        const response = await api.get('/patients/');
        return response.data;
    },

    getPatient: async (patientId) => {
        const response = await api.get(`/patients/${patientId}`);
        return response.data;
    },

    createPatient: async (patientData) => {
        const response = await api.post('/patients/', patientData);
        return response.data;
    },

    updatePatient: async (patientId, patientData) => {
        const response = await api.put(`/patients/${patientId}`, patientData);
        return response.data;
    }
};

export const appointmentService = {
    getAllAppointments: async () => {
        const response = await api.get('/appointments/');
        return response.data;
    },

    getAppointment: async (appointmentId) => {
        const response = await api.get(`/appointments/${appointmentId}`);
        return response.data;
    },

    createAppointment: async (appointmentData) => {
        const response = await api.post('/appointments/', appointmentData);
        return response.data;
    },

    updateAppointmentStatus: async (appointmentId, status) => {
        const response = await api.put(`/appointments/${appointmentId}`, { status });
        return response.data;
    }
};

export const treatmentPlanService = {
    getAllTreatmentPlans: async () => {
        const response = await api.get('/treatment-plans/');
        return response.data;
    },

    getTreatmentPlan: async (planId) => {
        const response = await api.get(`/treatment-plans/${planId}`);
        return response.data;
    },

    createTreatmentPlan: async (planData) => {
        const response = await api.post('/treatment-plans/', planData);
        return response.data;
    }
};

export const staffService = {
    getAllStaff: async () => {
        const response = await api.get('/staff/');
        return response.data;
    },

    createStaff: async (staffData) => {
        const response = await api.post('/staff/', staffData);
        return response.data;
    }
};

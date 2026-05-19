/**
 * Role-Based Service Visibility Utility
 * Filters services based on user role to ensure only relevant prices are visible
 */

export const ROLE_SERVICE_MAPPING = {
  doctor: {
    departments: ['Doctor'],
    description: 'Consultation and referral services',
  },
  radiology: {
    departments: ['Radiology'],
    description: 'Imaging and radiological services',
  },
  physiotherapy: {
    departments: ['Physiotherapy'],
    description: 'Physical therapy and rehabilitation services',
  },
  nurse: {
    departments: ['Doctor', 'Radiology', 'Physiotherapy'],
    description: 'All clinic services',
  },
  patient: {
    departments: [], // Patients don't see internal service pricing
    description: 'Invoice summary only',
  },
  admin: {
    departments: ['Doctor', 'Radiology', 'Physiotherapy'],
    description: 'All clinic services',
  },
};

/**
 * Filter services based on user role
 * @param {Array} services - Array of service objects
 * @param {String} userRole - User role (doctor, radiology, physiotherapy, nurse, patient, admin)
 * @returns {Array} Filtered services based on role
 */
export const getVisibleServices = (services, userRole) => {
  if (!services || !Array.isArray(services)) return [];
  
  const role = userRole?.toLowerCase() || 'patient';
  const allowedDepartments = ROLE_SERVICE_MAPPING[role]?.departments || [];

  // Patients see no internal pricing
  if (role === 'patient') {
    return [];
  }

  return services.filter((service) =>
    allowedDepartments.includes(service.department)
  );
};

/**
 * Check if a user role can view a specific service
 * @param {String} serviceDepartment - Service department
 * @param {String} userRole - User role
 * @returns {Boolean} True if user can view the service
 */
export const canViewService = (serviceDepartment, userRole) => {
  const role = userRole?.toLowerCase() || 'patient';
  const allowedDepartments = ROLE_SERVICE_MAPPING[role]?.departments || [];
  return allowedDepartments.includes(serviceDepartment);
};

/**
 * Get description for what services a role can see
 * @param {String} userRole - User role
 * @returns {String} Description of visible services
 */
export const getRoleServiceDescription = (userRole) => {
  const role = userRole?.toLowerCase() || 'patient';
  return ROLE_SERVICE_MAPPING[role]?.description || 'No services visible';
};

/**
 * Get all visible departments for a role
 * @param {String} userRole - User role
 * @returns {Array} Array of department names
 */
export const getVisibleDepartments = (userRole) => {
  const role = userRole?.toLowerCase() || 'patient';
  return ROLE_SERVICE_MAPPING[role]?.departments || [];
};

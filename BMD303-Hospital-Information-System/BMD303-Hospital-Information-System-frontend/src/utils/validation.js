// Frontend validation rules matching backend validators

// Email validation
export const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) return 'Email is required';
  if (!emailRegex.test(email)) return 'Invalid email format';
  if (email.length > 100) return 'Email must not exceed 100 characters';
  return null;
};

// Password validation (matching backend RegisterDtoValidator)
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (password.length > 100) return 'Password must not exceed 100 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain at least one digit';
  if (!/[^a-zA-Z0-9]/.test(password)) return 'Password must contain at least one special character';
  return null;
};

// Name validation
export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  if (name.length < 2 || name.length > 50) return `${fieldName} must be between 2 and 50 characters`;
  if (!/^[a-zA-Z\s]+$/.test(name)) return `${fieldName} can only contain letters and spaces`;
  return null;
};

// Phone number validation (Egyptian format)
export const validatePhoneNumber = (phone) => {
  if (!phone) return 'Phone number is required';
  const phoneRegex = /^(\+20|0)?1[0125]\d{8}$/;
  if (!phoneRegex.test(phone)) return 'Invalid Egyptian phone number format';
  return null;
};

// Role validation — must match backend RegisterRequest validator (Auth/register)
export const REGISTER_ROLES = [
  'Doctor',
  'Patient',
  'Nurse',
  'Physiotherapist',
  'Radiologist',
  'Admin',
  'Staff',
];

export const validateRole = (role) => {
  if (!role) return 'Role is required';
  if (!REGISTER_ROLES.includes(role)) {
    return 'Role must be Doctor, Nurse, Admin, Staff, Patient, Physiotherapist, or Radiologist';
  }
  return null;
};

// Doctor-specific validations
export const validateSpecialization = (specialization) => {
  if (!specialization) return 'Specialization is required for doctors';
  if (specialization.length < 2 || specialization.length > 100) {
    return 'Specialization must be between 2 and 100 characters';
  }
  return null;
};

export const validateLicenseNumber = (licenseNumber, role) => {
  if (licenseNumber && (role === 'Doctor' || role === 'Nurse')) {
    if (licenseNumber.length < 5 || licenseNumber.length > 50) {
      return 'License number must be between 5 and 50 characters';
    }
  }
  return null;
};

// Nurse-specific validation
export const validateDepartment = (department, role) => {
  if (role === 'Nurse' && !department) {
    return 'Department is required for nurses';
  }
  if (department && (department.length < 2 || department.length > 100)) {
    return 'Department must be between 2 and 100 characters';
  }
  return null;
};

// Appointment validation
export const validateAppointmentDate = (date) => {
  if (!date) return 'Appointment date is required';
  const appointmentDate = new Date(date);
  const now = new Date();
  if (appointmentDate <= now) return 'Appointment date must be in the future';
  return null;
};

export const validateDoctorId = (doctorId) => {
  if (!doctorId) return 'Doctor ID is required';
  if (isNaN(doctorId) || doctorId <= 0) return 'Invalid Doctor ID';
  return null;
};

export const validateTimeSlotId = (timeSlotId) => {
  if (!timeSlotId) return 'Please select an available time slot';
  if (isNaN(timeSlotId) || timeSlotId <= 0) return 'Please select a valid time slot';
  return null;
};

export const validateReason = (reason) => {
  if (reason && reason.length > 500) return 'Reason must not exceed 500 characters';
  return null;
};

// Consultation validation
export const validateConsultationField = (value, fieldName, maxLength = 2000) => {
  if (value && value.length > maxLength) {
    return `${fieldName} must not exceed ${maxLength} characters`;
  }
  return null;
};

// Medical image validation
export const validateImageType = (imageType) => {
  if (!imageType) return 'Image type is required';
  if (imageType.length < 2 || imageType.length > 50) {
    return 'Image type must be between 2 and 50 characters';
  }
  return null;
};

export const validateImageDescription = (description) => {
  if (description && description.length > 500) {
    return 'Description must not exceed 500 characters';
  }
  return null;
};

export const validateImageFile = (file) => {
  if (!file) return 'File is required';
  // Add file type and size validation as needed
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp', 'image/tiff'];
  if (!validTypes.includes(file.type)) {
    return 'Invalid image format. Supported formats: JPEG, PNG, GIF, BMP, WebP, TIFF';
  }
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) return 'Image size must not exceed 10MB';
  return null;
};

// Prescription validation
export const validateMedicationName = (name) => {
  if (!name) return 'Medication name is required';
  if (name.length < 2 || name.length > 200) {
    return 'Medication name must be between 2 and 200 characters';
  }
  return null;
};

export const validateDosage = (dosage) => {
  if (!dosage) return 'Dosage is required';
  if (dosage.length < 2 || dosage.length > 100) {
    return 'Dosage must be between 2 and 100 characters';
  }
  return null;
};

export const validateFrequency = (frequency) => {
  if (!frequency) return 'Frequency is required';
  if (frequency.length < 2 || frequency.length > 100) {
    return 'Frequency must be between 2 and 100 characters';
  }
  return null;
};

export const validateDurationDays = (duration) => {
  if (!duration) return 'Duration is required';
  if (isNaN(duration) || duration <= 0) return 'Duration must be greater than 0 days';
  return null;
};

export const validateInstructions = (instructions) => {
  if (instructions && instructions.length > 1000) {
    return 'Instructions must not exceed 1000 characters';
  }
  return null;
};

// Notification validation
export const validateMessage = (message) => {
  if (!message) return 'Message is required';
  if (message.length < 1 || message.length > 1000) {
    return 'Message must be between 1 and 1000 characters';
  }
  return null;
};

export const validateNotificationType = (type) => {
  if (!type) return 'Notification type is required';
  return null;
};

// Comprehensive validation functions
export const validateRegistration = (formData) => {
  const errors = {};
  
  errors.email = validateEmail(formData.email);
  errors.password = validatePassword(formData.password);
  errors.confirmPassword = formData.password !== formData.confirmPassword ? 'Passwords do not match' : null;
  errors.firstName = validateName(formData.firstName, 'First name');
  errors.lastName = validateName(formData.lastName, 'Last name');
  errors.phoneNumber = validatePhoneNumber(formData.phoneNumber);
  errors.role = validateRole(formData.role);
  errors.gender = formData.gender ? null : 'Gender is required';
  errors.dateOfBirth = formData.dateOfBirth ? null : 'Date of birth is required';
  
  if ((formData.role === 'Doctor' || formData.role === 'Nurse') && formData.licenseNumber) {
    errors.licenseNumber = validateLicenseNumber(formData.licenseNumber, formData.role);
  }
  
  if (formData.role === 'Nurse' && formData.department) {
    errors.department = validateDepartment(formData.department, formData.role);
  }
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validateAppointment = (formData) => {
  const errors = {};
  
  errors.doctorId = validateDoctorId(formData.doctorId);
  errors.appointmentDate = validateAppointmentDate(formData.appointmentDate);
  errors.timeSlotId = validateTimeSlotId(formData.timeSlotId);
  errors.reason = validateReason(formData.reason);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validateRescheduleAppointment = (formData) => {
  const errors = {};
  
  errors.newAppointmentDate = validateAppointmentDate(formData.newAppointmentDate);
  errors.newTimeSlotId = validateTimeSlotId(formData.newTimeSlotId);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validateConsultation = (formData) => {
  const errors = {};
  
  errors.appointmentId = formData.appointmentId ? null : 'Appointment ID is required';
  if (isNaN(formData.appointmentId) || formData.appointmentId <= 0) {
    errors.appointmentId = 'Invalid Appointment ID';
  }
  
  errors.symptoms = validateConsultationField(formData.symptoms, 'Symptoms');
  errors.diagnosis = validateConsultationField(formData.diagnosis, 'Diagnosis');
  errors.notes = validateConsultationField(formData.notes, 'Notes');
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validatePrescription = (formData) => {
  const errors = {};
  
  errors.consultationId = formData.consultationId ? null : 'Consultation ID is required';
  if (isNaN(formData.consultationId) || formData.consultationId <= 0) {
    errors.consultationId = 'Invalid Consultation ID';
  }
  
  errors.medicationName = validateMedicationName(formData.medicationName);
  errors.dosage = validateDosage(formData.dosage);
  errors.frequency = validateFrequency(formData.frequency);
  errors.durationDays = validateDurationDays(formData.durationDays);
  errors.instructions = validateInstructions(formData.instructions);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validateMedicalImage = (formData) => {
  const errors = {};
  
  errors.imageType = validateImageType(formData.imageType);
  errors.description = validateImageDescription(formData.description);
  errors.file = validateImageFile(formData.file);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

export const validateNotification = (formData) => {
  const errors = {};
  
  errors.userId = formData.userId ? null : 'User ID is required';
  if (isNaN(formData.userId) || formData.userId <= 0) {
    errors.userId = 'Invalid User ID';
  }
  
  errors.message = validateMessage(formData.message);
  errors.type = validateNotificationType(formData.type);
  
  // Remove null values
  Object.keys(errors).forEach(key => {
    if (errors[key] === null) delete errors[key];
  });
  
  return errors;
};

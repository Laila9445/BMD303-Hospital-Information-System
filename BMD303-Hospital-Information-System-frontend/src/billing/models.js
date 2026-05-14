/**
 * SIMPLIFIED BILLING MODEL FOR CLINIC WORKFLOW
 * 
 * This is NOT an accounting system.
 * This is a clinic workflow billing system.
 * Focus on medical workflow, NOT ERP/accounting complexity.
 */

/**
 * @typedef {Object} Service
 * @property {string} id
 * @property {string} serviceName
 * @property {string} department
 * @property {number} price
 * @property {string} [description]
 * @property {'Active' | 'Inactive'} status - Only two states: Active or Inactive
 */

/**
 * @typedef {Object} Invoice
 * @property {string} id
 * @property {string} patientId
 * @property {string} patientName
 * @property {string} department
 * @property {string} serviceId
 * @property {string} serviceName
 * @property {number} amount - Total invoice amount
 * @property {'Consultation' | 'Referral'} type - Only two types
 * @property {'Pending' | 'Paid' | 'Cancelled'} status - Only three statuses, NEVER deleted
 * @property {string} date
 * @property {string} [cancellationReason] - Only for cancelled invoices
 */

/**
 * @typedef {Object} Payment
 * @property {string} id
 * @property {string} invoiceId
 * @property {string} patientId
 * @property {string} patientName
 * @property {number} amount
 * @property {'Cash' | 'InstaPay'} method - ONLY these two payment methods allowed
 * @property {string} date
 */

/**
 * @typedef {Object} PatientBilling
 * @property {string} patientId
 * @property {string} patientName
 * @property {Invoice[]} invoices
 * @property {Payment[]} payments
 * @property {number} totalBilled
 * @property {number} totalPaid
 */

export const buildPatientBilling = ({ patientId, patientName, invoices = [], payments = [] }) => {
  const totalBilled = invoices.reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);
  const totalPaid = payments.reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  return {
    patientId,
    patientName,
    invoices,
    payments,
    totalBilled,
    totalPaid,
  };
};

import apiClient from '../api/apiClient';
import { billingApi } from './billingApi';
import { servicePricingApi } from './servicePricingApi';

/**
 * BILLING SERVICE - Simplified for clinic workflow
 * 
 * This service handles:
 * - Invoice management (Consultation & Referral types)
 * - Payment processing (Cash & InstaPay only)
 * - Service pricing (Active & Inactive status)
 * 
 * NO DELETES ALLOWED - Invoices and payments are permanent records
 * Services can only be deactivated, not deleted
 */

const request = async (config, fallback) => {
  try {
    const response = await apiClient.request(config);
    return response.data;
  } catch (error) {
    if (fallback) {
      return fallback();
    }
    throw error;
  }
};

export const billingService = {
  // ===== INVOICE OPERATIONS =====
  async getInvoices() {
    return request({ method: 'get', url: '/api/billing/invoices' }, () => billingApi.getInvoices());
  },

  async getInvoiceById(id) {
    return request({ method: 'get', url: `/api/billing/invoices/${id}` }, () => billingApi.getInvoiceById(id));
  },

  async createInvoice(payload) {
    // Invoice must have type: 'Consultation' | 'Referral'
    // Invoice must have status: 'Pending' (initial status)
    return request(
      { method: 'post', url: '/api/billing/invoices', data: { ...payload, status: 'Pending' } },
      () => billingApi.createInvoice({ ...payload, status: 'Pending' })
    );
  },

  async updateInvoiceStatus(id, status) {
    // Only allowed statuses: Pending, Paid, Cancelled
    const allowedStatuses = ['Pending', 'Paid', 'Cancelled'];
    if (!allowedStatuses.includes(status)) {
      throw new Error(`Invalid status: ${status}. Allowed: ${allowedStatuses.join(', ')}`);
    }
    return request(
      { method: 'patch', url: `/api/billing/invoices/${id}`, data: { status } },
      () => billingApi.updateInvoiceStatus(id, status)
    );
  },

  async cancelInvoice(id, reason) {
    // Cancellation only allowed for referral invoices with reason
    if (!reason || reason.trim() === '') {
      throw new Error('Cancellation reason is required');
    }
    return request(
      { method: 'patch', url: `/api/billing/invoices/${id}/cancel`, data: { reason, status: 'Cancelled' } },
      () => billingApi.cancelInvoice(id, reason)
    );
  },

  // ===== PAYMENT OPERATIONS =====
  async addPayment(payload) {
    // Payments only accept: Cash, InstaPay, or Card
    const allowedMethods = ['Cash', 'InstaPay', 'Card'];
    if (!allowedMethods.includes(payload.method)) {
      throw new Error(`Invalid payment method: ${payload.method}. Allowed: ${allowedMethods.join(', ')}`);
    }
    const result = await request(
      { method: 'post', url: '/api/billing/payments', data: payload },
      () => billingApi.addPayment(payload)
    );
    return result?.payment ?? result;
  },

  async getPayments() {
    return request({ method: 'get', url: '/api/billing/payments' }, () => billingApi.getPayments());
  },

  // ===== SERVICE OPERATIONS =====
  async getServices() {
    return request({ method: 'get', url: '/api/billing/services' }, () => servicePricingApi.getServices());
  },

  async addService(payload) {
    // Service status must be 'Active' or 'Inactive'
    const status = payload.status || 'Active';
    if (!['Active', 'Inactive'].includes(status)) {
      throw new Error('Service status must be Active or Inactive');
    }
    return request(
      { method: 'post', url: '/api/billing/services', data: { ...payload, status } },
      () => servicePricingApi.addService({ ...payload, status })
    );
  },

  async updateService(id, updates) {
    // Validate status if provided
    if (updates.status && !['Active', 'Inactive'].includes(updates.status)) {
      throw new Error('Service status must be Active or Inactive');
    }
    return request(
      { method: 'patch', url: `/api/billing/services/${id}`, data: updates },
      () => servicePricingApi.updateService(id, updates)
    );
  },

  async toggleService(id) {
    // Toggle between Active and Inactive
    return request(
      { method: 'patch', url: `/api/billing/services/${id}/toggle` },
      () => servicePricingApi.toggleService(id)
    );
  },

  // NO DELETE OPERATIONS - Services are deactivated, never deleted
  // NO PARTIAL PAYMENT SYSTEM - Invoices are marked as Paid in full
  // NO INVOICE DELETION - Invoices remain as permanent records
};

import { mockInvoices, mockPayments } from './billingMockData';
import mockDatabase from '../api/mockDatabase';

const INVOICES_KEY = 'clinic_billing_invoices';
const PAYMENTS_KEY = 'clinic_billing_payments';

const readStorage = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

const ensureSeeded = () => {
  const invoices = readStorage(INVOICES_KEY, null);
  if (!invoices) writeStorage(INVOICES_KEY, mockInvoices);
  const payments = readStorage(PAYMENTS_KEY, null);
  if (!payments) writeStorage(PAYMENTS_KEY, mockPayments);
};

const generateInvoiceId = () => `INV-${Math.floor(1000 + Math.random() * 9000)}`;
const generatePaymentId = () => `PAY-${Math.floor(1000 + Math.random() * 9000)}`;

export const billingApi = {
  async getInvoices() {
    ensureSeeded();
    return readStorage(INVOICES_KEY, mockInvoices);
  },

  async getInvoiceById(id) {
    ensureSeeded();
    const invoices = readStorage(INVOICES_KEY, mockInvoices);
    return invoices.find((invoice) => invoice.id === id) || null;
  },

  async createInvoice(payload) {
    ensureSeeded();
    const invoices = readStorage(INVOICES_KEY, mockInvoices);
    
    // Calculate insurance discount and final amount
    const insuranceDiscount = payload.insuranceDiscount || 0;
    const finalAmount = payload.finalAmount || (payload.price - insuranceDiscount);
    
    const newInvoice = {
      id: generateInvoiceId(),
      status: 'Pending',
      totalPaid: 0,
      remainingAmount: finalAmount,
      date: new Date().toISOString().slice(0, 10),
      type: 'Consultation', // Default type; can be overridden
      cancellationReason: null,
      insuranceId: payload.insuranceId || null,
      insuranceName: payload.insuranceName || null,
      insuranceDiscount: insuranceDiscount,
      finalAmount: finalAmount,
      ...payload,
    };
    const updated = [newInvoice, ...invoices];
    writeStorage(INVOICES_KEY, updated);

    if (newInvoice.referenceType === 'Appointment' && newInvoice.referenceId) {
      try {
        mockDatabase.appointments.update(Number(newInvoice.referenceId), { status: 'Payment Pending' });
      } catch {
        // Ignore mock update errors
      }
    }

    if (newInvoice.referenceType === 'Referral' && newInvoice.referenceId) {
      try {
        const raw = localStorage.getItem('referrals');
        const current = raw ? JSON.parse(raw) : [];
        if (Array.isArray(current)) {
          const updatedReferrals = current.map((referral) =>
            String(referral.id) === String(newInvoice.referenceId)
              ? { ...referral, status: 'Payment Pending' }
              : referral
          );
          localStorage.setItem('referrals', JSON.stringify(updatedReferrals));
          window.dispatchEvent(new Event('referrals-updated'));
        }
      } catch {
        // Ignore local referral updates
      }
    }
    return newInvoice;
  },

  async updateInvoiceStatus(id, status) {
    ensureSeeded();
    const invoices = readStorage(INVOICES_KEY, mockInvoices);
    const updated = invoices.map((invoice) =>
      invoice.id === id ? { ...invoice, status } : invoice
    );
    writeStorage(INVOICES_KEY, updated);
    return updated.find((invoice) => invoice.id === id) || null;
  },

  async cancelInvoice(id, reason) {
    ensureSeeded();
    const invoices = readStorage(INVOICES_KEY, mockInvoices);
    const updated = invoices.map((invoice) =>
      invoice.id === id ? { ...invoice, status: 'Cancelled', cancellationReason: reason } : invoice
    );
    writeStorage(INVOICES_KEY, updated);
    return updated.find((invoice) => invoice.id === id) || null;
  },

  // async deleteInvoice(id) {
  //   ensureSeeded();
  //   const invoices = readStorage(INVOICES_KEY, mockInvoices);
  //   const updated = invoices.filter((invoice) => invoice.id !== id);
  //   writeStorage(INVOICES_KEY, updated);
  //   return true;
  // },

  async addPayment({ invoiceId, amount, method, patientId, patientName }) {
    ensureSeeded();
    const invoices = readStorage(INVOICES_KEY, mockInvoices);
    const payments = readStorage(PAYMENTS_KEY, mockPayments);
    const newPayment = {
      id: generatePaymentId(),
      invoiceId,
      patientId,
      patientName,
      amount,
      method,
      date: new Date().toISOString().slice(0, 10),
    };

    const updatedPayments = [newPayment, ...payments];
    const updatedInvoices = invoices.map((invoice) => {
      if (invoice.id !== invoiceId) return invoice;
      const totalPaid = Number(invoice.totalPaid || 0) + Number(amount || 0);
      const remainingAmount = Math.max(Number(invoice.price) - totalPaid, 0);
      const status = totalPaid >= Number(invoice.price) ? 'Paid' : 'Pending';
      return { ...invoice, totalPaid, remainingAmount, status };
    });

    writeStorage(PAYMENTS_KEY, updatedPayments);
    writeStorage(INVOICES_KEY, updatedInvoices);

    const updatedInvoice = updatedInvoices.find((invoice) => invoice.id === invoiceId) || null;
    if (updatedInvoice?.status === 'Paid') {
      if (updatedInvoice.referenceType === 'Appointment' && updatedInvoice.referenceId) {
        try {
          mockDatabase.appointments.update(Number(updatedInvoice.referenceId), { status: 'Confirmed' });
        } catch {
          // Ignore mock update errors
        }
      }

      if (updatedInvoice.referenceType === 'Referral' && updatedInvoice.referenceId) {
        try {
          const raw = localStorage.getItem('referrals');
          const current = raw ? JSON.parse(raw) : [];
          if (Array.isArray(current)) {
            const updatedReferrals = current.map((referral) =>
              String(referral.id) === String(updatedInvoice.referenceId)
                ? { ...referral, status: 'Paid' }
                : referral
            );
            localStorage.setItem('referrals', JSON.stringify(updatedReferrals));
            window.dispatchEvent(new Event('referrals-updated'));
          }
        } catch {
          // Ignore local referral updates
        }
      }
    }

    return {
      payment: newPayment,
      invoice: updatedInvoice,
    };
  },

  async getPayments() {
    ensureSeeded();
    return readStorage(PAYMENTS_KEY, mockPayments);
  },
};

import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { billingService } from './billingService';
import { mockPatients } from './billingMockData';

const BillingContext = createContext(null);

const initialServicesState = {
  items: [],
  loading: false,
  error: null,
};

const initialInvoicesState = {
  items: [],
  loading: false,
  error: null,
};

const initialPaymentsState = {
  items: [],
  loading: false,
  error: null,
};

const servicesReducer = (state, action) => {
  switch (action.type) {
    case 'SERVICES_LOADING':
      return { ...state, loading: true, error: null };
    case 'SERVICES_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'SERVICES_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const invoicesReducer = (state, action) => {
  switch (action.type) {
    case 'INVOICES_LOADING':
      return { ...state, loading: true, error: null };
    case 'INVOICES_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'INVOICES_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

const paymentsReducer = (state, action) => {
  switch (action.type) {
    case 'PAYMENTS_LOADING':
      return { ...state, loading: true, error: null };
    case 'PAYMENTS_SUCCESS':
      return { ...state, loading: false, items: action.payload };
    case 'PAYMENTS_ERROR':
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export const BillingProvider = ({ children }) => {
  const [servicesState, servicesDispatch] = useReducer(servicesReducer, initialServicesState);
  const [invoicesState, invoicesDispatch] = useReducer(invoicesReducer, initialInvoicesState);
  const [paymentsState, paymentsDispatch] = useReducer(paymentsReducer, initialPaymentsState);

  const loadServices = async () => {
    servicesDispatch({ type: 'SERVICES_LOADING' });
    try {
      const data = await billingService.getServices();
      servicesDispatch({ type: 'SERVICES_SUCCESS', payload: data });
    } catch (error) {
      servicesDispatch({ type: 'SERVICES_ERROR', payload: error?.message || 'Failed to load services.' });
    }
  };

  const loadInvoices = async () => {
    invoicesDispatch({ type: 'INVOICES_LOADING' });
    try {
      const data = await billingService.getInvoices();
      invoicesDispatch({ type: 'INVOICES_SUCCESS', payload: data });
    } catch (error) {
      invoicesDispatch({ type: 'INVOICES_ERROR', payload: error?.message || 'Failed to load invoices.' });
    }
  };

  const loadPayments = async () => {
    paymentsDispatch({ type: 'PAYMENTS_LOADING' });
    try {
      const data = await billingService.getPayments();
      paymentsDispatch({ type: 'PAYMENTS_SUCCESS', payload: data });
    } catch (error) {
      paymentsDispatch({ type: 'PAYMENTS_ERROR', payload: error?.message || 'Failed to load payments.' });
    }
  };

  useEffect(() => {
    loadServices();
    loadInvoices();
    loadPayments();
  }, []);

  const addService = async (payload) => {
    const service = await billingService.addService(payload);
    await loadServices();
    return service;
  };

  const updateService = async (id, updates) => {
    const service = await billingService.updateService(id, updates);
    await loadServices();
    return service;
  };

  const deactivateService = async (id) => {
    // Deactivate (mark as Inactive) instead of delete
    const service = await billingService.updateService(id, { status: 'Inactive' });
    await loadServices();
    return service;
  };

  const toggleService = async (id) => {
    await billingService.toggleService(id);
    await loadServices();
  };

  const createInvoice = async (payload) => {
    const invoice = await billingService.createInvoice(payload);
    await loadInvoices();
    return invoice;
  };

  const markInvoicePaid = async (invoice, paymentData) => {
    // paymentData should contain { amount, method }
    const { amount, method } = paymentData;
    const payment = await billingService.addPayment({
      invoiceId: invoice.id,
      amount: amount,
      method: method,
      patientId: invoice.patientId,
      patientName: invoice.patientName,
    });
    await loadPayments();
    await loadInvoices();
    return payment;
  };

  const addPayment = async (payload) => {
    const payment = await billingService.addPayment(payload);
    await loadPayments();
    await loadInvoices();
    return payment;
  };

  const cancelInvoice = async (id, reason) => {
    // Only allowed for referral invoices
    await billingService.cancelInvoice(id, reason);
    await loadInvoices();
  };

  const value = useMemo(() => ({
    servicesState,
    invoicesState,
    paymentsState,
    patients: mockPatients,
    loadServices,
    loadInvoices,
    loadPayments,
    addService,
    updateService,
    deactivateService,
    toggleService,
    createInvoice,
    markInvoicePaid,
    addPayment,
    cancelInvoice,
  }), [servicesState, invoicesState, paymentsState]);

  return (
    <BillingContext.Provider value={value}>
      {children}
    </BillingContext.Provider>
  );
};

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return context;
};

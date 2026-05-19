import { configureStore } from '@reduxjs/toolkit';
import billingReducer from './billingSlice';
import servicesReducer from './servicesSlice';
import paymentsReducer from './paymentsSlice';

export const store = configureStore({
  reducer: {
    billing: billingReducer,
    services: servicesReducer,
    payments: paymentsReducer,
  },
});

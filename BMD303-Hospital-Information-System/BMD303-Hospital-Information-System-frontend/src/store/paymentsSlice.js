import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingService } from '../billing/billingService';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchPayments = createAsyncThunk('payments/fetchPayments', async (_, { rejectWithValue }) => {
  try {
    return await billingService.getPayments();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load payments.'));
  }
});

export const addPayment = createAsyncThunk('payments/addPayment', async (payload, { rejectWithValue }) => {
  try {
    return await billingService.addPayment(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to add payment.'));
  }
});

const paymentsSlice = createSlice({
  name: 'payments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPayments.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchPayments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load payments.';
      })
      .addCase(addPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addPayment.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(addPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add payment.';
      });
  },
});

export default paymentsSlice.reducer;

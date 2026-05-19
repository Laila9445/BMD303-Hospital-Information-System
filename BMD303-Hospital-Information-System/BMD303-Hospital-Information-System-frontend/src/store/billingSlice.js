import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingService } from '../billing/billingService';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchInvoices = createAsyncThunk('billing/fetchInvoices', async (_, { rejectWithValue }) => {
  try {
    return await billingService.getInvoices();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load invoices.'));
  }
});

export const createInvoice = createAsyncThunk('billing/createInvoice', async (payload, { rejectWithValue }) => {
  try {
    return await billingService.createInvoice(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to create invoice.'));
  }
});

export const updateInvoiceStatus = createAsyncThunk('billing/updateInvoiceStatus', async ({ id, status }, { rejectWithValue }) => {
  try {
    return await billingService.updateInvoiceStatus(id, status);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to update invoice status.'));
  }
});

export const deleteInvoice = createAsyncThunk('billing/deleteInvoice', async (id, { rejectWithValue }) => {
  try {
    await billingService.deleteInvoice(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to delete invoice.'));
  }
});

const billingSlice = createSlice({
  name: 'billing',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load invoices.';
      })
      .addCase(createInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createInvoice.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to create invoice.';
      })
      .addCase(updateInvoiceStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateInvoiceStatus.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((invoice) => (invoice.id === updated.id ? updated : invoice));
        }
      })
      .addCase(updateInvoiceStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update invoice status.';
      })
      .addCase(deleteInvoice.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteInvoice.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((invoice) => invoice.id !== action.payload);
      })
      .addCase(deleteInvoice.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete invoice.';
      });
  },
});

export default billingSlice.reducer;

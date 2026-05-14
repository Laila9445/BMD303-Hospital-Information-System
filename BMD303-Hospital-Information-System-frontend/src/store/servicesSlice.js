import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { billingService } from '../billing/billingService';

const initialState = {
  items: [],
  loading: false,
  error: null,
};

const getErrorMessage = (error, fallback) =>
  error?.response?.data?.message || error?.message || fallback;

export const fetchServices = createAsyncThunk('services/fetchServices', async (_, { rejectWithValue }) => {
  try {
    return await billingService.getServices();
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to load services.'));
  }
});

export const addService = createAsyncThunk('services/addService', async (payload, { rejectWithValue }) => {
  try {
    return await billingService.addService(payload);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to add service.'));
  }
});

export const updateService = createAsyncThunk('services/updateService', async ({ id, updates }, { rejectWithValue }) => {
  try {
    return await billingService.updateService(id, updates);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to update service.'));
  }
});

export const deleteService = createAsyncThunk('services/deleteService', async (id, { rejectWithValue }) => {
  try {
    await billingService.deleteService(id);
    return id;
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to delete service.'));
  }
});

export const toggleService = createAsyncThunk('services/toggleService', async (id, { rejectWithValue }) => {
  try {
    return await billingService.toggleService(id);
  } catch (error) {
    return rejectWithValue(getErrorMessage(error, 'Failed to toggle service.'));
  }
});

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload || [];
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to load services.';
      })
      .addCase(addService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addService.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(addService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to add service.';
      })
      .addCase(updateService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((service) => (service.id === updated.id ? updated : service));
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to update service.';
      })
      .addCase(deleteService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.loading = false;
        state.items = state.items.filter((service) => service.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to delete service.';
      })
      .addCase(toggleService.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(toggleService.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload;
        if (updated) {
          state.items = state.items.map((service) => (service.id === updated.id ? updated : service));
        }
      })
      .addCase(toggleService.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to toggle service.';
      });
  },
});

export default servicesSlice.reducer;

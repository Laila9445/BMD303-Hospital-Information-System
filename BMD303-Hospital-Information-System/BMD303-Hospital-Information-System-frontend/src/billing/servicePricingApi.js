import { mockServices } from './billingMockData';

const SERVICES_KEY = 'clinic_service_catalog';

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
  const services = readStorage(SERVICES_KEY, null);
  if (!services) writeStorage(SERVICES_KEY, mockServices);
};

const generateServiceId = () => `SRV-${Math.floor(1000 + Math.random() * 9000)}`;

export const servicePricingApi = {
  async getServices() {
    ensureSeeded();
    return readStorage(SERVICES_KEY, mockServices);
  },

  async addService(payload) {
    ensureSeeded();
    const services = readStorage(SERVICES_KEY, mockServices);
    const newService = {
      id: generateServiceId(),
      activeStatus: true,
      ...payload,
    };
    const updated = [newService, ...services];
    writeStorage(SERVICES_KEY, updated);
    return newService;
  },

  async updateService(id, updates) {
    ensureSeeded();
    const services = readStorage(SERVICES_KEY, mockServices);
    const updated = services.map((service) =>
      service.id === id ? { ...service, ...updates } : service
    );
    writeStorage(SERVICES_KEY, updated);
    return updated.find((service) => service.id === id) || null;
  },

  // async deleteService(id) {
  //   ensureSeeded();
  //   const services = readStorage(SERVICES_KEY, mockServices);
  //   const updated = services.filter((service) => service.id !== id);
  //   writeStorage(SERVICES_KEY, updated);
  //   return true;
  // },

  async toggleService(id) {
    ensureSeeded();
    const services = readStorage(SERVICES_KEY, mockServices);
    const updated = services.map((service) =>
      service.id === id ? { ...service, activeStatus: !service.activeStatus } : service
    );
    writeStorage(SERVICES_KEY, updated);
    return updated.find((service) => service.id === id) || null;
  },
};

// Все методы этого файла теперь перенаправляют вызовы на apiService.js
import { apiService } from './apiService.js';

export const auth = {
  login: (credentials) => apiService.login(credentials),
  logout: () => apiService.logout(),
  user: () => apiService.getProfile(),
};

export const models = {
  getAll: (params = {}) => apiService.getModels(params),
  getById: (id) => apiService.getModelById(id),
  create: (modelData) => apiService.createModel(modelData),
  update: (id, modelData) => apiService.updateModel(id, modelData),
  delete: (id) => apiService.deleteModel(id),
  moderate: (id, action, comment = '') => apiService.updateModelStatus(id, action),
  getHistory: (id) => Promise.resolve([]), // Реализовать при наличии API
};

export const dashboard = {
  getStats: () => apiService.getDashboardStats(),
};

export const users = {
  getAll: (params = {}) => apiService.getAllUsers(params),
};

export const categories = {
  getAll: () => apiService.getCategories(),
};

export const sections = {
  getAll: () => apiService.getSections(),
};
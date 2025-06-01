/**
 * Универсальный сервис для работы с API всей системы
 */
class APIService {
  constructor() {
    this.baseURL = 'u185465.test-handyhost.ru';
    this.loadSettings();
  }

  loadSettings() {
    const savedSettings = localStorage.getItem('admin_settings');
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      this.baseURL = settings.API_BASE_URL || 'u185465.test-handyhost.ru';
    }
  }

  // Универсальный метод для API запросов
  async makeRequest(endpoint, method = 'GET', data = null, params = {}) {
    try {
      // Используем apiConfig для унификации
      const { apiConfig } = await import('./apiConfigService.js');
      
      let fullEndpoint = endpoint;
      if (Object.keys(params).length > 0) {
        const searchParams = new URLSearchParams(params);
        fullEndpoint += `?${searchParams.toString()}`;
      }
      
      const options = { method };
      if (data && method !== 'GET') {
        options.body = JSON.stringify(data);
      }
      
      return await apiConfig.makeAPIRequest(fullEndpoint, options);
    } catch (error) {
      console.error(`API Error (${endpoint}):`, error);
      throw error;
    }
  }

  // ==================== 1️⃣ API АВТОРИЗАЦИИ И ПОЛЬЗОВАТЕЛЕЙ ====================
  
  async login(credentials) {
    return await this.makeRequest('/api/auth/login', 'POST', credentials);
  }

  async register(userData) {
    return await this.makeRequest('/api/auth/register', 'POST', userData);
  }

  async getProfile() {
    return await this.makeRequest('/api/auth/profile');
  }

  async updateProfile(profileData) {
    return await this.makeRequest('/api/auth/profile', 'PUT', profileData);
  }

  // ==================== 2️⃣ API МОДЕЛЕЙ ====================
  
  async getModels(params = {}) {
    return await this.makeRequest('/api/models', 'GET', null, params);
  }

  async getModelById(id) {
    return await this.makeRequest(`/api/models/${id}`);
  }

  async createModel(modelData) {
    return await this.makeRequest('/api/models', 'POST', modelData);
  }

  async updateModel(id, modelData) {
    return await this.makeRequest(`/api/models/${id}`, 'PUT', modelData);
  }

  async deleteModel(id) {
    return await this.makeRequest(`/api/models/${id}`, 'DELETE');
  }

  async uploadModelFiles(id, files) {
    const formData = new FormData();
    Object.keys(files).forEach(key => {
      formData.append(key, files[key]);
    });
    
    return await this.makeRequest(`/api/models/${id}/files`, 'POST', formData);
  }

  async updateModelStatus(id, status) {
    return await this.makeRequest(`/api/models/${id}/status`, 'PUT', { status });
  }

  // ==================== 3️⃣ API ЗАГРУЗКИ ФАЙЛОВ ====================
  
  async uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    return await this.makeRequest('/api/uploads', 'POST', formData);
  }

  // ==================== 4️⃣ API ФИЛЬТРОВ ====================
  
  async getAllFilters() {
    return await this.makeRequest('/api/filters');
  }

  async getFilterByType(type) {
    return await this.makeRequest(`/api/filters/${type}`);
  }

  // ==================== 5️⃣ API ОТЗЫВОВ/РЕЙТИНГОВ ====================
  
  async getModelReviews(id) {
    return await this.makeRequest(`/api/models/${id}/reviews`);
  }

  async createModelReview(id, reviewData) {
    return await this.makeRequest(`/api/models/${id}/reviews`, 'POST', reviewData);
  }

  // ==================== 6️⃣ API ПОКУПОК И ЗАГРУЗОК ====================
  
  async addToCart(modelId) {
    return await this.makeRequest('/api/cart', 'POST', { model_id: modelId });
  }

  async getCart() {
    return await this.makeRequest('/api/cart');
  }

  async createOrder(orderData) {
    return await this.makeRequest('/api/orders', 'POST', orderData);
  }

  async getOrders() {
    return await this.makeRequest('/api/orders');
  }

  async downloadOrder(orderId) {
    return await this.makeRequest(`/api/orders/${orderId}/download`);
  }

  // ==================== 7️⃣ API ГАЛЕРЕЙ ====================
  
  async getGalleries() {
    return await this.makeRequest('/api/galleries');
  }

  // ==================== 8️⃣ API СТАТИСТИКИ ====================
  
  async getModelStats(id) {
    return await this.makeRequest(`/api/models/${id}/stats`);
  }

  async likeModel(id) {
    return await this.makeRequest(`/api/models/${id}/like`, 'POST');
  }

  async getDashboardStats() {
    const { ftpDataService } = await import('./ftpDataService.js');
    const { apiConfig } = await import('./apiConfigService.js');
    
    if (apiConfig.getStorageMode() === 'ftp') {
      return await ftpDataService.getDashboardStats();
    }
    return await this.makeRequest('/api/dashboard/stats');
  }

  // ==================== 9️⃣ API ДЛЯ АДМИНКИ ====================
  
  // Управление пользователями
  async getAllUsers(params = {}) {
    return await this.makeRequest('/api/admin/users', 'GET', null, params);
  }

  async createUser(userData) {
    return await this.makeRequest('/api/admin/users', 'POST', userData);
  }

  async updateUser(id, userData) {
    return await this.makeRequest(`/api/admin/users/${id}`, 'PUT', userData);
  }

  async deleteUser(id) {
    return await this.makeRequest(`/api/admin/users/${id}`, 'DELETE');
  }

  async blockUser(id) {
    return await this.makeRequest(`/api/admin/users/${id}/block`, 'POST');
  }

  async unblockUser(id) {
    return await this.makeRequest(`/api/admin/users/${id}/unblock`, 'POST');
  }

  // Управление фильтрами
  async createFilter(type, filterData) {
    return await this.makeRequest(`/api/admin/filters/${type}`, 'POST', filterData);
  }

  async updateFilter(type, id, filterData) {
    return await this.makeRequest(`/api/admin/filters/${type}/${id}`, 'PUT', filterData);
  }

  async deleteFilter(type, id) {
    return await this.makeRequest(`/api/admin/filters/${type}/${id}`, 'DELETE');
  }

  async sortFilters(type, sortData) {
    return await this.makeRequest(`/api/admin/filters/${type}/sort`, 'POST', sortData);
  }

  // Модерация моделей
  async getModerationQueue(params = {}) {
    return await this.makeRequest('/api/admin/moderation', 'GET', null, params);
  }

  async moderateModel(id, action, comment = '') {
    return await this.makeRequest(`/api/admin/moderation/${id}`, 'POST', { action, comment });
  }

  // Синхронизация данных (гибридный режим)
  async syncData() {
    return await this.makeRequest('/api/sync');
  }

  // ==================== LEGACY МЕТОДЫ (для совместимости) ====================
  
  async getFilterData(table) {
    // Маппинг старых названий на новые эндпоинты
    const typeMap = {
      'categories': 'categories',
      'sections': 'sections',
      'softs': 'software',
      'software': 'software',
      'formats': 'formats',
      'colors': 'colors',
      'materials': 'materials',
      'renders': 'renders',
      'statuses': 'statuses'
    };
    
    const type = typeMap[table] || table;
    return await this.getFilterByType(type);
  }

  // Legacy методы для совместимости - перенаправляем на новые API эндпоинты
  async createFilterItem(table, data) {
    const typeMap = {
      'categories': 'categories',
      'sections': 'sections', 
      'softs': 'software',
      'software': 'software',
      'formats': 'formats',
      'colors': 'colors',
      'materials': 'materials',
      'renders': 'renders',
      'statuses': 'statuses'
    };
    
    const type = typeMap[table] || table;
    return await this.createFilter(type, data);
  }

  async updateFilterItem(table, id, data) {
    const typeMap = {
      'categories': 'categories',
      'sections': 'sections',
      'softs': 'software', 
      'software': 'software',
      'formats': 'formats',
      'colors': 'colors',
      'materials': 'materials',
      'renders': 'renders',
      'statuses': 'statuses'
    };
    
    const type = typeMap[table] || table;
    return await this.updateFilter(type, id, data);
  }

  async deleteFilterItem(table, id) {
    const typeMap = {
      'categories': 'categories',
      'sections': 'sections',
      'softs': 'software',
      'software': 'software', 
      'formats': 'formats',
      'colors': 'colors',
      'materials': 'materials',
      'renders': 'renders',
      'statuses': 'statuses'
    };
    
    const type = typeMap[table] || table;
    return await this.deleteFilter(type, id);
  }

  // Legacy методы для пользователей - перенаправляем на новые эндпоинты
  async getUsers(params = {}) {
    return await this.getAllUsers(params);
  }

  // Исправляем конфликт имен - переименовываем legacy метод
  async createUserLegacy(data) {
    return await this.createUser(data);
  }

  async updateUserLegacy(id, data) {
    return await this.updateUser(id, data);
  }

  // Legacy методы для модерации - перенаправляем на новые эндпоинты  
  async getModerationQueueLegacy(params = {}) {
    return await this.getModerationQueue(params);
  }

  async moderateItem(data) {
    return await this.moderateModel(data.id, data.action, data.comment || '');
  }

  // Legacy метод для дашборда - перенаправляем на новый эндпоинт
  async getDashboardStatsLegacy() {
    return await this.getDashboardStats();
  }

  // Методы для работы с локальным кэшем
  getCachedData(key) {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const data = JSON.parse(cached);
        // Проверяем срок действия кэша (24 часа)
        if (data.timestamp && (Date.now() - data.timestamp < 24 * 60 * 60 * 1000)) {
          return data.value;
        }
      }
    } catch (error) {
      console.error('Error reading cache:', error);
    }
    return null;
  }

  setCachedData(key, value) {
    try {
      const cacheData = {
        value,
        timestamp: Date.now()
      };
      localStorage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  }

  // Гибридный метод - сначала API, потом кэш
  async getDataWithFallback(apiMethod, cacheKey, ...args) {
    try {
      // Пытаемся получить данные с API
      const result = await apiMethod.call(this, ...args);
      if (result.success) {
        // Кэшируем успешный результат
        this.setCachedData(cacheKey, result.data);
        return result;
      }
      throw new Error('API returned unsuccessful result');
    } catch (error) {
      console.log(`API недоступен для ${cacheKey}, используем кэш:`, error.message);
      
      // Fallback на кэш
      const cachedData = this.getCachedData(cacheKey);
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          source: 'cache'
        };
      }
      
      // Если нет кэша, возвращаем ошибку
      throw new Error('No data available (API failed and no cache)');
    }
  }

  // Специальные методы для каждого типа фильтров с FTP поддержкой
  async getCategories() {
    const { ftpDataService } = await import('./ftpDataService.js');
    const { apiConfig } = await import('./apiConfigService.js');
    
    if (apiConfig.getStorageMode() === 'ftp') {
      return await ftpDataService.getCategories();
    }
    return this.getDataWithFallback(this.getFilterData, 'admin_categories', 'categories');
  }

  async getStatuses() {
    return this.getDataWithFallback(this.getFilterData, 'admin_statuses', 'statuses');
  }

  async getMaterials() {
    return this.getDataWithFallback(this.getFilterData, 'admin_materials', 'materials');
  }

  async getRenders() {
    return this.getDataWithFallback(this.getFilterData, 'admin_renders', 'renders');
  }

  async getColors() {
    return this.getDataWithFallback(this.getFilterData, 'admin_colors', 'colors');
  }

  async getSofts() {
    return this.getDataWithFallback(this.getFilterData, 'admin_softs', 'softs');
  }

  async getFormats() {
    return this.getDataWithFallback(this.getFilterData, 'admin_formats', 'formats');
  }

  async getSections() {
    return this.getDataWithFallback(this.getFilterData, 'admin_sections', 'sections');
  }

  async getPolygons() {
    return this.getDataWithFallback(this.getFilterData, 'admin_polygons', 'polygons');
  }

  async getStyles() {
    return this.getDataWithFallback(this.getFilterData, 'admin_styles', 'styles');
  }

  async getAnimation() {
    return this.getDataWithFallback(this.getFilterData, 'admin_animation', 'animation');
  }

  async getOthers() {
    return this.getDataWithFallback(this.getFilterData, 'admin_others', 'others');
  }
}

export const apiService = new APIService();
export default apiService;
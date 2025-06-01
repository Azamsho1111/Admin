/**
 * Централизованный сервис для управления API настройками
 * Все компоненты получают настройки из этого сервиса
 */
class APIConfigService {
  constructor() {
    this.config = this.loadConfig();
    this.listeners = [];
  }

  // Загрузка настроек из localStorage
  loadConfig() {
    const defaultConfig = {
      API_BASE_URL: 'http://localhost:8000/api',
      API_TIMEOUT: 30000,
      RETRY_ATTEMPTS: 3,
      FTP_HOST: '109.95.210.216',
      FTP_PORT: 21,
      FTP_USER: 'u185465',
      FTP_PASSWORD: 'vU4zS5lB7t',
      STORAGE_MODE: 'ftp',
      API_KEY: '',
      DEFAULT_HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    };

    const stored = localStorage.getItem('admin_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        // Автоматически заполняем отсутствующие данные из defaultConfig
        const mergedConfig = { ...defaultConfig, ...parsed };
        
        // Принудительно устанавливаем прокси URL
        mergedConfig.API_BASE_URL = '/api';
        
        // Автоматически сохраняем обновленную конфигурацию
        localStorage.setItem('admin_settings', JSON.stringify(mergedConfig));
        
        return mergedConfig;
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
        // При ошибке сохраняем базовую конфигурацию
        localStorage.setItem('admin_settings', JSON.stringify(defaultConfig));
        return defaultConfig;
      }
    }
    
    // Сохраняем базовую конфигурацию при первом запуске
    localStorage.setItem('admin_settings', JSON.stringify(defaultConfig));
    return defaultConfig;
  }

  // Сохранение настроек
  saveConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    localStorage.setItem('admin_settings', JSON.stringify(this.config));
    
    // Уведомляем всех слушателей об изменениях
    this.listeners.forEach(listener => listener(this.config));
  }

  // Получение текущих настроек
  getConfig() {
    return this.config;
  }

  // Подписка на изменения настроек
  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Получение базового URL для API запросов
  getAPIBaseURL() {
    return this.config.API_BASE_URL;
  }

  // Получение заголовков для API запросов
  getAPIHeaders() {
    const headers = { ...this.config.DEFAULT_HEADERS };
    if (this.config.API_KEY) {
      headers['Authorization'] = `Bearer ${this.config.API_KEY}`;
    }
    return headers;
  }

  // Получение настроек таймаута
  getTimeout() {
    return this.config.API_TIMEOUT;
  }

  // Получение FTP настроек
  getFTPConfig() {
    return {
      host: this.config.FTP_HOST,
      port: this.config.FTP_PORT,
      user: this.config.FTP_USER,
      password: this.config.FTP_PASSWORD
    };
  }

  // Универсальный метод для API запросов
  async makeAPIRequest(endpoint, options = {}) {
    // Корректируем endpoint для соответствия API структуре
    let correctedEndpoint = endpoint;
    
    // Маппинг старых endpoint'ов на новые API пути
    const endpointMap = {
      'categories': '/categories.json',
      'sections': '/sections.json', 
      'softs': '/api_softs.php',
      'software': '/api_softs.php',
      'formats': '/api_formats.php',
      'colors': '/api_colors.php',
      'materials': '/api_materials.php',
      'dashboard': '/dashboard.json',
      'models': '/models.json',
      'users': '/users.json'
    };
    
    if (endpointMap[endpoint]) {
      correctedEndpoint = endpointMap[endpoint];
    } else if (!endpoint.startsWith('/') && !endpoint.includes('.php')) {
      correctedEndpoint = `/api/api_${endpoint}.php`;
    } else if (endpoint.startsWith('/')) {
      correctedEndpoint = endpoint;
    }

    const url = `${this.getAPIBaseURL()}${correctedEndpoint}`;
    
    // Отладочная информация
    console.log(`Формируем запрос к ${url} (попытка ${options.attempt || 1})`);
    console.log(`Базовый URL: ${this.getAPIBaseURL()}`);
    console.log(`Эндпоинт: ${endpoint} -> ${correctedEndpoint}`);
    
    // Автоматически используем все данные из конфигурации для аутентификации
    let authHeaders = {};
    
    // Проверяем все возможные варианты авторизации из настроек
    if (this.config.API_TOKEN || this.config.apiToken) {
      authHeaders['Authorization'] = `Bearer ${this.config.API_TOKEN || this.config.apiToken}`;
    } else if (this.config.API_KEY || this.config.apiKey) {
      authHeaders['X-API-Key'] = this.config.API_KEY || this.config.apiKey;
    } else if (this.config.username && this.config.password) {
      // Basic Auth с логином/паролем
      const credentials = btoa(`${this.config.username}:${this.config.password}`);
      authHeaders['Authorization'] = `Basic ${credentials}`;
    } else if (this.config.FTP_USER && this.config.FTP_PASSWORD) {
      // Используем FTP данные как fallback для авторизации
      const credentials = btoa(`${this.config.FTP_USER}:${this.config.FTP_PASSWORD}`);
      authHeaders['Authorization'] = `Basic ${credentials}`;
    }
    
    // Добавляем дополнительные заголовки из настроек
    if (this.config.authToken) {
      authHeaders['X-Auth-Token'] = this.config.authToken;
    }
    if (this.config.sessionId) {
      authHeaders['X-Session-ID'] = this.config.sessionId;
    }
    
    const defaultOptions = {
      headers: {
        ...this.getAPIHeaders(),
        ...authHeaders,
        'Cookie': 'handyhosttrial=yes'
      },
      timeout: this.getTimeout()
    };

    const finalOptions = { ...defaultOptions, ...options };

    for (let attempt = 1; attempt <= this.config.RETRY_ATTEMPTS; attempt++) {
      try {
        console.log(`Отправляем запрос к ${url} (попытка ${attempt})`);
        const response = await fetch(url, finalOptions);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Успешный ответ от ${url}:`, data);
          return { status: 'success', data };
        } else {
          const errorText = await response.text();
          console.error(`HTTP ошибка ${response.status} для ${url}:`, errorText);
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
      } catch (error) {
        console.error(`API запрос ${url} попытка ${attempt}:`, error);
        if (attempt === this.config.RETRY_ATTEMPTS) {
          throw error;
        }
        // Ждем перед повторной попыткой
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  // Получение режима хранения
  getStorageMode() {
    return this.config.STORAGE_MODE;
  }

  // Проверка доступности API
  async testConnection() {
    try {
      const response = await this.makeAPIRequest('dashboard');
      return response.success;
    } catch (error) {
      return false;
    }
  }

  // Сохранение данных на API сервер
  async saveToAPI(endpoint, data) {
    try {
      const response = await this.makeAPIRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(data)
      });
      console.log(`Данные сохранены на API: ${endpoint}`);
      return { success: true, data: response };
    } catch (error) {
      console.error('Ошибка API сохранения:', error);
      return { success: false, error: error.message };
    }
  }

  // Универсальное сохранение во все системы
  async saveEverywhere(data, options = {}) {
    const results = {
      localStorage: false,
      api: false,
      errors: []
    };

    // Сохранение в localStorage
    try {
      const key = options.localStorageKey || 'admin_data';
      localStorage.setItem(key, JSON.stringify(data));
      results.localStorage = true;
      console.log('Данные сохранены в localStorage');
    } catch (error) {
      results.errors.push(`localStorage: ${error.message}`);
    }

    // Сохранение через API
    if (options.apiEndpoint) {
      const apiResult = await this.saveToAPI(options.apiEndpoint, data);
      results.api = apiResult.success;
      if (!apiResult.success) {
        results.errors.push(`API: ${apiResult.error}`);
      }
    }

    return results;
  }

  // Получение статуса настроек
  getStatus() {
    const requiredFields = ['API_BASE_URL'];
    const isConfigured = requiredFields.every(field => 
      this.config[field] && this.config[field].trim() !== ''
    );

    return {
      configured: isConfigured,
      apiBaseURL: this.config.API_BASE_URL,
      ftpConfigured: !!(this.config.FTP_HOST && this.config.FTP_USER),
      storageMode: this.config.STORAGE_MODE
    };
  }
}

// Создаем единственный экземпляр сервиса
export const apiConfig = new APIConfigService();
export default apiConfig;
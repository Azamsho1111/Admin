// Сервис для управления различными режимами хранения данных

class StorageService {
  constructor() {
    this.mode = localStorage.getItem('storage_mode') || 'hybrid';
    this.apiUrl = window.location.origin + '/api';
    this.cacheTimeout = 5 * 60 * 1000; // 5 минут TTL
  }

  // Установка режима хранения
  setMode(mode) {
    this.mode = mode;
    localStorage.setItem('storage_mode', mode);
    console.log(`Режим хранения изменен на: ${mode}`);
  }

  // Получение данных в зависимости от режима
  async getData(key, apiEndpoint) {
    switch (this.mode) {
      case 'local':
        return this.getFromLocal(key);
      
      case 'api':
        return this.getFromAPI(apiEndpoint);
      
      case 'hybrid':
        return this.getFromHybrid(key, apiEndpoint);
      
      default:
        return this.getFromHybrid(key, apiEndpoint);
    }
  }

  // Сохранение данных в зависимости от режима
  async saveData(key, data, apiEndpoint) {
    switch (this.mode) {
      case 'local':
        return this.saveToLocal(key, data);
      
      case 'api':
        return this.saveToAPI(data, apiEndpoint);
      
      case 'hybrid':
        return this.saveToHybrid(key, data, apiEndpoint);
      
      default:
        return this.saveToHybrid(key, data, apiEndpoint);
    }
  }

  // Локальное хранение
  getFromLocal(key) {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Ошибка чтения из localStorage:', error);
      return null;
    }
  }

  saveToLocal(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data));
      return { success: true };
    } catch (error) {
      console.error('Ошибка записи в localStorage:', error);
      return { success: false, error: error.message };
    }
  }

  // API хранение
  async getFromAPI(endpoint) {
    try {
      // Устанавливаем cookie для обхода ограничений тестового домена
      document.cookie = 'handyhosttrial=yes; path=/; domain=.test-handyhost.ru';
      
      const response = await fetch(`${this.apiUrl}/${endpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': 'handyhosttrial=yes'
        },
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Ошибка получения данных из API:', error);
      throw error;
    }
  }

  async saveToAPI(data, endpoint) {
    try {
      // Устанавливаем cookie для обхода ограничений тестового домена
      document.cookie = 'handyhosttrial=yes; path=/; domain=.test-handyhost.ru';
      
      const response = await fetch(`${this.apiUrl}/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Cookie': 'handyhosttrial=yes'
        },
        mode: 'cors',
        credentials: 'include',
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Ошибка отправки данных в API:', error);
      throw error;
    }
  }

  // Гибридный режим
  async getFromHybrid(key, apiEndpoint) {
    // Сначала проверяем кэш
    const cached = this.getFromCache(key);
    if (cached && this.isCacheValid(cached.timestamp)) {
      console.log(`Данные получены из кэша: ${key}`);
      return cached.data;
    }

    // Если кэш устарел или отсутствует, пытаемся получить с API
    try {
      const apiData = await this.getFromAPI(apiEndpoint);
      // Сохраняем в кэш
      this.saveToCache(key, apiData);
      console.log(`Данные получены с API и сохранены в кэш: ${key}`);
      return apiData;
    } catch (error) {
      // Если API недоступен, используем устаревший кэш как fallback
      if (cached) {
        console.log(`API недоступен, используем устаревший кэш: ${key}`);
        return cached.data;
      }
      throw error;
    }
  }

  async saveToHybrid(key, data, apiEndpoint) {
    // Сохраняем в локальный кэш
    this.saveToCache(key, data);
    
    // Пытаемся отправить на сервер
    try {
      const result = await this.saveToAPI(data, apiEndpoint);
      console.log(`Данные сохранены локально и на сервере: ${key}`);
      return result;
    } catch (error) {
      console.log(`Данные сохранены только локально (сервер недоступен): ${key}`);
      // Добавляем в очередь на синхронизацию
      this.addToSyncQueue(key, data, apiEndpoint);
      return { success: true, cached: true };
    }
  }

  // Управление кэшем
  getFromCache(key) {
    try {
      const cached = localStorage.getItem(`cache_${key}`);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.error('Ошибка чтения кэша:', error);
      return null;
    }
  }

  saveToCache(key, data) {
    try {
      const cacheEntry = {
        data: data,
        timestamp: Date.now()
      };
      localStorage.setItem(`cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
      console.error('Ошибка записи в кэш:', error);
    }
  }

  isCacheValid(timestamp) {
    return (Date.now() - timestamp) < this.cacheTimeout;
  }

  // Очередь синхронизации
  addToSyncQueue(key, data, endpoint) {
    try {
      const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
      queue.push({
        key,
        data,
        endpoint,
        timestamp: Date.now()
      });
      localStorage.setItem('sync_queue', JSON.stringify(queue));
    } catch (error) {
      console.error('Ошибка добавления в очередь синхронизации:', error);
    }
  }

  // Синхронизация очереди
  async syncQueue() {
    try {
      const queue = JSON.parse(localStorage.getItem('sync_queue') || '[]');
      const successful = [];
      
      for (const item of queue) {
        try {
          await this.saveToAPI(item.data, item.endpoint);
          successful.push(item);
          console.log(`Синхронизирован элемент очереди: ${item.key}`);
        } catch (error) {
          console.log(`Не удалось синхронизировать: ${item.key}`);
        }
      }
      
      // Удаляем успешно синхронизированные элементы
      const remaining = queue.filter(item => !successful.includes(item));
      localStorage.setItem('sync_queue', JSON.stringify(remaining));
      
      return {
        synced: successful.length,
        remaining: remaining.length
      };
    } catch (error) {
      console.error('Ошибка синхронизации очереди:', error);
      return { synced: 0, remaining: 0 };
    }
  }

  // Очистка кэша
  clearCache() {
    const keys = Object.keys(localStorage);
    let cleared = 0;
    
    keys.forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key);
        cleared++;
      }
    });
    
    console.log(`Очищено ${cleared} элементов кэша`);
    return cleared;
  }

  // Статистика хранилища
  getStorageStats() {
    const total = JSON.stringify(localStorage).length;
    const cache = Object.keys(localStorage)
      .filter(key => key.startsWith('cache_'))
      .reduce((size, key) => size + localStorage.getItem(key).length, 0);
    
    const queue = localStorage.getItem('sync_queue');
    const queueSize = queue ? queue.length : 0;
    
    return {
      totalSize: (total / 1024 / 1024).toFixed(2) + ' МБ',
      cacheSize: (cache / 1024).toFixed(2) + ' КБ',
      queueItems: JSON.parse(localStorage.getItem('sync_queue') || '[]').length,
      mode: this.mode
    };
  }
}

// Экспортируем единственный экземпляр
export const storageService = new StorageService();
export default storageService;
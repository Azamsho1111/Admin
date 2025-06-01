import axios from 'axios';

class StorageAdapter {
  constructor(config = {}) {
    this.config = {
      mode: 'local',
      apiBaseUrl: '',
      apiKey: '',
      prefix: 'admin_',
      cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours in ms
      timeout: 5000,
      failoverMode: 'local',
      ...config
    };
  }

  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
  }

  isCacheValid(timestamp) {
    return Date.now() - timestamp < this.config.cacheExpiry;
  }

  async getFromLocal(key) {
    try {
      const fullKey = this.config.prefix + key;
      const data = localStorage.getItem(fullKey);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      return {
        data: parsed.data,
        timestamp: parsed.timestamp,
        isValid: this.isCacheValid(parsed.timestamp)
      };
    } catch (error) {
      console.error('Ошибка чтения из localStorage:', error);
      return null;
    }
  }

  async setToLocal(key, data) {
    try {
      const fullKey = this.config.prefix + key;
      const payload = {
        data,
        timestamp: Date.now()
      };
      localStorage.setItem(fullKey, JSON.stringify(payload));
      return true;
    } catch (error) {
      console.error('Ошибка записи в localStorage:', error);
      return false;
    }
  }

  async getFromServer(key) {
    try {
      const response = await axios.get(`${this.config.apiBaseUrl}/data/${key}`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        },
        timeout: this.config.timeout
      });

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Время ожидания запроса к серверу истекло');
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Сервер недоступен. Проверьте URL сервера и интернет-соединение');
      } else if (error.response?.status === 404) {
        throw new Error('API эндпоинт не найден. Проверьте правильность URL сервера');
      } else if (error.response?.status === 401) {
        throw new Error('Ошибка авторизации. Проверьте API ключ');
      } else {
        throw new Error(`Ошибка сервера: ${error.message}`);
      }
    }
  }

  async setToServer(key, data) {
    try {
      const response = await axios.post(`${this.config.apiBaseUrl}/data/${key}`, 
        { data }, 
        {
          headers: {
            'Authorization': `Bearer ${this.config.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.config.timeout
        }
      );

      return response.data;
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        throw new Error('Время ожидания запроса к серверу истекло');
      } else if (error.code === 'ERR_NETWORK' || error.message.includes('Network Error')) {
        throw new Error('Сервер недоступен. Проверьте URL сервера и интернет-соединение');
      } else if (error.response?.status === 404) {
        throw new Error('API эндпоинт не найден. Проверьте правильность URL сервера');
      } else if (error.response?.status === 401) {
        throw new Error('Ошибка авторизации. Проверьте API ключ');
      } else {
        throw new Error(`Ошибка сервера: ${error.message}`);
      }
    }
  }

  async get(key) {
    switch (this.config.mode) {
      case 'local':
        const localData = await this.getFromLocal(key);
        return localData ? localData.data : null;

      case 'server':
        try {
          return await this.getFromServer(key);
        } catch (error) {
          if (this.config.failoverMode === 'local') {
            console.warn('Сервер недоступен, используем локальные данные');
            const localData = await this.getFromLocal(key);
            return localData ? localData.data : null;
          }
          throw new Error(`Ошибка подключения к серверу: ${error.message}`);
        }

      case 'hybrid':
        const cachedData = await this.getFromLocal(key);
        
        if (cachedData && cachedData.isValid) {
          return cachedData.data;
        }

        try {
          const serverData = await this.getFromServer(key);
          await this.setToLocal(key, serverData);
          return serverData;
        } catch (error) {
          if (cachedData) {
            console.warn('Сервер недоступен, используем устаревшие данные из кэша');
            return cachedData.data;
          }
          throw new Error(`Ошибка подключения к серверу: ${error.message}`);
        }

      default:
        throw new Error(`Неизвестный режим хранения: ${this.config.mode}`);
    }
  }

  async set(key, data) {
    switch (this.config.mode) {
      case 'local':
        return await this.setToLocal(key, data);

      case 'server':
        try {
          await this.setToServer(key, data);
          return true;
        } catch (error) {
          if (this.config.failoverMode === 'local') {
            console.warn('Сервер недоступен, сохраняем локально');
            return await this.setToLocal(key, data);
          }
          throw new Error(`Ошибка подключения к серверу: ${error.message}`);
        }

      case 'hybrid':
        await this.setToLocal(key, data);
        
        try {
          await this.setToServer(key, data);
          return true;
        } catch (error) {
          console.warn('Сервер недоступен, данные сохранены только локально');
          return true;
        }

      default:
        throw new Error(`Неизвестный режим хранения: ${this.config.mode}`);
    }
  }

  async update(key, updateData) {
    const existingData = await this.get(key);
    if (!existingData) {
      throw new Error(`Данные с ключом '${key}' не найдены`);
    }

    const updatedData = { ...existingData, ...updateData };
    return await this.set(key, updatedData);
  }

  async delete(key) {
    switch (this.config.mode) {
      case 'local':
        try {
          const fullKey = this.config.prefix + key;
          localStorage.removeItem(fullKey);
          return true;
        } catch (error) {
          console.error('Ошибка удаления из localStorage:', error);
          return false;
        }

      case 'server':
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(`${this.config.apiBaseUrl}/data/${key}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          if (this.config.failoverMode === 'local') {
            console.warn('Сервер недоступен, удаляем только локально');
            const fullKey = this.config.prefix + key;
            localStorage.removeItem(fullKey);
            return true;
          }
          throw new Error(`Ошибка подключения к серверу: ${error.message}`);
        }

      case 'hybrid':
        const fullKey = this.config.prefix + key;
        localStorage.removeItem(fullKey);
        
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

          const response = await fetch(`${this.config.apiBaseUrl}/data/${key}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${this.config.apiKey}`,
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          });

          clearTimeout(timeoutId);
          return response.ok;
        } catch (error) {
          console.warn('Сервер недоступен, данные удалены только локально');
          return true;
        }

      default:
        throw new Error(`Неизвестный режим хранения: ${this.config.mode}`);
    }
  }

  getStats() {
    const keys = Object.keys(localStorage);
    const ourKeys = keys.filter(key => key.startsWith(this.config.prefix));
    
    let totalSize = 0;
    const items = ourKeys.map(key => {
      const value = localStorage.getItem(key);
      const size = new Blob([value]).size;
      totalSize += size;
      
      try {
        const parsed = JSON.parse(value);
        return {
          key: key.replace(this.config.prefix, ''),
          size,
          timestamp: parsed.timestamp,
          isValid: this.isCacheValid(parsed.timestamp)
        };
      } catch {
        return {
          key: key.replace(this.config.prefix, ''),
          size,
          timestamp: null,
          isValid: false
        };
      }
    });

    return {
      mode: this.config.mode,
      totalItems: ourKeys.length,
      totalSize,
      items
    };
  }
}

export default StorageAdapter;
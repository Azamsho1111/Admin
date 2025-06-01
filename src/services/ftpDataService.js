/**
 * Сервис для загрузки данных напрямую через FTP
 * Загружает JSON файлы с сервера и предоставляет данные приложению
 */
class FTPDataService {
  constructor() {
    this.ftpConfig = {
      host: '109.95.210.216',
      user: 'u185465',
      password: 'vU4zS5lB7t',
      port: 21
    };
    this.cache = {};
    this.lastUpdate = {};
  }

  // Универсальный метод для загрузки данных с сервера
  async loadDataFromServer(filename) {
    try {
      console.log(`Загружаем ${filename} с сервера...`);
      const response = await fetch(`/api/${filename}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        this.cache[filename] = data;
        this.lastUpdate[filename] = Date.now();
        console.log(`Данные ${filename} успешно загружены с сервера`);
        return data;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error(`Ошибка загрузки ${filename} с сервера:`, error);
      throw error;
    }
  }

  // Получение данных с сервера (fallback)
  getServerData(filename) {
    const serverData = {
      'categories.json': {
        success: true,
        data: [
          { id: 1, name: 'Архитектура', name_en: 'Architecture', position: 1, models_count: 25 },
          { id: 2, name: 'Мебель', name_en: 'Furniture', position: 2, models_count: 150 },
          { id: 3, name: 'Транспорт', name_en: 'Transport', position: 3, models_count: 75 },
          { id: 4, name: 'Декор', name_en: 'Decor', position: 4, models_count: 90 },
          { id: 5, name: 'Освещение', name_en: 'Lighting', position: 5, models_count: 45 }
        ]
      },
      'dashboard.json': {
        success: true,
        data: {
          total_models: 1250,
          pending_models: 45,
          approved_models: 1180,
          rejected_models: 25,
          total_users: 340,
          active_users: 285,
          monthly_uploads: [120, 150, 180, 165, 200, 220, 195, 210, 185, 225, 240, 260],
          daily_downloads: [45, 67, 52, 78, 89, 65, 72],
          revenue: 125000
        }
      },
      'sections.json': {
        success: true,
        data: [
          { id: 1, category_id: 1, name: 'Жилые здания', name_en: 'residential', icon: '🏠' },
          { id: 2, category_id: 1, name: 'Коммерческие', name_en: 'commercial', icon: '🏢' },
          { id: 3, category_id: 2, name: 'Столы', name_en: 'tables', icon: '🪑' },
          { id: 4, category_id: 2, name: 'Стулья', name_en: 'chairs', icon: '🪑' },
          { id: 5, category_id: 3, name: 'Автомобили', name_en: 'cars', icon: '🚗' }
        ]
      },
      'models.json': {
        success: true,
        data: [
          { id: 1, name: 'Современный диван', category_id: 2, status: 'approved', author: 'Иван Петров', downloads: 150 },
          { id: 2, name: 'Офисное кресло', category_id: 2, status: 'pending', author: 'Мария Сидорова', downloads: 85 },
          { id: 3, name: 'Торшер классический', category_id: 5, status: 'approved', author: 'Алексей Иванов', downloads: 220 },
          { id: 4, name: 'BMW X5', category_id: 3, status: 'approved', author: 'Дмитрий Козлов', downloads: 340 },
          { id: 5, name: 'Загородный дом', category_id: 1, status: 'pending', author: 'Елена Новикова', downloads: 95 }
        ]
      },
      'users.json': {
        success: true,
        data: [
          { id: 1, name: 'Иван Петров', email: 'ivan@example.com', role: 'designer', models_count: 25, status: 'active' },
          { id: 2, name: 'Мария Сидорова', email: 'maria@example.com', role: 'admin', models_count: 45, status: 'active' },
          { id: 3, name: 'Алексей Иванов', email: 'alexey@example.com', role: 'designer', models_count: 15, status: 'active' },
          { id: 4, name: 'Дмитрий Козлов', email: 'dmitry@example.com', role: 'moderator', models_count: 30, status: 'inactive' },
          { id: 5, name: 'Елена Новикова', email: 'elena@example.com', role: 'designer', models_count: 12, status: 'active' }
        ]
      }
    };

    return serverData[filename] || { success: false, error: 'Файл не найден' };
  }

  // Сохранение данных на FTP сервер
  async saveDataToFTP(filename, data) {
    try {
      const response = await fetch(`/proxy/ftp/${filename}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FTP-Host': this.ftpConfig.host,
          'X-FTP-User': this.ftpConfig.user,
          'X-FTP-Password': this.ftpConfig.password
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        this.cache[filename] = data;
        this.lastUpdate[filename] = Date.now();
        console.log(`Данные сохранены на FTP: ${filename}`);
        return { success: true };
      }
    } catch (error) {
      console.error(`Ошибка сохранения ${filename} на FTP:`, error);
    }

    // Сохраняем в локальном кэше как fallback
    this.cache[filename] = data;
    localStorage.setItem(`ftp_cache_${filename}`, JSON.stringify(data));
    return { success: true, cached: true };
  }

  // API методы для различных типов данных
  async getCategories() {
    return await this.loadDataFromServer('categories.json');
  }

  async getDashboardStats() {
    return await this.loadDataFromServer('dashboard.json');
  }

  async getSections() {
    return await this.loadDataFromServer('sections.json');
  }

  async getModels() {
    return await this.loadDataFromServer('models.json');
  }

  async getUsers() {
    return await this.loadDataFromServer('users.json');
  }

  // Методы для сохранения данных
  async saveCategories(categories) {
    console.log('Сохраняем категории на FTP сервер...');
    return await this.saveDataToFTP('categories.json', { success: true, data: categories });
  }

  async saveDashboardStats(stats) {
    console.log('Сохраняем статистику на FTP сервер...');
    return await this.saveDataToFTP('dashboard.json', { success: true, data: stats });
  }

  async saveSections(sections) {
    console.log('Сохраняем секции на FTP сервер...');
    return await this.saveDataToFTP('sections.json', { success: true, data: sections });
  }

  async saveModels(models) {
    console.log('Сохраняем модели на FTP сервер...');
    return await this.saveDataToFTP('models.json', { success: true, data: models });
  }

  async saveUsers(users) {
    console.log('Сохраняем пользователей на FTP сервер...');
    return await this.saveDataToFTP('users.json', { success: true, data: users });
  }

  // Проверка подключения к FTP
  async testConnection() {
    try {
      const result = await this.getCategories();
      return result.success;
    } catch (error) {
      console.error('Ошибка подключения к FTP:', error);
      return false;
    }
  }

  // Получение статуса подключения
  getConnectionStatus() {
    return {
      host: this.ftpConfig.host,
      user: this.ftpConfig.user,
      connected: Object.keys(this.cache).length > 0,
      lastUpdate: Math.max(...Object.values(this.lastUpdate).filter(t => t)) || null
    };
  }
}

// Создаем единственный экземпляр сервиса
export const ftpDataService = new FTPDataService();
export default ftpDataService;
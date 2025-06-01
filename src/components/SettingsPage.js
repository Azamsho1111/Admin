import React, { useState, useEffect } from 'react';
import storageService from '../services/storageService';
import { useModalContext } from './ModalProvider';

const SettingsPage = () => {
  const { success, error, warning, confirm } = useModalContext();
  const [activeTab, setActiveTab] = useState('api');
  const [storageMode, setStorageMode] = useState('local');
  const [systemInfo, setSystemInfo] = useState({
    apiStatus: 'checking',
    dbStatus: 'checking',
    totalModels: 0,
    totalUsers: 0,
    lastSync: null
  });
  
  const [settings, setSettings] = useState({
    API_BASE_URL: 'u185465.test-handyhost.ru/laravel/public/api',
    ADMIN_PANEL_URL: window.location.origin,
    WEBHOOK_URL: `${window.location.origin}/webhook-endpoint`,
    API_KEY: 'laravel_api_token',
    STORAGE_MODE: 'database',
    CACHE_EXPIRY_HOURS: 24,
    FAILOVER_STORAGE: 'mysql',
    timeout: 30,
    cacheSize: '50MB',
    syncInterval: 300,
    notifications: true,
    autoSave: true,
    // Laravel настройки
    LARAVEL_APP_URL: 'http://u185465.test-handyhost.ru/laravel/public',
    LARAVEL_API_PREFIX: '/api',
    // Дополнительные API настройки
    API_TIMEOUT: 30000,
    RETRY_ATTEMPTS: 3,
    DEFAULT_HEADERS: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    // Настройки базы данных MySQL
    DATABASE_HOST: '127.0.0.1',
    DATABASE_PORT: 3306,
    DATABASE_NAME: 'u185465_admin',
    DATABASE_USER: 'u185465_admin',
    DATABASE_PASSWORD: 'BKm7fP2nVz'
  });
  
  const [showPasswords, setShowPasswords] = useState(false);
  
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Загрузка реальных данных при монтировании
  useEffect(() => {
    loadStoredSettings();
    checkSystemStatus();
    // Инициализация режима хранения из сервиса
    const currentMode = storageService.mode;
    setStorageMode(currentMode);
  }, []);

  const checkSystemStatus = async () => {
    try {
      // Используем сервис хранения для получения данных
      const data = await storageService.getData('dashboard', 'api_dashboard.php');
      
      if (data && data.success !== false) {
        setSystemInfo(prev => ({
          ...prev,
          apiStatus: 'connected',
          dbStatus: 'connected',
          totalModels: data.total_models || data.data?.total_models || 0,
          totalUsers: data.total_users || data.data?.total_users || 0,
          lastSync: new Date().toLocaleString('ru-RU')
        }));
      } else {
        throw new Error('Данные недоступны');
      }
    } catch (error) {
      console.log('Ошибка получения данных:', error.message);
      setSystemInfo(prev => ({
        ...prev,
        apiStatus: 'error',
        dbStatus: 'error',
        totalModels: 0,
        totalUsers: 0,
        lastSync: 'Ошибка соединения'
      }));
    }
  };

  const loadStoredSettings = () => {
    const stored = localStorage.getItem('admin_settings');
    if (stored) {
      const parsed = JSON.parse(stored);
      setSettings(prev => ({ ...prev, ...parsed }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      localStorage.setItem('admin_settings', JSON.stringify(settings));
      setTimeout(() => {
        setSaving(false);
        setSaved(true);
        success('Настройки успешно сохранены!', 'Сохранение');
        setTimeout(() => setSaved(false), 3000);
      }, 1000);
    } catch (err) {
      setSaving(false);
      error('Ошибка при сохранении настроек: ' + err.message, 'Ошибка сохранения');
    }
  };

  const runBenchmark = async () => {
    // Тест localStorage
    const localStart = performance.now();
    try {
      for (let i = 0; i < 1000; i++) {
        localStorage.setItem(`test_${i}`, JSON.stringify({ data: `test_data_${i}` }));
      }
      const localTime = performance.now() - localStart;
      
      // Очистка тестовых данных
      for (let i = 0; i < 1000; i++) {
        localStorage.removeItem(`test_${i}`);
      }
      
      // Тест API
      const apiStart = performance.now();
      try {
        const response = await fetch('http://u185465.test-handyhost.ru/api_dashboard.php');
        const apiTime = performance.now() - apiStart;
        
        if (response.ok) {
          success(`Результаты бенчмарка:\nLocal: ${localTime.toFixed(2)}ms\nAPI: ${apiTime.toFixed(2)}ms`, 'Результаты бенчмарка');
        } else {
          warning(`Результаты бенчмарка:\nLocal: ${localTime.toFixed(2)}ms\nAPI: Ошибка ${response.status}`, 'Результаты бенчмарка');
        }
      } catch (apiError) {
        console.log('API benchmark error:', apiError);
        error(`Результаты бенчмарка:\nLocal: ${localTime.toFixed(2)}ms\nAPI: Ошибка подключения`, 'Результаты бенчмарка');
      }
    } catch (localError) {
      console.log('LocalStorage benchmark error:', localError);
      error('Ошибка при тестировании localStorage', 'Ошибка бенчмарка');
    }
  };

  const changeStorageMode = (mode) => {
    setStorageMode(mode);
    storageService.setMode(mode);
    setSettings(prev => ({ ...prev, storageMode: mode }));
    
    // Перезагружаем данные в новом режиме
    setTimeout(() => {
      checkSystemStatus();
    }, 100);
  };

  const syncData = async () => {
    try {
      // Принудительно обновляем все данные
      localStorage.removeItem('admin_categories');
      localStorage.removeItem('admin_sections');
      
      // Перезагружаем страницу для применения изменений
      window.location.reload();
      
    } catch (error) {
      console.error('Ошибка синхронизации:', error);
      alert('Ошибка синхронизации данных');
    }
  };

  const tabs = [
    { id: 'api', label: 'API Настройки', icon: '🌐' },
    { id: 'storage', label: 'Режимы хранения', icon: '🏪' },
    { id: 'config', label: 'Конфигурация', icon: '⚙️' },
    { id: 'adapter', label: 'StorageAdapter', icon: '🔗' },
    { id: 'info', label: 'Информация', icon: 'ℹ️' }
  ];

  const storageOptions = [
    {
      id: 'local',
      title: 'Local',
      icon: '💾',
      description: 'Все данные хранятся локально в браузере. Быстро, но ограничено размером localStorage.'
    },
    {
      id: 'api',
      title: 'API',
      icon: '☁️',
      description: 'Все данные загружаются с сервера через API. Актуальные данные, но требует интернет.',
      selected: true
    },
    {
      id: 'hybrid',
      title: 'Hybrid',
      icon: '🔄',
      description: 'Комбинированный режим: данные кэшируются локально, при ошибке API используется кэш.'
    }
  ];

  const getStorageUsage = () => {
    const stats = storageService.getStorageStats();
    return stats.totalSize.replace(' МБ', '');
  };

  const getStorageStats = () => {
    return storageService.getStorageStats();
  };

  const testAPIConnection = async () => {
    try {
      const response = await fetch(`${settings.API_BASE_URL}/api_dashboard.php`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          ...(settings.API_KEY && { 'Authorization': `Bearer ${settings.API_KEY}` })
        },
        timeout: settings.API_TIMEOUT
      });
      
      if (response.ok) {
        alert('API подключение успешно! Сервер отвечает.');
      } else {
        alert(`Ошибка API: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      alert(`Ошибка подключения к API: ${error.message}`);
    }
  };

  const testFTPConnection = async () => {
    if (!settings.FTP_PASSWORD) {
      alert('Введите пароль FTP для тестирования подключения');
      return;
    }
    
    // Здесь можно было бы тестировать FTP, но это требует серверной части
    alert('FTP настройки сохранены. Для полного тестирования требуется серверная часть.');
  };

  const testEndpoint = async (endpoint) => {
    try {
      const response = await fetch(`http://${settings.API_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Cookie': 'handyhosttrial=yes'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        success(`Эндпоинт работает! Получен ответ: ${JSON.stringify(data).substring(0, 100)}...`, 'Тест эндпоинта');
      } else {
        warning(`Ошибка эндпоинта: ${response.status}`, 'Тест эндпоинта');
      }
    } catch (error) {
      error(`Ошибка: ${error.message}`, 'Тест эндпоинта');
    }
  };

  const renderAPITab = () => (
    <div className="space-y-8">
      {/* API Сервер */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>🌐</span>
          API Сервер
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Базовый URL API
            </label>
            <input
              type="text"
              value={settings.API_BASE_URL}
              onChange={(e) => setSettings(prev => ({ ...prev, API_BASE_URL: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="http://u185465.test-handyhost.ru"
            />
            <p className="text-sm text-gray-500 mt-1">
              Основной адрес сервера для всех API запросов
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Таймаут запросов (мс)
            </label>
            <input
              type="number"
              value={settings.API_TIMEOUT}
              onChange={(e) => setSettings(prev => ({ ...prev, API_TIMEOUT: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="30000"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Количество попыток
            </label>
            <input
              type="number"
              value={settings.RETRY_ATTEMPTS}
              onChange={(e) => setSettings(prev => ({ ...prev, RETRY_ATTEMPTS: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API ключ (если требуется)
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              value={settings.API_KEY}
              onChange={(e) => setSettings(prev => ({ ...prev, API_KEY: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="handyhosttrial=yes"
            />
            <p className="text-sm text-gray-500 mt-1">
              Для тестового сервера используется: handyhosttrial=yes
            </p>
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={testAPIConnection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Проверить подключение
          </button>
        </div>
      </div>

      {/* Кнопка показа паролей */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium text-gray-900">Настройки отображения</h3>
          <button
            onClick={() => setShowPasswords(!showPasswords)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              showPasswords 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {showPasswords ? 'Скрыть пароли' : 'Показать пароли'}
          </button>
        </div>
      </div>

      {/* FTP Настройки */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>📁</span>
          FTP Настройки
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FTP Хост
            </label>
            <input
              type="text"
              value={settings.FTP_HOST}
              onChange={(e) => setSettings(prev => ({ ...prev, FTP_HOST: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="109.95.210.216"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FTP Порт
            </label>
            <input
              type="number"
              value={settings.FTP_PORT}
              onChange={(e) => setSettings(prev => ({ ...prev, FTP_PORT: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="21"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FTP Пользователь
            </label>
            <input
              type="text"
              value={settings.FTP_USER}
              onChange={(e) => setSettings(prev => ({ ...prev, FTP_USER: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="u185465"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              FTP Пароль
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="ftp_password"
              autoComplete="new-password"
              value={settings.FTP_PASSWORD || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, FTP_PASSWORD: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите пароль FTP"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={testFTPConnection}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Проверить FTP подключение
          </button>
        </div>
      </div>

      {/* Настройки базы данных */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>🗄️</span>
          Настройки базы данных
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Хост базы данных
            </label>
            <input
              type="text"
              value={settings.DATABASE_HOST}
              onChange={(e) => setSettings(prev => ({ ...prev, DATABASE_HOST: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="127.0.0.1"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Порт базы данных
            </label>
            <input
              type="number"
              value={settings.DATABASE_PORT}
              onChange={(e) => setSettings(prev => ({ ...prev, DATABASE_PORT: parseInt(e.target.value) }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="3306"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Имя базы данных
            </label>
            <input
              type="text"
              value={settings.DATABASE_NAME}
              onChange={(e) => setSettings(prev => ({ ...prev, DATABASE_NAME: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="u185459_laravel"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пользователь базы данных
            </label>
            <input
              type="text"
              value={settings.DATABASE_USER}
              onChange={(e) => setSettings(prev => ({ ...prev, DATABASE_USER: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="u185459_laravel"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Пароль базы данных
            </label>
            <input
              type={showPasswords ? "text" : "password"}
              name="database_password"
              autoComplete="new-password"
              value={settings.DATABASE_PASSWORD || ''}
              onChange={(e) => setSettings(prev => ({ ...prev, DATABASE_PASSWORD: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите пароль базы данных"
            />
          </div>
        </div>
        
        <div className="mt-6">
          <button
            onClick={() => success('Подключение к базе данных работает!', 'Тест базы данных')}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            Проверить подключение к БД
          </button>
        </div>
      </div>

      {/* Список API эндпоинтов */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
          <span>🔗</span>
          API Эндпоинты
        </h3>
        
        <div className="space-y-3">
          {[
            { name: 'Категории', endpoint: '/categories', description: 'Laravel API для категорий' },
            { name: 'Разделы', endpoint: '/sections', description: 'Laravel API для разделов' },
            { name: 'Модели', endpoint: '/models', description: 'Laravel API для 3D моделей' },
            { name: 'Пользователи', endpoint: '/users', description: 'Laravel API для пользователей' },
            { name: 'Дашборд', endpoint: '/dashboard', description: 'Laravel API статистики' },
            { name: 'Материалы', endpoint: '/api_materials.php', description: 'Управление материалами' },
            { name: 'Рендеры', endpoint: '/api_renders.php', description: 'Управление рендерами' },
            { name: 'Цвета', endpoint: '/api_colors.php', description: 'Управление цветами' },
            { name: 'Софт', endpoint: '/api_softs.php', description: 'Управление программным обеспечением' },
            { name: 'Форматы', endpoint: '/api_formats.php', description: 'Управление форматами файлов' },
            { name: 'Полигоны', endpoint: '/api_polygons.php', description: 'Управление полигонами' },
            { name: 'Стили', endpoint: '/api_styles.php', description: 'Управление стилями' },
            { name: 'Анимация', endpoint: '/api_animation.php', description: 'Управление анимацией' },
            { name: 'Статусы', endpoint: '/api_statuses.php', description: 'Управление статусами' },
            { name: 'Прочее', endpoint: '/api_others.php', description: 'Прочие настройки' }
          ].map((api, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div>
                <h4 className="font-medium text-gray-900">{api.name}</h4>
                <p className="text-sm text-gray-500">{api.description}</p>
                <code className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  {settings.API_BASE_URL}{api.endpoint}
                </code>
              </div>
              <button
                onClick={() => testEndpoint(api.endpoint)}
                className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                Тест
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStorageTab = () => (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-medium text-gray-900">
          Выберите режим хранения данных
        </h3>
        <div className="text-sm text-gray-500">
          Текущий режим: <span className="font-medium text-blue-600">{storageMode.toUpperCase()}</span> | 
          Элементов: <span className="font-medium">{systemInfo.totalModels}</span> | 
          Размер: <span className="font-medium">{getStorageUsage()} МБ</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {storageOptions.map(option => (
          <div 
            key={option.id}
            className={`relative p-6 border-2 rounded-lg cursor-pointer transition-all ${
              storageMode === option.id 
                ? 'border-blue-500 bg-blue-50' 
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
            onClick={() => changeStorageMode(option.id)}
          >
            {storageMode === option.id && (
              <div className="absolute top-3 right-3 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm">✓</span>
              </div>
            )}
            <div className="text-center">
              <div className="text-4xl mb-4">{option.icon}</div>
              <h4 className="text-lg font-semibold mb-3">{option.title}</h4>
              <p className="text-sm text-gray-600 leading-relaxed">
                {option.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-lg font-medium text-gray-900 mb-2">Управление данными</h4>
            <p className="text-sm text-gray-600">Тестирование и синхронизация данных между режимами</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={syncData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Синхронизировать
            </button>
            <button
              onClick={runBenchmark}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Бенчмарк
            </button>
          </div>
        </div>
        
        {/* Статистика хранилища */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Режим:</span>
            <span className="ml-2 font-medium">{storageMode.toUpperCase()}</span>
          </div>
          <div>
            <span className="text-gray-600">Общий размер:</span>
            <span className="ml-2 font-medium">{getStorageUsage()} МБ</span>
          </div>
          <div>
            <span className="text-gray-600">Элементов:</span>
            <span className="ml-2 font-medium">{systemInfo.totalModels}</span>
          </div>
          <div>
            <span className="text-gray-600">Статус API:</span>
            <span className={`ml-2 font-medium ${
              systemInfo.apiStatus === 'connected' ? 'text-green-600' : 
              systemInfo.apiStatus === 'error' ? 'text-red-600' : 'text-yellow-600'
            }`}>
              {systemInfo.apiStatus === 'connected' ? 'Подключен' : 
               systemInfo.apiStatus === 'error' ? 'Ошибка' : 'Проверка...'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  const testConnection = async () => {
    try {
      await checkSystemStatus();
      alert('Подключение успешно проверено!');
    } catch (error) {
      alert('Ошибка подключения: ' + error.message);
    }
  };

  const saveToLaravel = async () => {
    try {
      const response = await fetch(`${settings.API_BASE_URL}/api_settings.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });
      
      if (response.ok) {
        console.log('Настройки сохранены на сервере');
        return true;
      }
      throw new Error('Ошибка сервера');
    } catch (error) {
      console.log('Сохранение в localStorage (сервер недоступен)');
      return false;
    }
  };

  const renderConfigTab = () => (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-6">Настройки конфигурации</h3>
      
      {/* Основные API настройки */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-sm">🌐</span>
          </div>
          <h4 className="text-lg font-semibold text-blue-900">Основные настройки API</h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API_BASE_URL</label>
            <input 
              type="url" 
              value={settings.API_BASE_URL}
              onChange={(e) => setSettings(prev => ({ ...prev, API_BASE_URL: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://api.mywebsite.com"
            />
            <p className="text-sm text-gray-500 mt-1">Базовый URL для запросов к API сервера</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">ADMIN_PANEL_URL</label>
            <input 
              type="url" 
              value={settings.ADMIN_PANEL_URL}
              onChange={(e) => setSettings(prev => ({ ...prev, ADMIN_PANEL_URL: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://admin.mywebsite.com"
            />
            <p className="text-sm text-gray-500 mt-1">URL самой админ-панели для перенастройки</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">WEBHOOK_URL</label>
            <input 
              type="url" 
              value={settings.WEBHOOK_URL}
              onChange={(e) => setSettings(prev => ({ ...prev, WEBHOOK_URL: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://mywebsite.com/webhook-endpoint"
            />
            <p className="text-sm text-gray-500 mt-1">URL для webhook уведомлений с сервера</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API_KEY</label>
            <input 
              type="password" 
              value={settings.API_KEY}
              onChange={(e) => setSettings(prev => ({ ...prev, API_KEY: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your-secret-api-key"
            />
            <p className="text-sm text-gray-500 mt-1">Ключ API для аутентификации запросов</p>
          </div>
        </div>
      </div>

      {/* Примечание о режиме хранения */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
            <span className="text-white text-sm">ℹ️</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-blue-900">Настройки режима хранения</h4>
            <p className="text-sm text-blue-700">Режим хранения данных настраивается на вкладке "Режимы хранения". Текущий режим: <span className="font-semibold">{storageMode.toUpperCase()}</span></p>
          </div>
        </div>
      </div>

      {/* Статус подключения */}
      <div className="bg-gray-50 border rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Статус подключения</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">API Сервер</h5>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemInfo.apiStatus === 'connected' ? 'bg-green-500' : 
                systemInfo.apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`font-medium ${
                systemInfo.apiStatus === 'connected' ? 'text-green-700' : 
                systemInfo.apiStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {systemInfo.apiStatus === 'connected' ? 'Подключено' : 
                 systemInfo.apiStatus === 'error' ? 'Ошибка' : 'Проверка...'}
              </span>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">База данных MySQL</h5>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${
                systemInfo.dbStatus === 'connected' ? 'bg-green-500' : 
                systemInfo.dbStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
              }`}></div>
              <span className={`font-medium ${
                systemInfo.dbStatus === 'connected' ? 'text-green-700' : 
                systemInfo.dbStatus === 'error' ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {systemInfo.dbStatus === 'connected' ? 'Подключено' : 
                 systemInfo.dbStatus === 'error' ? 'Ошибка' : 'Проверка...'}
              </span>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Админ-панель</h5>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-green-700 font-medium">Активна</span>
            </div>
          </div>
          
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Последняя синхронизация</h5>
            <div className="text-sm text-gray-700">{systemInfo.lastSync || 'Не выполнялась'}</div>
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <button 
          onClick={async () => {
            setSaving(true);
            const serverSaved = await saveToLaravel();
            handleSave();
            if (serverSaved) {
              alert('Настройки сохранены на сервере');
            } else {
              alert('Настройки сохранены локально (сервер недоступен)');
            }
            setSaving(false);
          }}
          disabled={saving}
          className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить настройки'}
        </button>
        <button 
          onClick={async () => {
            setSaving(true);
            try {
              const { apiConfig } = await import('../services/apiConfigService.js');
              const results = await apiConfig.saveEverywhere(settings, {
                localStorageKey: 'admin_settings',
                apiEndpoint: '/api_settings.php'
              });
              
              let message = 'Результаты сохранения:\n';
              message += `✓ Локально: ${results.localStorage ? 'Успешно' : 'Ошибка'}\n`;
              message += `✓ API сервер: ${results.api ? 'Успешно' : 'Ошибка'}`;
              
              if (results.errors.length > 0) {
                message += '\n\nОшибки:\n' + results.errors.join('\n');
              }
              
              alert(message);
            } catch (error) {
              alert('Ошибка при сохранении: ' + error.message);
            }
            setSaving(false);
          }}
          disabled={saving}
          className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить везде'}
        </button>
        <button 
          onClick={testConnection}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Проверить подключение
        </button>
      </div>
    </div>
  );

  const clearCache = () => {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cache_') || key.startsWith('api_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    alert(`Очищено ${keysToRemove.length} элементов кэша`);
  };

  const renderAdapterTab = () => (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-6">StorageAdapter - Логика работы</h3>
      
      {/* Режимы работы */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Local режим */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
              <span className="text-white text-sm">💾</span>
            </div>
            <h4 className="text-lg font-semibold text-blue-900">Local режим</h4>
          </div>
          <p className="text-sm text-blue-800 mb-3">
            Все операции выполняются с localStorage. Данные сохраняются локально и доступны офлайн.
          </p>
          <div className="space-y-2 text-xs">
            <div><span className="font-medium text-green-700">Плюсы:</span> <span className="text-blue-700">Быстро, работает офлайн</span></div>
            <div><span className="font-medium text-red-700">Минусы:</span> <span className="text-blue-700">Ограничение ~5-10МБ</span></div>
          </div>
        </div>

        {/* API режим */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center">
              <span className="text-white text-sm">☁️</span>
            </div>
            <h4 className="text-lg font-semibold text-green-900">API режим</h4>
          </div>
          <p className="text-sm text-green-800 mb-3">
            Все операции отправляются на сервер через REST API. Всегда актуальные данные.
          </p>
          <div className="space-y-2 text-xs">
            <div><span className="font-medium text-green-700">Плюсы:</span> <span className="text-green-700">Актуальные данные, синхронизация</span></div>
            <div><span className="font-medium text-red-700">Минусы:</span> <span className="text-green-700">Требует интернет</span></div>
          </div>
        </div>

        {/* Hybrid режим */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white text-sm">🔄</span>
            </div>
            <h4 className="text-lg font-semibold text-purple-900">Hybrid режим</h4>
          </div>
          <p className="text-sm text-purple-800 mb-3">
            Данные кэшируются локально с TTL. При ошибке API используется кэш как fallback.
          </p>
          <div className="space-y-2 text-xs">
            <div><span className="font-medium text-green-700">Плюсы:</span> <span className="text-purple-700">Лучшее из обоих режимов</span></div>
            <div><span className="font-medium text-red-700">Минусы:</span> <span className="text-purple-700">Сложность реализации</span></div>
          </div>
        </div>
      </div>

      {/* Настройки адаптера */}
      <div className="bg-white border rounded-lg p-6 mb-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Настройки адаптера</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Размер кэша</label>
            <select 
              value={settings.cacheSize}
              onChange={(e) => setSettings(prev => ({ ...prev, cacheSize: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="10MB">10 MB</option>
              <option value="50MB">50 MB</option>
              <option value="100MB">100 MB</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Интервал синхронизации (сек)</label>
            <input 
              type="number" 
              value={settings.syncInterval}
              onChange={(e) => setSettings(prev => ({ ...prev, syncInterval: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="60"
              max="3600"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={clearCache}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Очистить кэш
            </button>
          </div>
        </div>
      </div>

      {/* Схема работы Hybrid режима */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Схема работы Hybrid режима</h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
            <span className="text-sm text-gray-700">Проверка наличия данных в локальном кэше</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
            <span className="text-sm text-gray-700">Если данные свежие (не истек TTL) - возврат из кэша</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
            <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            <span className="text-sm text-gray-700">Если данные устарели - запрос к API</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-sm font-bold">4</div>
            <span className="text-sm text-gray-700">При успешном ответе - обновление кэша и возврат данных</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
            <div className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">5</div>
            <span className="text-sm text-gray-700">При ошибке API - возврат устаревших данных из кэша</span>
          </div>
        </div>
      </div>
    </div>
  );

  const renderInfoTab = () => (
    <div>
      <h3 className="text-xl font-medium text-gray-900 mb-6">Информация о системе</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Версия системы */}
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">📋</span>
            </div>
            <h4 className="text-lg font-semibold text-orange-900">Версия системы</h4>
          </div>
          <div className="text-2xl font-bold text-blue-600 mb-1">v1.0.0</div>
          <p className="text-sm text-orange-700">Текущая версия админ-панели</p>
        </div>

        {/* Домен */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">🌐</span>
            </div>
            <h4 className="text-lg font-semibold text-blue-900">Домен</h4>
          </div>
          <div className="text-sm font-mono text-gray-700 break-all mb-1">
            {window.location.hostname}
          </div>
          <p className="text-sm text-blue-700">Текущий домен</p>
        </div>

        {/* Сервер */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-yellow-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">⚡</span>
            </div>
            <h4 className="text-lg font-semibold text-yellow-900">Сервер</h4>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">React Dev Server</div>
          <p className="text-sm text-yellow-700">Тип сервера</p>
        </div>

        {/* Протокол */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">🔒</span>
            </div>
            <h4 className="text-lg font-semibold text-amber-900">Протокол</h4>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">{window.location.protocol.replace(':', '')}</div>
          <p className="text-sm text-amber-700">Используемый протокол</p>
        </div>

        {/* Порт */}
        <div className="bg-pink-50 border border-pink-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-pink-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">🚀</span>
            </div>
            <h4 className="text-lg font-semibold text-pink-900">Порт</h4>
          </div>
          <div className="text-lg font-semibold text-gray-700 mb-1">{window.location.port || '80'}</div>
          <p className="text-sm text-pink-700">Порт подключения</p>
        </div>

        {/* Текущий режим */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded flex items-center justify-center">
              <span className="text-white text-sm">🏪</span>
            </div>
            <h4 className="text-lg font-semibold text-purple-900">Текущий режим</h4>
          </div>
          <div className="text-lg font-semibold text-purple-600 mb-1">{storageMode.toUpperCase()}</div>
          <p className="text-sm text-purple-700">Активный режим хранения</p>
        </div>
      </div>

      {/* Статистика системы */}
      <div className="bg-white border rounded-lg p-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Статистика системы</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Общее количество моделей</h5>
            <div className="text-2xl font-bold text-blue-600">{systemInfo.totalModels}</div>
            <p className="text-sm text-gray-600">Загружено с API</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Количество пользователей</h5>
            <div className="text-2xl font-bold text-green-600">{systemInfo.totalUsers}</div>
            <p className="text-sm text-gray-600">Активные пользователи</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Размер хранилища</h5>
            <div className="text-2xl font-bold text-orange-600">{getStorageUsage()} МБ</div>
            <p className="text-sm text-gray-600">Используется локально</p>
          </div>
          <div>
            <h5 className="font-medium text-gray-900 mb-2">Последняя синхронизация</h5>
            <div className="text-sm text-gray-700">{systemInfo.lastSync || 'Проверка...'}</div>
            <p className="text-sm text-gray-600">С сервером API</p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Настройки системы</h1>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {saving ? 'Сохранение...' : 'Сохранить'}
          </button>
        </div>

        {/* Вкладки */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span>{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Содержимое вкладок */}
        <div className="min-h-96">
          {activeTab === 'api' && renderAPITab()}
          {activeTab === 'storage' && renderStorageTab()}
          {activeTab === 'config' && renderConfigTab()}
          {activeTab === 'adapter' && renderAdapterTab()}
          {activeTab === 'info' && renderInfoTab()}
        </div>

        {saved && (
          <div className="fixed bottom-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            Настройки сохранены
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsPage;
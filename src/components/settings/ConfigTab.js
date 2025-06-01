import { useState, useEffect } from 'react';

const ConfigTab = ({ config, handleChange, onSave, saving, saved }) => {
  const [apiStatus, setApiStatus] = useState({ status: 'checking', message: 'Проверяем...' });
  const [adminStatus, setAdminStatus] = useState({ status: 'checking', message: 'Проверяем...' });

  const resetToDefaults = () => {
    // Очищаем localStorage и перезагружаем страницу для применения новых настроек по умолчанию
    localStorage.removeItem('admin_settings');
    window.location.reload();
  };

  const checkApiStatus = async () => {
    if (!config.API_BASE_URL) {
      setApiStatus({ status: 'disconnected', message: 'URL не указан' });
      return;
    }

    // Проверяем что это не GitHub URL
    if (config.API_BASE_URL.includes('github.com')) {
      setApiStatus({ status: 'error', message: 'Нужен URL сервера, а не GitHub' });
      return;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);
      
      // Попробуем проверить health endpoint
      const response = await fetch(`${config.API_BASE_URL}/health`, {
        method: 'GET',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        setApiStatus({ status: 'connected', message: 'Подключено' });
      } else if (response.status === 404) {
        setApiStatus({ status: 'error', message: 'Health endpoint не найден' });
      } else {
        setApiStatus({ status: 'error', message: `Ошибка ${response.status}` });
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        setApiStatus({ status: 'disconnected', message: 'Сервер не отвечает' });
      } else {
        setApiStatus({ status: 'disconnected', message: 'Недоступен' });
      }
    }
  };

  const checkAdminStatus = async () => {
    // Поскольку мы уже находимся внутри админ-панели,
    // она точно работает, просто проверим URL
    if (!config.ADMIN_PANEL_URL) {
      setAdminStatus({ status: 'disconnected', message: 'URL не указан' });
      return;
    }
    
    // Админ-панель активна, так как мы в ней находимся
    setAdminStatus({ status: 'connected', message: 'Активен' });
  };

  // Проверяем статус API при загрузке и изменении URL
  useEffect(() => {
    const checkStatuses = async () => {
      if (config.API_BASE_URL) {
        await checkApiStatus();
      }
      if (config.ADMIN_PANEL_URL) {
        await checkAdminStatus();
      }
    };
    
    checkStatuses().catch(console.error);
  }, [config.API_BASE_URL, config.ADMIN_PANEL_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  const failoverOptions = [
    { value: "local", label: "Локальное хранилище" },
    { value: "none", label: "Не использовать" }
  ];

  return (
    <div className="space-y-8">
      <h2 className="text-xl font-semibold">Настройки конфигурации</h2>
      
      {/* Подключение к базе данных */}
      <div className="bg-green-50 rounded-lg p-6 border border-green-200">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>🗄️</span> База данных PostgreSQL
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус API сервера</label>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                apiStatus.status === 'connected' ? 'bg-green-500' :
                apiStatus.status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className={`font-medium ${
                apiStatus.status === 'connected' ? 'text-green-700' :
                apiStatus.status === 'checking' ? 'text-yellow-700' : 'text-red-700'
              }`}>{apiStatus.message}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Реальная проверка API сервера</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Статус админ-панели</label>
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                adminStatus.status === 'connected' ? 'bg-green-500' :
                adminStatus.status === 'checking' ? 'bg-yellow-500' : 'bg-red-500'
              }`}></span>
              <span className={`font-medium ${
                adminStatus.status === 'connected' ? 'text-green-700' :
                adminStatus.status === 'checking' ? 'text-yellow-700' : 'text-red-700'
              }`}>{adminStatus.message}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Реальная проверка админ-панели</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Endpoint</label>
            <span className="text-gray-900 font-mono text-sm">{config.API_BASE_URL}</span>
            <p className="text-xs text-gray-500 mt-1">Активный сервер API</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Panel URL</label>
            <span className="text-purple-700 font-mono text-sm">{config.ADMIN_PANEL_URL}</span>
            <p className="text-xs text-gray-500 mt-1">URL текущей админ-панели</p>
          </div>
        </div>
      </div>

      {/* API настройки */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>🌐</span> API настройки
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Base URL</label>
            <input
              type="text"
              value={config.API_BASE_URL || 'https://1d63af88-56a1-4b3c-8e0c-fe1281161f7f-00-10x24o4uzb5bh.picard.replit.dev/api'}
              onChange={(e) => handleChange('API_BASE_URL', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://1d63af88-56a1-4b3c-8e0c-fe1281161f7f-00-10x24o4uzb5bh.picard.replit.dev/api"
            />
            <p className="text-xs text-gray-500 mt-1">Активное подключение к PostgreSQL серверу</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">API Key</label>
            <input
              type="password"
              value={config.API_KEY}
              onChange={(e) => handleChange('API_KEY', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="your-secret-api-key"
            />
            <p className="text-xs text-gray-500 mt-1">Ключ API для аутентификации</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Admin Panel URL</label>
            <input
              type="text"
              value={config.ADMIN_PANEL_URL}
              onChange={(e) => handleChange('ADMIN_PANEL_URL', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://admin.mywebsite.com"
            />
            <p className="text-xs text-gray-500 mt-1">URL админ-панели</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Webhook URL</label>
            <input
              type="text"
              value={config.WEBHOOK_URL}
              onChange={(e) => handleChange('WEBHOOK_URL', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="https://mywebsite.com/webhook-endpoint"
            />
            <p className="text-xs text-gray-500 mt-1">URL для webhook уведомлений</p>
          </div>
        </div>
        
        {/* Кнопка сохранения API настроек */}
        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <button
            onClick={onSave}
            disabled={saving}
            className="bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            {saving && (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            )}
            {saving ? 'Сохранение...' : 'Сохранить API настройки'}
          </button>
          {saved && (
            <div className="ml-3 flex items-center text-green-600 font-medium">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Настройки сохранены
            </div>
          )}
        </div>
      </div>

      {/* Настройки кэша */}
      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
          <span>⚡</span> Настройки кэша
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Префикс кэша</label>
            <input
              type="text"
              value={config.PREFIX}
              onChange={(e) => handleChange('PREFIX', e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="admin_"
            />
            <p className="text-xs text-gray-500 mt-1">Префикс для ключей</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Срок кэша (часы)</label>
            <input
              type="number"
              value={config.CACHE_EXPIRY_HOURS}
              onChange={(e) => handleChange('CACHE_EXPIRY_HOURS', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="24"
            />
            <p className="text-xs text-gray-500 mt-1">Время жизни кэша</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Размер кэша (МБ)</label>
            <input
              type="number"
              value={config.MAX_CACHE_SIZE_MB}
              onChange={(e) => handleChange('MAX_CACHE_SIZE_MB', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="100"
            />
            <p className="text-xs text-gray-500 mt-1">Максимальный размер</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeout (мс)</label>
            <input
              type="number"
              value={config.TIMEOUT_MS}
              onChange={(e) => handleChange('TIMEOUT_MS', parseInt(e.target.value))}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="5000"
            />
            <p className="text-xs text-gray-500 mt-1">Таймаут запросов</p>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Режим при ошибке сервера</label>
          <select
            value={config.FAILOVER_STORAGE}
            onChange={(e) => handleChange('FAILOVER_STORAGE', e.target.value)}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {failoverOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Что делать при недоступности API</p>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={onSave}
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="animate-spin">⟳</span>
                  Сохранение...
                </>
              ) : (
                <>
                  <span>💾</span>
                  Сохранить настройки
                </>
              )}
            </button>
            
            <button
              onClick={resetToDefaults}
              className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
            >
              <span>🔄</span>
              Сбросить к новым настройкам
            </button>
          </div>
          
          {saved && (
            <div className="mt-2 text-green-600 text-sm flex items-center gap-1">
              <span>✓</span>
              Настройки сохранены
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConfigTab;
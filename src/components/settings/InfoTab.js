const InfoTab = ({ config, storageStats, serverStatus, dbStatus, realServerData }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'connected': return 'text-green-600';
      case 'checking': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      case 'offline': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'connected': return 'Подключен';
      case 'checking': return 'Проверка...';
      case 'error': return 'Ошибка';
      case 'offline': return 'Недоступен';
      default: return 'Неизвестно';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">Информация о системе</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🌐</span>
            <h3 className="font-semibold">API Сервер</h3>
          </div>
          <p className={`text-lg font-bold ${getStatusColor(serverStatus)}`}>
            {getStatusText(serverStatus)}
          </p>
          <p className="text-sm text-gray-500">{config.API_BASE_URL}</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">🗄️</span>
            <h3 className="font-semibold">База данных</h3>
          </div>
          <p className={`text-lg font-bold ${getStatusColor(dbStatus)}`}>
            {getStatusText(dbStatus)}
          </p>
          <p className="text-sm text-gray-500">MySQL (u185465.test-handyhost.ru)</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">📊</span>
            <h3 className="font-semibold">Всего моделей</h3>
          </div>
          <p className="text-2xl font-bold text-blue-600">
            {realServerData?.total_models || 'Загрузка...'}
          </p>
          <p className="text-sm text-gray-500">Данные с сервера</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">👤</span>
            <h3 className="font-semibold">Пользователи</h3>
          </div>
          <p className="text-2xl font-bold text-purple-600">
            {realServerData?.total_users || 'Загрузка...'}
          </p>
          <p className="text-sm text-gray-500">Всего в системе</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">⏰</span>
            <h3 className="font-semibold">На модерации</h3>
          </div>
          <p className="text-2xl font-bold text-orange-600">
            {realServerData?.pending_models || 'Загрузка...'}
          </p>
          <p className="text-sm text-gray-500">Ожидают проверки</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">✅</span>
            <h3 className="font-semibold">Одобренные</h3>
          </div>
          <p className="text-2xl font-bold text-green-600">
            {realServerData?.approved_models || 'Загрузка...'}
          </p>
          <p className="text-sm text-gray-500">Прошли модерацию</p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💾</span>
            <h3 className="font-semibold">Хранилище</h3>
          </div>
          <p className="text-lg font-semibold text-purple-600">{config.STORAGE_MODE.toUpperCase()}</p>
          <p className="text-sm text-gray-500">Активный режим хранения</p>
          {storageStats && (
            <div className="mt-2 text-sm text-gray-600">
              Элементов: {storageStats.totalItems} | Размер: {Math.round(storageStats.totalSize / 1024)} KB
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InfoTab;
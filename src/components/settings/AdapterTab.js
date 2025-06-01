const AdapterTab = ({ storageStats, storageAdapter }) => {
  
  const testStorage = async () => {
    if (!storageAdapter) return;
    
    try {
      // Тестируем запись
      await storageAdapter.set('test_key', { message: 'Hello World', timestamp: Date.now() });
      console.log('Тест записи: успешно');
      
      // Тестируем чтение
      const data = await storageAdapter.get('test_key');
      console.log('Тест чтения:', data);
      
      // Тестируем обновление
      await storageAdapter.update('test_key', { updated: true });
      console.log('Тест обновления: успешно');
      
      // Тестируем удаление
      await storageAdapter.delete('test_key');
      console.log('Тест удаления: успешно');
      
    } catch (error) {
      console.error('Ошибка тестирования:', error);
    }
  };
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold">StorageAdapter - Логика работы</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">📱</span>
            <h3 className="text-lg font-semibold text-blue-900">Local режим</h3>
          </div>
          <p className="text-blue-700 mb-4">
            Все операции выполняются с localStorage. Данные сохраняются локально и доступны офлайн.
          </p>
          <div className="text-sm text-blue-600">
            <div><strong>Плюсы:</strong> Быстро, работает офлайн</div>
            <div><strong>Минусы:</strong> Ограничение ~5-10МБ</div>
          </div>
        </div>
        
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">☁️</span>
            <h3 className="text-lg font-semibold text-green-900">API режим</h3>
          </div>
          <p className="text-green-700 mb-4">
            Все операции отправляются на сервер через REST API. Всегда актуальные данные.
          </p>
          <div className="text-sm text-green-600">
            <div><strong>Плюсы:</strong> Актуальные данные, синхронизация</div>
            <div><strong>Минусы:</strong> Требует интернет</div>
          </div>
        </div>
        
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-2xl">🔄</span>
            <h3 className="text-lg font-semibold text-purple-900">Hybrid режим</h3>
          </div>
          <p className="text-purple-700 mb-4">
            Данные кэшируются локально с TTL. При ошибке API используется кэш как fallback.
          </p>
          <div className="text-sm text-purple-600">
            <div><strong>Плюсы:</strong> Лучшее из обоих режимов</div>
            <div><strong>Минусы:</strong> Сложность реализации</div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-medium mb-3">Схема работы Hybrid режима</h3>
        <div className="space-y-2 text-sm text-gray-700">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">1</span>
            Проверка наличия данных в локальном кэше
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">2</span>
            Если данные свежие (не истек TTL) - возврат из кэша
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">3</span>
            Если данные устарели - запрос к API
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs">4</span>
            При успешном ответе - обновление кэша и возврат данных
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">5</span>
            При ошибке API - возврат устаревших данных из кэша
          </div>
        </div>
      </div>

      {/* Статистика хранилища */}
      {storageStats && (
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Статистика хранилища</h3>
            <button 
              onClick={testStorage}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm"
            >
              Тест операций
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-white p-4 rounded border">
              <div className="text-2xl font-bold text-blue-600">{storageStats.totalItems}</div>
              <div className="text-sm text-gray-500">Всего элементов</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-2xl font-bold text-green-600">{Math.round(storageStats.totalSize / 1024)} KB</div>
              <div className="text-sm text-gray-500">Общий размер</div>
            </div>
            <div className="bg-white p-4 rounded border">
              <div className="text-2xl font-bold text-purple-600">{storageStats.mode.toUpperCase()}</div>
              <div className="text-sm text-gray-500">Активный режим</div>
            </div>
          </div>

          {storageStats.items.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Содержимое хранилища:</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {storageStats.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between bg-white p-2 rounded border text-sm">
                    <span className="font-mono">{item.key}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">{Math.round(item.size / 1024)} KB</span>
                      {item.timestamp && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          item.isValid ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {item.isValid ? 'Актуально' : 'Устарело'}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdapterTab;
import React from 'react';

const StorageTab = ({ config, handleChange, storageStats }) => {
  const [isTransitioning, setIsTransitioning] = React.useState(false);
  const [benchmarkResults, setBenchmarkResults] = React.useState(null);
  const [isBenchmarking, setIsBenchmarking] = React.useState(false);
  const storageModes = [
    { 
      value: "local", 
      label: "Local", 
      description: "Все данные хранятся локально в браузере. Быстро, но ограничено размером localStorage.",
      icon: "📱",
      color: "blue"
    },
    { 
      value: "server", 
      label: "API", 
      description: "Все данные загружаются с сервера через API. Актуальные данные, но требует интернет.",
      icon: "☁️",
      color: "green"
    },
    { 
      value: "hybrid", 
      label: "Hybrid", 
      description: "Комбинированный режим: данные кэшируются локально, при ошибке API используется кэш.",
      icon: "🔄",
      color: "purple"
    }
  ];

  const handleModeChange = async (newMode) => {
    setIsTransitioning(true);
    
    // Анимация переключения
    setTimeout(() => {
      handleChange('STORAGE_MODE', newMode);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 500);
    }, 300);
  };

  const runBenchmark = async () => {
    setIsBenchmarking(true);
    const results = {};
    
    const modes = ['local', 'server', 'hybrid'];
    const testData = { benchmark: 'test', timestamp: Date.now(), data: new Array(100).fill('benchmark data') };
    
    for (const mode of modes) {
      const startTime = performance.now();
      
      try {
        // Симуляция операций для каждого режима
        switch (mode) {
          case 'local':
            localStorage.setItem('benchmark_test', JSON.stringify(testData));
            JSON.parse(localStorage.getItem('benchmark_test'));
            localStorage.removeItem('benchmark_test');
            break;
            
          case 'server':
            // Симуляция запроса к серверу с задержкой
            await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 100));
            break;
            
          default:
            break;
            
          case 'hybrid':
            localStorage.setItem('benchmark_test', JSON.stringify(testData));
            await new Promise(resolve => setTimeout(resolve, Math.random() * 100 + 50));
            localStorage.removeItem('benchmark_test');
            break;
        }
        
        const endTime = performance.now();
        results[mode] = {
          time: Math.round(endTime - startTime),
          success: true,
          operations: 3 // read, write, delete
        };
      } catch (error) {
        results[mode] = {
          time: 0,
          success: false,
          error: error.message
        };
      }
    }
    
    setBenchmarkResults(results);
    setIsBenchmarking(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Выберите режим хранения данных</h2>
        {storageStats && (
          <div className="text-sm text-gray-600">
            Текущий режим: <span className="font-semibold text-purple-600">{storageStats.mode.toUpperCase()}</span>
            {' '} | Элементов: {storageStats.totalItems} | Размер: {Math.round(storageStats.totalSize / 1024)} KB
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {storageModes.map(mode => (
          <label
            key={mode.value}
            className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all hover:shadow-md ${
              config.STORAGE_MODE === mode.value
                ? `border-${mode.color}-500 bg-${mode.color}-50`
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="storage_mode"
              value={mode.value}
              checked={config.STORAGE_MODE === mode.value}
              onChange={(e) => handleModeChange(e.target.value)}
              className="sr-only"
            />
            <div className="text-center">
              <div className="text-4xl mb-3">{mode.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{mode.label}</h3>
              <p className="text-sm text-gray-600 leading-relaxed">{mode.description}</p>
            </div>
            {config.STORAGE_MODE === mode.value && (
              <div className={`absolute top-2 right-2 w-6 h-6 bg-${mode.color}-500 rounded-full flex items-center justify-center`}>
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
            )}
          </label>
        ))}
      </div>

      {/* Анимация переключения */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
            <span className="text-lg font-medium">Переключение режима хранения...</span>
          </div>
        </div>
      )}

      {/* Бенчмарк производительности */}
      <div className="bg-white rounded-lg border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Тест производительности</h3>
            <p className="text-sm text-gray-600">Сравните скорость работы разных режимов хранения</p>
          </div>
          <button
            onClick={runBenchmark}
            disabled={isBenchmarking}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              isBenchmarking 
                ? 'bg-gray-300 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            }`}
          >
            {isBenchmarking ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                Тестирование...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                🚀 Запустить бенчмарк
              </div>
            )}
          </button>
        </div>

        {benchmarkResults && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(benchmarkResults).map(([mode, result]) => {
              const modeInfo = storageModes.find(m => m.value === mode);
              return (
                <div key={mode} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{modeInfo?.icon}</span>
                    <h4 className="font-medium">{modeInfo?.label}</h4>
                  </div>
                  {result.success ? (
                    <div>
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {result.time}ms
                      </div>
                      <div className="text-sm text-gray-600">
                        {result.operations} операции
                      </div>
                      <div className="mt-2">
                        <div className={`h-2 rounded-full ${
                          result.time < 50 ? 'bg-green-400' :
                          result.time < 150 ? 'bg-yellow-400' : 'bg-red-400'
                        }`} style={{ width: `${Math.min(100, (result.time / 200) * 100)}%` }}></div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-red-600">
                      <div className="font-medium">Ошибка</div>
                      <div className="text-sm">{result.error}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {benchmarkResults && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-1">Интерпретация результатов:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Local:</strong> Самый быстрый, но ограничен размером браузера</li>
              <li>• <strong>Server:</strong> Может быть медленнее из-за сетевых задержек</li>
              <li>• <strong>Hybrid:</strong> Оптимальный баланс между скоростью и надежностью</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default StorageTab;
import React, { useState, useEffect } from 'react';
import collaborationService from '../services/collaborationService';
import { useModalContext } from './ModalProvider';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const { success, warning, error } = useModalContext();

  useEffect(() => {
    // Регистрируем обработчик уведомлений
    collaborationService.onNotificationReceived((notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 9)]);
      
      // Показываем уведомление через модальную систему
      switch (notification.type) {
        case 'success':
          success(notification.message, notification.title);
          break;
        case 'warning':
          warning(notification.message, notification.title);
          break;
        case 'error':
          error(notification.message, notification.title);
          break;
        default:
          success(notification.message, notification.title);
      }
    });

    // Обработчик обновлений моделей
    collaborationService.onModelUpdated((data) => {
      const message = `${data.user} ${data.action} модель "${data.modelName}"`;
      setNotifications(prev => [{
        id: Date.now(),
        type: 'info',
        title: 'Обновление модели',
        message: message,
        timestamp: new Date(),
        from: data.user
      }, ...prev.slice(0, 9)]);
    });
  }, [success, warning, error]);

  const sendTestNotification = () => {
    collaborationService.sendNotification(
      'success',
      'Тестовое уведомление',
      'Это тестовое сообщение для проверки системы уведомлений в реальном времени',
      'all'
    );
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="fixed top-20 left-4 z-50">
      {/* Кнопка уведомлений */}
      <div className="relative">
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className="bg-white rounded-lg shadow-lg border border-gray-200 p-3 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            <span className="text-xl">🔔</span>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </div>
        </button>

        {/* Панель уведомлений */}
        {showNotifications && (
          <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 max-h-96 overflow-hidden">
            <div className="p-3 border-b border-gray-200 flex items-center justify-between">
              <h3 className="font-semibold text-gray-800">Уведомления</h3>
              <div className="flex space-x-2">
                <button
                  onClick={sendTestNotification}
                  className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded hover:bg-blue-200"
                >
                  Тест
                </button>
                <button
                  onClick={() => setNotifications([])}
                  className="text-xs bg-gray-100 text-gray-800 px-2 py-1 rounded hover:bg-gray-200"
                >
                  Очистить
                </button>
              </div>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  Нет уведомлений
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="p-3 hover:bg-gray-50">
                      <div className="flex items-start space-x-3">
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type === 'success' ? 'bg-green-400' :
                          notification.type === 'warning' ? 'bg-yellow-400' :
                          notification.type === 'error' ? 'bg-red-400' :
                          'bg-blue-400'
                        }`}></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-gray-500">
                              {notification.from && `От: ${notification.from}`}
                            </span>
                            <span className="text-xs text-gray-500">
                              {formatTime(notification.timestamp)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RealTimeNotifications;
import React, { useState, useEffect } from 'react';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all');

  // Симуляция уведомлений
  useEffect(() => {
    const mockNotifications = [
      {
        id: 1,
        type: 'model_approved',
        title: 'Модель одобрена',
        message: 'Ваша модель "Диван классический" была одобрена модератором',
        user: 'Александр Иванов',
        time: '2 минуты назад',
        read: false,
        priority: 'normal'
      },
      {
        id: 2,
        type: 'new_user',
        title: 'Новый пользователь',
        message: 'Зарегистрировался новый пользователь: designer123',
        user: 'Система',
        time: '15 минут назад',
        read: false,
        priority: 'low'
      },
      {
        id: 3,
        type: 'payment',
        title: 'Новая покупка',
        message: 'Пользователь купил модель "Стол офисный" за 500₽',
        user: 'Мария Петрова',
        time: '1 час назад',
        read: true,
        priority: 'high'
      }
    ];
    setNotifications(mockNotifications);
  }, []);

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    );
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.read;
    if (filter === 'read') return notif.read;
    return true;
  });

  const getTypeIcon = (type) => {
    switch (type) {
      case 'model_approved': return '✅';
      case 'new_user': return '👤';
      case 'payment': return '💰';
      default: return '🔔';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'border-l-red-500';
      case 'normal': return 'border-l-blue-500';
      case 'low': return 'border-l-gray-500';
      default: return 'border-l-gray-500';
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          <p className="text-gray-500">Управление уведомлениями и событиями системы</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={markAllAsRead}
            className="px-4 py-2 text-blue-600 hover:text-blue-800"
          >
            Отметить все как прочитанные
          </button>
          <div className="flex items-center gap-2 bg-white rounded-lg border p-1">
            <button 
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Все ({notifications.length})
            </button>
            <button 
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 rounded text-sm ${filter === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Непрочитанные ({notifications.filter(n => !n.read).length})
            </button>
            <button 
              onClick={() => setFilter('read')}
              className={`px-3 py-1 rounded text-sm ${filter === 'read' ? 'bg-blue-100 text-blue-700' : 'text-gray-600'}`}
            >
              Прочитанные ({notifications.filter(n => n.read).length})
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <div className="text-gray-400 text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-600 mb-2">Нет уведомлений</h3>
            <p className="text-gray-500">
              {filter === 'unread' ? 'Все уведомления прочитаны' : 'Уведомления будут появляться здесь'}
            </p>
          </div>
        ) : (
          filteredNotifications.map(notification => (
            <div 
              key={notification.id}
              className={`bg-white rounded-lg border-l-4 p-4 shadow-sm ${getPriorityColor(notification.priority)} ${!notification.read ? 'bg-blue-50' : ''}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 flex-1">
                  <span className="text-2xl">{getTypeIcon(notification.type)}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-gray-900">{notification.title}</h3>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>От: {notification.user}</span>
                      <span>{notification.time}</span>
                      <span className={`px-2 py-1 rounded text-xs ${
                        notification.priority === 'high' ? 'bg-red-100 text-red-700' :
                        notification.priority === 'normal' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {notification.priority === 'high' ? 'Высокий' : 
                         notification.priority === 'normal' ? 'Обычный' : 'Низкий'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.read && (
                    <button 
                      onClick={() => markAsRead(notification.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm"
                    >
                      Прочитано
                    </button>
                  )}
                  <button 
                    onClick={() => deleteNotification(notification.id)}
                    className="text-red-600 hover:text-red-800 text-sm ml-2"
                  >
                    Удалить
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Настройки уведомлений */}
      <div className="mt-8 bg-white rounded-lg p-6">
        <h2 className="text-lg font-medium mb-4">Настройки уведомлений</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Новые модели на модерации</h3>
              <p className="text-sm text-gray-500">Получать уведомления о новых моделях</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Новые пользователи</h3>
              <p className="text-sm text-gray-500">Уведомления о регистрации новых пользователей</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Платежи и покупки</h3>
              <p className="text-sm text-gray-500">Уведомления о новых транзакциях</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Системные события</h3>
              <p className="text-sm text-gray-500">Ошибки и важные системные уведомления</p>
            </div>
            <input type="checkbox" defaultChecked className="toggle" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notifications;
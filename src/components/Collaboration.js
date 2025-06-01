import React, { useState, useEffect, useRef } from 'react';
import collaborationService from '../services/collaborationService';
import { useAuth } from '../contexts/AuthContext';
import { useModalContext } from './ModalProvider';

const Collaboration = () => {
  const { user } = useAuth();
  const { success } = useModalContext();
  const [activeUsers, setActiveUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showActivities, setShowActivities] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      // Подключаемся к системе совместной работы
      collaborationService.connect({
        username: user.username || user.email,
        role: user.role || 'admin',
        avatar: user.avatar,
        currentPage: window.location.pathname
      });

      // Регистрируем callbacks
      collaborationService.onUsersUpdated((users) => {
        setActiveUsers(users);
        setIsConnected(collaborationService.isUserConnected());
      });

      collaborationService.onMessageReceived((message) => {
        setMessages(prev => [...prev, message]);
        scrollToBottom();
      });

      collaborationService.onActivityReceived((activity) => {
        setActivities(prev => [activity, ...prev.slice(0, 19)]);
      });

      collaborationService.onNotificationReceived((notification) => {
        // Фильтруем уведомления - показываем только важные, не системные подключения
        if (notification.type !== 'connection' && notification.type !== 'system_connect') {
          success(notification.message, notification.title);
        }
      });

      return () => {
        collaborationService.disconnect();
      };
    }
  }, [user, success]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const sendMessage = () => {
    if (newMessage.trim()) {
      collaborationService.sendMessage(newMessage);
      setNewMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPageName = (page) => {
    const pageNames = {
      '/': 'Дашборд',
      '/users': 'Пользователи',
      '/models': 'Модели',
      '/gallery': 'Галерея',
      '/lessons': 'Уроки',
      '/design': 'Дизайн',
      '/settings': 'Настройки',
      '/management': 'Управление',
      '/moderation': 'Модерация'
    };
    return pageNames[page] || page;
  };

  if (!user) return null;

  return (
    <div className="fixed right-4 top-20 z-50">
      {/* Кнопка с иконкой пользователя в наушниках */}
      <button 
        onClick={() => setIsExpanded(!isExpanded)}
        className={`mb-2 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
          isConnected 
            ? 'bg-green-500 hover:bg-green-600' 
            : 'bg-gray-500 hover:bg-gray-600'
        }`}
      >
        <svg 
          className="w-6 h-6 text-white" 
          fill="currentColor" 
          viewBox="0 0 24 24"
        >
          {/* Иконка человека с наушниками */}
          <path d="M12 2C8.686 2 6 4.686 6 8v4c0 1.657-1.343 3-3 3s-3-1.343-3-3h2c0 .552.448 1 1 1s1-.448 1-1V8c0-4.411 3.589-8 8-8s8 3.589 8 8v4c0 .552.448 1 1 1s1-.448 1-1h2c0 1.657-1.343 3-3 3s-3-1.343-3-3V8c0-3.314-2.686-6-6-6z"/>
          <circle cx="12" cy="16" r="2"/>
          <path d="M12 20c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2z"/>
        </svg>
        {/* Индикатор количества активных пользователей */}
        {activeUsers.length > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {activeUsers.length}
          </div>
        )}
      </button>

      {/* Панель совместной работы (появляется при клике) */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow-xl border border-gray-200 mb-2 max-w-sm animate-fadeIn">
          {/* Индикатор подключения */}
          <div className={`px-3 py-2 border-b border-gray-200 text-xs font-medium ${
            isConnected 
              ? 'bg-green-50 text-green-800' 
              : 'bg-red-50 text-red-800'
          }`}>
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              {isConnected ? 'Система совместной работы активна' : 'Нет подключения'}
            </div>
          </div>

          {/* Активные пользователи */}
          <div className="p-3 border-b border-gray-200">
            <h3 className="font-semibold text-gray-800 text-sm">
              Администраторы онлайн ({activeUsers.length})
            </h3>
          </div>
          <div className="p-3 max-h-40 overflow-y-auto border-b border-gray-200">
            {activeUsers.length === 0 ? (
              <p className="text-gray-500 text-sm">Нет активных пользователей</p>
            ) : (
              <div className="space-y-2">
                {activeUsers.map((activeUser) => (
                  <div key={activeUser.id} className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-blue-600">
                        {activeUser.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activeUser.username}
                      </p>
                      <p className="text-xs text-gray-500">
                        {getPageName(activeUser.currentPage)}
                      </p>
                    </div>
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Панель управления */}
          <div className="p-2 flex space-x-1 border-b border-gray-200">
            <button
              onClick={() => setShowActivities(!showActivities)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                showActivities 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Активность
            </button>
            <button
              onClick={() => setShowChat(!showChat)}
              className={`px-3 py-1 text-xs font-medium rounded ${
                showChat 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Чат
            </button>
          </div>

          {/* Лента активности */}
          {showActivities && (
            <div className="p-3 max-h-60 overflow-y-auto border-b border-gray-200">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Последняя активность</h4>
              {activities.length === 0 ? (
                <p className="text-gray-500 text-sm">Нет активности</p>
              ) : (
                <div className="space-y-2">
                  {activities.map((activity, index) => (
                    <div key={index} className="text-xs text-gray-600">
                      <span className="font-medium">{activity.user}:</span> {activity.action}
                      <span className="text-gray-400 ml-1">{formatTime(activity.timestamp)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Чат */}
          {showChat && (
            <div className="p-3 max-h-60 overflow-y-auto">
              <h4 className="font-semibold text-gray-800 text-sm mb-2">Быстрый чат</h4>
              <div className="space-y-2 mb-3">
                {messages.map((message, index) => (
                  <div key={index} className="text-xs">
                    <span className="font-medium text-gray-700">{message.user}:</span>
                    <span className="text-gray-600 ml-1">{message.text}</span>
                    <span className="text-gray-400 ml-1">{formatTime(message.timestamp)}</span>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Сообщение..."
                  className="flex-1 text-xs px-2 py-1 border rounded"
                />
                <button
                  onClick={sendMessage}
                  className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                >
                  →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Collaboration;
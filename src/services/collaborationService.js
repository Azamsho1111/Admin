import io from 'socket.io-client';

class CollaborationService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.currentUser = null;
    this.activeUsers = [];
    this.activities = [];
    this.messages = [];
    
    // Callbacks для обновления UI
    this.onUsersUpdate = null;
    this.onNewMessage = null;
    this.onNewActivity = null;
    this.onNotification = null;
    this.onModelUpdate = null;
  }

  connect(userData) {
    if (this.socket) {
      this.disconnect();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const socketUrl = `${protocol}//${window.location.host}`;

    this.socket = io(socketUrl, {
      transports: ['websocket', 'polling'],
      path: '/socket.io'
    });

    this.currentUser = userData;

    this.socket.on('connect', () => {
      console.log('Подключен к системе совместной работы');
      this.isConnected = true;
      this.socket.emit('admin_join', userData);
    });

    this.socket.on('disconnect', () => {
      console.log('Отключен от системы совместной работы');
      this.isConnected = false;
    });

    // Обработка списка активных пользователей
    this.socket.on('active_users', (users) => {
      this.activeUsers = users;
      if (this.onUsersUpdate) {
        this.onUsersUpdate(users);
      }
    });

    // Новый пользователь подключился
    this.socket.on('user_joined', (user) => {
      this.activeUsers.push(user);
      if (this.onUsersUpdate) {
        this.onUsersUpdate(this.activeUsers);
      }
      
      if (this.onNewActivity) {
        this.onNewActivity({
          type: 'system',
          user: user.username,
          action: 'присоединился к системе',
          timestamp: new Date()
        });
      }
    });

    // Пользователь покинул систему
    this.socket.on('user_left', (data) => {
      this.activeUsers = this.activeUsers.filter(u => u.id !== data.userId);
      if (this.onUsersUpdate) {
        this.onUsersUpdate(this.activeUsers);
      }
    });

    // Пользователь сменил страницу
    this.socket.on('user_page_change', (data) => {
      const user = this.activeUsers.find(u => u.id === data.userId);
      if (user) {
        user.currentPage = data.page;
        if (this.onUsersUpdate) {
          this.onUsersUpdate(this.activeUsers);
        }
      }
    });

    // Новое сообщение в чате
    this.socket.on('new_message', (message) => {
      this.messages.push(message);
      if (this.onNewMessage) {
        this.onNewMessage(message);
      }
    });

    // Новая активность
    this.socket.on('new_activity', (activity) => {
      this.activities.unshift(activity);
      if (this.activities.length > 50) {
        this.activities = this.activities.slice(0, 50);
      }
      
      if (this.onNewActivity) {
        this.onNewActivity(activity);
      }
    });

    // Последние активности при подключении
    this.socket.on('recent_activities', (activities) => {
      this.activities = activities;
      if (this.onNewActivity) {
        activities.forEach(activity => this.onNewActivity(activity));
      }
    });

    // Уведомления
    this.socket.on('new_notification', (notification) => {
      if (this.onNotification) {
        this.onNotification(notification);
      }
    });

    // Обновления моделей
    this.socket.on('model_updated', (data) => {
      if (this.onModelUpdate) {
        this.onModelUpdate(data);
      }
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Отправка сообщения в чат
  sendMessage(text, type = 'message') {
    if (this.socket && this.isConnected) {
      this.socket.emit('chat_message', { text, type });
    }
  }

  // Уведомление о смене страницы
  setCurrentPage(page) {
    if (this.socket && this.isConnected) {
      this.socket.emit('page_activity', { page });
    }
  }

  // Уведомление об изменении модели
  notifyModelUpdate(modelId, modelName, action, details) {
    if (this.socket && this.isConnected) {
      this.socket.emit('model_update', {
        modelId,
        modelName,
        action,
        details
      });
    }
  }

  // Отправка уведомления другим администраторам
  sendNotification(type, title, message, recipients = 'all') {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_notification', {
        type,
        title,
        message,
        recipients
      });
    }
  }

  // Регистрация callbacks
  onUsersUpdated(callback) {
    this.onUsersUpdate = callback;
  }

  onMessageReceived(callback) {
    this.onNewMessage = callback;
  }

  onActivityReceived(callback) {
    this.onNewActivity = callback;
  }

  onNotificationReceived(callback) {
    this.onNotification = callback;
  }

  onModelUpdated(callback) {
    this.onModelUpdate = callback;
  }

  // Получение текущих данных
  getActiveUsers() {
    return this.activeUsers;
  }

  getRecentActivities() {
    return this.activities;
  }

  getMessages() {
    return this.messages;
  }

  isUserConnected() {
    return this.isConnected;
  }
}

const collaborationService = new CollaborationService();
export default collaborationService;
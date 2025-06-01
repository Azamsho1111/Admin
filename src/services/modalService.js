/**
 * Глобальный сервис для замены стандартных alert/confirm на красивые модальные окна
 */
class ModalService {
  constructor() {
    this.modalContext = null;
  }

  // Устанавливаем контекст модальных окон
  setContext(context) {
    this.modalContext = context;
  }

  // Заменяет window.alert
  alert(message, title = 'Уведомление') {
    if (this.modalContext) {
      return this.modalContext.alert(message, title);
    }
    // Fallback к стандартному alert
    return window.alert(`${title}: ${message}`);
  }

  // Заменяет window.confirm
  confirm(message, title = 'Подтверждение') {
    if (this.modalContext) {
      return this.modalContext.confirm(message, title);
    }
    // Fallback к стандартному confirm
    return window.confirm(`${title}: ${message}`);
  }

  // Показывает успешное уведомление
  success(message, title = 'Успешно') {
    if (this.modalContext) {
      return this.modalContext.success(message, title);
    }
    return window.alert(`${title}: ${message}`);
  }

  // Показывает ошибку
  error(message, title = 'Ошибка') {
    if (this.modalContext) {
      return this.modalContext.error(message, title);
    }
    return window.alert(`${title}: ${message}`);
  }

  // Показывает предупреждение
  warning(message, title = 'Предупреждение') {
    if (this.modalContext) {
      return this.modalContext.warning(message, title);
    }
    return window.alert(`${title}: ${message}`);
  }
}

// Создаем единственный экземпляр
export const modalService = new ModalService();

// Переопределяем глобальные функции для автоматической замены
if (typeof window !== 'undefined') {
  // Сохраняем оригинальные функции
  const originalAlert = window.alert;
  const originalConfirm = window.confirm;

  // Заменяем на наши красивые модальные окна
  window.alert = (message) => modalService.alert(message);
  window.confirm = (message) => modalService.confirm(message);

  // Добавляем возможность восстановления
  window.restoreOriginalAlerts = () => {
    window.alert = originalAlert;
    window.confirm = originalConfirm;
  };
}

export default modalService;
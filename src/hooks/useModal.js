import { useState, useCallback } from 'react';

export const useModal = () => {
  const [modals, setModals] = useState([]);

  const showModal = useCallback((options) => {
    const id = Date.now() + Math.random();
    const modal = {
      id,
      ...options,
      isOpen: true
    };
    
    setModals(prev => [...prev, modal]);
    
    return new Promise((resolve) => {
      modal.onClose = () => {
        setModals(prev => prev.filter(m => m.id !== id));
        resolve(false);
      };
      
      if (modal.onConfirm) {
        const originalOnConfirm = modal.onConfirm;
        modal.onConfirm = () => {
          setModals(prev => prev.filter(m => m.id !== id));
          resolve(true);
          if (originalOnConfirm) originalOnConfirm();
        };
      }
    });
  }, []);

  const closeModal = useCallback((id) => {
    setModals(prev => prev.filter(m => m.id !== id));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals([]);
  }, []);

  // Методы для разных типов модальных окон
  const alert = useCallback((message, title = 'Уведомление', type = 'info') => {
    return showModal({
      type,
      title,
      children: message,
      confirmText: 'OK'
    });
  }, [showModal]);

  const confirm = useCallback((message, title = 'Подтверждение') => {
    return showModal({
      type: 'confirm',
      title,
      children: message,
      confirmText: 'Да',
      cancelText: 'Отмена',
      onConfirm: () => true
    });
  }, [showModal]);

  const success = useCallback((message, title = 'Успешно') => {
    return showModal({
      type: 'success',
      title,
      children: message,
      confirmText: 'OK'
    });
  }, [showModal]);

  const error = useCallback((message, title = 'Ошибка') => {
    return showModal({
      type: 'error',
      title,
      children: message,
      confirmText: 'OK'
    });
  }, [showModal]);

  const warning = useCallback((message, title = 'Предупреждение') => {
    return showModal({
      type: 'warning',
      title,
      children: message,
      confirmText: 'OK'
    });
  }, [showModal]);

  return {
    modals,
    showModal,
    closeModal,
    closeAllModals,
    alert,
    confirm,
    success,
    error,
    warning
  };
};
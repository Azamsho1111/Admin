import React, { createContext, useContext } from 'react';
import { useModal } from '../hooks/useModal';
import Modal from './Modal';

const ModalContext = createContext();

export const useModalContext = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error('useModalContext must be used within ModalProvider');
  }
  return context;
};

export const ModalProvider = ({ children }) => {
  const modalUtils = useModal();

  return (
    <ModalContext.Provider value={modalUtils}>
      {children}
      
      {/* Рендеринг всех активных модальных окон */}
      {modalUtils.modals.map((modal) => (
        <Modal
          key={modal.id}
          isOpen={modal.isOpen}
          onClose={modal.onClose}
          title={modal.title}
          type={modal.type}
          onConfirm={modal.onConfirm}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          showCloseButton={modal.showCloseButton}
        >
          {modal.children}
        </Modal>
      ))}
    </ModalContext.Provider>
  );
};
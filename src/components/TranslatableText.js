import React, { useState, useEffect } from 'react';
import translationService from '../services/translationService';

// Глобальный контекст для управления переводом
export const TranslationContext = React.createContext({
  isTranslationEnabled: false,
  toggleTranslation: () => {},
  currentLanguage: 'ru'
});

// Провайдер перевода
export const TranslationProvider = ({ children }) => {
  const [isTranslationEnabled, setIsTranslationEnabled] = useState(() => {
    try {
      return localStorage.getItem('translation_enabled') === 'true';
    } catch {
      return false;
    }
  });

  const toggleTranslation = () => {
    const newState = !isTranslationEnabled;
    setIsTranslationEnabled(newState);
    localStorage.setItem('translation_enabled', newState.toString());
  };

  const value = {
    isTranslationEnabled,
    toggleTranslation,
    currentLanguage: isTranslationEnabled ? 'en' : 'ru'
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
};

// Хук для использования перевода
export const useTranslation = () => {
  const context = React.useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslation must be used within TranslationProvider');
  }
  return context;
};

// Компонент для переводимого текста
export const TranslatableText = ({ 
  children, 
  translationKey, 
  className = '',
  as: Component = 'span',
  ...props 
}) => {
  const { isTranslationEnabled } = useTranslation();
  const [translatedText, setTranslatedText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isTranslationEnabled && children && typeof children === 'string') {
      setIsLoading(true);
      const translateText = async () => {
        try {
          // Проверяем кэш перевода
          const cached = localStorage.getItem(`translation_${translationKey || children}`);
          if (cached) {
            setTranslatedText(cached);
            setIsLoading(false);
            return;
          }

          const translated = await translationService.translateText(children);
          setTranslatedText(translated);
          
          // Сохраняем в кэш
          localStorage.setItem(`translation_${translationKey || children}`, translated);
        } catch (error) {
          console.error('Ошибка перевода:', error);
          setTranslatedText(children);
        } finally {
          setIsLoading(false);
        }
      };

      translateText();
    } else {
      setTranslatedText('');
      setIsLoading(false);
    }
  }, [isTranslationEnabled, children, translationKey]);

  const displayText = isTranslationEnabled && translatedText ? translatedText : children;

  return (
    <Component className={`${className} ${isLoading ? 'opacity-75' : ''}`} {...props}>
      {displayText}
      {isLoading && isTranslationEnabled && (
        <span className="ml-1 text-xs text-gray-400">...</span>
      )}
    </Component>
  );
};

// Компонент для переводимого инпута
export const TranslatableInput = ({ 
  placeholder, 
  translatedPlaceholder,
  ...props 
}) => {
  const { isTranslationEnabled } = useTranslation();
  const [translatedPlaceholderText, setTranslatedPlaceholderText] = useState('');

  useEffect(() => {
    if (isTranslationEnabled && placeholder && !translatedPlaceholder) {
      const translatePlaceholder = async () => {
        try {
          const translated = await translationService.translateText(placeholder);
          setTranslatedPlaceholderText(translated);
        } catch (error) {
          console.error('Ошибка перевода placeholder:', error);
          setTranslatedPlaceholderText(placeholder);
        }
      };

      translatePlaceholder();
    }
  }, [isTranslationEnabled, placeholder, translatedPlaceholder]);

  const displayPlaceholder = isTranslationEnabled 
    ? (translatedPlaceholder || translatedPlaceholderText || placeholder)
    : placeholder;

  return (
    <input 
      {...props} 
      placeholder={displayPlaceholder}
    />
  );
};

// Глобальная кнопка переключения языка
export const GlobalTranslationToggle = ({ className = '' }) => {
  const { isTranslationEnabled, toggleTranslation } = useTranslation();

  return (
    <button
      onClick={toggleTranslation}
      className={`px-3 py-2 text-sm rounded-lg transition-colors ${
        isTranslationEnabled 
          ? 'bg-green-500 text-white hover:bg-green-600' 
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      } ${className}`}
      title={isTranslationEnabled ? 'Переключить на русский' : 'Переключить на английский'}
    >
      {isTranslationEnabled ? '🇬🇧 EN' : '🇷🇺 RU'}
    </button>
  );
};

export default TranslatableText;
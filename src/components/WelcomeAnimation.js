import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';

const WelcomeAnimation = ({ onComplete }) => {
  const { user, isAdmin } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const adminSteps = [
    {
      icon: (
        <svg className="w-16 h-16 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      title: "Добро пожаловать, Администратор!",
      subtitle: "Полный контроль над системой",
      color: "from-orange-400 to-orange-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      title: "Управление пользователями",
      subtitle: "Контроль доступа и ролей",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
        </svg>
      ),
      title: "Финансовая аналитика",
      subtitle: "Доходы, расходы и отчеты",
      color: "from-green-400 to-green-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
      title: "Системные настройки",
      subtitle: "Конфигурация и оптимизация",
      color: "from-purple-400 to-purple-600"
    }
  ];

  const moderatorSteps = [
    {
      icon: (
        <svg className="w-16 h-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      title: "Добро пожаловать, Модератор!",
      subtitle: "Качественная модерация контента",
      color: "from-green-400 to-green-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4-8-4m16 0v10l-8 4-8-4V7" />
        </svg>
      ),
      title: "Модерация моделей",
      subtitle: "Проверка и утверждение 3D контента",
      color: "from-blue-400 to-blue-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
      ),
      title: "Управление фильтрами",
      subtitle: "Настройка категорий и тегов",
      color: "from-indigo-400 to-indigo-600"
    },
    {
      icon: (
        <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: "Галерея и контент",
      subtitle: "Курирование визуального контента",
      color: "from-teal-400 to-teal-600"
    }
  ];

  const steps = isAdmin() ? adminSteps : moderatorSteps;

  useEffect(() => {
    // Skip animation if no user or steps
    if (!user || steps.length === 0) {
      onComplete();
      return;
    }

    let timeoutId;
    const timer = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          // Animation complete
          clearInterval(timer);
          timeoutId = setTimeout(() => {
            setIsVisible(false);
            setTimeout(() => onComplete(), 200);
          }, 800);
          return prev;
        }
      });
    }, 600);

    // Cleanup
    return () => {
      clearInterval(timer);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [steps.length, onComplete, user]);

  if (!isVisible) {
    return null;
  }

  const currentStepData = steps[currentStep];

  return (
    <div 
      className="fixed inset-0 z-50 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
      role="dialog"
      aria-labelledby="welcome-title"
      aria-describedby="welcome-description"
      aria-live="polite"
    >
      {/* Background particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-white rounded-full opacity-20 animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Skip button */}
      <button
        onClick={() => {
          setIsVisible(false);
          onComplete();
        }}
        className="absolute top-4 right-4 z-10 px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-white"
        aria-label="Пропустить приветствие"
      >
        Пропустить
      </button>

      {/* Main content */}
      <div className="relative text-center text-white max-w-md mx-auto p-4 sm:p-8">
        {/* Screen reader announcements */}
        <div className="sr-only" aria-live="assertive">
          Шаг {currentStep + 1} из {steps.length}: {currentStepData?.title || 'Загрузка'}
        </div>
        
        {/* User avatar */}
        <div className="mb-6 sm:mb-8">
          <div 
            className="mx-auto w-20 h-20 sm:w-24 sm:h-24 bg-gray-700 rounded-full flex items-center justify-center border-4 border-gray-600"
            role="img"
            aria-label={`Аватар пользователя ${user?.firstName || 'пользователь'}`}
          >
            <span className="text-xl sm:text-2xl font-bold text-gray-300">
              {user?.firstName?.[0] || user?.email?.[0] || 'U'}
            </span>
          </div>
        </div>

        {/* Animated step indicator */}
        <div 
          className="flex justify-center mb-6 sm:mb-8 space-x-2"
          role="progressbar"
          aria-valuenow={currentStep + 1}
          aria-valuemin="1"
          aria-valuemax={steps.length}
          aria-label={`Прогресс приветствия: шаг ${currentStep + 1} из ${steps.length}`}
        >
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-500 ${
                index <= currentStep 
                  ? 'w-6 sm:w-8 bg-white' 
                  : 'w-2 bg-gray-600'
              }`}
              aria-hidden="true"
            />
          ))}
        </div>

        {/* Current step animation */}
        <div 
          key={currentStep}
          className="animate-fade-in"
        >
          {/* Icon with gradient background */}
          <div 
            className={`mx-auto w-24 h-24 sm:w-32 sm:h-32 rounded-full bg-gradient-to-br ${currentStepData.color} flex items-center justify-center mb-4 sm:mb-6 transform transition-all duration-700 animate-bounce-in shadow-2xl`}
            role="img"
            aria-label={`Иконка для ${currentStepData.title}`}
          >
            {currentStepData.icon}
          </div>

          {/* Title */}
          <h1 
            id="welcome-title"
            className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4 animate-slide-in px-4"
          >
            {currentStepData.title}
          </h1>

          {/* Subtitle */}
          <p 
            id="welcome-description"
            className="text-lg sm:text-xl text-gray-300 animate-slide-in px-4"
          >
            {currentStepData.subtitle}
          </p>

          {/* Loading indicator on last step */}
          {currentStep === steps.length - 1 && (
            <div className="mt-8">
              <div className="inline-flex items-center text-gray-400">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Загрузка панели управления...
              </div>
            </div>
          )}
        </div>

        {/* Role badge */}
        <div className="absolute top-8 right-8">
          <span className={`px-4 py-2 rounded-full text-sm font-medium ${
            isAdmin() 
              ? 'bg-orange-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            {isAdmin() ? 'Администратор' : 'Модератор'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default WelcomeAnimation;
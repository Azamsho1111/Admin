import React from 'react';

const PasswordStrengthMeter = ({ password }) => {
  const calculateStrength = (password) => {
    let score = 0;
    const feedback = [];
    
    if (!password) return { score: 0, strength: 'none', feedback: [] };
    
    // Длина пароля
    if (password.length >= 8) {
      score += 1;
    } else {
      feedback.push('Минимум 8 символов');
    }
    
    if (password.length >= 12) {
      score += 1;
    }
    
    // Строчные буквы
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Строчные буквы (a-z)');
    }
    
    // Заглавные буквы
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Заглавные буквы (A-Z)');
    }
    
    // Цифры
    if (/\d/.test(password)) {
      score += 1;
    } else {
      feedback.push('Цифры (0-9)');
    }
    
    // Специальные символы
    if (/[^A-Za-z\d]/.test(password)) {
      score += 1;
    } else {
      feedback.push('Специальные символы (!@#$%^&*)');
    }
    
    // Определение силы пароля
    let strength = 'weak';
    if (score >= 5) {
      strength = 'strong';
    } else if (score >= 3) {
      strength = 'medium';
    }
    
    return { score, strength, feedback };
  };
  
  const { score, strength, feedback } = calculateStrength(password);
  
  const getStrengthColor = () => {
    switch (strength) {
      case 'strong':
        return 'bg-green-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'weak':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };
  
  const getStrengthText = () => {
    switch (strength) {
      case 'strong':
        return 'Надежный пароль';
      case 'medium':
        return 'Средний пароль';
      case 'weak':
        return 'Слабый пароль';
      default:
        return '';
    }
  };
  
  const getStrengthTextColor = () => {
    switch (strength) {
      case 'strong':
        return 'text-green-600';
      case 'medium':
        return 'text-yellow-600';
      case 'weak':
        return 'text-red-600';
      default:
        return 'text-gray-500';
    }
  };
  
  const progressPercentage = (score / 6) * 100;
  
  return (
    <div className="space-y-2">
      {/* Полоса прогресса */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      {/* Текст силы пароля */}
      {password && (
        <div className={`text-sm font-medium ${getStrengthTextColor()}`}>
          {getStrengthText()}
        </div>
      )}
      
      {/* Требования к паролю */}
      {password && feedback.length > 0 && (
        <div className="text-xs space-y-1">
          <p className="text-gray-600 font-medium">Добавьте для усиления:</p>
          <ul className="space-y-1">
            {feedback.map((item, index) => (
              <li key={index} className="flex items-center text-gray-500">
                <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {/* Выполненные требования */}
      {password && (
        <div className="text-xs space-y-1">
          <div className="space-y-1">
            {/* Длина */}
            <div className={`flex items-center ${password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
              <svg className={`w-3 h-3 mr-2 ${password.length >= 8 ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {password.length >= 8 ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              Минимум 8 символов
            </div>
            
            {/* Строчные буквы */}
            <div className={`flex items-center ${/[a-z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <svg className={`w-3 h-3 mr-2 ${/[a-z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/[a-z]/.test(password) ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              Строчные буквы
            </div>
            
            {/* Заглавные буквы */}
            <div className={`flex items-center ${/[A-Z]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <svg className={`w-3 h-3 mr-2 ${/[A-Z]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/[A-Z]/.test(password) ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              Заглавные буквы
            </div>
            
            {/* Цифры */}
            <div className={`flex items-center ${/\d/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <svg className={`w-3 h-3 mr-2 ${/\d/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/\d/.test(password) ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              Цифры
            </div>
            
            {/* Специальные символы */}
            <div className={`flex items-center ${/[^A-Za-z\d]/.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
              <svg className={`w-3 h-3 mr-2 ${/[^A-Za-z\d]/.test(password) ? 'text-green-500' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/[^A-Za-z\d]/.test(password) ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                )}
              </svg>
              Специальные символы
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PasswordStrengthMeter;
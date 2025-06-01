import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordForm, setShowPasswordForm] = useState(false);

  const handleRoleSelect = (role) => {
    console.log('Role selected:', role);
    setSelectedRole(role);
    setShowPasswordForm(true);
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!password) return;

    try {
      console.log('Starting login process...');
      await login(selectedRole);
      console.log('Login completed successfully');
      window.location.href = '/';
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-gray-50 flex items-center justify-center py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-md w-full space-y-6 sm:space-y-8">
        {/* Header */}
        <div className="text-center">
          <div 
            className="mx-auto h-20 w-20 sm:h-24 sm:w-24 bg-gradient-to-br from-gray-600 to-gray-700 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-200"
            role="img"
            aria-label="Иконка админ-панели"
          >
            <svg className="h-10 w-10 sm:h-12 sm:w-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="mt-6 sm:mt-8 text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Войти в админ-панель
          </h1>
          <p className="mt-2 sm:mt-3 text-center text-sm sm:text-base text-gray-600">
            Управление 3D моделями и модерация контента
          </p>
        </div>

        {/* Main Form */}
        <div className="bg-white/80 backdrop-blur-lg py-6 sm:py-8 px-6 sm:px-8 shadow-2xl rounded-3xl border border-white/20">
          <div className="space-y-6">
            {!showPasswordForm ? (
              // Role Selection
              <div>
                <h2 className="text-lg font-semibold text-gray-800 mb-4 sm:mb-6 text-center">Выберите роль</h2>
              
              <div className="space-y-3" role="group" aria-labelledby="role-selection">
                {/* Admin Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('administrator')}
                  disabled={loading}
                  aria-label="Войти как администратор с полным доступом ко всем функциям"
                  className={`w-full p-3 sm:p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-orange-400 to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        АДМИН
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Полный доступ ко всем функциям</p>
                    </div>
                  </div>
                </button>

                {/* Moderator Card */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect('moderator')}
                  disabled={loading}
                  aria-label="Войти как модератор с доступом к модерации и фильтрам"
                  className={`w-full p-3 sm:p-4 border-2 border-gray-200 rounded-2xl hover:border-blue-300 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 group ${
                    loading ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="h-10 w-10 sm:h-12 sm:w-12 bg-gradient-to-br from-green-400 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200" aria-hidden="true">
                      <svg className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="text-left flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        МОДЕРАТОР
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-500 truncate">Доступ к модерации и фильтрам</p>
                    </div>
                  </div>
                </button>
              </div>
              </div>
            ) : (
              // Password Form
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-lg font-semibold text-gray-800">
                    Введите пароль для роли: {selectedRole === 'administrator' ? 'Администратор' : 'Модератор'}
                  </h2>
                </div>
                
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Пароль
                    </label>
                    <input
                      type="password"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Введите пароль"
                      required
                    />
                  </div>
                  
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setSelectedRole('');
                        setPassword('');
                      }}
                      className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Назад
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !password}
                      className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {loading ? 'Вход...' : 'Войти'}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Forgot Password Link */}
            {!showPasswordForm && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors duration-200"
                >
                  Забыли пароль?
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center text-xs text-gray-500 space-y-2">
          <p className="font-medium">Доступ предоставляется только авторизованным пользователям</p>
          <div className="space-y-1">
            <p><span className="font-semibold text-gray-600">Администратор:</span> полный доступ ко всем функциям (пароль: admin123)</p>
            <p><span className="font-semibold text-gray-600">Модератор:</span> доступ к моделям, фильтрам и модерации (пароль: mod123)</p>
          </div>
          
          {/* Demo Password Strength */}
          <div className="mt-4">
            <button
              type="button"
              onClick={() => navigate('/reset-password?token=demo-token-123&email=demo@cgarea.ru')}
              className="text-blue-600 hover:text-blue-700 text-xs underline transition-colors duration-200"
            >
              Демонстрация индикатора силы пароля
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
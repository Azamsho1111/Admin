import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleBasedRoute = ({ children, requiredRole, fallback = null }) => {
  const { user, isAdmin, isModerator } = useAuth();

  // Check access based on required role
  const hasAccess = () => {
    if (!user) return false;
    
    switch (requiredRole) {
      case 'administrator':
        return isAdmin();
      case 'moderator':
        return isModerator();
      default:
        return true;
    }
  };

  if (!hasAccess()) {
    return fallback || (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Доступ ограничен</h3>
          <p className="text-gray-600">У вас нет прав для просмотра этого раздела.</p>
          <p className="text-sm text-gray-500 mt-2">
            Обратитесь к администратору для получения необходимых разрешений.
          </p>
        </div>
      </div>
    );
  }

  return children;
};

export default RoleBasedRoute;
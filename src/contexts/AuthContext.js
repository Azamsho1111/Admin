import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const checkAuth = async () => {
      try {
        // For demonstration purposes, check localStorage first
        const savedUser = localStorage.getItem('demo_user');
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        }
        // Authentication check complete
      } catch (error) {
        console.error('Auth check error:', error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (selectedRole) => {
    console.log('Login function called with role:', selectedRole);
    setLoading(true);
    
    try {
      // Создаем пользователя для демонстрации
      const demoUser = {
        id: selectedRole === 'administrator' ? '1' : '2',
        email: selectedRole === 'administrator' ? 'admin@cgarea.ru' : 'moderator@cgarea.ru',
        firstName: selectedRole === 'administrator' ? 'Администратор' : 'Модератор',
        lastName: 'Система',
        role: selectedRole,
        profileImageUrl: null
      };
      
      console.log('Created demo user:', demoUser);
      
      // Сохраняем в localStorage и устанавливаем пользователя
      localStorage.setItem('demo_user', JSON.stringify(demoUser));
      setUser(demoUser);
      console.log('User set successfully');
    } catch (error) {
      console.error('Error in login function:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('demo_user');
      await fetch('/api/logout', {
        method: 'POST',
        credentials: 'include'
      });
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Even if API fails, clear local state
      setUser(null);
    }
  };

  const hasRole = (role) => {
    return user?.role === role;
  };

  const isAdmin = () => {
    return user?.role === 'administrator';
  };

  const isModerator = () => {
    return user?.role === 'moderator' || user?.role === 'administrator';
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    isAdmin,
    isModerator,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
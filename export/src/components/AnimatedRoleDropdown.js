import React, { useState, useRef, useEffect } from 'react';

const AnimatedRoleDropdown = ({ selectedRole, onRoleSelect, isLoading }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const roles = [
    {
      id: 'administrator',
      name: 'АДМИН',
      description: 'полный доступ ко всем функциям (пароль: admin123)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
    {
      id: 'moderator',
      name: 'МОДЕРАТОР',
      description: 'доступ к моделям, фильтрам и модерации (пароль: mod123)',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleRoleSelect = (role) => {
    onRoleSelect(role);
    setIsOpen(false);
  };

  const selectedRoleData = roles.find(role => role.id === selectedRole);

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Выберите роль
      </label>
      
      {/* Dropdown Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading}
        className={`relative w-full bg-white border border-gray-300 rounded-lg shadow-sm pl-3 pr-10 py-4 text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:border-gray-400'
        }`}
      >
        <div className="flex items-center">
          {selectedRoleData ? (
            <>
              <div className="flex-shrink-0 text-blue-600">
                {selectedRoleData.icon}
              </div>
              <div className="ml-3 flex-1">
                <div className="text-sm font-medium text-gray-900">
                  {selectedRoleData.name}
                </div>
                <div className="text-xs text-gray-500">
                  {selectedRoleData.description}
                </div>
              </div>
            </>
          ) : (
            <div className="text-gray-500">Выберите роль для входа</div>
          )}
        </div>
        
        {/* Arrow Icon */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <svg 
            className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Dropdown Options */}
      <div 
        className={`absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-lg py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none transition-all duration-200 origin-top ${
          isOpen 
            ? 'opacity-100 scale-y-100 translate-y-0' 
            : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
        }`}
      >
        {roles.map((role, index) => (
          <button
            key={role.id}
            type="button"
            onClick={() => handleRoleSelect(role.id)}
            className={`w-full text-left px-4 py-3 hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors duration-150 ${
              selectedRole === role.id ? 'bg-blue-50 text-blue-600' : 'text-gray-900'
            }`}
            style={{
              animationDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
          >
            <div className="flex items-start">
              <div className={`flex-shrink-0 mt-0.5 ${
                selectedRole === role.id ? 'text-blue-600' : 'text-gray-400'
              }`}>
                {role.icon}
              </div>
              <div className="ml-3">
                <div className={`text-sm font-medium ${
                  selectedRole === role.id ? 'text-blue-600' : 'text-gray-900'
                }`}>
                  {role.name}
                </div>
                <div className={`text-xs mt-1 ${
                  selectedRole === role.id ? 'text-blue-500' : 'text-gray-500'
                }`}>
                  {role.description}
                </div>
              </div>
              
              {/* Check icon for selected role */}
              {selectedRole === role.id && (
                <div className="ml-auto flex-shrink-0">
                  <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
      
      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 z-0 bg-black bg-opacity-25 sm:hidden" />
      )}
    </div>
  );
};

export default AnimatedRoleDropdown;
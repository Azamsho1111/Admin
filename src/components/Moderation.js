import React, { useState } from 'react';
import NewModels from './ModerationModels/NewModels';
import IgnoredModels from './ModerationModels/IgnoredModels';
import AllModels from './ModerationModels/AllModels';

const Moderation = () => {
  const [activeTab, setActiveTab] = useState('new');

  const tabs = [
    { id: 'new', label: 'Новые модели', icon: '🔍' },
    { id: 'ignored', label: 'Игнорируемые', icon: '❌' },
    { id: 'all', label: 'Все модели', icon: '📋' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'new':
        return <NewModels />;
      case 'ignored':
        return <IgnoredModels />;
      case 'all':
        return <AllModels />;
      default:
        return <NewModels />;
    }
  };



  return (
    <div>
      {/* Верхняя навигация с серым фоном */}
      <div className="bg-gray-100 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button className="py-4 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm bg-white">
              3D МОДЕЛЬ
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              ГАЛЕРЕЯ
            </button>
            <button className="py-4 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 font-medium text-sm">
              УРОК
            </button>
          </nav>
        </div>
      </div>

      {/* Основной контент */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Заголовок и кнопка */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold">Модерация моделей</h1>
              <div className="text-gray-500 text-sm">Управление и проверка загруженных 3D моделей</div>
            </div>
          </div>

          {/* Карточка с табами */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className="text-lg">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Содержимое активного таба */}
            <div className="p-6">
              {renderTabContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Moderation;
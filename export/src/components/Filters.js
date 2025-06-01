import React, { useState } from 'react';
import {
  FilterStatuses,
  FilterRenders,
  FilterColors,
  FilterMaterials,
  FilterCategories,
  FilterOther,
  FilterStyles,
  FilterFormats,
  FilterSofts,
  FilterAnimation,
  FilterPolygons
} from './filters';
import FilterSections from './filters/FilterSections';
import translationService from '../services/translationService';

const Filters = () => {
  const [activeTab, setActiveTab] = useState('categories');
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedTabs, setTranslatedTabs] = useState({});

  const tabs = [
    { id: 'categories', label: 'Категории', icon: '📁' },
    { id: 'sections', label: 'Разделы', icon: '📂' },
    { id: 'softs', label: 'Софты', icon: '💻' },
    { id: 'formats', label: 'Форматы', icon: '📄' },
    { id: 'colors', label: 'Цвета', icon: '🎨' },
    { id: 'materials', label: 'Материалы', icon: '🧱' },
    { id: 'renders', label: 'Рендеры', icon: '🖼️' },
    { id: 'statuses', label: 'Статусы', icon: '📊' },
    { id: 'styles', label: 'Стили', icon: '✨' },
    { id: 'animation', label: 'Анимация', icon: '🎬' },
    { id: 'polygons', label: 'Полигонаж', icon: '🔺' },
    { id: 'other', label: 'Прочее', icon: '⚙️' }
  ];

  // Функция для перевода названий табов
  const translateTabs = async () => {
    const translations = {};
    for (const tab of tabs) {
      try {
        const translated = await translationService.translateText(tab.label);
        translations[tab.id] = translated;
      } catch (error) {
        console.error(`Ошибка перевода для ${tab.label}:`, error);
        translations[tab.id] = tab.label;
      }
    }
    setTranslatedTabs(translations);
  };

  // Функция для получения отображаемого названия таба
  const getTabLabel = (tab) => {
    return showTranslation && translatedTabs[tab.id] ? translatedTabs[tab.id] : tab.label;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'categories':
        return <FilterCategories />;
      case 'sections':
        return <FilterSections />;
      case 'softs':
        return <FilterSofts />;
      case 'formats':
        return <FilterFormats />;
      case 'colors':
        return <FilterColors />;
      case 'materials':
        return <FilterMaterials />;
      case 'renders':
        return <FilterRenders />;
      case 'statuses':
        return <FilterStatuses />;
      case 'styles':
        return <FilterStyles />;
      case 'animation':
        return <FilterAnimation />;
      case 'polygons':
        return <FilterPolygons />;
      case 'other':
        return <FilterOther />;
      default:
        return <FilterCategories />;
    }
  };

  return (
    <div>
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Управление фильтрами</h1>
          <div className="text-gray-500 text-sm">Настройка фильтров для каталога 3D моделей</div>
        </div>
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
          <button
            onClick={async () => {
              if (!showTranslation) {
                await translateTabs();
              }
              setShowTranslation(!showTranslation);
            }}
            className={`px-3 sm:px-4 py-2 text-sm rounded-lg transition-colors ${
              showTranslation 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showTranslation ? '🇬🇧 EN' : '🇷🇺 RU'} Перевод
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-2 rounded flex items-center justify-center gap-2 text-sm">
            + Добавить новый фильтр
          </button>
        </div>
      </div>

      {/* Вкладки фильтров */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex flex-wrap gap-2 sm:gap-4 lg:gap-8 px-4 sm:px-6 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 sm:py-4 px-2 sm:px-3 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-1 sm:gap-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-base sm:text-lg">{tab.icon}</span>
                <span className="hidden sm:inline">{getTabLabel(tab)}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Содержимое вкладки */}
        <div className="p-4 sm:p-6">
          {renderTabContent()}
        </div>
      </div>
    </div>
  );
};

export default Filters;
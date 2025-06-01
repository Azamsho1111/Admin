import React, { useState, useEffect } from "react";
import translationService from '../../services/translationService';
import apiConfig from '../../services/apiConfigService';

const FilterSections = () => {
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    category_id: '',
    icon_type: 'emoji',
    icon_data: '',
    icon_position: 'left'
  });
  const [editFormData, setEditFormData] = useState({});
  const [manualEditEn, setManualEditEn] = useState(false);
  const [editManualEditEn, setEditManualEditEn] = useState({});
  const [translationTimeout, setTranslationTimeout] = useState(null);

  const transliterate = (text) => {
    const translitMap = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ы': 'y', 'э': 'e', 'ю': 'yu', 'я': 'ya', ' ': '_'
    };
    return text.toLowerCase().split('').map(char => translitMap[char] || char).join('');
  };

  useEffect(() => {
    // Принудительно очищаем кэш разделов при загрузке
    localStorage.removeItem('admin_sections');
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      // Загрузка категорий
      await loadCategories(config);
      
      // Загрузка разделов
      await loadSections(config);
      
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async (config) => {
    try {
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('categories');
          if (response.success && response.data) {
            setCategories(response.data);
            localStorage.setItem('admin_categories', JSON.stringify(response.data));
            return;
          }
        } catch (serverError) {
          console.log('Сервер недоступен, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    }

    // Fallback: загружаем из localStorage
    const savedCategories = localStorage.getItem('admin_categories');
    if (savedCategories) {
      const categories = JSON.parse(savedCategories);
      setCategories(categories);
      console.log('Категории загружены из кэша:', categories);
    } else {
      // Полный список категорий
      const defaultCategories = [
        { id: 1, name_ru: 'Детская', name_en: 'children', icon_type: 'emoji', icon_data: '🧸', position: 1 },
        { id: 2, name_ru: 'Кухня', name_en: 'kitchen', icon_type: 'emoji', icon_data: '🍳', position: 2 },
        { id: 3, name_ru: 'Мебель', name_en: 'furniture', icon_type: 'emoji', icon_data: '🪑', position: 3 },
        { id: 4, name_ru: 'Гардероб', name_en: 'wardrobe', icon_type: 'emoji', icon_data: '👔', position: 4 },
        { id: 5, name_ru: 'Освещение', name_en: 'lighting', icon_type: 'emoji', icon_data: '💡', position: 5 },
        { id: 6, name_ru: 'Санузел', name_en: 'bathroom', icon_type: 'emoji', icon_data: '🚿', position: 6 },
        { id: 7, name_ru: 'Ландшафт', name_en: 'landscape', icon_type: 'emoji', icon_data: '🌳', position: 7 },
        { id: 8, name_ru: 'Транспорт', name_en: 'transport', icon_type: 'emoji', icon_data: '🚗', position: 8 },
        { id: 9, name_ru: 'Магазин', name_en: 'shop', icon_type: 'emoji', icon_data: '🏪', position: 9 },
        { id: 10, name_ru: 'Интерьер', name_en: 'interior', icon_type: 'emoji', icon_data: '🏠', position: 10 },
        { id: 11, name_ru: 'Техника', name_en: 'electronics', icon_type: 'emoji', icon_data: '📱', position: 11 },
        { id: 12, name_ru: 'Разное', name_en: 'misc', icon_type: 'emoji', icon_data: '📦', position: 12 },
        { id: 13, name_ru: 'Скрипты', name_en: 'scripts', icon_type: 'emoji', icon_data: '⚙️', position: 13 },
        { id: 14, name_ru: 'Архитектура', name_en: 'architecture', icon_type: 'emoji', icon_data: '🏢', position: 14 },
        { id: 15, name_ru: 'Декор', name_en: 'decor', icon_type: 'emoji', icon_data: '🎨', position: 15 }
      ];
      localStorage.setItem('admin_categories', JSON.stringify(defaultCategories));
      setCategories(defaultCategories);
      console.log('Загружены дефолтные категории:', defaultCategories);
    }
  };

  const loadSections = async (config) => {
    try {
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('sections', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              console.log('Разделы загружены с сервера:', result.data);
              setSections(result.data);
              localStorage.setItem('admin_sections', JSON.stringify(result.data));
              return;
            }
          }
          throw new Error('Ошибка ответа сервера разделов');
        } catch (serverError) {
          console.log('Сервер недоступен для разделов, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки разделов:', error);
    }

    // Загружаем из кэша или создаем дефолтные разделы
    const cachedSections = localStorage.getItem('admin_sections');
    if (cachedSections) {
      try {
        const sectionsData = JSON.parse(cachedSections);
        setSections(sectionsData);
        console.log('Разделы загружены из кэша:', sectionsData);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша разделов:', e);
      }
    }

    // Создаем дефолтные разделы
    const defaultSections = [
      { id: 1, category_id: 1, name: 'Жилые здания', name_en: 'residential', icon: '🏠', position: 1 },
      { id: 2, category_id: 1, name: 'Коммерческие', name_en: 'commercial', icon: '🏢', position: 2 },
      { id: 3, category_id: 1, name: 'Промышленные', name_en: 'industrial', icon: '🏭', position: 3 },
      { id: 4, category_id: 1, name: 'Общественные', name_en: 'public', icon: '🏛️', position: 4 },
      { id: 5, category_id: 1, name: 'Религиозные', name_en: 'religious', icon: '⛪', position: 5 }
    ];
    localStorage.setItem('admin_sections', JSON.stringify(defaultSections));
    setSections(defaultSections);
  };

  const handleInputChange = async (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    // Автоматический перевод для русского названия
    if (field === 'name_ru' && value && !manualEditEn) {
      // Очищаем предыдущий таймер
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
      
      // Устанавливаем новый таймер для перевода
      const timeoutId = setTimeout(async () => {
        if (value.trim()) {
          try {
            const translated = await translationService.translateText(value);
            setFormData(prev => ({
              ...prev,
              name_en: translated
            }));
          } catch (error) {
            console.error('Ошибка перевода:', error);
            // Fallback к транслитерации при ошибке
            setFormData(prev => ({
              ...prev,
              name_en: transliterate(value)
            }));
          }
        }
      }, 1500); // Переводим через 1.5 секунды после остановки печатания
      
      setTranslationTimeout(timeoutId);
    }
    
    // Сбрасываем флаг ручного редактирования при изменении русского
    if (field === 'name_ru') {
      setManualEditEn(false);
    }
    
    // Устанавливаем флаг ручного редактирования при изменении английского
    if (field === 'name_en') {
      setManualEditEn(true);
    }
    
    setFormData(newFormData);
  };

  const handleEditInputChange = async (field, value) => {
    const itemId = editingItem;
    const newFormData = { ...editFormData, [field]: value };
    
    if (field === 'name_ru' && value && !editManualEditEn[itemId]) {
      try {
        const translated = await translationService.translateText(value);
        newFormData.name_en = translated;
      } catch (error) {
        console.error('Ошибка перевода:', error);
        // Fallback к транслитерации при ошибке
        newFormData.name_en = transliterate(value);
      }
    }
    
    // Сбрасываем флаг ручного редактирования при изменении русского
    if (field === 'name_ru') {
      setEditManualEditEn(prev => ({...prev, [itemId]: false}));
    }
    
    // Устанавливаем флаг ручного редактирования при изменении английского
    if (field === 'name_en') {
      setEditManualEditEn(prev => ({...prev, [itemId]: true}));
    }
    
    setEditFormData(newFormData);
  };

  const handleFileUpload = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleInputChange(field, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEditFileUpload = (event, field) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleEditInputChange(field, e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const reorderPositions = (sections, itemId, newPosition) => {
    const maxPosition = sections.length;
    const targetPosition = Math.max(1, Math.min(parseInt(newPosition), maxPosition));
    
    const sortedSections = [...sections].sort((a, b) => a.position - b.position);
    const itemIndex = sortedSections.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return sections;
    
    const [movedItem] = sortedSections.splice(itemIndex, 1);
    sortedSections.splice(targetPosition - 1, 0, movedItem);
    
    return sortedSections.map((item, index) => ({
      ...item,
      position: index + 1
    }));
  };

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > sections.length) return;
    
    const currentItem = sections.find(s => s.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedSections = reorderPositions(sections, itemId, position);
    setSections([...reorderedSections]);
    localStorage.setItem('admin_sections', JSON.stringify(reorderedSections));
  };

  const addSection = async () => {
    if (!formData.name_ru.trim() || !formData.category_id) {
      alert('Введите название раздела и выберите категорию');
      return;
    }

    try {
      const newSection = {
        id: Math.max(...sections.map(s => s.id), 0) + 1,
        category_id: parseInt(formData.category_id),
        name_ru: formData.name_ru,
        name_en: formData.name_en || transliterate(formData.name_ru),
        icon_type: formData.icon_type,
        icon_data: formData.icon_data,
        icon_position: formData.icon_position,
        position: Math.max(...sections.filter(s => s.category_id === parseInt(formData.category_id)).map(s => s.position), 0) + 1,
        count: 0
      };

      const updatedSections = [...sections, newSection];
      localStorage.setItem('admin_sections', JSON.stringify(updatedSections));
      setSections(updatedSections);
      
      setFormData({
        name_ru: '',
        name_en: '',
        category_id: '',
        icon_type: 'emoji',
        icon_data: '',
        icon_position: 'left'
      });
    } catch (error) {
      console.error('Ошибка при добавлении раздела:', error);
    }
  };

  const startEdit = (section) => {
    setEditingItem(section.id);
    setEditFormData({
      name_ru: section.name || section.name_ru,
      name_en: section.name_en,
      category_id: section.category_id,
      icon_type: section.icon_type,
      icon_data: section.icon_data,
      icon_position: section.icon_position,
      position: section.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name_ru?.trim()) {
      alert('Введите название');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedSections = sections.map(section => 
        section.id === editingItem 
          ? { ...section, ...editFormData, name_en: editFormData.name_en || transliterate(editFormData.name_ru) }
          : section
      );
      
      localStorage.setItem('admin_sections', JSON.stringify(updatedSections));
      setSections(updatedSections);
      
      setLastUpdated(editingItem);
      setTimeout(() => setLastUpdated(null), 2000);
      
      cancelEdit();
    } catch (error) {
      console.error('Ошибка при сохранении:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const deleteSection = async (id) => {
    if (!window.confirm('Удалить этот раздел?')) return;
    
    const updatedSections = sections.filter(s => s.id !== id);
    setSections(updatedSections);
    localStorage.setItem('admin_sections', JSON.stringify(updatedSections));
  };



  const moveItem = async (id, direction) => {
    const section = sections.find(s => s.id === id);
    const categorySections = sections.filter(s => s.category_id === section.category_id).sort((a, b) => a.position - b.position);
    const currentIndex = categorySections.findIndex(s => s.id === id);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === categorySections.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedSections = [...sections];
    
    const currentSection = updatedSections.find(s => s.id === id);
    const targetSection = updatedSections.find(s => s.id === categorySections[newIndex].id);
    
    const tempPosition = currentSection.position;
    currentSection.position = targetSection.position;
    targetSection.position = tempPosition;
    
    setSections(updatedSections);
    localStorage.setItem('admin_sections', JSON.stringify(updatedSections));
    
    // Сохраняем на сервер
    try {
      const savedSettings = localStorage.getItem('admin_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : { STORAGE_MODE: 'hybrid' };
      
      if (settings.STORAGE_MODE === 'api' || settings.STORAGE_MODE === 'hybrid') {
        const response = await fetch('/api/api_sections.php', {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'update_positions',
            sections: updatedSections.map(section => ({
              id: section.id,
              position: section.position
            }))
          })
        });
        
        if (!response.ok) {
          console.log('Не удалось сохранить позиции разделов на сервере');
        }
      }
    } catch (error) {
      console.log('Ошибка сохранения позиций разделов на сервере:', error);
    }
  };

  const renderIcon = (item) => {
    if (item.icon_type === 'emoji') {
      return <span className="text-xl">{item.icon_data}</span>;
    } else if (item.icon_type === 'url') {
      return item.icon_data ? (
        <img src={item.icon_data} alt="Icon" className="w-6 h-6 object-contain" onError={(e) => {
          e.target.style.display = 'none';
        }} />
      ) : <span className="text-xl">🔗</span>;
    } else if (item.icon_type === 'code') {
      return (
        <div 
          className="w-6 h-6 flex items-center justify-center"
          dangerouslySetInnerHTML={{ __html: item.icon_data || '📄' }}
        />
      );
    }
    return <span className="text-xl">📄</span>;
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name_ru : 'Неизвестная категория';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка разделов...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-3">📂</span>
          Управление разделами
        </h2>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <span className="text-gray-500 mr-2">📂</span>
            Разделы ({selectedCategoryId ? sections.filter(s => s.category_id == selectedCategoryId).length : 0})
          </h3>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Выберите категорию для просмотра разделов:
          </label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="">Выберите категорию</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name_ru}</option>
            ))}
          </select>
        </div>

        <div className="bg-gradient-to-r from-gray-50 to-indigo-50 border border-gray-200 p-6 rounded-xl mb-8 shadow-sm">
          <h4 className="font-semibold text-gray-600 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Добавить новый раздел
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name_ru}
                onChange={(e) => handleInputChange('name_ru', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                placeholder="Название (рус)"
              />
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                placeholder="Название (eng)"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <select
                value={formData.category_id}
                onChange={(e) => handleInputChange('category_id', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
              >
                <option value="">Выберите категорию</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id}>{category.name_ru}</option>
                ))}
              </select>
              <select
                value={formData.icon_type}
                onChange={(e) => handleInputChange('icon_type', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
              >
                <option value="emoji">Emoji</option>
                <option value="code">Код иконки</option>
                <option value="url">URL изображения</option>
              </select>
              <select
                value={formData.icon_position}
                onChange={(e) => handleInputChange('icon_position', e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
              >
                <option value="left">Слева</option>
                <option value="right">Справа</option>
                <option value="top">Сверху</option>
                <option value="bottom">Снизу</option>
              </select>
            </div>
            {formData.icon_type === 'url' ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={formData.icon_data}
                  onChange={(e) => handleInputChange('icon_data', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                  placeholder="Введите URL изображения (https://example.com/icon.png)"
                />
                <div className="text-center text-gray-500">или</div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileUpload(e, 'icon_data')}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-500 hover:file:bg-blue-100"
                />
              </div>
            ) : formData.icon_type === 'code' ? (
              <textarea
                value={formData.icon_data}
                onChange={(e) => handleInputChange('icon_data', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 h-24 resize-none"
                placeholder="Введите HTML код иконки (например: <i class='fa fa-home'></i> или <svg>...</svg>)"
              />
            ) : (
              <input
                type="text"
                value={formData.icon_data}
                onChange={(e) => handleInputChange('icon_data', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200"
                placeholder="Введите emoji (🏠, 📁, 🎨, etc.)"
              />
            )}
            <button
              onClick={addSection}
              className="w-full bg-gradient-to-r from-gray-500 to-purple-600 hover:from-gray-400 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Добавить раздел
              </span>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {selectedCategoryId ? (
            sections
              .filter(s => s.category_id == selectedCategoryId)
              .sort((a, b) => a.position - b.position)
              .map((section, index) => (
            <div 
              key={section.id}
              className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                editingItem === section.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg animate-slideIn'
                  : lastUpdated === section.id
                  ? 'bg-green-100 border-2 border-green-300 animate-pulse-custom shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === section.id ? (
                <div className="space-y-4 animate-slideIn">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFormData.name_ru || ''}
                      onChange={(e) => handleEditInputChange('name_ru', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Название (рус)"
                    />
                    <input
                      type="text"
                      value={editFormData.name_en || ''}
                      onChange={(e) => handleEditInputChange('name_en', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      placeholder="Название (eng)"
                    />
                  </div>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select
                        value={editFormData.icon_type || 'emoji'}
                        onChange={(e) => handleEditInputChange('icon_type', e.target.value)}
                        className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="emoji">Emoji</option>
                        <option value="code">Код иконки</option>
                        <option value="url">URL изображения</option>
                      </select>
                      <select
                        value={editFormData.icon_position || 'left'}
                        onChange={(e) => handleEditInputChange('icon_position', e.target.value)}
                        className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                      >
                        <option value="left">Слева</option>
                        <option value="right">Справа</option>
                        <option value="top">Сверху</option>
                        <option value="bottom">Снизу</option>
                      </select>
                    </div>
                    <div>
                      {editFormData.icon_type === 'url' ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editFormData.icon_data || ''}
                            onChange={(e) => handleEditInputChange('icon_data', e.target.value)}
                            className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                            placeholder="URL изображения"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleEditFileUpload(e, 'icon_data')}
                            className="w-full text-xs file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-green-50 file:text-green-700"
                          />
                        </div>
                      ) : editFormData.icon_type === 'code' ? (
                        <textarea
                          value={editFormData.icon_data || ''}
                          onChange={(e) => handleEditInputChange('icon_data', e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200 h-16 resize-none text-sm"
                          placeholder="HTML код"
                        />
                      ) : (
                        <input
                          type="text"
                          value={editFormData.icon_data || ''}
                          onChange={(e) => handleEditInputChange('icon_data', e.target.value)}
                          className="w-full px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                          placeholder="Emoji"
                        />
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className={`flex-1 px-4 py-2 text-sm font-medium text-white border border-transparent rounded-lg transition-all duration-200 transform ${
                        saving 
                          ? 'bg-green-400 cursor-not-allowed' 
                          : 'bg-green-500 hover:bg-green-600 hover:scale-105 active:scale-95 shadow-md'
                      }`}
                    >
                      <span className="flex items-center justify-center">
                        {saving ? (
                          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                          </svg>
                        )}
                        {saving ? 'Сохранение...' : 'Сохранить'}
                      </span>
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 shadow-md"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        value={section.position}
                        onChange={(e) => handlePositionChange(section.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 text-gray-400 hover:border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                        min="1"
                        max={sections.length}
                      />
                      {renderIcon(section)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-600">{section.name || section.name_ru}</h4>
                      <p className="text-xs text-gray-500">{section.name_en}</p>
                      <p className="text-sm text-gray-400">
                        {getCategoryName(section.category_id)} • {section.count} моделей
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveItem(section.id, 'up')}
                      disabled={index === 0}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        index === 0 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-gray-400 hover:bg-gray-50 transform hover:scale-110'
                      }`}
                      title="Переместить вверх"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 15l7-7 7 7"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => moveItem(section.id, 'down')}
                      disabled={index === sections.length - 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        index === sections.length - 1 
                          ? 'text-gray-300 cursor-not-allowed' 
                          : 'text-gray-500 hover:text-gray-400 hover:bg-gray-50 transform hover:scale-110'
                      }`}
                      title="Переместить вниз"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                      </svg>
                    </button>
                    
                    <input 
                      type="checkbox" 
                      defaultChecked 
                      className="rounded border-gray-300 text-gray-400 focus:ring-gray-500 transition-all duration-200"
                      title="Активен"
                    />
                    
                    <button
                      onClick={() => startEdit(section)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-500 hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
                      title="Редактировать"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => deleteSection(section.id)}
                      className="p-2 rounded-lg text-red-500 hover:text-red-700 hover:bg-red-50 transition-all duration-200 transform hover:scale-110"
                      title="Удалить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              <div className="text-6xl mb-4">📂</div>
              <p className="text-lg">Выберите категорию для просмотра разделов</p>
              <p className="text-sm mt-2">Разделы будут показаны только после выбора категории</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FilterSections;
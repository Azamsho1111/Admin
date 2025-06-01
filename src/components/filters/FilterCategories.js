import React, { useState, useEffect } from "react";
import translationService from '../../services/translationService';
import apiConfig from '../../services/apiConfigService';
import { useModalContext } from '../ModalProvider';

const FilterCategories = () => {
  const { success, error, warning } = useModalContext();
  const [categories, setCategories] = useState([]);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    icon_type: 'emoji',
    icon_data: '',
    icon_position: 'left',
    position: 0
  });
  const [editFormData, setEditFormData] = useState({});
  const [manualEditEn, setManualEditEn] = useState(false);
  const [editManualEditEn, setEditManualEditEn] = useState({});
  const [translationTimeout, setTranslationTimeout] = useState(null);

  // Функция транслитерации
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
    // Принудительно очищаем старые данные и загружаем новые
    localStorage.removeItem('admin_categories');
    loadCategories();
  }, []); // Убираем зависимость от translationTimeout
  
  useEffect(() => {
    // Очищаем таймер при размонтировании компонента
    return () => {
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
    };
  }, [translationTimeout]);

  const loadSections = async (settings) => {
    try {
      if (settings.STORAGE_MODE === 'api' || settings.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('/sections.json', {
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              setSections(result.data);
              localStorage.setItem('admin_sections', JSON.stringify(result.data));
              return;
            }
          }
        } catch (error) {
          console.log('Сервер недоступен для разделов, загружаем из кэша:', error);
        }
      }
      
      // Загружаем из кэша
      const cachedSections = localStorage.getItem('admin_sections');
      if (cachedSections) {
        setSections(JSON.parse(cachedSections));
      }
    } catch (error) {
      console.error('Ошибка загрузки разделов:', error);
    }
  };

  const getSectionCount = (categoryId) => {
    return sections.filter(section => section.category_id == categoryId).length;
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      // Сначала пытаемся загрузить с сервера
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('/categories.json');

          if (response.success && response.data) {
            console.log('Категории загружены с сервера:', response.data);
            setCategories(response.data);
            
            // Кэшируем данные локально
            localStorage.setItem('admin_categories', JSON.stringify(response.data));
            
            // Загружаем разделы для подсчета
            await loadSections(config);
            return;
          }
          throw new Error('Ошибка ответа сервера');
        } catch (serverError) {
          console.log('Сервер недоступен, загружаем из кэша:', serverError);
        }
      }
      
      // Fallback: загружаем из localStorage
      const savedCategories = localStorage.getItem('admin_categories');
      if (savedCategories) {
        const data = JSON.parse(savedCategories);
        
        // Автоматически исправляем дублированные позиции
        const fixedCategories = data
          .sort((a, b) => a.position - b.position)
          .map((category, index) => ({
            ...category,
            position: index + 1
          }));
        
        setCategories(fixedCategories);
        
        // Загружаем разделы для подсчета
        await loadSections({ STORAGE_MODE: 'local' });
      } else {
        // Полный список категорий
        const defaultCategories = [
          { id: 1, name_ru: 'Детская', name_en: 'children', icon_type: 'emoji', icon_data: '🧸', icon_position: 'left', position: 1, count: 0 },
          { id: 2, name_ru: 'Кухня', name_en: 'kitchen', icon_type: 'emoji', icon_data: '🍳', icon_position: 'left', position: 2, count: 0 },
          { id: 3, name_ru: 'Мебель', name_en: 'furniture', icon_type: 'emoji', icon_data: '🪑', icon_position: 'left', position: 3, count: 0 },
          { id: 4, name_ru: 'Гардероб', name_en: 'wardrobe', icon_type: 'emoji', icon_data: '👔', icon_position: 'left', position: 4, count: 0 },
          { id: 5, name_ru: 'Освещение', name_en: 'lighting', icon_type: 'emoji', icon_data: '💡', icon_position: 'left', position: 5, count: 0 },
          { id: 6, name_ru: 'Санузел', name_en: 'bathroom', icon_type: 'emoji', icon_data: '🚿', icon_position: 'left', position: 6, count: 0 },
          { id: 7, name_ru: 'Ландшафт', name_en: 'landscape', icon_type: 'emoji', icon_data: '🌳', icon_position: 'left', position: 7, count: 0 },
          { id: 8, name_ru: 'Транспорт', name_en: 'transport', icon_type: 'emoji', icon_data: '🚗', icon_position: 'left', position: 8, count: 0 },
          { id: 9, name_ru: 'Магазин', name_en: 'shop', icon_type: 'emoji', icon_data: '🏪', icon_position: 'left', position: 9, count: 0 },
          { id: 10, name_ru: 'Интерьер', name_en: 'interior', icon_type: 'emoji', icon_data: '🏠', icon_position: 'left', position: 10, count: 0 },
          { id: 11, name_ru: 'Техника', name_en: 'electronics', icon_type: 'emoji', icon_data: '📱', icon_position: 'left', position: 11, count: 0 },
          { id: 12, name_ru: 'Разное', name_en: 'misc', icon_type: 'emoji', icon_data: '📦', icon_position: 'left', position: 12, count: 0 },
          { id: 13, name_ru: 'Скрипты', name_en: 'scripts', icon_type: 'emoji', icon_data: '⚙️', icon_position: 'left', position: 13, count: 0 },
          { id: 14, name_ru: 'Архитектура', name_en: 'architecture', icon_type: 'emoji', icon_data: '🏢', icon_position: 'left', position: 14, count: 0 },
          { id: 15, name_ru: 'Декор', name_en: 'decor', icon_type: 'emoji', icon_data: '🎨', icon_position: 'left', position: 15, count: 0 },
          { id: 16, name_ru: 'Детская', name_en: 'children_2', icon_type: 'emoji', icon_data: '🧸', icon_position: 'left', position: 16, count: 0 },
          { id: 17, name_ru: 'Кухня', name_en: 'kitchen_2', icon_type: 'emoji', icon_data: '🍳', icon_position: 'left', position: 17, count: 0 },
          { id: 18, name_ru: 'Мебель', name_en: 'furniture_2', icon_type: 'emoji', icon_data: '🪑', icon_position: 'left', position: 18, count: 0 },
          { id: 19, name_ru: 'Гардероб', name_en: 'wardrobe_2', icon_type: 'emoji', icon_data: '👔', icon_position: 'left', position: 19, count: 0 },
          { id: 20, name_ru: 'Освещение', name_en: 'lighting_2', icon_type: 'emoji', icon_data: '💡', icon_position: 'left', position: 20, count: 0 },
          { id: 21, name_ru: 'Санузел', name_en: 'bathroom_2', icon_type: 'emoji', icon_data: '🚿', icon_position: 'left', position: 21, count: 0 },
          { id: 22, name_ru: 'Ландшафт', name_en: 'landscape_2', icon_type: 'emoji', icon_data: '🌳', icon_position: 'left', position: 22, count: 0 },
          { id: 23, name_ru: 'Транспорт', name_en: 'transport_2', icon_type: 'emoji', icon_data: '🚗', icon_position: 'left', position: 23, count: 0 },
          { id: 24, name_ru: 'Интерьер', name_en: 'interior_2', icon_type: 'emoji', icon_data: '🏠', icon_position: 'left', position: 24, count: 0 },
          { id: 25, name_ru: 'Магазин', name_en: 'shop_2', icon_type: 'emoji', icon_data: '🏪', icon_position: 'left', position: 25, count: 0 },
          { id: 26, name_ru: 'Техника', name_en: 'electronics_2', icon_type: 'emoji', icon_data: '📱', icon_position: 'left', position: 26, count: 0 },
          { id: 27, name_ru: 'Разное', name_en: 'misc_2', icon_type: 'emoji', icon_data: '📦', icon_position: 'left', position: 27, count: 0 },
          { id: 28, name_ru: 'Скрипты', name_en: 'scripts_2', icon_type: 'emoji', icon_data: '⚙️', icon_position: 'left', position: 28, count: 0 }
        ];
        localStorage.setItem('admin_categories', JSON.stringify(defaultCategories));
        setCategories(defaultCategories);
      }
    } catch (error) {
      console.error('Ошибка загрузки категорий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = async (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'name_ru' && value && !manualEditEn) {
      // Очищаем предыдущий таймер
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
      
      // Устанавливаем новый таймер для перевода после того как пользователь закончил печатать
      const timeoutId = setTimeout(async () => {
        if (!manualEditEn) {
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

  const reorderPositions = (categories, itemId, newPosition) => {
    const maxPosition = categories.length;
    const targetPosition = Math.max(1, Math.min(parseInt(newPosition), maxPosition));
    
    // Создаем копию массива, отсортированную по текущим позициям
    const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
    
    // Находим перемещаемый элемент
    const itemIndex = sortedCategories.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return categories;
    
    // Удаляем элемент из текущей позиции
    const [movedItem] = sortedCategories.splice(itemIndex, 1);
    
    // Вставляем элемент в новую позицию (позиция - 1 для индекса массива)
    sortedCategories.splice(targetPosition - 1, 0, movedItem);
    
    // Пересчитываем позиции для всех элементов
    return sortedCategories.map((item, index) => ({
      ...item,
      position: index + 1
    }));
  };

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > categories.length) return;
    
    // Находим текущую позицию элемента
    const currentItem = categories.find(c => c.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedCategories = reorderPositions(categories, itemId, position);
    
    // Обновляем состояние и сохраняем
    setCategories([...reorderedCategories]);
    localStorage.setItem('admin_categories', JSON.stringify(reorderedCategories));
    
    console.log(`Позиция изменена: ${currentItem.name || currentItem.name_ru} с ${currentItem.position} на ${position}`);
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

  const addCategory = async () => {
    if (!formData.name_ru.trim()) {
      alert('Введите название категории');
      return;
    }

    setSaving(true);
    try {
      const newCategory = {
        name_ru: formData.name_ru.trim(),
        name_en: formData.name_en.trim() || transliterate(formData.name_ru.trim()),
        icon_type: formData.icon_type || 'emoji',
        icon_data: formData.icon_data || '📁',
        icon_position: formData.icon_position || 'left',
        position: Math.max(...categories.map(c => c.position), 0) + 1
      };

      console.log('Добавляется новая категория:', newCategory);
      
      // Сначала пытаемся сохранить на сервере
      const savedSettings = localStorage.getItem('admin_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : { API_BASE_URL: 'u185465.test-handyhost.ru' };
      
      try {
        const response = await fetch('/api/api_categories.php', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            action: 'create',
            ...newCategory
          })
        });

        if (response.ok) {
          const result = await response.json();
          console.log('Категория сохранена на сервере:', result);
          
          // Добавляем ID от сервера
          const categoryWithId = {
            id: result.id || Math.max(...categories.map(c => c.id), 0) + 1,
            ...newCategory,
            count: 0
          };
          
          const updatedCategories = [...categories, categoryWithId];
          setCategories(updatedCategories);
          localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
          
        } else {
          throw new Error('Ошибка сервера: ' + response.status);
        }
      } catch (serverError) {
        console.log('Сервер недоступен, сохраняем локально:', serverError);
        
        // Fallback: сохраняем локально если сервер недоступен
        const categoryWithLocalId = {
          id: Math.max(...categories.map(c => c.id), 0) + 1,
          ...newCategory,
          count: 0
        };
        
        const updatedCategories = [...categories, categoryWithLocalId];
        setCategories(updatedCategories);
        localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
        
        alert('Сервер недоступен. Категория сохранена локально и будет синхронизирована позже.');
      }
      
      setLastUpdated(new Date().toLocaleString());
      
      // Очищаем форму
      setFormData({
        name_ru: '',
        name_en: '',
        icon_type: 'emoji',
        icon_data: '',
        icon_position: 'left',
        position: 0
      });

      // Сбрасываем флаги
      setManualEditEn(false);
      
      console.log('Категория успешно добавлена');
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      alert('Ошибка при добавлении категории: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (category) => {
    setEditingItem(category.id);
    setEditFormData({
      name_ru: category.name || category.name_ru,
      name_en: category.name_en,
      icon_type: category.icon_type,
      icon_data: category.icon_data,
      icon_position: category.icon_position,
      position: category.position
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

      const updatedCategories = categories.map(cat => 
        cat.id === editingItem 
          ? { ...cat, ...editFormData, name_en: editFormData.name_en || transliterate(editFormData.name_ru) }
          : cat
      );
      setCategories(updatedCategories);
      localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
      
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

  const deleteCategory = async (id) => {
    if (!window.confirm('Удалить категорию и все её разделы?')) return;
    
    const updatedCategories = categories.filter(c => c.id !== id);
    setCategories(updatedCategories);
    localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
    
    const savedSections = localStorage.getItem('admin_sections');
    if (savedSections) {
      const allSections = JSON.parse(savedSections);
      const filteredSections = allSections.filter(s => s.category_id !== id);
      localStorage.setItem('admin_sections', JSON.stringify(filteredSections));
    }
  };

  const updatePosition = async (id, newPosition) => {
    if (newPosition < 1) return;
    
    const updatedCategories = categories.map(cat => 
      cat.id === id ? { ...cat, position: newPosition } : cat
    );
    setCategories(updatedCategories);
    localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
  };

  const moveItem = async (id, direction) => {
    const sortedCategories = [...categories].sort((a, b) => a.position - b.position);
    const currentIndex = sortedCategories.findIndex(cat => cat.id === id);
    
    if ((direction === 'up' && currentIndex === 0) || 
        (direction === 'down' && currentIndex === sortedCategories.length - 1)) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedCategories = [...categories];
    
    const currentCat = updatedCategories.find(cat => cat.id === id);
    const targetCat = updatedCategories.find(cat => cat.id === sortedCategories[newIndex].id);
    
    const tempPosition = currentCat.position;
    currentCat.position = targetCat.position;
    targetCat.position = tempPosition;
    
    // Обновляем локальное состояние
    setCategories(updatedCategories);
    localStorage.setItem('admin_categories', JSON.stringify(updatedCategories));
    
    // Сохраняем на сервер
    try {
      const savedSettings = localStorage.getItem('admin_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : { STORAGE_MODE: 'hybrid' };
      
      if (settings.STORAGE_MODE === 'api' || settings.STORAGE_MODE === 'hybrid') {
        const response = await fetch('/api/api_categories.php', {
          method: 'PUT',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            action: 'update_positions',
            categories: updatedCategories.map(cat => ({
              id: cat.id,
              position: cat.position
            }))
          })
        });
        
        if (!response.ok) {
          console.log('Не удалось сохранить позиции на сервере');
        }
      }
    } catch (error) {
      console.log('Ошибка сохранения позиций на сервере:', error);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка категорий...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white flex items-center">
          <span className="mr-3">📁</span>
          Управление категориями
        </h2>
      </div>
      
      <div className="p-6">
        {/* Форма добавления категории */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200 p-6 rounded-xl mb-6 shadow-sm">
          <h4 className="font-semibold text-gray-600 mb-4 flex items-center">
            <span className="mr-2">✨</span>
            Добавить новую категорию
          </h4>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name_ru}
                onChange={(e) => handleInputChange('name_ru', e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Название (рус)"
              />
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base"
                placeholder="Название (eng)"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <select
                value={formData.icon_type}
                onChange={(e) => handleInputChange('icon_type', e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base"
              >
                <option value="emoji">Emoji</option>
                <option value="code">Код иконки</option>
                <option value="url">URL изображения</option>
              </select>
              <select
                value={formData.icon_position}
                onChange={(e) => handleInputChange('icon_position', e.target.value)}
                className="px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 text-sm sm:text-base"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all duration-200 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-orange-700 hover:file:bg-orange-100"
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
              onClick={addCategory}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-400 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg"
            >
              <span className="flex items-center justify-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                </svg>
                Добавить категорию
              </span>
            </button>
          </div>
        </div>

        {/* Список категорий */}
        <div className="space-y-4">
          {categories.sort((a, b) => a.position - b.position).map((category, index) => (
            <div 
              key={category.id}
              className={`p-4 rounded-lg transition-all duration-300 transform hover:scale-102 ${
                editingItem === category.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg animate-slideIn'
                  : lastUpdated === category.id
                  ? 'bg-green-100 border-2 border-green-300 animate-pulse-custom shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === category.id ? (
                /* Inline Editing Mode */
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
                  <div className="grid grid-cols-3 gap-3">
                    <select
                      value={editFormData.icon_type || 'emoji'}
                      onChange={(e) => handleEditInputChange('icon_type', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                    >
                      <option value="emoji">Emoji</option>
                      <option value="code">Код иконки</option>
                      <option value="url">URL изображения</option>
                    </select>
                    <div className="space-y-2">
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
                /* Normal Display Mode */
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        value={category.position}
                        onChange={(e) => handlePositionChange(category.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 text-gray-400 hover:border-gray-400 focus:border-gray-500 focus:ring-1 focus:ring-gray-500 transition-all duration-200"
                        min="1"
                        max={categories.length}
                      />
                      {renderIcon(category)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-600">{category.name || category.name_ru}</h4>
                      <p className="text-xs text-gray-500">{category.name_en}</p>
                      <p className="text-sm text-gray-400">
                        {category.models_count || category.count || 0} моделей • {category.sections_count || getSectionCount(category.id)} разделов
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => moveItem(category.id, 'up')}
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
                      onClick={() => moveItem(category.id, 'down')}
                      disabled={index === categories.length - 1}
                      className={`p-2 rounded-lg transition-all duration-200 ${
                        index === categories.length - 1 
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
                      title="Активна"
                    />
                    
                    <button
                      onClick={() => startEdit(category)}
                      className="p-2 rounded-lg text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-all duration-200 transform hover:scale-110"
                      title="Редактировать"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => deleteCategory(category.id)}
                      className="p-2 rounded-lg text-gray-500 hover:text-gray-500 hover:bg-gray-50 transition-all duration-200 transform hover:scale-110"
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default FilterCategories;
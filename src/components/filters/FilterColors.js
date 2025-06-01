import React, { useState, useEffect } from 'react';
import { apiConfig } from '../../services/apiConfigService';

const FilterColors = () => {
  const [colors, setColors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    hex: '#000000'
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadColors();
  }, []);

  const loadColors = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('colors');
          if (response.success && response.data) {
            console.log('Цвета загружены с сервера:', response.data);
            setColors(response.data);
            localStorage.setItem('admin_colors', JSON.stringify(response.data));
            setLoading(false);
            return;
          }
          throw new Error('Ошибка ответа сервера цветов');
        } catch (serverError) {
          console.log('Сервер недоступен для цветов, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки цветов:', error);
    }

    // Загружаем из кэша или создаем дефолтные цвета
    const cachedColors = localStorage.getItem('admin_colors');
    if (cachedColors) {
      try {
        const colorData = JSON.parse(cachedColors);
        setColors(colorData);
        console.log('Цвета загружены из кэша:', colorData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша цветов:', e);
      }
    }

    // Создаем дефолтные цвета
    const defaultColors = [
      { id: 1, name: 'Красный', name_en: 'red', hex: '#ef4444', position: 1 },
      { id: 2, name: 'Синий', name_en: 'blue', hex: '#3b82f6', position: 2 },
      { id: 3, name: 'Зеленый', name_en: 'green', hex: '#22c55e', position: 3 },
      { id: 4, name: 'Желтый', name_en: 'yellow', hex: '#eab308', position: 4 },
      { id: 5, name: 'Черный', name_en: 'black', hex: '#000000', position: 5 },
      { id: 6, name: 'Белый', name_en: 'white', hex: '#ffffff', position: 6 },
      { id: 7, name: 'Серый', name_en: 'gray', hex: '#6b7280', position: 7 },
      { id: 8, name: 'Коричневый', name_en: 'brown', hex: '#92400e', position: 8 }
    ];
    localStorage.setItem('admin_colors', JSON.stringify(defaultColors));
    setColors(defaultColors);
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > colors.length) return;
    
    const currentItem = colors.find(c => c.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedColors = reorderPositions(colors, itemId, position);
    setColors([...reorderedColors]);
    localStorage.setItem('admin_colors', JSON.stringify(reorderedColors));
  };

  const reorderPositions = (items, itemId, newPosition) => {
    const maxPosition = items.length;
    const targetPosition = Math.max(1, Math.min(parseInt(newPosition), maxPosition));
    
    const sortedItems = [...items].sort((a, b) => a.position - b.position);
    const itemIndex = sortedItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return items;
    
    const [movedItem] = sortedItems.splice(itemIndex, 1);
    sortedItems.splice(targetPosition - 1, 0, movedItem);
    
    return sortedItems.map((item, index) => ({
      ...item,
      position: index + 1
    }));
  };

  const addColor = async () => {
    if (!formData.name.trim() || !formData.hex.trim()) {
      alert('Введите название и цвет');
      return;
    }

    try {
      const newColor = {
        id: Math.max(...colors.map(c => c.id), 0) + 1,
        name: formData.name,
        hex: formData.hex,
        position: Math.max(...colors.map(c => c.position), 0) + 1
      };

      const updatedColors = [...colors, newColor];
      localStorage.setItem('admin_colors', JSON.stringify(updatedColors));
      setColors(updatedColors);
      
      setFormData({
        name: '',
        hex: '#000000'
      });
    } catch (error) {
      console.error('Ошибка при добавлении цвета:', error);
    }
  };

  const startEdit = (color) => {
    setEditingItem(color.id);
    setEditFormData({
      name: color.name,
      hex: color.hex,
      position: color.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name?.trim() || !editFormData.hex?.trim()) {
      alert('Введите название и цвет');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedColors = colors.map(color => 
        color.id === editingItem 
          ? { ...color, ...editFormData }
          : color
      );
      
      localStorage.setItem('admin_colors', JSON.stringify(updatedColors));
      setColors(updatedColors);
      
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

  const deleteColor = async (id) => {
    if (!window.confirm('Удалить этот цвет?')) return;
    
    const updatedColors = colors.filter(c => c.id !== id);
    setColors(updatedColors);
    localStorage.setItem('admin_colors', JSON.stringify(updatedColors));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка цветов...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white">
          Управление цветами
        </h2>
      </div>
      
      <div className="p-6">
        {/* Форма добавления цвета */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый цвет</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название цвета"
              />
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.hex}
                  onChange={(e) => handleInputChange('hex', e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.hex}
                  onChange={(e) => handleInputChange('hex', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <button
              onClick={addColor}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список цветов */}
        <div className="space-y-3">
          {colors.sort((a, b) => a.position - b.position).map((color) => (
            <div 
              key={color.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === color.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === color.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === color.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название цвета"
                    />
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editFormData.hex || '#000000'}
                        onChange={(e) => handleEditInputChange('hex', e.target.value)}
                        className="w-12 h-10 border border-green-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editFormData.hex || ''}
                        onChange={(e) => handleEditInputChange('hex', e.target.value)}
                        className="flex-1 px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                        placeholder="#000000"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={saveEdit}
                      disabled={saving}
                      className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-500 rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {saving ? 'Сохранение...' : 'Сохранить'}
                    </button>
                    <button
                      onClick={cancelEdit}
                      disabled={saving}
                      className="flex-1 px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Отмена
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex flex-col items-center">
                      <input
                        type="number"
                        value={color.position}
                        onChange={(e) => handlePositionChange(color.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={colors.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-lg border border-gray-300"
                        style={{ backgroundColor: color.hex }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{color.name}</span>
                            <span className="text-sm text-gray-500">{color.hex}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(color)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteColor(color.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

export default FilterColors;
import React, { useState, useEffect } from "react";
import { apiConfig } from '../../services/apiConfigService';

const FilterPolygons = () => {
  const [polygons, setPolygons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    min_polygons: '',
    max_polygons: '',
    color: '#4CAF50'
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadPolygons();
  }, []);

  const loadPolygons = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('polygons');
          if (response.status === 'success' && response.data) {
            console.log('Полигоны загружены с сервера:', response.data);
            setPolygons(response.data);
            localStorage.setItem('admin_polygons', JSON.stringify(response.data));
            return;
          }
        } catch (serverError) {
          console.log('Сервер недоступен для полигонов, загружаем из кэша:', serverError);
        }
      }
      
      // Загружаем из кэша или используем данные по умолчанию
      const savedPolygons = localStorage.getItem('admin_polygons');
      if (savedPolygons) {
        const data = JSON.parse(savedPolygons);
        console.log('Полигоны загружены из кэша:', data);
        setPolygons(data);
      } else {
        const defaultPolygons = [
          { id: 1, name: 'Low Poly', name_en: 'Low Poly', min_polygons: 1, max_polygons: 5000, color: '#4CAF50', position: 1 },
          { id: 2, name: 'Medium Poly', name_en: 'Medium Poly', min_polygons: 5001, max_polygons: 25000, color: '#FF9800', position: 2 },
          { id: 3, name: 'High Poly', name_en: 'High Poly', min_polygons: 25001, max_polygons: 100000, color: '#F44336', position: 3 },
          { id: 4, name: 'Ultra High Poly', name_en: 'Ultra High Poly', min_polygons: 100001, max_polygons: 999999999, color: '#9C27B0', position: 4 }
        ];
        localStorage.setItem('admin_polygons', JSON.stringify(defaultPolygons));
        setPolygons(defaultPolygons);
      }
    } catch (error) {
      console.error('Ошибка загрузки полигонов:', error);
      // При ошибке загружаем базовые данные
      const defaultPolygons = [
        { id: 1, name: 'Low Poly', name_en: 'Low Poly', min_polygons: 1, max_polygons: 5000, color: '#4CAF50', position: 1 }
      ];
      setPolygons(defaultPolygons);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateRange = (min, max, excludeId = null) => {
    const minNum = parseInt(min);
    const maxNum = parseInt(max);
    
    if (isNaN(minNum) || isNaN(maxNum) || minNum < 0 || maxNum < 0) {
      return 'Введите корректные числовые значения';
    }
    
    if (minNum >= maxNum) {
      return 'Минимум должен быть меньше максимума';
    }
    
    // Проверка пересечений с другими диапазонами
    for (const polygon of polygons) {
      if (excludeId && polygon.id === excludeId) continue;
      
      const existingMin = polygon.min_polygons;
      const existingMax = polygon.max_polygons;
      
      if ((minNum >= existingMin && minNum <= existingMax) ||
          (maxNum >= existingMin && maxNum <= existingMax) ||
          (minNum <= existingMin && maxNum >= existingMax)) {
        return `Диапазон пересекается с категорией "${polygon.name}"`;
      }
    }
    
    return null;
  };

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > polygons.length) return;
    
    const currentItem = polygons.find(p => p.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedPolygons = reorderPositions(polygons, itemId, position);
    setPolygons([...reorderedPolygons]);
    localStorage.setItem('admin_polygons', JSON.stringify(reorderedPolygons));
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

  const addPolygon = async () => {
    if (!formData.name.trim() || !formData.name_en.trim()) {
      alert('Введите название на русском и английском языках');
      return;
    }

    const validationError = validateRange(formData.min_polygons, formData.max_polygons);
    if (validationError) {
      alert(validationError);
      return;
    }

    try {
      const newPolygon = {
        id: Math.max(...polygons.map(p => p.id), 0) + 1,
        name: formData.name,
        name_en: formData.name_en,
        min_polygons: parseInt(formData.min_polygons),
        max_polygons: parseInt(formData.max_polygons),
        color: formData.color,
        position: Math.max(...polygons.map(p => p.position), 0) + 1
      };

      const updatedPolygons = [...polygons, newPolygon];
      localStorage.setItem('admin_polygons', JSON.stringify(updatedPolygons));
      setPolygons(updatedPolygons);
      
      setFormData({
        name: '',
        name_en: '',
        min_polygons: '',
        max_polygons: '',
        color: '#4CAF50'
      });
    } catch (error) {
      console.error('Ошибка при добавлении полигонажа:', error);
    }
  };

  const startEdit = (polygon) => {
    setEditingItem(polygon.id);
    setEditFormData({
      name: polygon.name,
      name_en: polygon.name_en || '',
      min_polygons: polygon.min_polygons,
      max_polygons: polygon.max_polygons,
      color: polygon.color || '#4CAF50',
      position: polygon.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name?.trim() || !editFormData.name_en?.trim()) {
      alert('Введите название на русском и английском языках');
      return;
    }

    const validationError = validateRange(editFormData.min_polygons, editFormData.max_polygons, editingItem);
    if (validationError) {
      alert(validationError);
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedPolygons = polygons.map(polygon => 
        polygon.id === editingItem 
          ? { 
              ...polygon, 
              ...editFormData,
              min_polygons: parseInt(editFormData.min_polygons),
              max_polygons: parseInt(editFormData.max_polygons)
            }
          : polygon
      );
      
      localStorage.setItem('admin_polygons', JSON.stringify(updatedPolygons));
      setPolygons(updatedPolygons);
      
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

  const deletePolygon = async (id) => {
    if (!window.confirm('Удалить эту категорию полигонажа?')) return;
    
    const updatedPolygons = polygons.filter(p => p.id !== id);
    setPolygons(updatedPolygons);
    localStorage.setItem('admin_polygons', JSON.stringify(updatedPolygons));
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка полигонажа...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white">
          Управление фильтрами
        </h2>
      </div>
      
      <div className="p-6">
        {/* Форма добавления категории */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новую категорию полигонажа</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название (русский)"
              />
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название (английский)"
              />
              <input
                type="number"
                value={formData.min_polygons}
                onChange={(e) => handleInputChange('min_polygons', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Мин. полигонов"
                min="0"
              />
              <input
                type="number"
                value={formData.max_polygons}
                onChange={(e) => handleInputChange('max_polygons', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Макс. полигонов"
                min="0"
              />
              <input
                type="color"
                value={formData.color}
                onChange={(e) => handleInputChange('color', e.target.value)}
                className="w-full h-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                title="Цвет категории"
              />
            </div>
            
            <button
              onClick={addPolygon}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список категорий */}
        <div className="space-y-3">
          {polygons.sort((a, b) => a.position - b.position).map((polygon) => (
            <div 
              key={polygon.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === polygon.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === polygon.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === polygon.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-5 gap-3">
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название (русский)"
                    />
                    <input
                      type="text"
                      value={editFormData.name_en || ''}
                      onChange={(e) => handleEditInputChange('name_en', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название (английский)"
                    />
                    <input
                      type="number"
                      value={editFormData.min_polygons || ''}
                      onChange={(e) => handleEditInputChange('min_polygons', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Мин. полигонов"
                      min="0"
                    />
                    <input
                      type="number"
                      value={editFormData.max_polygons || ''}
                      onChange={(e) => handleEditInputChange('max_polygons', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Макс. полигонов"
                      min="0"
                    />
                    <input
                      type="color"
                      value={editFormData.color || '#4CAF50'}
                      onChange={(e) => handleEditInputChange('color', e.target.value)}
                      className="w-full h-10 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    />
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
                        value={polygon.position}
                        onChange={(e) => handlePositionChange(polygon.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={polygons.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white"
                        style={{ backgroundColor: polygon.color }}
                      >
                        {polygon.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="font-medium text-gray-900">{polygon.name}</span>
                              {polygon.name_en && (
                                <span className="text-sm text-gray-500 ml-2">({polygon.name_en})</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {formatNumber(polygon.min_polygons)} - {formatNumber(polygon.max_polygons)} полигонов
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(polygon)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deletePolygon(polygon.id)}
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

export default FilterPolygons;
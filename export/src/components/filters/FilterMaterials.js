import React, { useState, useEffect } from 'react';
import translationService from '../../services/translationService';
import { apiConfig } from '../../services/apiConfigService';

const FilterMaterials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    color: '#000000'
  });
  const [editFormData, setEditFormData] = useState({});
  const [manualEditEn, setManualEditEn] = useState(false);
  const [translationTimeout, setTranslationTimeout] = useState(null);

  // Функция транслитерации как fallback
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
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('materials');
          if (response.success && response.data) {
            console.log('Материалы загружены с сервера:', response.data);
            setMaterials(response.data);
            localStorage.setItem('admin_materials', JSON.stringify(response.data));
            setLoading(false);
            return;
          }
          throw new Error('Ошибка ответа сервера материалов');
        } catch (serverError) {
          console.log('Сервер недоступен для материалов, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки материалов:', error);
    }

    // Загружаем из кэша или создаем дефолтные материалы
    const cachedMaterials = localStorage.getItem('admin_materials');
    if (cachedMaterials) {
      try {
        const materialData = JSON.parse(cachedMaterials);
        setMaterials(materialData);
        console.log('Материалы загружены из кэша:', materialData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша материалов:', e);
      }
    }

    // Создаем дефолтные материалы
    const defaultMaterials = [
      { id: 1, name: 'Золото', name_en: 'gold', color: '#fde047', position: 1 },
      { id: 2, name: 'Латунь', name_en: 'brass', color: '#fbbf24', position: 2 },
      { id: 3, name: 'Хром', name_en: 'chrome', color: '#e5e7eb', position: 3 },
      { id: 4, name: 'Дерево', name_en: 'wood', color: '#b45309', position: 4 },
      { id: 5, name: 'Бетон', name_en: 'concrete', color: '#6b7280', position: 5 },
      { id: 6, name: 'Кожа', name_en: 'leather', color: '#92400e', position: 6 },
      { id: 7, name: 'Пластик', name_en: 'plastic', color: '#065f46', position: 7 },
      { id: 8, name: 'Стекло', name_en: 'glass', color: '#1e40af', position: 8 }
    ];
    localStorage.setItem('admin_materials', JSON.stringify(defaultMaterials));
    setMaterials(defaultMaterials);
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditInputChange = (field, value) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePositionChange = async (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > materials.length) return;
    
    const currentItem = materials.find(m => m.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedMaterials = reorderPositions(materials, itemId, position);
    setMaterials([...reorderedMaterials]);
    
    // Сохраняем во всех системах
    await saveToAllSystems(reorderedMaterials, 'reorder');
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

  const saveToAllSystems = async (data, action = 'save') => {
    try {
      // Сохранение в localStorage
      localStorage.setItem('admin_materials', JSON.stringify(data));
      
      // Сохранение на API сервер
      const { apiConfig } = await import('../../services/apiConfigService.js');
      await apiConfig.saveToAPI('/api_materials.php', {
        action: action,
        data: data
      });
      
      console.log('Материалы сохранены во всех системах');
    } catch (error) {
      console.error('Ошибка сохранения:', error);
    }
  };

  const addMaterial = async () => {
    if (!formData.name.trim() || !formData.name_en.trim() || !formData.color.trim()) {
      alert('Введите название на русском и английском языках, а также цвет материала');
      return;
    }

    setSaving(true);
    try {
      const newMaterial = {
        id: Math.max(...materials.map(m => m.id), 0) + 1,
        name: formData.name,
        name_en: formData.name_en,
        color: formData.color,
        position: Math.max(...materials.map(m => m.position), 0) + 1
      };

      const updatedMaterials = [...materials, newMaterial];
      setMaterials(updatedMaterials);
      
      // Сохраняем во всех системах
      await saveToAllSystems(updatedMaterials, 'create');
      
      setFormData({
        name: '',
        name_en: '',
        color: '#000000'
      });
    } catch (error) {
      console.error('Ошибка при добавлении материала:', error);
    }
    setSaving(false);
  };

  const startEdit = (material) => {
    setEditingItem(material.id);
    setEditFormData({
      name: material.name,
      name_en: material.name_en || '',
      color: material.color,
      position: material.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name?.trim() || !editFormData.name_en?.trim() || !editFormData.color?.trim()) {
      alert('Введите название на русском и английском языках, а также цвет материала');
      return;
    }

    setSaving(true);
    try {
      const updatedMaterials = materials.map(material => 
        material.id === editingItem 
          ? { ...material, ...editFormData }
          : material
      );
      
      setMaterials(updatedMaterials);
      
      // Сохраняем во всех системах
      await saveToAllSystems(updatedMaterials, 'update');
      
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

  const deleteMaterial = async (id) => {
    if (!window.confirm('Удалить этот материал?')) return;
    
    setSaving(true);
    try {
      const updatedMaterials = materials.filter(m => m.id !== id);
      setMaterials(updatedMaterials);
      
      // Сохраняем во всех системах
      await saveToAllSystems(updatedMaterials, 'delete');
    } catch (error) {
      console.error('Ошибка при удалении:', error);
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка материалов...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white">
          Управление материалами
        </h2>
      </div>
      
      <div className="p-6">
        {/* Форма добавления материала */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый материал</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="w-16 h-12 border border-gray-300 rounded-lg"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => handleInputChange('color', e.target.value)}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="#000000"
                />
              </div>
            </div>
            
            <button
              onClick={addMaterial}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список материалов */}
        <div className="space-y-3">
          {materials.sort((a, b) => a.position - b.position).map((material) => (
            <div 
              key={material.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === material.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === material.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === material.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
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
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editFormData.color || '#000000'}
                        onChange={(e) => handleEditInputChange('color', e.target.value)}
                        className="w-12 h-10 border border-green-300 rounded-lg"
                      />
                      <input
                        type="text"
                        value={editFormData.color || ''}
                        onChange={(e) => handleEditInputChange('color', e.target.value)}
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
                        value={material.position}
                        onChange={(e) => handlePositionChange(material.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={materials.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-10 h-10 rounded-lg border border-gray-300"
                        style={{ backgroundColor: material.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="font-medium text-gray-900">{material.name}</span>
                              {material.name_en && (
                                <span className="text-sm text-gray-500 ml-2">({material.name_en})</span>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">{material.color}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(material)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteMaterial(material.id)}
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

export default FilterMaterials;
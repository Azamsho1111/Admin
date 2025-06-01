import React, { useState, useEffect } from "react";
import { apiConfig } from '../../services/apiConfigService';

const FilterFormats = () => {
  const [formats, setFormats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    extension: '',
    category: 'Основные'
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadFormats();
  }, []);

  const loadFormats = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('formats');
          if (response.success && response.data) {
            console.log('Форматы загружены с сервера:', response.data);
            setFormats(response.data);
            localStorage.setItem('admin_formats', JSON.stringify(response.data));
            setLoading(false);
            return;
          }
          throw new Error('Ошибка ответа сервера форматов');
        } catch (serverError) {
          console.log('Сервер недоступен для форматов, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки форматов:', error);
    }

    // Загружаем из кэша или создаем дефолтные форматы
    const cachedFormats = localStorage.getItem('admin_formats');
    if (cachedFormats) {
      try {
        const formatData = JSON.parse(cachedFormats);
        setFormats(formatData);
        console.log('Форматы загружены из кэша:', formatData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша форматов:', e);
      }
    }

    // Создаем дефолтные форматы
    const defaultFormats = [
      { id: 1, name: 'FBX', name_en: 'fbx', description: 'Autodesk формат', extension: '.fbx', category: 'Основные', position: 1 },
      { id: 2, name: 'OBJ', name_en: 'obj', description: 'Универсальный формат', extension: '.obj', category: 'Основные', position: 2 },
      { id: 3, name: 'BLEND', name_en: 'blend', description: 'Blender файлы', extension: '.blend', category: 'Основные', position: 3 },
      { id: 4, name: 'STL', name_en: 'stl', description: 'Для 3D печати', extension: '.stl', category: '3D Печать', position: 4 },
      { id: 5, name: 'GLTF', name_en: 'gltf', description: 'WebGL формат', extension: '.gltf', category: 'Веб', position: 5 }
    ];
    localStorage.setItem('admin_formats', JSON.stringify(defaultFormats));
    setFormats(defaultFormats);
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
    if (isNaN(position) || position < 1 || position > formats.length) return;
    
    const currentItem = formats.find(f => f.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedFormats = reorderPositions(formats, itemId, position);
    setFormats([...reorderedFormats]);
    localStorage.setItem('admin_formats', JSON.stringify(reorderedFormats));
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

  const addFormat = async () => {
    if (!formData.name.trim() || !formData.extension.trim()) {
      alert('Введите название и расширение формата');
      return;
    }

    try {
      const newFormat = {
        id: Math.max(...formats.map(f => f.id), 0) + 1,
        name: formData.name,
        description: formData.description,
        extension: formData.extension.startsWith('.') ? formData.extension : '.' + formData.extension,
        category: formData.category,
        position: Math.max(...formats.map(f => f.position), 0) + 1
      };

      const updatedFormats = [...formats, newFormat];
      localStorage.setItem('admin_formats', JSON.stringify(updatedFormats));
      setFormats(updatedFormats);
      
      setFormData({
        name: '',
        description: '',
        extension: '',
        category: 'Основные'
      });
    } catch (error) {
      console.error('Ошибка при добавлении формата:', error);
    }
  };

  const startEdit = (format) => {
    setEditingItem(format.id);
    setEditFormData({
      name: format.name,
      description: format.description,
      extension: format.extension,
      category: format.category,
      position: format.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name?.trim() || !editFormData.extension?.trim()) {
      alert('Введите название и расширение');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedFormats = formats.map(format => 
        format.id === editingItem 
          ? { ...format, ...editFormData, extension: editFormData.extension.startsWith('.') ? editFormData.extension : '.' + editFormData.extension }
          : format
      );
      
      localStorage.setItem('admin_formats', JSON.stringify(updatedFormats));
      setFormats(updatedFormats);
      
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

  const deleteFormat = async (id) => {
    if (!window.confirm('Удалить этот формат?')) return;
    
    const updatedFormats = formats.filter(f => f.id !== id);
    setFormats(updatedFormats);
    localStorage.setItem('admin_formats', JSON.stringify(updatedFormats));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка форматов...</span>
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
        {/* Форма добавления формата */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый формат</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.extension}
                onChange={(e) => handleInputChange('extension', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Расширение (например: .obj)"
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название (eng)"
              />
            </div>
            
            <button
              onClick={addFormat}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список форматов */}
        <div className="space-y-3">
          {formats.sort((a, b) => a.position - b.position).map((format) => (
            <div 
              key={format.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === format.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === format.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === format.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFormData.extension || ''}
                      onChange={(e) => handleEditInputChange('extension', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Расширение"
                    />
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название"
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
                        value={format.position}
                        onChange={(e) => handlePositionChange(format.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={formats.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center font-bold text-blue-700">
                        {format.name}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium text-gray-900">{format.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(format)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteFormat(format.id)}
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

export default FilterFormats;
import React, { useState, useEffect } from "react";

const FilterStyles = () => {
  const [styles, setStyles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    icon: ''
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadStyles();
  }, []);

  const loadStyles = async () => {
    setLoading(true);
    try {
      const savedSettings = localStorage.getItem('admin_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : { STORAGE_MODE: 'local' };
      
      if (settings.STORAGE_MODE === 'local') {
        const savedStyles = localStorage.getItem('admin_styles');
        if (savedStyles) {
          const data = JSON.parse(savedStyles);
          setStyles(data);
        } else {
          const defaultStyles = [
            { id: 1, name: 'Современный', name_en: 'Modern', icon: '🔥', position: 1 },
            { id: 2, name: 'Классический', name_en: 'Classic', icon: '🏛️', position: 2 },
            { id: 3, name: 'Минимализм', name_en: 'Minimalism', icon: '⚪', position: 3 },
            { id: 4, name: 'Индустриальный', name_en: 'Industrial', icon: '🏭', position: 4 },
            { id: 5, name: 'Скандинавский', name_en: 'Scandinavian', icon: '🌿', position: 5 },
            { id: 6, name: 'Лофт', name_en: 'Loft', icon: '🧱', position: 6 }
          ];
          localStorage.setItem('admin_styles', JSON.stringify(defaultStyles));
          setStyles(defaultStyles);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки стилей:', error);
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

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > styles.length) return;
    
    const currentItem = styles.find(s => s.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedStyles = reorderPositions(styles, itemId, position);
    setStyles([...reorderedStyles]);
    localStorage.setItem('admin_styles', JSON.stringify(reorderedStyles));
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

  const addStyle = async () => {
    if (!formData.name.trim() || !formData.name_en.trim()) {
      alert('Введите название на русском и английском языках');
      return;
    }

    try {
      const newStyle = {
        id: Math.max(...styles.map(s => s.id), 0) + 1,
        name: formData.name,
        name_en: formData.name_en,
        icon: formData.icon || '🎨',
        position: Math.max(...styles.map(s => s.position), 0) + 1
      };

      const updatedStyles = [...styles, newStyle];
      localStorage.setItem('admin_styles', JSON.stringify(updatedStyles));
      setStyles(updatedStyles);
      
      setFormData({
        name: '',
        name_en: '',
        icon: ''
      });
    } catch (error) {
      console.error('Ошибка при добавлении стиля:', error);
    }
  };

  const startEdit = (style) => {
    setEditingItem(style.id);
    setEditFormData({
      name: style.name,
      name_en: style.name_en || '',
      icon: style.icon || '',
      position: style.position
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

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedStyles = styles.map(style => 
        style.id === editingItem 
          ? { ...style, ...editFormData }
          : style
      );
      
      localStorage.setItem('admin_styles', JSON.stringify(updatedStyles));
      setStyles(updatedStyles);
      
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

  const deleteStyle = async (id) => {
    if (!window.confirm('Удалить этот стиль?')) return;
    
    const updatedStyles = styles.filter(s => s.id !== id);
    setStyles(updatedStyles);
    localStorage.setItem('admin_styles', JSON.stringify(updatedStyles));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка стилей...</span>
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
        {/* Форма добавления стиля */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый стиль</h3>
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
              <input
                type="text"
                value={formData.icon}
                onChange={(e) => handleInputChange('icon', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Иконка (emoji, опционально)"
              />
            </div>
            
            <button
              onClick={addStyle}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список стилей */}
        <div className="space-y-3">
          {styles.sort((a, b) => a.position - b.position).map((style) => (
            <div 
              key={style.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === style.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === style.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === style.id ? (
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
                    <input
                      type="text"
                      value={editFormData.icon || ''}
                      onChange={(e) => handleEditInputChange('icon', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Иконка"
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
                        value={style.position}
                        onChange={(e) => handlePositionChange(style.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={styles.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700">
                        {style.icon ? (
                          <span className="text-lg">{style.icon}</span>
                        ) : (
                          <span className="font-bold">{style.name.charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="font-medium text-gray-900">{style.name}</span>
                              {style.name_en && (
                                <span className="text-sm text-gray-500 ml-2">({style.name_en})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(style)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteStyle(style.id)}
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

export default FilterStyles;
import React, { useState, useEffect } from "react";
import translationService from '../../services/translationService';

const FilterOther = () => {
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    name_en: ''
  });
  const [editFormData, setEditFormData] = useState({});
  const [manualEditEn, setManualEditEn] = useState(false);
  const [editManualEditEn, setEditManualEditEn] = useState({});
  const [translationTimeout, setTranslationTimeout] = useState(null);

  useEffect(() => {
    loadOthers();
  }, []);

  const loadOthers = async () => {
    setLoading(true);
    try {
      const savedSettings = localStorage.getItem('admin_settings');
      const settings = savedSettings ? JSON.parse(savedSettings) : { STORAGE_MODE: 'local' };
      
      if (settings.STORAGE_MODE === 'local') {
        const savedOthers = localStorage.getItem('admin_others');
        if (savedOthers) {
          const data = JSON.parse(savedOthers);
          setOthers(data);
        } else {
          const defaultOthers = [
            { id: 1, name: 'Текстура', name_en: 'Texture', position: 1 },
            { id: 2, name: 'UVW', name_en: 'UVW', position: 2 }
          ];
          localStorage.setItem('admin_others', JSON.stringify(defaultOthers));
          setOthers(defaultOthers);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки прочих элементов:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const handleInputChange = async (field, value) => {
    const newFormData = { ...formData, [field]: value };
    
    if (field === 'name' && value && !manualEditEn) {
      // Очищаем предыдущий таймер
      if (translationTimeout) {
        clearTimeout(translationTimeout);
      }
      
      // Устанавливаем новый таймер для перевода
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
      }, 1500);
      
      setTranslationTimeout(timeoutId);
    }
    
    // Сбрасываем флаг ручного редактирования при изменении русского
    if (field === 'name') {
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
    
    if (field === 'name' && value && !editManualEditEn[itemId]) {
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
    if (field === 'name') {
      setEditManualEditEn(prev => ({...prev, [itemId]: false}));
    }
    
    // Устанавливаем флаг ручного редактирования при изменении английского
    if (field === 'name_en') {
      setEditManualEditEn(prev => ({...prev, [itemId]: true}));
    }
    
    setEditFormData(newFormData);
  };

  const handlePositionChange = (itemId, newPosition) => {
    const position = parseInt(newPosition);
    if (isNaN(position) || position < 1 || position > others.length) return;
    
    const currentItem = others.find(o => o.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedOthers = reorderPositions(others, itemId, position);
    setOthers([...reorderedOthers]);
    localStorage.setItem('admin_others', JSON.stringify(reorderedOthers));
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

  const addOther = async () => {
    if (!formData.name.trim() || !formData.name_en.trim()) {
      alert('Введите название на русском и английском языках');
      return;
    }

    try {
      const newOther = {
        id: Math.max(...others.map(o => o.id), 0) + 1,
        name: formData.name,
        name_en: formData.name_en,
        position: Math.max(...others.map(o => o.position), 0) + 1
      };

      const updatedOthers = [...others, newOther];
      localStorage.setItem('admin_others', JSON.stringify(updatedOthers));
      setOthers(updatedOthers);
      
      setFormData({
        name: '',
        name_en: ''
      });
    } catch (error) {
      console.error('Ошибка при добавлении элемента:', error);
    }
  };

  const startEdit = (other) => {
    setEditingItem(other.id);
    setEditFormData({
      name: other.name,
      name_en: other.name_en || '',
      position: other.position
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

      const updatedOthers = others.map(other => 
        other.id === editingItem 
          ? { ...other, ...editFormData }
          : other
      );
      
      localStorage.setItem('admin_others', JSON.stringify(updatedOthers));
      setOthers(updatedOthers);
      
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

  const deleteOther = async (id) => {
    if (!window.confirm('Удалить этот элемент?')) return;
    
    const updatedOthers = others.filter(o => o.id !== id);
    setOthers(updatedOthers);
    localStorage.setItem('admin_others', JSON.stringify(updatedOthers));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка прочих элементов...</span>
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
        {/* Форма добавления элемента */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Добавить новый элемент</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
            
            <button
              onClick={addOther}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить
            </button>
          </div>
        </div>

        {/* Список элементов */}
        <div className="space-y-3">
          {others.sort((a, b) => a.position - b.position).map((other) => (
            <div 
              key={other.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === other.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === other.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === other.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
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
                        value={other.position}
                        onChange={(e) => handlePositionChange(other.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={others.length}
                      />
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center font-bold text-indigo-700">
                        {other.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div>
                              <span className="font-medium text-gray-900">{other.name}</span>
                              {other.name_en && (
                                <span className="text-sm text-gray-500 ml-2">({other.name_en})</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(other)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteOther(other.id)}
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

export default FilterOther;
import React, { useState, useEffect } from "react";
import { apiConfig } from '../../services/apiConfigService';

const FilterSofts = () => {
  const [softwares, setSoftwares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    versionFrom: '2020',
    versionTo: '2024',
    active: true,
    profOnly: false
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadSoftwares();
  }, []);

  const loadSoftwares = async () => {
    setLoading(true);
    try {
      const config = apiConfig.getConfig();
      
      if (config.STORAGE_MODE === 'api' || config.STORAGE_MODE === 'hybrid') {
        try {
          const response = await apiConfig.makeAPIRequest('softs');
          if (response.success && response.data) {
            console.log('Софты загружены с сервера:', response.data);
            setSoftwares(response.data);
            localStorage.setItem('admin_softwares', JSON.stringify(response.data));
            setLoading(false);
            return;
          }
          throw new Error('Ошибка ответа сервера софтов');
        } catch (serverError) {
          console.log('Сервер недоступен для софтов, загружаем из кэша:', serverError);
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки софтов:', error);
    }

    // Загружаем из кэша или создаем дефолтные софты
    const cachedSoftwares = localStorage.getItem('admin_softwares');
    if (cachedSoftwares) {
      try {
        const softwareData = JSON.parse(cachedSoftwares);
        setSoftwares(softwareData);
        console.log('Софты загружены из кэша:', softwareData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша софтов:', e);
      }
    }

    // Создаем дефолтные софты
    const defaultSoftwares = [
      { id: 1, name: 'Maya', name_en: 'maya', version_from: '2022', version_to: '2024', active: 1, prof_only: 1, position: 1 },
      { id: 2, name: 'Blender', name_en: 'blender', version_from: '3.0', version_to: '4.0', active: 1, prof_only: 1, position: 2 },
      { id: 3, name: '3ds Max', name_en: '3ds_max', version_from: '2020', version_to: '2024', active: 1, prof_only: 0, position: 3 },
      { id: 4, name: 'Cinema 4D', name_en: 'cinema_4d', version_from: '21', version_to: '25', active: 1, prof_only: 0, position: 4 },
      { id: 5, name: 'SketchUp', name_en: 'sketchup', version_from: '2021', version_to: '2024', active: 1, prof_only: 0, position: 5 }
    ];
    localStorage.setItem('admin_softwares', JSON.stringify(defaultSoftwares));
    setSoftwares(defaultSoftwares);
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
    if (isNaN(position) || position < 1 || position > softwares.length) return;
    
    const currentItem = softwares.find(s => s.id === itemId);
    if (!currentItem || currentItem.position === position) return;
    
    const reorderedSoftwares = reorderPositions(softwares, itemId, position);
    setSoftwares([...reorderedSoftwares]);
    localStorage.setItem('admin_softwares', JSON.stringify(reorderedSoftwares));
  };

  const reorderPositions = (softs, itemId, newPosition) => {
    const maxPosition = softs.length;
    const targetPosition = Math.max(1, Math.min(parseInt(newPosition), maxPosition));
    
    const sortedSofts = [...softs].sort((a, b) => a.position - b.position);
    const itemIndex = sortedSofts.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return softs;
    
    const [movedItem] = sortedSofts.splice(itemIndex, 1);
    sortedSofts.splice(targetPosition - 1, 0, movedItem);
    
    return sortedSofts.map((item, index) => ({
      ...item,
      position: index + 1
    }));
  };

  const addSoftware = async () => {
    if (!formData.name.trim()) {
      alert('Введите название ПО');
      return;
    }

    try {
      const newSoftware = {
        id: Math.max(...softwares.map(s => s.id), 0) + 1,
        name: formData.name,
        versionFrom: formData.versionFrom,
        versionTo: formData.versionTo,
        active: formData.active,
        profOnly: formData.profOnly,
        position: Math.max(...softwares.map(s => s.position), 0) + 1
      };

      const updatedSoftwares = [...softwares, newSoftware];
      localStorage.setItem('admin_softwares', JSON.stringify(updatedSoftwares));
      setSoftwares(updatedSoftwares);
      
      setFormData({
        name: '',
        versionFrom: '2020',
        versionTo: '2024',
        active: true,
        profOnly: false
      });
    } catch (error) {
      console.error('Ошибка при добавлении ПО:', error);
    }
  };

  const startEdit = (software) => {
    setEditingItem(software.id);
    setEditFormData({
      name: software.name,
      versionFrom: software.versionFrom,
      versionTo: software.versionTo,
      active: software.active,
      profOnly: software.profOnly,
      position: software.position
    });
  };

  const cancelEdit = () => {
    setEditingItem(null);
    setEditFormData({});
  };

  const saveEdit = async () => {
    if (!editFormData.name?.trim()) {
      alert('Введите название');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      const updatedSoftwares = softwares.map(software => 
        software.id === editingItem 
          ? { ...software, ...editFormData }
          : software
      );
      
      localStorage.setItem('admin_softwares', JSON.stringify(updatedSoftwares));
      setSoftwares(updatedSoftwares);
      
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

  const deleteSoftware = async (id) => {
    if (!window.confirm('Удалить это ПО?')) return;
    
    const updatedSoftwares = softwares.filter(s => s.id !== id);
    setSoftwares(updatedSoftwares);
    localStorage.setItem('admin_softwares', JSON.stringify(updatedSoftwares));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-500"></div>
        <span className="ml-3 text-gray-500">Загрузка ПО...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
        <h2 className="text-xl font-semibold text-white">
          Управление ПО
        </h2>
      </div>
      
      <div className="p-6">
        {/* Форма добавления ПО */}
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Название ПО</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название (рус)"
              />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Название (eng)"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                value={formData.versionFrom}
                onChange={(e) => handleInputChange('versionFrom', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Версия от"
              />
              <input
                type="text"
                value={formData.versionTo}
                onChange={(e) => handleInputChange('versionTo', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Версия до"
              />
              <select 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.profOnly === null ? 'both' : formData.profOnly ? 'pro' : 'basic'}
                onChange={(e) => {
                  if (e.target.value === 'both') {
                    handleInputChange('profOnly', null);
                  } else {
                    handleInputChange('profOnly', e.target.value === 'pro');
                  }
                }}
              >
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
                <option value="both">Basic and pro</option>
              </select>
            </div>
            
            <button
              onClick={addSoftware}
              className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
            >
              + Добавить софт
            </button>
          </div>
        </div>

        {/* Список ПО */}
        <div className="space-y-3">
          {softwares.sort((a, b) => a.position - b.position).map((software) => (
            <div 
              key={software.id}
              className={`p-4 rounded-lg transition-all duration-300 ${
                editingItem === software.id
                  ? 'bg-green-50 border-2 border-green-400 shadow-lg'
                  : lastUpdated === software.id
                  ? 'bg-green-100 border-2 border-green-300 shadow-md'
                  : 'bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md'
              }`}
            >
              {editingItem === software.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название (рус)"
                    />
                    <input
                      type="text"
                      value={editFormData.name || ''}
                      onChange={(e) => handleEditInputChange('name', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Название (eng)"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <input
                      type="text"
                      value={editFormData.versionFrom || ''}
                      onChange={(e) => handleEditInputChange('versionFrom', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Версия от"
                    />
                    <input
                      type="text"
                      value={editFormData.versionTo || ''}
                      onChange={(e) => handleEditInputChange('versionTo', e.target.value)}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                      placeholder="Версия до"
                    />
                    <select
                      value={editFormData.profOnly === null ? 'both' : editFormData.profOnly ? 'pro' : 'basic'}
                      onChange={(e) => {
                        if (e.target.value === 'both') {
                          handleEditInputChange('profOnly', null);
                        } else {
                          handleEditInputChange('profOnly', e.target.value === 'pro');
                        }
                      }}
                      className="px-3 py-2 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500"
                    >
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="both">Basic and pro</option>
                    </select>
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
                        value={software.position}
                        onChange={(e) => handlePositionChange(software.id, e.target.value)}
                        className="w-12 text-xs text-center border rounded px-1 py-0.5 hover:border-gray-400 focus:border-gray-500"
                        min="1"
                        max={softwares.length}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <span className="font-medium text-gray-900">{software.name}</span>
                          <span className="text-sm text-gray-500">
                            {software.versionFrom} — {software.versionTo}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 ml-8">
                          {software.profOnly === true ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                              PROF
                            </span>
                          ) : software.profOnly === null ? (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Basic and pro
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Basic
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => startEdit(software)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Изменить"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                      </svg>
                    </button>
                    <button
                      onClick={() => deleteSoftware(software.id)}
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

export default FilterSofts;
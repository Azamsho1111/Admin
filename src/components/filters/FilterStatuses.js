import React, { useState, useEffect } from "react";
import { apiConfig } from '../../services/apiConfigService';

const FilterStatuses = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    background_color: '#3b82f6'
  });

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    setLoading(true);
    
    try {
      const response = await apiConfig.makeAPIRequest('statuses');
      if (response.status === 'success' && response.data) {
        setStatuses(response.data);
        localStorage.setItem('admin_statuses', JSON.stringify(response.data));
        console.log('Статусы загружены из API:', response.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов из API:', error);
    }

    // Проверяем локальный кэш
    const cachedStatuses = localStorage.getItem('admin_statuses');
    if (cachedStatuses) {
      try {
        const statusData = JSON.parse(cachedStatuses);
        setStatuses(statusData);
        console.log('Статусы загружены из кэша:', statusData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша статусов:', e);
      }
    }

    // Создаем дефолтные статусы
    const defaultStatuses = [
      { id: 1, name_ru: 'Опубликовано', name_en: 'published', background_color: '#22c55e', position: 1 },
      { id: 2, name_ru: 'На модерации', name_en: 'moderation', background_color: '#f59e0b', position: 2 },
      { id: 3, name_ru: 'Отклонено', name_en: 'rejected', background_color: '#ef4444', position: 3 },
      { id: 4, name_ru: 'Черновик', name_en: 'draft', background_color: '#6b7280', position: 4 }
    ];
    localStorage.setItem('admin_statuses', JSON.stringify(defaultStatuses));
    setStatuses(defaultStatuses);
    setLoading(false);
  };

  const saveItem = async () => {
    try {
      const response = await apiConfig.makeAPIRequest('statuses', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.status === 'success') {
        loadStatuses();
        setFormData({ name_ru: '', name_en: '', background_color: '#3b82f6' });
      }
    } catch (error) {
      console.error('Ошибка сохранения статуса:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Статусы</h2>
      
      {loading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : (
        <div>
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Добавить статус</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Название (RU)"
                value={formData.name_ru}
                onChange={(e) => handleInputChange('name_ru', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Название (EN)"
                value={formData.name_en}
                onChange={(e) => handleInputChange('name_en', e.target.value)}
                className="border rounded px-3 py-2"
              />
              <input
                type="color"
                value={formData.background_color}
                onChange={(e) => handleInputChange('background_color', e.target.value)}
                className="border rounded px-3 py-2"
              />
            </div>
            <button
              onClick={saveItem}
              className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Сохранить
            </button>
          </div>

          <div className="space-y-3">
            {statuses.map(status => (
              <div key={status.id} className="border p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold text-lg">{status.name_ru}</h3>
                    <p className="text-gray-600">EN: {status.name_en}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-8 h-8 rounded"
                      style={{ backgroundColor: status.background_color }}
                    ></div>
                    <span className="text-sm text-gray-500">ID: {status.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterStatuses;
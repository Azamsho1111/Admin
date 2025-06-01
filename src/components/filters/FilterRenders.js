import React, { useState, useEffect } from 'react';
import { apiConfig } from '../../services/apiConfigService';

const FilterRenders = () => {
  const [rendersList, setRendersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    name_en: '',
    position: ''
  });

  useEffect(() => {
    loadRenders();
  }, []);

  const loadRenders = async () => {
    setLoading(true);
    
    try {
      const response = await apiConfig.makeAPIRequest('renders');
      if (response.status === 'success' && response.data) {
        setRendersList(response.data);
        localStorage.setItem('admin_renders', JSON.stringify(response.data));
        console.log('Рендеры загружены из API:', response.data);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error('Ошибка загрузки рендеров из API:', error);
    }

    // Проверяем локальный кэш
    const cachedRenders = localStorage.getItem('admin_renders');
    if (cachedRenders) {
      try {
        const renderData = JSON.parse(cachedRenders);
        setRendersList(renderData);
        console.log('Рендеры загружены из кэша:', renderData);
        setLoading(false);
        return;
      } catch (e) {
        console.error('Ошибка парсинга кэша рендеров:', e);
      }
    }

    // Создаем дефолтные рендеры
    const defaultRenders = [
      { 
        id: 1, 
        name: 'V-Ray', 
        name_en: 'vray', 
        position: 1,
        versions: [
          { id: 1, version: '5.0', usage_count: 45, is_official: true },
          { id: 2, version: '6.0', usage_count: 128, is_official: true }
        ]
      },
      { 
        id: 2, 
        name: 'Corona', 
        name_en: 'corona',
        position: 2,
        versions: [
          { id: 3, version: '9.0', usage_count: 76, is_official: true },
          { id: 4, version: '10.0', usage_count: 92, is_official: true }
        ]
      }
    ];
    localStorage.setItem('admin_renders', JSON.stringify(defaultRenders));
    setRendersList(defaultRenders);
    setLoading(false);
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const saveItem = async () => {
    try {
      const response = await apiConfig.makeAPIRequest('renders', {
        method: 'POST',
        body: JSON.stringify(formData)
      });
      
      if (response.status === 'success') {
        loadRenders();
        setFormData({ name: '', name_en: '', position: '' });
      }
    } catch (error) {
      console.error('Ошибка сохранения рендера:', error);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Рендеры</h2>
      
      {loading ? (
        <div className="text-center py-4">Загрузка...</div>
      ) : (
        <div>
          <div className="mb-6 p-4 border rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Добавить рендер</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Название"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
                type="number"
                placeholder="Позиция"
                value={formData.position}
                onChange={(e) => handleInputChange('position', e.target.value)}
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
            {rendersList.map(render => (
              <div key={render.id} className="border p-4 rounded-lg bg-gray-50">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{render.name}</h3>
                    <p className="text-gray-600">EN: {render.name_en}</p>
                    <p className="text-sm text-gray-500">Позиция: {render.position}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm text-gray-500">ID: {render.id}</span>
                  </div>
                </div>
                
                {render.versions && render.versions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-medium text-sm mb-2">Версии:</h4>
                    <div className="flex flex-wrap gap-2">
                      {render.versions.map(version => (
                        <span
                          key={version.id}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs"
                        >
                          {version.version} ({version.usage_count})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FilterRenders;
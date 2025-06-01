import { useState, useEffect } from 'react';
import translationService from '../../services/translationService';

const AllModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [showTranslation, setShowTranslation] = useState(false);
  const [translatedModels, setTranslatedModels] = useState(new Map());

  useEffect(() => {
    loadModels();
  }, []);

  // Функция для перевода модели
  const translateModel = async (model) => {
    if (translatedModels.has(model.id)) {
      return translatedModels.get(model.id);
    }

    try {
      const translated = {
        ...model,
        nameEn: await translationService.translateText(model.name),
        categoryEn: await translationService.translateText(model.category),
        sectionEn: await translationService.translateText(model.section),
        styleEn: await translationService.translateText(model.style)
      };

      setTranslatedModels(prev => new Map(prev).set(model.id, translated));
      return translated;
    } catch (error) {
      console.error('Ошибка перевода модели:', error);
      return model;
    }
  };

  // Функция для получения отображаемого текста
  const getDisplayText = (originalText, translatedText) => {
    return showTranslation && translatedText ? translatedText : originalText;
  };

  const loadModels = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/models', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setModels(data);
      } else {
        console.error('Ошибка API:', response.status);
        // Тестовые данные для всех моделей
        const testModels = [
          {
            id: 5,
            name: 'Офисное кресло Executive',
            category: 'Мебель',
            section: 'Офис',
            software: '3ds Max',
            version: '2024',
            formats: ['max', 'obj', 'fbx'],
            style: 'Современный',
            materials: ['fabric', 'metal'],
            colors: ['black', 'brown'],
            animation: 'none',
            status: 'pending',
            userStatus: 'Премиум',
            uploadDate: '2024-01-20',
            author: {
              name: 'OfficeDesigner',
              avatar: 'https://via.placeholder.com/32',
              modelsCount: 156
            },
            fileSize: '78 МБ',
            polygons: '18.2K',
            downloads: 0,
            rating: 0
          },
          {
            id: 4,
            name: 'Торшер Arc Light',
            category: 'Освещение',
            section: 'Интерьер',
            software: 'Blender',
            version: '3.6',
            formats: ['blend', 'obj', 'fbx'],
            style: 'Минимализм',
            materials: ['metal', 'glass'],
            colors: ['white', 'black'],
            animation: 'basic',
            status: 'pending',
            userStatus: 'Бесплатно',
            uploadDate: '2024-01-18',
            author: {
              name: 'LightStudio',
              avatar: 'https://via.placeholder.com/32',
              modelsCount: 43
            },
            fileSize: '32 МБ',
            polygons: '9.8K',
            downloads: 0,
            rating: 0
          },
          {
            id: 3,
            name: 'Современное кресло',
            category: 'Мебель',
            section: 'Интерьер',
            software: '3ds Max',
            version: '2023',
            formats: ['max', 'obj', 'fbx'],
            style: 'Современный',
            materials: ['fabric', 'wood'],
            colors: ['brown', 'red'],
            animation: 'none',
            status: 'approved',
            userStatus: 'Стандарт',
            uploadDate: '2024-01-15',
            author: {
              name: 'UserDesigner1',
              avatar: 'https://via.placeholder.com/32',
              modelsCount: 24
            },
            fileSize: '45 МБ',
            polygons: '12.5K',
            downloads: 234,
            rating: 4.7
          },
          {
            id: 2,
            name: 'Настольная лампа Edison',
            category: 'Освещение',
            section: 'Интерьер',
            software: 'Blender',
            version: '2022',
            formats: ['blend', 'obj', 'fbx'],
            style: 'Индустриальный',
            materials: ['metal', 'plastic'],
            colors: ['black', 'white'],
            animation: 'complex',
            status: 'approved',
            userStatus: 'Премиум+',
            uploadDate: '2024-01-10',
            author: {
              name: 'LightMaster',
              avatar: 'https://via.placeholder.com/32',
              modelsCount: 87
            },
            fileSize: '23 МБ',
            polygons: '8.2K',
            downloads: 156,
            rating: 4.5
          },
          {
            id: 1,
            name: 'Декоративная ваза',
            category: 'Декор',
            section: 'Интерьер',
            software: 'Maya',
            version: '2024',
            formats: ['ma', 'obj', 'fbx'],
            style: 'Классический',
            materials: ['glass', 'metal'],
            colors: ['blue', 'white'],
            animation: 'none',
            status: 'rejected',
            userStatus: 'Отклонено',
            uploadDate: '2024-01-12',
            author: {
              name: 'ArtCreator',
              avatar: 'https://via.placeholder.com/32',
              modelsCount: 12
            },
            fileSize: '67 МБ',
            polygons: '25.1K',
            downloads: 0,
            rating: 0,
            rejectReason: 'Низкое качество текстур'
          }
        ];
        setModels(testModels);
      }
    } catch (error) {
      console.error('Ошибка загрузки моделей:', error);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModerationAction = async (modelId, action) => {
    try {
      const response = await fetch(`/api/models/${modelId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ action: action })
      });

      if (response.ok) {
        loadModels();
      } else {
        const updatedModels = models.filter(model => model.id !== modelId);
        setModels(updatedModels);
      }
    } catch (error) {
      console.error('Ошибка модерации:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return <div className="p-6 text-center">Загрузка моделей...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Все модели</h1>
        <div className="flex items-center space-x-4">
          <button
            onClick={async () => {
              if (!showTranslation) {
                // Переводим все модели при включении перевода
                for (const model of models) {
                  await translateModel(model);
                }
              }
              setShowTranslation(!showTranslation);
            }}
            className={`px-4 py-2 text-sm rounded-lg transition-colors ${
              showTranslation 
                ? 'bg-green-500 text-white hover:bg-green-600' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {showTranslation ? '🇬🇧 EN' : '🇷🇺 RU'} Перевод
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow">
        {models.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">Моделей не найдено</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Модель</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Автор</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Вес</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Категория</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Раздел</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ПО</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Формат</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Стиль</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Анимация</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Полигонаж</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Действия</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {models.map((model, index) => {
                  const translatedModel = translatedModels.get(model.id);
                  return (
                    <tr key={model.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {models.length - index}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <a 
                            href={`#/model/${model.id}`}
                            className="font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {getDisplayText(model.name, translatedModel?.nameEn)}
                          </a>
                          <div className="text-xs text-gray-500 mt-1">{model.polygons || 'N/A'} полигонов</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center space-x-2">
                          <img 
                            src={model.author?.avatar || 'https://via.placeholder.com/32'} 
                            alt="" 
                            className="w-8 h-8 rounded-full bg-gray-200"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{model.author?.name || model.author || 'Неизвестен'}</div>
                            <div className="text-xs text-gray-500">{model.author?.modelsCount || 0} моделей</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{model.fileSize}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getDisplayText(model.category, translatedModel?.categoryEn)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getDisplayText(model.section, translatedModel?.sectionEn)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{model.software} {model.version}</td>
                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-1">
                          {(model.formats || []).map(format => (
                            <span key={format} className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded">
                              {format.toUpperCase()}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {getDisplayText(model.style, translatedModel?.styleEn)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">{model.animation || 'Нет'}</td>
                      <td className="px-4 py-4 text-sm text-gray-900">{model.polygons || 'N/A'}</td>
                      <td className="px-4 py-4">
                        <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(model.status)}`}>
                        {model.userStatus || model.status}
                      </span>
                      {model.rejectReason && (
                        <div className="text-xs text-red-600 mt-1">{model.rejectReason}</div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{model.uploadDate}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => window.open(`#/model/${model.id}`, '_blank')}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs"
                          title="Просмотр модели"
                        >
                          👁️
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Удалить модель? Это действие нельзя отменить.')) {
                              handleModerationAction(model.id, 'delete');
                              showNotification('Модель удалена', 'success');
                            }
                          }}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                          title="Удалить модель (только администратор)"
                        >
                          🗑️
                        </button>
                      </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Toast уведомления */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
          notification ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
        }`}>
          <div className={`px-6 py-4 rounded-lg shadow-lg flex items-center space-x-3 min-w-80 ${
            notification.type === 'error' 
              ? 'bg-red-500 text-white' 
              : 'bg-green-500 text-white'
          }`}>
            <div className="flex-shrink-0">
              {notification.type === 'error' ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
            </div>
            <button 
              onClick={() => setNotification(null)}
              className="flex-shrink-0 ml-4 text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllModels;
import { useState, useEffect } from 'react';

const NewModels = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  const [rejectModal, setRejectModal] = useState({ open: false, modelId: null });

  useEffect(() => {
    loadModels();
  }, []);

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
        const newModels = data.filter(model => model.status === 'pending');
        setModels(newModels);
      } else {
        console.error('Ошибка API:', response.status);
        // Тестовые данные для новых моделей
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

  const handleModerationAction = async (modelId, action, comment = '') => {
    try {
      const response = await fetch(`/api/models/${modelId}/moderate`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          action: action,
          comment: comment
        })
      });

      if (response.ok) {
        loadModels();
      } else {
        const updatedModels = models.map(model => {
          if (model.id === modelId) {
            return {
              ...model,
              status: action,
              rejectReason: action === 'rejected' ? comment : undefined
            };
          }
          return model;
        }).filter(model => model.status === 'pending');
        setModels(updatedModels);
      }
    } catch (error) {
      console.error('Ошибка модерации:', error);
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
      <h1 className="text-2xl font-bold mb-6">Новые модели для модерации</h1>
      
      <div className="bg-white rounded-lg shadow">
        {models.length === 0 ? (
          <div className="p-6 text-center">
            <div className="text-gray-500">Новых моделей для модерации нет</div>
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
                {models.map((model, index) => (
                  <tr key={model.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm font-medium text-gray-900">
                      {models.length - index}
                    </td>
                    <td className="px-4 py-4">
                      <div>
                        <button 
                          onClick={() => window.location.href = `/moderation/model/${model.id}`}
                          className="font-medium text-blue-600 hover:text-blue-800 hover:underline text-left"
                        >
                          {model.name}
                        </button>
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
                    <td className="px-4 py-4 text-sm text-gray-900">{model.category}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{model.section}</td>
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
                    <td className="px-4 py-4 text-sm text-gray-900">{model.style}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{model.animation || 'Нет'}</td>
                    <td className="px-4 py-4 text-sm text-gray-900">{model.polygons || 'N/A'}</td>
                    <td className="px-4 py-4">
                      <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {model.userStatus || 'На модерации'}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-gray-900">{model.uploadDate}</td>
                    <td className="px-4 py-4">
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            handleModerationAction(model.id, 'approved');
                            showNotification('Модель одобрена', 'success');
                          }}
                          className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setRejectModal({ open: true, modelId: model.id })}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs"
                        >
                          ✗
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Модальное окно отклонения */}
      {rejectModal.open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Отклонить модель</h3>
              <button 
                onClick={() => setRejectModal({ open: false, modelId: null })}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const reason = formData.get('reason');
              if (reason) {
                handleModerationAction(rejectModal.modelId, 'rejected', reason);
                showNotification('Модель отклонена', 'success');
                setRejectModal({ open: false, modelId: null });
              }
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Причина отклонения
                </label>
                <textarea
                  name="reason"
                  rows="4"
                  required
                  placeholder="Укажите причину отклонения модели..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setRejectModal({ open: false, modelId: null })}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors"
                >
                  Отклонить модель
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

export default NewModels;
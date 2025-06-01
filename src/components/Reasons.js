import React, { useState, useEffect } from 'react';

const Reasons = () => {
  const [reasons, setReasons] = useState([]);
  const [newReason, setNewReason] = useState({ name_ru: '', name_en: '', description: '', category: 'model', is_active: true });
  const [editingReason, setEditingReason] = useState(null);

  // Категории для причин
  const categories = [
    { value: 'model', label: 'Модель', color: 'bg-blue-100 text-blue-800' },
    { value: 'gallery', label: 'Галерея', color: 'bg-green-100 text-green-800' },
    { value: 'lessons', label: 'Уроки', color: 'bg-purple-100 text-purple-800' }
  ];

  // Словарь для автоматического перевода
  const translationDict = {
    'низкое качество': 'low quality',
    'некачественная модель': 'poor quality model',
    'нарушение авторских прав': 'copyright violation',
    'неподходящий контент': 'inappropriate content',
    'спам': 'spam',
    'дублирование': 'duplication',
    'неправильные теги': 'incorrect tags',
    'отсутствие описания': 'missing description',
    'неправильный формат': 'incorrect format',
    'технические проблемы': 'technical issues',
    'не соответствует требованиям': 'does not meet requirements',
    'плохая геометрия': 'bad geometry',
    'отсутствуют текстуры': 'missing textures',
    'слишком большой размер файла': 'file size too large',
    'вирус или вредоносное ПО': 'virus or malware',
    'неполная модель': 'incomplete model',
    'нарушение правил сообщества': 'community guidelines violation',
    'оскорбительный контент': 'offensive content',
    'неточная категория': 'incorrect category',
    'отсутствие лицензии': 'missing license'
  };

  // Функция автоматического перевода
  const translateToEnglish = (russianText) => {
    if (!russianText) return '';
    
    const lowerText = russianText.toLowerCase().trim();
    
    // Поиск точного совпадения
    if (translationDict[lowerText]) {
      return translationDict[lowerText];
    }
    
    // Поиск частичного совпадения
    for (const [ru, en] of Object.entries(translationDict)) {
      if (lowerText.includes(ru) || ru.includes(lowerText)) {
        return en;
      }
    }
    
    // Простая транслитерация если нет перевода
    return russianText
      .toLowerCase()
      .replace(/а/g, 'a').replace(/б/g, 'b').replace(/в/g, 'v')
      .replace(/г/g, 'g').replace(/д/g, 'd').replace(/е/g, 'e')
      .replace(/ё/g, 'yo').replace(/ж/g, 'zh').replace(/з/g, 'z')
      .replace(/и/g, 'i').replace(/й/g, 'y').replace(/к/g, 'k')
      .replace(/л/g, 'l').replace(/м/g, 'm').replace(/н/g, 'n')
      .replace(/о/g, 'o').replace(/п/g, 'p').replace(/р/g, 'r')
      .replace(/с/g, 's').replace(/т/g, 't').replace(/у/g, 'u')
      .replace(/ф/g, 'f').replace(/х/g, 'h').replace(/ц/g, 'c')
      .replace(/ч/g, 'ch').replace(/ш/g, 'sh').replace(/щ/g, 'sch')
      .replace(/ъ/g, '').replace(/ы/g, 'y').replace(/ь/g, '')
      .replace(/э/g, 'e').replace(/ю/g, 'yu').replace(/я/g, 'ya')
      .replace(/\s+/g, ' ').trim();
  };
  const [saving, setSaving] = useState(false);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    loadReasons();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadReasons = () => {
    try {
      const savedReasons = localStorage.getItem('admin_reasons');
      if (savedReasons) {
        setReasons(JSON.parse(savedReasons));
      }
    } catch (error) {
      console.error('Ошибка загрузки причин:', error);
    }
  };

  const saveReasons = (reasonsData) => {
    try {
      localStorage.setItem('admin_reasons', JSON.stringify(reasonsData));
    } catch (error) {
      console.error('Ошибка сохранения причин:', error);
    }
  };

  const handleAddReason = async () => {
    if (!newReason.name_ru || !newReason.name_en) {
      showNotification('Заполните название на русском и английском языках', 'error');
      return;
    }

    setSaving(true);
    try {
      const reason = {
        id: Date.now(),
        ...newReason,
        created_at: new Date().toISOString()
      };

      const updatedReasons = [...reasons, reason];
      setReasons(updatedReasons);
      saveReasons(updatedReasons);
      
      setNewReason({ name_ru: '', name_en: '', description: '', is_active: true });
      showNotification('Причина успешно добавлена!');
    } catch (error) {
      console.error('Ошибка добавления причины:', error);
      showNotification('Ошибка при добавлении причины', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEditReason = async (reason) => {
    setSaving(true);
    try {
      const updatedReasons = reasons.map(r => 
        r.id === reason.id 
          ? { ...reason, updated_at: new Date().toISOString() }
          : r
      );
      
      setReasons(updatedReasons);
      saveReasons(updatedReasons);
      setEditingReason(null);
      showNotification('Причина успешно обновлена!');
    } catch (error) {
      console.error('Ошибка обновления причины:', error);
      showNotification('Ошибка при обновлении причины', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteReason = async (reasonId) => {
    if (!window.confirm('Вы уверены, что хотите удалить эту причину?')) {
      return;
    }

    try {
      const updatedReasons = reasons.filter(r => r.id !== reasonId);
      setReasons(updatedReasons);
      saveReasons(updatedReasons);
      showNotification('Причина успешно удалена!');
    } catch (error) {
      console.error('Ошибка удаления причины:', error);
      showNotification('Ошибка при удалении причины', 'error');
    }
  };

  const toggleReasonStatus = async (reasonId) => {
    try {
      const updatedReasons = reasons.map(r => 
        r.id === reasonId 
          ? { ...r, is_active: !r.is_active, updated_at: new Date().toISOString() }
          : r
      );
      
      setReasons(updatedReasons);
      saveReasons(updatedReasons);
      showNotification('Статус причины изменен!');
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
      showNotification('Ошибка при изменении статуса', 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* Уведомления */}
      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}

      {/* Форма добавления новой причины */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
          <h3 className="text-xl font-semibold text-white">Добавить новую причину</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название (русский) *
              </label>
              <input
                type="text"
                value={newReason.name_ru}
                onChange={(e) => {
                  const russianValue = e.target.value;
                  setNewReason({ 
                    ...newReason, 
                    name_ru: russianValue,
                    name_en: translateToEnglish(russianValue)
                  });
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Введите название на русском"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Название (английский) *
              </label>
              <input
                type="text"
                value={newReason.name_en}
                onChange={(e) => setNewReason({...newReason, name_en: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter name in English"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Категория *
              </label>
              <select
                value={newReason.category}
                onChange={(e) => setNewReason({...newReason, category: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Описание
            </label>
            <textarea
              value={newReason.description}
              onChange={(e) => setNewReason({...newReason, description: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Введите описание причины"
            />
          </div>
          
          <div className="flex items-center gap-3 mb-4">
            <input
              type="checkbox"
              id="new-reason-active"
              checked={newReason.is_active}
              onChange={(e) => setNewReason({...newReason, is_active: e.target.checked})}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="new-reason-active" className="text-sm font-medium text-gray-700">
              Активная причина
            </label>
          </div>
          
          <button
            onClick={handleAddReason}
            disabled={saving}
            className="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200"
          >
            {saving ? 'Добавление...' : 'Добавить причину'}
          </button>
        </div>
      </div>

      {/* Список причин */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-gray-500 to-gray-600 p-6">
          <h3 className="text-xl font-semibold text-white">Список причин ({reasons.length})</h3>
        </div>
        
        <div className="p-6">
          {reasons.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <div className="text-4xl mb-4">📋</div>
              <p>Причины не найдены. Добавьте первую причину выше.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reasons.map((reason) => (
                <div key={reason.id} className="border border-gray-200 rounded-lg p-4">
                  {editingReason === reason.id ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <input
                          type="text"
                          value={reason.name_ru}
                          onChange={(e) => setReasons(reasons.map(r => 
                            r.id === reason.id ? {...r, name_ru: e.target.value} : r
                          ))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Название (русский)"
                        />
                        <input
                          type="text"
                          value={reason.name_en}
                          onChange={(e) => setReasons(reasons.map(r => 
                            r.id === reason.id ? {...r, name_en: e.target.value} : r
                          ))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                          placeholder="Название (английский)"
                        />
                        <select
                          value={reason.category || 'model'}
                          onChange={(e) => setReasons(reasons.map(r => 
                            r.id === reason.id ? {...r, category: e.target.value} : r
                          ))}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        >
                          {categories.map(category => (
                            <option key={category.value} value={category.value}>
                              {category.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <textarea
                        value={reason.description}
                        onChange={(e) => setReasons(reasons.map(r => 
                          r.id === reason.id ? {...r, description: e.target.value} : r
                        ))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        rows="2"
                        placeholder="Описание"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditReason(reason)}
                          disabled={saving}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Сохранить
                        </button>
                        <button
                          onClick={() => setEditingReason(null)}
                          className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                        >
                          Отмена
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium text-gray-900">
                              {reason.name_ru} / {reason.name_en}
                            </h4>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              categories.find(cat => cat.value === reason.category)?.color || 'bg-gray-100 text-gray-800'
                            }`}>
                              {categories.find(cat => cat.value === reason.category)?.label || reason.category}
                            </span>
                          </div>
                          {reason.description && (
                            <p className="text-gray-600 text-sm mt-1">{reason.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            reason.is_active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {reason.is_active ? 'Активна' : 'Неактивна'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setEditingReason(reason.id)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Редактировать
                        </button>
                        <button
                          onClick={() => toggleReasonStatus(reason.id)}
                          className={`px-3 py-1 rounded text-sm ${
                            reason.is_active
                              ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                              : 'bg-green-500 hover:bg-green-600 text-white'
                          }`}
                        >
                          {reason.is_active ? 'Деактивировать' : 'Активировать'}
                        </button>
                        <button
                          onClick={() => handleDeleteReason(reason.id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm"
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reasons;
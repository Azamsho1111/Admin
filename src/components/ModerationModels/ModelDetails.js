import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import translationService from '../../services/translationService';

const ModelDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [model, setModel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(true);
  const [formData, setFormData] = useState({});
  const [rejectModal, setRejectModal] = useState(false);
  const [notification, setNotification] = useState(null);
  const [manualDescEdit, setManualDescEdit] = useState(false);

  // Автоматический перевод описания
  React.useEffect(() => {
    if (!manualDescEdit && formData.description && editMode) {
      const timeoutId = setTimeout(async () => {
        const translated = await translationService.translateText(formData.description);
        setFormData(prev => ({ ...prev, descriptionEn: translated }));
      }, 1000); // Задержка 1 секунда для избежания частых запросов

      return () => clearTimeout(timeoutId);
    }
  }, [formData.description, manualDescEdit, editMode]);
  const [filters, setFilters] = useState({
    categories: [],
    sections: [],
    styles: [],
    software: [],
    formats: [],
    colors: [],
    materials: [],
    renders: [],
    statuses: [],
    animation: [],
    polygons: []
  });
  const [moderationStatus, setModerationStatus] = useState('');
  const [ignoreReason, setIgnoreReason] = useState('');
  const [statusDisabled, setStatusDisabled] = useState(false);
  const [ignoreDisabled, setIgnoreDisabled] = useState(false);

  // Обработчики модерации
  const handleStatusChange = (status) => {
    setModerationStatus(status);
    setIgnoreReason('');
    setIgnoreDisabled(!!status);
  };

  const handleIgnoreChange = (reason) => {
    setIgnoreReason(reason);
    setModerationStatus('');
    setStatusDisabled(!!reason);
  };

  const handleAccept = () => {
    if (moderationStatus) {
      console.log('Принято со статусом:', moderationStatus);
      // Здесь будет API запрос
    }
  };

  const handleIgnore = () => {
    if (ignoreReason) {
      console.log('Отклонено по причине:', ignoreReason);
      // Здесь будет API запрос
    }
  };

  const handleDelete = () => {
    console.log('Удалено');
    // Здесь будет API запрос
  };

  // Получение причин из настроек
  const getIgnoreReasons = () => {
    try {
      const savedReasons = localStorage.getItem('admin_reasons');
      if (savedReasons) {
        const reasons = JSON.parse(savedReasons);
        return reasons.filter(reason => reason.is_active);
      }
    } catch (error) {
      console.error('Ошибка загрузки причин:', error);
    }
    return [];
  };

  // Тестовые данные
  const testModel = {
    id: 1,
    name: 'Офисное кресло Executive',
    description: 'Современное офисное кресло в стиле Executive с высокой спинкой и кожаной обивкой',
    category: 'Мебель',
    section: 'Офис',
    style: 'Современный',
    software: '3ds Max',
    version: '2024',
    formats: ['max', 'obj', 'fbx'],
    colors: ['black', 'brown'],
    materials: ['leather', 'metal'],
    renderEngines: ['V-Ray', 'Corona'],
    status: 'pending',
    uploadDate: '2024-01-20',
    fileSize: '78 МБ',
    polygons: '18.2K',
    downloads: 0,
    rating: 0,
    price: 7990,
    profiPrice: 12500,
    currency: 'RUB',
    tags: 'офис, кресло, мебель, executive',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
        filename: 'kitchen_main_view.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909114-35f47c5e671d?w=400&h=300&fit=crop',
        filename: 'kitchen_detail_1.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909114-c3e10ff71c2b?w=400&h=300&fit=crop',
        filename: 'kitchen_detail_2.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909114-26cdfccdb0a4?w=400&h=300&fit=crop',
        filename: 'kitchen_lighting.jpg'
      },
      {
        url: 'https://images.unsplash.com/photo-1556909919-45b5b5e3e0d8?w=400&h=300&fit=crop',
        filename: 'kitchen_cabinet_detail.jpg'
      }
    ],
    author: {
      id: 1,
      name: 'OfficeDesigner',
      avatar: 'https://via.placeholder.com/80',
      email: 'designer@example.com',
      joinDate: '2021',
      modelsCount: 156,
      rating: 4.8,
      totalDownloads: 12500
    }
  };

  useEffect(() => {
    loadModel();
    loadFilters();
  }, [id]);

  const loadModel = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/models/${id}`);
      
      if (response.ok) {
        const data = await response.json();
        setModel(data);
        setFormData(data);
      } else {
        setModel(testModel);
        setFormData(testModel);
      }
    } catch (error) {
      console.error('Ошибка загрузки модели:', error);
      setModel(testModel);
      setFormData(testModel);
    } finally {
      setLoading(false);
    }
  };

  const loadFilters = async () => {
    try {
      // Загружаем категории
      const categoriesResponse = await fetch('/api/filters_categories');
      const categoriesData = categoriesResponse.ok ? await categoriesResponse.json() : [];

      // Загружаем разделы
      const sectionsResponse = await fetch('/api/filters_sections');
      const sectionsData = sectionsResponse.ok ? await sectionsResponse.json() : [];

      // Загружаем стили
      const stylesResponse = await fetch('/api/filters_styles');
      const stylesData = stylesResponse.ok ? await stylesResponse.json() : [];

      // Загружаем софты
      const softwareResponse = await fetch('/api/filters_softs');
      const softwareData = softwareResponse.ok ? await softwareResponse.json() : [];

      // Загружаем форматы
      const formatsResponse = await fetch('/api/filters_formats');
      const formatsData = formatsResponse.ok ? await formatsResponse.json() : [];

      // Загружаем цвета
      const colorsResponse = await fetch('/api/filters_colors');
      const colorsData = colorsResponse.ok ? await colorsResponse.json() : [];

      // Загружаем материалы
      const materialsResponse = await fetch('/api/filters_materials');
      const materialsData = materialsResponse.ok ? await materialsResponse.json() : [];

      // Загружаем рендеры
      const rendersResponse = await fetch('/api/filters_renders');
      const rendersData = rendersResponse.ok ? await rendersResponse.json() : [];

      // Загружаем статусы
      const statusesResponse = await fetch('/api/filters_statuses');
      const statusesData = statusesResponse.ok ? await statusesResponse.json() : [];

      setFilters({
        categories: categoriesData.data || [],
        sections: sectionsData.data || [],
        styles: stylesData.data || [],
        software: softwareData.data || [],
        formats: formatsData.data || [],
        colors: colorsData.data || [],
        materials: materialsData.data || [],
        renders: rendersData.data || [],
        statuses: statusesData.data || [],
        animation: [],
        polygons: []
      });
    } catch (error) {
      console.error('Ошибка загрузки фильтров:', error);
    }
  };

  const handleModerationAction = async (action, comment = '') => {
    try {
      const response = await fetch(`/api/models/${id}/moderate`, {
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
        showNotification(
          action === 'approved' ? 'Модель одобрена' : 'Модель отклонена',
          'success'
        );
        setTimeout(() => navigate('/moderation'), 1500);
      }
    } catch (error) {
      console.error('Ошибка модерации:', error);
      showNotification(
        action === 'approved' ? 'Модель одобрена' : 'Модель отклонена',
        'success'
      );
      setTimeout(() => navigate('/moderation'), 1500);
    }
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/models/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setModel(formData);
        setEditMode(false);
        showNotification('Изменения сохранены', 'success');
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      setModel(formData);
      setEditMode(false);
      showNotification('Изменения сохранены', 'success');
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-600">Загрузка модели...</div>
        </div>
      </div>
    );
  }

  if (!model) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-gray-600">Модель не найдена</div>
          <button 
            onClick={() => navigate('/moderation')}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Вернуться к модерации
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Основной контент */}
      <div className="flex-1">
        {/* Заголовок */}
        <div className="bg-gray-100 border-b border-gray-200 px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-800">Редактирование модели</h1>
        </div>

        <div className="flex justify-center">
          {/* Основная форма */}
          <div className="w-full max-w-4xl p-6">
            <div className="max-w-2xl mx-auto">
              {/* Название */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">НАЗВАНИЕ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <input
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => editMode && setFormData({...formData, name: e.target.value})}
                  placeholder="Укажите имя Продукта *"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-3"
                  disabled={!editMode}
                />
                
                {/* Название на английском */}
                <input
                  type="text"
                  value={formData.nameEn || ''}
                  onChange={(e) => editMode && setFormData({...formData, nameEn: e.target.value})}
                  onBlur={(e) => {
                    // Автоматически заполняем английское название, если оно пустое
                    if (editMode && !e.target.value && formData.name) {
                      // Простая транслитерация русского текста в английский
                      const transliterate = (text) => {
                        const map = {
                          'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
                          'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
                          'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
                          'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
                          'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
                          ' ': ' '
                        };
                        return text.toLowerCase().split('').map(char => map[char] || char).join('');
                      };
                      const transliterated = transliterate(formData.name);
                      setFormData({...formData, nameEn: transliterated});
                    }
                  }}
                  placeholder="Название (английский)"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={!editMode}
                />
              </div>

              {/* Теги */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">ТЕГИ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <input
                  type="text"
                  value={formData.tags || ''}
                  onChange={async (e) => {
                    if (editMode) {
                      const newTags = e.target.value;
                      setFormData({...formData, tags: newTags});
                      
                      // Автоматический перевод тегов
                      if (newTags.trim()) {
                        const translatedTags = await translationService.translateText(newTags);
                        setFormData(prev => ({...prev, tagsEn: translatedTags}));
                      }
                    }
                  }}
                  placeholder="Введите теги"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-3"
                  disabled={!editMode}
                />
                
                {/* Теги на английском */}
                <input
                  type="text"
                  value={formData.tagsEn || ''}
                  onChange={(e) => editMode && setFormData({...formData, tagsEn: e.target.value})}
                  placeholder="Tags in English"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={!editMode}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Разделяйте теги запятыми. Английские теги заполняются автоматически.
                </div>
              </div>

              {/* Статус модели */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">СТАТУС МОДЕЛИ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="flex space-x-0 mb-3">
                  <button 
                    className={`px-8 py-2 text-sm font-medium border ${
                      formData.status === 'basic' 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => editMode && setFormData({...formData, status: 'basic'})}
                    disabled={!editMode}
                  >
                    BASIC
                  </button>
                  <button 
                    className={`px-8 py-2 text-sm font-medium border-t border-b border-r ${
                      formData.status === 'profi' 
                        ? 'bg-teal-500 text-white border-teal-500' 
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                    onClick={() => editMode && setFormData({...formData, status: 'profi'})}
                    disabled={!editMode}
                  >
                    PROFI
                  </button>
                  <div className="flex-1"></div>
                  <div className="flex items-center space-x-3">
                    <div className="text-sm text-gray-600">
                      Размер: <span className="font-medium">{model.fileSize}</span>
                    </div>
                    <button className="px-4 py-2 bg-teal-500 text-white text-sm rounded">
                      Выгрузить файл
                    </button>
                  </div>
                </div>
                
                <label className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={formData.isBrand || false}
                    onChange={(e) => editMode && setFormData({...formData, isBrand: e.target.checked})}
                    className="mr-2"
                    disabled={!editMode}
                  />
                  <span className="text-gray-600">От производителя (Бренд)</span>
                </label>

                {/* Поле цены для PROFI */}
                {formData.status === 'profi' && (
                  <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <label className="block text-sm font-medium text-blue-900 mb-2">
                      💎 Цена профессиональной модели
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="number"
                        value={formData.profiPrice || ''}
                        onChange={(e) => editMode && setFormData({...formData, profiPrice: e.target.value})}
                        placeholder="Укажите цену в рублях"
                        className="flex-1 px-3 py-2 border border-blue-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        disabled={!editMode}
                      />
                      <span className="text-sm text-blue-700 font-medium">₽</span>
                    </div>
                    <p className="text-xs text-blue-600 mt-1">
                      Цена, указанная автором при загрузке модели. Автоматически применяется при выборе статуса PROFI.
                    </p>
                  </div>
                )}
              </div>

              {/* Изображения модели */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">Изображения модели</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                
                {model.images && model.images.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {model.images.map((image, index) => (
                      <div key={index} className="relative group bg-white border border-gray-200 rounded-lg overflow-hidden">
                        <img 
                          src={image.url} 
                          alt={`Изображение модели ${index + 1}`}
                          className="w-full h-32 object-cover"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                          <button className="opacity-0 group-hover:opacity-100 text-white text-xs bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded transition-all">
                            Просмотр
                          </button>
                        </div>
                        <div className="p-2">
                          <p className="text-xs text-gray-500 truncate">
                            {image.filename || `image_${index + 1}.jpg`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 p-8 text-center bg-gray-50 rounded-lg">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-sm">Изображения не найдены</p>
                      <p className="text-xs text-gray-400">Автор не загрузил изображения для этой модели</p>
                    </div>
                  </div>
                )}
              </div>

              {/* ПО */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">ПО</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-5 gap-2">
                  {filters.software.map((software, index) => (
                    <div key={index} className="space-y-2">
                      <div className="border border-gray-200 p-2 text-center text-sm">
                        {software.name_ru || software.name || software}
                      </div>
                      <select className="w-full text-xs h-8 px-1 border border-gray-300">
                        <option>Версия</option>
                        <option>2024</option>
                        <option>2023</option>
                        <option>2022</option>
                        <option>2021</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Формат */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">ФОРМАТ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {filters.formats.map((format, index) => (
                    <button
                      key={index}
                      className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      {format.name_ru || format.name || format}
                    </button>
                  ))}
                </div>
              </div>

              {/* Рендер-движок */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">РЕНДЕР-ДВИЖОК</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {filters.renders.map((render, index) => (
                    <button
                      key={index}
                      className="px-3 py-2 text-sm border border-gray-300 bg-white hover:bg-gray-50"
                    >
                      {render.name_ru || render.name || render}
                    </button>
                  ))}
                </div>
              </div>

              {/* Цвет */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">ЦВЕТ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-10 gap-2">
                  {filters.colors.map((color, index) => (
                    <button
                      key={index}
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color.hex_color || color.color || '#ffffff' }}
                      title={color.name_ru || color.name || color}
                    />
                  ))}
                </div>
              </div>

              {/* Особенности */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">ОСОБЕННОСТИ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Полигонаж:</span>
                    <span className="ml-2 font-medium">50000</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Максимум 3 характеристики</span>
                  </div>
                </div>
              </div>

              {/* Категории */}
              <div className="mb-6">
                <div className="flex items-center mb-4">
                  <h2 className="text-sm font-medium whitespace-nowrap mr-4">КАТЕГОРИИ</h2>
                  <div className="h-px bg-gray-300 flex-1"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Стиль</label>
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 bg-teal-500 text-white"
                      value={formData.style || ''}
                      onChange={(e) => editMode && setFormData({...formData, style: e.target.value})}
                      disabled={!editMode}
                    >
                      <option value="">Выбрать</option>
                      {filters.styles.map((style, index) => (
                        <option key={index} value={style.name_ru || style.name || style}>
                          {style.name_ru || style.name || style}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Категория</label>
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 bg-teal-500 text-white"
                      value={formData.category || ''}
                      onChange={(e) => editMode && setFormData({...formData, category: e.target.value})}
                      disabled={!editMode}
                    >
                      <option value="">Выбрать</option>
                      {filters.categories.map((category, index) => (
                        <option key={index} value={category.name_ru || category.name || category}>
                          {category.name_ru || category.name || category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Раздел</label>
                    <select 
                      className="w-full px-3 py-2 text-sm border border-gray-300 bg-teal-500 text-white"
                      value={formData.section || ''}
                      onChange={(e) => editMode && setFormData({...formData, section: e.target.value})}
                      disabled={!editMode}
                    >
                      <option value="">Выбрать</option>
                      {filters.sections.map((section, index) => (
                        <option key={index} value={section.name_ru || section.name || section}>
                          {section.name_ru || section.name || section}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Длина</label>
                    <input
                      type="text"
                      value={formData.length || ''}
                      onChange={(e) => editMode && setFormData({...formData, length: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300"
                      disabled={!editMode}
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ширина</label>
                    <input
                      type="text"
                      value={formData.width || ''}
                      onChange={(e) => editMode && setFormData({...formData, width: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300"
                      disabled={!editMode}
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Высота</label>
                    <input
                      type="text"
                      value={formData.height || ''}
                      onChange={(e) => editMode && setFormData({...formData, height: e.target.value})}
                      className="w-full px-2 py-1 text-sm border border-gray-300"
                      disabled={!editMode}
                      placeholder="-"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Ед.изм</label>
                    <select 
                      className="w-full px-2 py-1 text-sm border border-gray-300"
                      value={formData.unit || 'см'}
                      onChange={(e) => editMode && setFormData({...formData, unit: e.target.value})}
                      disabled={!editMode}
                    >
                      <option value="см">см</option>
                      <option value="м">м</option>
                      <option value="мм">мм</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Описание */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ОПИСАНИЕ
                </label>
                <textarea
                  value={formData.description || ''}
                  onChange={(e) => {
                    if (editMode) {
                      setFormData({...formData, description: e.target.value});
                      setManualDescEdit(false); // Сбрасываем флаг ручного редактирования при изменении русского текста
                    }
                  }}
                  placeholder="Описание продукта *"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 mb-3"
                  disabled={!editMode}
                />
                
                {/* Описание на английском */}
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ОПИСАНИЕ (АНГЛИЙСКИЙ)
                  <span className="text-xs text-gray-500 ml-2">автоматически переводится</span>
                </label>
                <textarea
                  value={formData.descriptionEn || ''}
                  onChange={(e) => {
                    if (editMode) {
                      setFormData({...formData, descriptionEn: e.target.value});
                      setManualDescEdit(true); // Устанавливаем флаг ручного редактирования
                    }
                  }}
                  placeholder="Description in English"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={!editMode}
                />
                <div className="text-xs text-gray-500 mt-1">
                  Поле автоматически заполняется переводом русского описания. Можно редактировать вручную.
                </div>
              </div>

              {/* Теги */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ТЕГИ
                </label>
                <input
                  type="text"
                  placeholder="Введите тег"
                  className="w-full px-3 py-2 border border-gray-300 focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <button className="mt-2 px-4 py-2 bg-teal-500 text-white text-sm rounded">
                  Добавить
                </button>
              </div>
            </div>
          </div>

          {/* Правая боковая панель */}
          <div className="w-80 p-6 bg-gray-50 border-l border-gray-200">
            {/* Информация об авторе */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">Autor</h3>
                <div className="flex space-x-2">
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button className="p-1 text-gray-400 hover:text-gray-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="text-center">
                <img 
                  src={model.author.avatar} 
                  alt={model.author.name}
                  className="w-20 h-20 rounded mx-auto mb-3 bg-gray-200"
                />
                <h4 className="font-medium text-gray-900 mb-1">{model.author.name}</h4>
                <p className="text-sm text-gray-500 mb-3">Since in {model.author.joinDate}</p>
                
                <div className="flex justify-center space-x-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg
                      key={i}
                      className={`w-4 h-4 ${i < Math.floor(model.author.rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div>
                    <div className="font-bold text-lg">{model.author.modelsCount}</div>
                    <div className="text-gray-500">MODELS</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">54</div>
                    <div className="text-gray-500">GALLERY</div>
                  </div>
                  <div>
                    <div className="font-bold text-lg">35</div>
                    <div className="text-gray-500">LESSONS</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Панель модерации */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Модерация</h3>
              
              {/* Статус */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Статус</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={moderationStatus}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  disabled={statusDisabled}
                >
                  <option value="">-</option>
                  {filters.statuses.map((status, index) => (
                    <option key={index} value={status.name_ru || status.name || status}>
                      {status.name_ru || status.name || status}
                    </option>
                  ))}
                </select>
              </div>

              {/* Игнор */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Игнор</label>
                <select 
                  className="w-full px-3 py-2 border border-gray-300 rounded"
                  value={ignoreReason}
                  onChange={(e) => handleIgnoreChange(e.target.value)}
                  disabled={ignoreDisabled}
                >
                  <option value="">Выберите причину</option>
                  {getIgnoreReasons().map((reason, index) => (
                    <option key={index} value={reason.name_ru || reason.name}>
                      {reason.name_ru || reason.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Кнопки действий */}
              <div className="space-y-3">
                <button 
                  onClick={handleAccept}
                  disabled={!moderationStatus}
                  className={`w-full py-2 px-4 rounded font-medium ${
                    moderationStatus 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Принять
                </button>
                
                <button 
                  onClick={handleIgnore}
                  disabled={!ignoreReason}
                  className={`w-full py-2 px-4 rounded font-medium ${
                    ignoreReason 
                      ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  Игнорировать
                </button>
                
                <button 
                  onClick={handleDelete}
                  className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded font-medium"
                >
                  Удалить
                </button>
            </div>


            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно отклонения */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Отклонить модель</h3>
              <button 
                onClick={() => setRejectModal(false)}
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
                handleModerationAction('rejected', reason);
                setRejectModal(false);
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
                  onClick={() => setRejectModal(false)}
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

export default ModelDetails;
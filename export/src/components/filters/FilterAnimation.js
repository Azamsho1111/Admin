import { useState, useEffect } from 'react';

const FilterAnimation = () => {
  const [animations, setAnimations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name_ru: '',
    name_en: '',
    description: '',
    position: 0,
    is_active: true
  });
  const [editFormData, setEditFormData] = useState({});

  useEffect(() => {
    loadAnimations();
  }, []);

  const loadAnimations = async () => {
    setLoading(true);
    try {
      const savedAnimations = localStorage.getItem('admin_animations');
      if (savedAnimations) {
        const data = JSON.parse(savedAnimations);
        setAnimations(data.sort((a, b) => a.position - b.position));
      } else {
        const defaultAnimations = [
          { id: 1, name_ru: 'Без анимации', name_en: 'none', description: 'Статичная модель без анимации', position: 1, is_active: true },
          { id: 2, name_ru: 'Базовая анимация', name_en: 'basic', description: 'Простая анимация (поворот, масштаб)', position: 2, is_active: true },
          { id: 3, name_ru: 'Сложная анимация', name_en: 'complex', description: 'Комплексная анимация с несколькими объектами', position: 3, is_active: true },
          { id: 4, name_ru: 'Риггинг персонажа', name_en: 'rigged', description: 'Анимированный персонаж с костями', position: 4, is_active: true }
        ];
        localStorage.setItem('admin_animations', JSON.stringify(defaultAnimations));
        setAnimations(defaultAnimations);
      }
    } catch (error) {
      console.error('Ошибка загрузки анимаций:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.name_ru || !formData.name_en) {
      alert('Заполните обязательные поля');
      return;
    }

    setSaving(true);
    try {
      const newAnimation = {
        id: Date.now(),
        ...formData,
        position: animations.length + 1
      };

      const updatedAnimations = [...animations, newAnimation];
      localStorage.setItem('admin_animations', JSON.stringify(updatedAnimations));
      setAnimations(updatedAnimations);
      setFormData({ name_ru: '', name_en: '', description: '', position: 0, is_active: true });
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      alert('Ошибка при сохранении');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item.id);
    setEditFormData({ ...item });
  };

  const handleUpdate = async () => {
    setSaving(true);
    try {
      const updatedAnimations = animations.map(item =>
        item.id === editingItem ? editFormData : item
      );
      localStorage.setItem('admin_animations', JSON.stringify(updatedAnimations));
      setAnimations(updatedAnimations);
      setEditingItem(null);
      setEditFormData({});
    } catch (error) {
      console.error('Ошибка обновления:', error);
      alert('Ошибка при обновлении');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить этот тип анимации?')) return;

    try {
      const updatedAnimations = animations.filter(item => item.id !== id);
      localStorage.setItem('admin_animations', JSON.stringify(updatedAnimations));
      setAnimations(updatedAnimations);
    } catch (error) {
      console.error('Ошибка удаления:', error);
      alert('Ошибка при удалении');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      const updatedAnimations = animations.map(item =>
        item.id === id ? { ...item, is_active: !item.is_active } : item
      );
      localStorage.setItem('admin_animations', JSON.stringify(updatedAnimations));
      setAnimations(updatedAnimations);
    } catch (error) {
      console.error('Ошибка изменения статуса:', error);
    }
  };

  const moveItem = (id, direction) => {
    const sortedAnimations = [...animations].sort((a, b) => a.position - b.position);
    const currentIndex = sortedAnimations.findIndex(item => item.id === id);
    
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === sortedAnimations.length - 1)
    ) {
      return;
    }
    
    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    const updatedAnimations = [...animations];
    
    const currentItem = updatedAnimations.find(item => item.id === id);
    const targetItem = updatedAnimations.find(item => item.id === sortedAnimations[newIndex].id);
    
    const tempPosition = currentItem.position;
    currentItem.position = targetItem.position;
    targetItem.position = tempPosition;
    
    setAnimations(updatedAnimations);
    localStorage.setItem('admin_animations', JSON.stringify(updatedAnimations));
  };

  if (loading) {
    return <div className="text-center py-8">Загрузка...</div>;
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">🎬 Управление типами анимации</h2>
        
        {/* Форма добавления */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-3">Добавить новый тип анимации</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Название (RU) *</label>
              <input
                type="text"
                value={formData.name_ru}
                onChange={(e) => setFormData({...formData, name_ru: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Например: Базовая анимация"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Название (EN) *</label>
              <input
                type="text"
                value={formData.name_en}
                onChange={(e) => setFormData({...formData, name_en: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Например: basic"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Описание</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded"
                placeholder="Краткое описание типа анимации"
                rows="2"
              />
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="mt-4 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 text-white px-4 py-2 rounded"
          >
            {saving ? 'Сохранение...' : 'Добавить'}
          </button>
        </div>
      </div>

      {/* Список анимаций */}
      <div className="bg-white rounded-lg border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Позиция</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Название</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Описание</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {animations.sort((a, b) => a.position - b.position).map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">#{item.position}</span>
                      <div className="flex flex-col gap-1">
                        <button
                          onClick={() => moveItem(item.id, 'up')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ↑
                        </button>
                        <button
                          onClick={() => moveItem(item.id, 'down')}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    {editingItem === item.id ? (
                      <div className="space-y-2">
                        <input
                          type="text"
                          value={editFormData.name_ru}
                          onChange={(e) => setEditFormData({...editFormData, name_ru: e.target.value})}
                          className="w-full p-1 border rounded text-sm"
                        />
                        <input
                          type="text"
                          value={editFormData.name_en}
                          onChange={(e) => setEditFormData({...editFormData, name_en: e.target.value})}
                          className="w-full p-1 border rounded text-sm"
                        />
                      </div>
                    ) : (
                      <div>
                        <div className="font-medium">{item.name_ru}</div>
                        <div className="text-sm text-gray-500">{item.name_en}</div>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    {editingItem === item.id ? (
                      <textarea
                        value={editFormData.description}
                        onChange={(e) => setEditFormData({...editFormData, description: e.target.value})}
                        className="w-full p-1 border rounded text-sm"
                        rows="2"
                      />
                    ) : (
                      <div className="text-sm text-gray-600">{item.description}</div>
                    )}
                  </td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => handleToggleActive(item.id)}
                      className={`px-2 py-1 text-xs rounded-full ${
                        item.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {item.is_active ? 'Активен' : 'Неактивен'}
                    </button>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {editingItem === item.id ? (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={handleUpdate}
                          disabled={saving}
                          className="text-green-600 hover:text-green-800"
                        >
                          ✓
                        </button>
                        <button
                          onClick={() => setEditingItem(null)}
                          className="text-gray-600 hover:text-gray-800"
                        >
                          ✗
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEdit(item)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="text-red-600 hover:text-red-800"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FilterAnimation;
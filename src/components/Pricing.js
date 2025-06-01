import React, { useState, useEffect } from "react";
import Reasons from './Reasons';

const stats = [
  { label: "Доход за всё время", value: "16 490 ₽", diff: "+8.2%", color: "text-green-600" },
  { label: "Расходы", value: "23 880 ₽", diff: "-3.1%", color: "text-red-600" },
  { label: "Чистая прибыль", value: "-7 390 ₽", diff: "+4.4%", color: "text-green-600" },
  { label: "Успешных транзакций", value: "31", diff: "+12.3%", color: "text-green-600" },
];

const Pricing = () => {
  const [activeTab, setActiveTab] = useState("pricing");
  const [selectedStatus, setSelectedStatus] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [authorPercent, setAuthorPercent] = useState("");
  const [globalIpPercent, setGlobalIpPercent] = useState("");
  const [isAuthorPrice, setIsAuthorPrice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statuses, setStatuses] = useState([]);
  const [notification, setNotification] = useState(null);

  const tabs = [
    { id: "pricing", label: "Управление ценами", icon: "" },
    { id: "reasons", label: "Причины", icon: "" }
  ];

  useEffect(() => {
    loadStatuses();
    loadGlobalSettings();
  }, []);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const loadStatuses = () => {
    try {
      const savedStatuses = localStorage.getItem('admin_statuses');
      if (savedStatuses) {
        const statusesData = JSON.parse(savedStatuses);
        setStatuses(statusesData.filter(status => status.is_active));
      }
    } catch (error) {
      console.error('Ошибка загрузки статусов:', error);
    }
  };

  const loadGlobalSettings = () => {
    try {
      const globalSettings = localStorage.getItem('admin_global_settings');
      if (globalSettings) {
        const settings = JSON.parse(globalSettings);
        setGlobalIpPercent(settings.ip_percent || "");
      }
    } catch (error) {
      console.error('Ошибка загрузки глобальных настроек:', error);
    }
  };

  const saveGlobalSettings = () => {
    try {
      const settings = {
        ip_percent: parseFloat(globalIpPercent) || 0,
        updated_at: new Date().toISOString()
      };
      localStorage.setItem('admin_global_settings', JSON.stringify(settings));
    } catch (error) {
      console.error('Ошибка сохранения глобальных настроек:', error);
    }
  };

  const calculateTotals = () => {
    if (!basePrice || !authorPercent) return {};

    const base = parseFloat(basePrice);
    const authorPct = parseFloat(authorPercent);
    const ipPct = parseFloat(globalIpPercent) || 0;

    if (isAuthorPrice) {
      const authorAmount = base;
      const platformPercent = 100 - authorPct;
      const platformTotal = (base * platformPercent) / authorPct;
      const platformAmount = platformTotal;
      const platformFinalAmount = platformAmount * (1 - ipPct / 100);
      const ipAmount = platformAmount * (ipPct / 100);
      const totalPrice = authorAmount + platformAmount;

      return {
        totalPrice: totalPrice.toFixed(2),
        authorAmount: authorAmount.toFixed(2),
        platformAmount: platformAmount.toFixed(2),
        platformFinalAmount: platformFinalAmount.toFixed(2),
        ipAmount: ipAmount.toFixed(2),
        authorPercent: authorPct,
        platformPercent: platformPercent.toFixed(1),
        ipPercent: ipPct
      };
    } else {
      const authorAmount = (base * authorPct) / 100;
      const platformPercent = 100 - authorPct;
      const platformAmount = (base * platformPercent) / 100;
      const platformFinalAmount = platformAmount * (1 - ipPct / 100);
      const ipAmount = platformAmount * (ipPct / 100);

      return {
        totalPrice: base.toFixed(2),
        authorAmount: authorAmount.toFixed(2),
        platformAmount: platformAmount.toFixed(2),
        platformFinalAmount: platformFinalAmount.toFixed(2),
        ipAmount: ipAmount.toFixed(2),
        authorPercent: authorPct,
        platformPercent: platformPercent.toFixed(1),
        ipPercent: ipPct
      };
    }
  };

  const totals = calculateTotals();

  const handleSave = async () => {
    if (!selectedStatus || !basePrice || !authorPercent) {
      showNotification('Заполните все обязательные поля', 'error');
      return;
    }

    setSaving(true);
    try {
      const savedStatuses = localStorage.getItem('admin_statuses');
      if (savedStatuses) {
        const statusesData = JSON.parse(savedStatuses);
        
        const updatedStatuses = statusesData.map(status => 
          status.id === parseInt(selectedStatus) 
            ? {
                ...status,
                base_price: isAuthorPrice ? 0 : parseFloat(basePrice),
                author_percent: parseFloat(authorPercent),
                platform_percent: totals.platformPercent,
                ip_percent: parseFloat(globalIpPercent) || 0,
                author_amount: parseFloat(totals.authorAmount),
                platform_amount: parseFloat(totals.platformFinalAmount),
                ip_amount: parseFloat(totals.ipAmount),
                is_author_price: isAuthorPrice,
                updated_at: new Date().toISOString()
              }
            : status
        );
        
        localStorage.setItem('admin_statuses', JSON.stringify(updatedStatuses));
        setStatuses(updatedStatuses.filter(status => status.is_active));
        
        saveGlobalSettings();
        
        showNotification('Цены успешно сохранены!', 'success');
        
        setSelectedStatus("");
        setBasePrice("");
        setAuthorPercent("");
        setIsAuthorPrice(false);
      }
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      showNotification('Ошибка при сохранении цен', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="w-full space-y-8">
      {notification && (
        <div className={`p-4 rounded-lg ${notification.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {notification.message}
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
        <div className="bg-gradient-to-r from-gray-300 to-gray-400 p-6">
          <h2 className="text-xl font-semibold text-white">
            Управление ценами статусов
          </h2>
        </div>


        
        <div className="p-6">
          {activeTab === "pricing" && (
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Настройка цен</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg">
                  <input 
                    type="checkbox" 
                    id="authorPrice" 
                    checked={isAuthorPrice}
                    onChange={e => setIsAuthorPrice(e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="authorPrice" className="text-sm font-medium text-gray-700">
                    💰 Цена от автора (указываем сколько % остается автору)
                  </label>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Выберите статус из фильтров:</label>
                    <select 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                      value={selectedStatus} 
                      onChange={e => setSelectedStatus(e.target.value)}
                    >
                      <option value="">Выберите статус</option>
                      {statuses.filter(status => !status.base_price && !status.is_author_price).map(status => (
                        <option key={status.id} value={status.id}>
                          {status.name_ru} ({status.name_en})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {isAuthorPrice ? "Пример цены автора:" : "Базовая цена (₽):"}
                    </label>
                    <input
                      type="number"
                      placeholder={isAuthorPrice ? "Сколько получит автор" : "Общая цена товара"}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={basePrice}
                      onChange={e => setBasePrice(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Процент автора (%):</label>
                    <input
                      type="number"
                      placeholder="30"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={authorPercent}
                      onChange={e => setAuthorPercent(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">Глобальный % ИП:</label>
                    <input
                      type="number"
                      placeholder="6"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      value={globalIpPercent}
                      onChange={e => setGlobalIpPercent(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <button 
                      onClick={handleSave}
                      className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-400 hover:to-gray-500 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200" 
                      disabled={saving}
                    >
                      {saving ? "Сохранение..." : "Сохранить"}
                    </button>
                  </div>
                </div>

                {totals.totalPrice && (
                  <div className="bg-white border-2 border-blue-200 rounded-lg p-4 mt-4">
                    <h4 className="text-lg font-medium text-gray-900 mb-3">Расчет распределения</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-xs text-gray-500">
                          {isAuthorPrice ? "Итоговая цена" : "Базовая цена"}
                        </div>
                        <div className="text-2xl font-bold text-blue-600">{totals.totalPrice} ₽</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Автор</div>
                        <div className="text-2xl font-bold text-orange-600">{totals.authorAmount} ₽</div>
                        <div className="text-xs text-gray-400">({totals.authorPercent}%)</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">
                          {isAuthorPrice ? "Платформе (до ИП)" : "Платформе (итого)"}
                        </div>
                        <div className="text-2xl font-bold text-green-600">{totals.platformFinalAmount} ₽</div>
                        <div className="text-xs text-gray-400">
                          ({totals.platformPercent}% - {totals.ipPercent}% ИП)
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">ИП</div>
                        <div className="text-2xl font-bold text-purple-600">{totals.ipAmount} ₽</div>
                        <div className="text-xs text-gray-400">({totals.ipPercent}% от {totals.platformAmount} ₽)</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 border-t pt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Настроенные цены</h3>
                <div className="space-y-4">
                  {statuses.filter(status => status.base_price || status.is_author_price).map(status => (
                    <div key={status.id} className="bg-white border rounded-lg p-4 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-4 h-4 rounded-full border-2"
                          style={{ backgroundColor: status.color, borderColor: status.color }}
                        ></div>
                        <div>
                          <div className="font-medium">{status.name_ru} / {status.name_en}</div>
                          <div className="text-sm text-gray-600">
                            {status.is_author_price ? "Цена от автора" : `Базовая цена: ${status.base_price} ₽`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-sm text-blue-600">
                          Автору: {status.author_amount} ₽ ({status.author_percent}%)
                        </div>
                        <div className="text-sm text-green-600">
                          Платформе: {status.platform_amount} ₽ ({status.platform_percent}%)
                        </div>
                        {status.ip_amount > 0 && (
                          <div className="text-sm text-purple-600">ИП: {status.ip_amount} ₽ ({status.ip_percent}%)</div>
                        )}
                      </div>
                    </div>
                  ))}
                  {statuses.filter(status => status.base_price || status.is_author_price).length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                      Пока нет настроенных цен для статусов
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "reasons" && (
            <Reasons />
          )}
        </div>
      </div>

      {activeTab === "pricing" && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-8">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-lg shadow p-6 flex flex-col gap-2">
              <div className="text-sm text-gray-500">{s.label}</div>
              <div className="text-2xl font-bold">{s.value}</div>
              <div className={`text-sm ${s.color}`}>{s.diff} к прошлому периоду</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Pricing;
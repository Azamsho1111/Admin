import { useState } from "react";

const GitHubTab = ({ config, onConfigChange }) => {
  const [githubSettings, setGithubSettings] = useState({
    repo: config.GITHUB_REPO || "Azamsho1111/NewBack",
    branch: config.GITHUB_BRANCH || "main",
    token: config.GITHUB_TOKEN || "",
    deployTarget: config.DEPLOY_TARGET || "reg.ru",
    autoSync: config.AUTO_SYNC || false
  });

  const [syncStatus, setSyncStatus] = useState("idle");
  const [lastSync, setLastSync] = useState(null);

  const handleSettingChange = (key, value) => {
    setGithubSettings(prev => ({
      ...prev,
      [key]: value
    }));
    
    onConfigChange({
      ...config,
      [`GITHUB_${key.toUpperCase()}`]: value,
      DEPLOY_TARGET: key === 'deployTarget' ? value : config.DEPLOY_TARGET
    });
  };

  const syncWithGitHub = async () => {
    setSyncStatus("syncing");
    try {
      // Имитация синхронизации с GitHub
      await new Promise(resolve => setTimeout(resolve, 2000));
      setLastSync(new Date().toLocaleString());
      setSyncStatus("success");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
      console.error("Ошибка синхронизации:", error);
    }
  };

  const deployToRegRu = async () => {
    setSyncStatus("deploying");
    try {
      // Имитация развертывания
      await new Promise(resolve => setTimeout(resolve, 3000));
      setSyncStatus("deployed");
      setTimeout(() => setSyncStatus("idle"), 3000);
    } catch (error) {
      setSyncStatus("error");
      console.error("Ошибка развертывания:", error);
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case "syncing": return "text-blue-600";
      case "deploying": return "text-orange-600";
      case "success": return "text-green-600";
      case "deployed": return "text-purple-600";
      case "error": return "text-red-600";
      default: return "text-gray-600";
    }
  };

  const getStatusText = () => {
    switch (syncStatus) {
      case "syncing": return "Синхронизация с GitHub...";
      case "deploying": return "Развертывание на Reg.ru...";
      case "success": return "Синхронизация завершена";
      case "deployed": return "Развертывание завершено";
      case "error": return "Ошибка операции";
      default: return "Готов к работе";
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">GitHub Integration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Репозиторий
            </label>
            <input
              type="text"
              value={githubSettings.repo}
              onChange={(e) => handleSettingChange('repo', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="username/repository"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ветка
            </label>
            <input
              type="text"
              value={githubSettings.branch}
              onChange={(e) => handleSettingChange('branch', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="main"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              GitHub Token
            </label>
            <input
              type="password"
              value={githubSettings.token}
              onChange={(e) => handleSettingChange('token', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Цель развертывания
            </label>
            <select
              value={githubSettings.deployTarget}
              onChange={(e) => handleSettingChange('deployTarget', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="railway">Railway</option>
              <option value="render.com">Render.com</option>
              <option value="ps.kz">PS.kz Хостинг</option>
              <option value="manual">Ручное развертывание</option>
            </select>
          </div>
        </div>

        <div className="flex items-center mb-6">
          <input
            type="checkbox"
            id="autoSync"
            checked={githubSettings.autoSync}
            onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="autoSync" className="ml-2 block text-sm text-gray-900">
            Автоматическая синхронизация при изменениях
          </label>
        </div>

        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <span className="text-sm font-medium text-gray-700">Статус: </span>
            <span className={`text-sm font-medium ${getStatusColor()}`}>
              {getStatusText()}
            </span>
            {lastSync && (
              <div className="text-xs text-gray-500 mt-1">
                Последняя синхронизация: {lastSync}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={syncWithGitHub}
            disabled={syncStatus !== "idle"}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncStatus === "syncing" ? "Синхронизация..." : "Синхронизировать с GitHub"}
          </button>

          <button
            onClick={deployToRegRu}
            disabled={syncStatus !== "idle"}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {syncStatus === "deploying" ? "Развертывание..." : "Развернуть на Reg.ru"}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Инструкции по развертыванию</h3>
        
        <div className="space-y-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900">1. Настройка GitHub</h4>
            <p>Создайте Personal Access Token в GitHub Settings → Developer settings → Personal access tokens</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">2. Загрузка на Reg.ru</h4>
            <p>Скачайте архив <code className="bg-gray-100 px-1 rounded">laravel-newback.tar.gz</code> и загрузите через ISPmanager</p>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900">3. Настройка базы данных</h4>
            <p>Выполните SQL скрипт <code className="bg-gray-100 px-1 rounded">database_setup.sql</code> в PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GitHubTab;
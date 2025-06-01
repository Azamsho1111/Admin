import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { ModalProvider } from "./components/ModalProvider";
import LoginPage from "./components/LoginPage";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import RoleBasedRoute from "./components/RoleBasedRoute";
import { Line } from 'react-chartjs-2';
import { dashboard, users as usersAPI } from './services/api';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import Moderation from "./components/Moderation";
import Filters from "./components/Filters";
import Management from "./components/Management";
import Notifications from "./components/Notifications";
import SettingsPage from "./components/SettingsPage";
import Collaboration from "./components/Collaboration";
import RealTimeNotifications from "./components/RealTimeNotifications";


ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

function Dashboard() {
  const [stats, setStats] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [chartData, setChartData] = React.useState(null);
  const [error, setError] = React.useState(null);
  const [widgetLayout] = React.useState(['stats', 'chart', 'recent']);

  React.useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Загружаем статистику с реального Laravel сервера
        console.log('Загружаем данные с Laravel API...');
        const serverStats = await dashboard.getStats();
        console.log('Получены данные:', serverStats);
        
        const statsArray = [
          { label: 'Всего моделей', value: serverStats.total_models, diff: '+8.2%', icon: '📦' },
          { label: 'Пользователи', value: serverStats.total_users, diff: '+12.5%', icon: '👤' },
          { label: 'На модерации', value: serverStats.pending_models, diff: '-3.1%', icon: '⏰' },
          { label: 'Одобренные', value: serverStats.approved_models, diff: '+15.3%', icon: '✅' },
          { label: 'Отклоненные', value: serverStats.rejected_models, diff: '-2.1%', icon: '❌' },
          { label: 'Активные пользователи', value: serverStats.active_users, diff: '+4.4%', icon: '🟢' },
          { label: 'Доход за месяц', value: `${serverStats.revenue.toLocaleString()} ₽`, diff: '+15.3%', icon: '💰' },
          { label: 'Транзакции', value: serverStats.transactions, diff: '+4.4%', icon: '📈' },
        ];
        
        setStats(statsArray);
        
        // Генерируем данные для графика на основе реальных данных
        const chartDataConfig = {
          labels: ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн'],
          datasets: [
            {
              label: 'Загруженные модели',
              data: [65, 78, 90, 81, 95, Math.round(serverStats.total_models / 12)],
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true,
            },
            {
              label: 'Одобренные модели',
              data: [45, 68, 75, 72, 85, Math.round(serverStats.approved_models / 12)],
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.4,
              fill: true,
            }
          ]
        };
        
        setChartData(chartDataConfig);
        
      } catch (error) {
        console.error('Ошибка загрузки данных дашборда:', error);
        setError('Не удалось загрузить данные с сервера');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  // Остальной код Dashboard компонента остается тем же...


  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { 
        display: true,
        position: 'bottom',
      },
      title: { display: false },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
        }
      },
      x: {
        grid: {
          color: '#f3f4f6',
        },
        ticks: {
          color: '#6b7280',
        }
      }
    }
  };



  const AnimatedStatWidget = ({ stat, index }) => (
    <div 
      className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
      style={{ 
        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
      }}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-gray-600 text-sm mb-2">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
          <div className="flex items-center">
            <span className={`text-sm font-medium ${
              stat.diff.startsWith('+') ? 'text-green-600' : 
              stat.diff.startsWith('-') ? 'text-red-600' : 'text-gray-600'
            }`}>
              {stat.diff}
            </span>
            <span className="text-xs text-gray-500 ml-2">за период</span>
          </div>
        </div>
        <div className="text-4xl opacity-80">
          {stat.icon}
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Дашборд</h1>
            <p className="text-gray-600 text-sm">Данные загружены с Laravel API сервера</p>
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => window.location.reload()}
              className="px-3 py-2 text-xs bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Обновить данные
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">⚠️ {error}</p>
        </div>
      )}

      {widgetLayout.map((widgetType, layoutIndex) => {
        
        if (widgetType === 'stats') {
          return (
            <div key="stats" className="mb-6">
              {loading ? (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg border border-gray-200 p-6 pulse-loading">
                      <div className="h-4 bg-gray-200 rounded mb-2"></div>
                      <div className="h-8 bg-gray-200 rounded mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                  {stats.map((stat, index) => (
                    <AnimatedStatWidget key={index} stat={stat} index={index} />
                  ))}
                </div>
              )}
            </div>
          );
        }

        if (widgetType === 'chart') {
          return (
            <div key="chart" className="mb-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Статистика загрузок</h2>
                {loading ? (
                  <div className="h-64 bg-gray-200 rounded pulse-loading"></div>
                ) : chartData ? (
                  <div style={{ height: '300px' }}>
                    <Line data={chartData} options={options} />
                  </div>
                ) : (
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    Данные графика недоступны
                  </div>
                )}
              </div>
            </div>
          );
        }

        if (widgetType === 'recent') {
          return (
            <div key="recent" className="mb-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Последние действия</h2>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Новая модель загружена</span>
                      <span className="text-sm text-gray-500">2 мин назад</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Пользователь зарегистрирован</span>
                      <span className="text-sm text-gray-500">15 мин назад</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600">Модель одобрена</span>
                      <span className="text-sm text-gray-500">1 час назад</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function Users() {
  const [users, setUsers] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState(null);

  React.useEffect(() => {
    const loadUsers = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Загружаем пользователей с Laravel API...');
        const response = await usersAPI.getAll();
        console.log('Получены пользователи:', response);
        
        if (response.success && response.data) {
          setUsers(response.data);
        } else {
          setError('Неверный формат данных пользователей');
        }
        
      } catch (error) {
        console.error('Ошибка загрузки пользователей:', error);
        setError('Не удалось загрузить список пользователей');
      } finally {
        setLoading(false);
      }
    };

    loadUsers();
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Пользователи</h1>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 pulse-loading">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Пользователи</h1>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">⚠️ {error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Пользователи</h1>
          <p className="text-gray-600 text-sm">Данные загружены с Laravel API сервера</p>
        </div>
        <button 
          onClick={() => window.location.reload()}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Обновить список
        </button>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Пользователь</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Роль</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Статус</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Моделей</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Последняя активность</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{user.name}</div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.role === 'administrator' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'moderator' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {user.role === 'administrator' ? 'Администратор' :
                     user.role === 'moderator' ? 'Модератор' : 'Пользователь'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {user.status === 'active' ? 'Активен' : 'Неактивен'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {user.modelsCount || 0}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(user.lastActivity).toLocaleString('ru-RU')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Остальные компоненты остаются без изменений
function Models() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">3D модели</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Управление 3D моделями (подключение к API в разработке)</p>
      </div>
    </div>
  );
}

function Gallery() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Галерея</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Галерея изображений</p>
      </div>
    </div>
  );
}

function Lessons() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Уроки</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Обучающие материалы</p>
      </div>
    </div>
  );
}

function Design() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Дизайн</h1>
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <p className="text-gray-600">Инструменты дизайна</p>
      </div>
    </div>
  );
}

function Settings() {
  return <SettingsPage />;
}

function Sidebar({ isOpen = false, onToggle }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { path: '/dashboard', label: 'Дашборд', icon: '📊', roles: ['administrator', 'moderator'] },
    { path: '/users', label: 'Пользователи', icon: '👥', roles: ['administrator'] },
    { path: '/models', label: '3D модели', icon: '🎯', roles: ['administrator', 'moderator'] },
    { path: '/moderation', label: 'Модерация', icon: '✅', roles: ['administrator', 'moderator'] },
    { path: '/gallery', label: 'Галерея', icon: '🖼️', roles: ['administrator', 'moderator'] },
    { path: '/lessons', label: 'Уроки', icon: '📚', roles: ['administrator', 'moderator'] },
    { path: '/design', label: 'Дизайн', icon: '🎨', roles: ['administrator', 'moderator'] },
    { path: '/filters', label: 'Фильтры', icon: '🔍', roles: ['administrator'] },
    { path: '/management', label: 'Управление', icon: '💰', roles: ['administrator'] },
    { path: '/notifications', label: 'Уведомления', icon: '🔔', roles: ['administrator', 'moderator'] },
    { path: '/settings', label: 'Настройки', icon: '⚙️', roles: ['administrator', 'moderator'] },
  ];

  const allowedItems = menuItems.filter(item => 
    !item.roles || item.roles.includes(user?.role)
  );

  return (
    <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static`}>
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200 flex-shrink-0">
        <h1 className="text-xl font-bold text-gray-900">CGArea Admin</h1>
        <button onClick={onToggle} className="lg:hidden">
          <span className="text-2xl">✕</span>
        </button>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-2">
          {allowedItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className="flex items-center px-4 py-2 text-gray-700 rounded-md hover:bg-gray-100 hover:text-gray-900 transition-colors"
              onClick={() => window.innerWidth < 1024 && onToggle()}
            >
              <span className="mr-3 text-lg">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-gray-200 p-4 flex-shrink-0">
        <div className="mb-3">
          <p className="text-sm font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
          <p className="text-xs text-gray-500">{user?.role === 'administrator' ? 'Администратор' : 'Модератор'}</p>
        </div>
        <button
          onClick={logout}
          className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
        >
          Выйти
        </button>
      </div>
    </div>
  );
}

function Header({ onMenuClick }) {
  return (
    <header className="bg-white border-b border-gray-200 flex-shrink-0">
      <div className="flex items-center justify-between h-16 px-4">
        <button onClick={onMenuClick} className="lg:hidden">
          <span className="text-2xl">☰</span>
        </button>
        
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            CGArea Admin Panel
          </div>
        </div>
      </div>
    </header>
  );
}

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 flex flex-col">
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <Collaboration />
      <RealTimeNotifications />
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

function AuthenticatedApp() {
  return (
    <Layout>
      <Routes>
        <Route path="/dashboard" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Dashboard />
          </RoleBasedRoute>
        } />
        <Route path="/users" element={
          <RoleBasedRoute allowedRoles={['administrator']}>
            <Users />
          </RoleBasedRoute>
        } />
        <Route path="/models" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Models />
          </RoleBasedRoute>
        } />
        <Route path="/moderation" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Moderation />
          </RoleBasedRoute>
        } />
        <Route path="/gallery" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Gallery />
          </RoleBasedRoute>
        } />
        <Route path="/lessons" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Lessons />
          </RoleBasedRoute>
        } />
        <Route path="/design" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Design />
          </RoleBasedRoute>
        } />
        <Route path="/filters" element={
          <RoleBasedRoute allowedRoles={['administrator']}>
            <Filters />
          </RoleBasedRoute>
        } />
        <Route path="/management" element={
          <RoleBasedRoute allowedRoles={['administrator']}>
            <Management />
          </RoleBasedRoute>
        } />
        <Route path="/notifications" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <Notifications />
          </RoleBasedRoute>
        } />
        <Route path="/settings" element={
          <RoleBasedRoute allowedRoles={['administrator', 'moderator']}>
            <SettingsPage />
          </RoleBasedRoute>
        } />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <AuthProvider>
      <ModalProvider>
        <Router>
          <div className="App">
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/*" element={
                <ProtectedRoute>
                  <AuthenticatedApp />
                </ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </ModalProvider>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Загрузка...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default App;
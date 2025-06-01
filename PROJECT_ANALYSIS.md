# Полный анализ проекта админ-панели

## Статус централизованной системы настроек

### ✅ НАСТРОЕНО ПРАВИЛЬНО:
1. **SettingsPage.js** - Использует централизованные настройки
2. **apiConfigService.js** - Центральный сервис настроек API

### 🔧 ТРЕБУЕТ ИСПРАВЛЕНИЯ:

#### 1. FilterCategories.js
- **Проблема**: Использует localStorage напрямую вместо apiConfig
- **Исправление**: Заменить на apiConfig.getConfig()

#### 2. FilterSections.js  
- **Проблема**: Hardcoded API_BASE_URL
- **Исправление**: Использовать централизованные настройки

#### 3. FilterRenders.js
- **Проблема**: Прямое обращение к localStorage
- **Исправление**: Интегрировать с apiConfig

## Реальные данные в системе:

### API Сервер:
- URL: u185465.test-handyhost.ru
- Ключ: handyhosttrial=yes
- Таймаут: 30000ms
- Попытки: 3

### FTP:
- Хост: 109.95.210.216:21
- Логин: u185465
- Пароль: uZ7kI5pG8s

### База данных:
- Хост: 127.0.0.1:3306
- База: u185459_laravel
- Логин: u185459_laravel
- Пароль: oM1mK6xV6q

### API Эндпоинты (15 шт):
1. /api_categories.php - Категории
2. /api_sections.php - Разделы  
3. /api_models.php - Модели
4. /api_users.php - Пользователи
5. /api_dashboard.php - Дашборд
6. /api_materials.php - Материалы
7. /api_renders.php - Рендеры
8. /api_colors.php - Цвета
9. /api_softs.php - Софт
10. /api_formats.php - Форматы
11. /api_polygons.php - Полигоны
12. /api_styles.php - Стили
13. /api_animation.php - Анимация
14. /api_statuses.php - Статусы
15. /api_others.php - Прочее

## План исправления:
1. Обновить все фильтры для использования apiConfig
2. Убрать hardcoded значения
3. Протестировать централизованную систему
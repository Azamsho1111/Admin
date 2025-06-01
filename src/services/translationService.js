/**
 * Служба автоматического перевода для админ-панели
 * Поддерживает различные API переводчиков
 */

class TranslationService {
  constructor() {
    this.cache = new Map();
    this.pendingRequests = new Map();
    this.settings = this.getTranslationSettings();
  }

  getTranslationSettings() {
    try {
      const saved = localStorage.getItem('translation_settings');
      return saved ? JSON.parse(saved) : {
        provider: 'mymemory', // 'mymemory', 'google', 'yandex'
        apiKey: '',
        enabled: true,
        autoTranslate: true,
        fromLang: 'ru',
        toLang: 'en'
      };
    } catch {
      return {
        provider: 'mymemory',
        apiKey: '',
        enabled: true,
        autoTranslate: true,
        fromLang: 'ru',
        toLang: 'en'
      };
    }
  }

  saveSettings(settings) {
    this.settings = { ...this.settings, ...settings };
    localStorage.setItem('translation_settings', JSON.stringify(this.settings));
  }

  async translateText(text, fromLang = 'ru', toLang = 'en') {
    if (!text || !text.trim() || !this.settings.enabled) {
      return text;
    }

    const cacheKey = `${fromLang}-${toLang}-${text}`;
    
    // Проверяем кэш
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    // Проверяем, есть ли уже запрос на перевод этого текста
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }

    const translationPromise = this.performTranslation(text, fromLang, toLang);
    this.pendingRequests.set(cacheKey, translationPromise);

    try {
      const result = await translationPromise;
      this.cache.set(cacheKey, result);
      this.pendingRequests.delete(cacheKey);
      return result;
    } catch (error) {
      this.pendingRequests.delete(cacheKey);
      console.error('Ошибка перевода:', error);
      return this.fallbackTransliteration(text);
    }
  }

  async performTranslation(text, fromLang, toLang) {
    switch (this.settings.provider) {
      case 'google':
        return this.translateWithGoogle(text, fromLang, toLang);
      case 'yandex':
        return this.translateWithYandex(text, fromLang, toLang);
      default:
        return this.translateWithMyMemory(text, fromLang, toLang);
    }
  }

  async translateWithMyMemory(text, fromLang, toLang) {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${fromLang}|${toLang}`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText;
    }
    
    throw new Error('MyMemory API недоступен');
  }

  async translateWithGoogle(text, fromLang, toLang) {
    if (!this.settings.apiKey) {
      throw new Error('Google Translate API ключ не настроен');
    }

    const url = `https://translation.googleapis.com/language/translate/v2?key=${this.settings.apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        q: text,
        source: fromLang,
        target: toLang,
        format: 'text'
      })
    });

    const data = await response.json();
    
    if (data && data.data && data.data.translations && data.data.translations[0]) {
      return data.data.translations[0].translatedText;
    }
    
    throw new Error('Google Translate API недоступен');
  }

  async translateWithYandex(text, fromLang, toLang) {
    if (!this.settings.apiKey) {
      throw new Error('Yandex Translate API ключ не настроен');
    }

    const url = 'https://translate.yandex.net/api/v1.5/tr.json/translate';
    
    const params = new URLSearchParams({
      key: this.settings.apiKey,
      text: text,
      lang: `${fromLang}-${toLang}`,
      format: 'plain'
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();
    
    if (data && data.code === 200 && data.text && data.text[0]) {
      return data.text[0];
    }
    
    throw new Error('Yandex Translate API недоступен');
  }

  fallbackTransliteration(text) {
    // Простая транслитерация как запасной вариант
    const map = {
      'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e',
      'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
      'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
      'ф': 'f', 'х': 'h', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'sch',
      'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya'
    };
    
    return text.toLowerCase().split('').map(char => map[char] || char).join('');
  }

  // Перевод с задержкой для избежания частых запросов
  translateWithDelay(text, delay = 1000, fromLang = 'ru', toLang = 'en') {
    return new Promise((resolve) => {
      setTimeout(async () => {
        const translated = await this.translateText(text, fromLang, toLang);
        resolve(translated);
      }, delay);
    });
  }

  // Очистка кэша
  clearCache() {
    this.cache.clear();
  }

  // Получение статистики кэша
  getCacheStats() {
    return {
      size: this.cache.size,
      pendingRequests: this.pendingRequests.size
    };
  }
}

// Создаем единственный экземпляр службы
const translationService = new TranslationService();

export default translationService;
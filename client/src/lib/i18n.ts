export type Language = 'ja' | 'en' | 'zh';

export const translations = {
  ja: {
    // Navigation
    home: 'ホーム',
    search: '検索',
    favorites: 'お気に入り',
    history: '履歴',
    recommendations: 'レコメンド',
    proposals: '研究提案',
    
    // Auth
    signIn: 'サインイン',
    signOut: 'サインアウト',
    pleaseSignIn: 'サインインしてください',
    
    // Common
    loading: '読み込み中...',
    error: 'エラーが発生しました',
    save: '保存',
    cancel: 'キャンセル',
    delete: '削除',
    edit: '編集',
    close: '閉じる',
    
    // Language
    language: '言語',
    japanese: '日本語',
    english: 'English',
    chinese: '中文',
  },
  en: {
    // Navigation
    home: 'Home',
    search: 'Search',
    favorites: 'Favorites',
    history: 'History',
    recommendations: 'Recommendations',
    proposals: 'Research Proposals',
    
    // Auth
    signIn: 'Sign in',
    signOut: 'Sign out',
    pleaseSignIn: 'Please sign in to continue',
    
    // Common
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    close: 'Close',
    
    // Language
    language: 'Language',
    japanese: '日本語',
    english: 'English',
    chinese: '中文',
  },
  zh: {
    // Navigation
    home: '首页',
    search: '搜索',
    favorites: '收藏',
    history: '历史',
    recommendations: '推荐',
    proposals: '研究提案',
    
    // Auth
    signIn: '登录',
    signOut: '退出',
    pleaseSignIn: '请登录以继续',
    
    // Common
    loading: '加载中...',
    error: '发生错误',
    save: '保存',
    cancel: '取消',
    delete: '删除',
    edit: '编辑',
    close: '关闭',
    
    // Language
    language: '语言',
    japanese: '日本語',
    english: 'English',
    chinese: '中文',
  },
};

export type TranslationKey = keyof typeof translations.ja;

const LANGUAGE_KEY = 'app-language';

export function getLanguage(): Language {
  const saved = localStorage.getItem(LANGUAGE_KEY);
  if (saved && (saved === 'ja' || saved === 'en' || saved === 'zh')) {
    return saved;
  }
  
  // Detect browser language
  const browserLang = navigator.language.toLowerCase();
  if (browserLang.startsWith('ja')) return 'ja';
  if (browserLang.startsWith('zh')) return 'zh';
  return 'en';
}

export function setLanguage(lang: Language) {
  localStorage.setItem(LANGUAGE_KEY, lang);
  window.location.reload();
}

export function t(key: TranslationKey, lang?: Language): string {
  const currentLang = lang || getLanguage();
  return translations[currentLang][key] || translations.en[key] || key;
}

export function getLanguageName(lang: Language): string {
  switch (lang) {
    case 'ja': return '日本語';
    case 'en': return 'English';
    case 'zh': return '中文';
  }
}

export function getLLMLanguageInstruction(lang: Language): string {
  switch (lang) {
    case 'ja': return '日本語で応答してください。';
    case 'en': return 'Please respond in English.';
    case 'zh': return '请用中文回答。';
  }
}


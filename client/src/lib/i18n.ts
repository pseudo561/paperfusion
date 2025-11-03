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
    
    // Search page
    searchPlaceholder: '例: machine learning, quantum computing',
    searchSource: '検索ソース',
    both: '両方',
    arxiv: 'arXiv',
    semanticScholar: 'Semantic Scholar',
    searchButton: '検索',
    
    // Proposals page
    researchProposals: '研究テーマ提案',
    researchProposalsDesc: '複数の論文から新しい研究アイデアを生成します',
    createNewProposal: '新規提案を作成',
    aboutThisFeature: 'この機能について',
    proposalFeatureDesc: 'お気に入りに保存した複数の論文を選択し、AIを使って新しい研究テーマを提案します。選択した論文の内容を分析し、それらを組み合わせた革新的な研究アイデアを生成します。',
    selectPapersForProposal: '提案に使用する論文を選択',
    noFavoritesForProposal: 'お気に入りに論文がありません。まず論文を検索してお気に入りに追加してください。',
    generateProposal: '提案を生成',
    generating: '生成中...',
    proposalContent: '提案内容',
    generatedAt: '生成日時',
    basedOnPapers: '基にした論文',
    noProposalsYet: 'まだ研究提案がありません',
    noProposalsDesc: '「新規提案を作成」ボタンから、お気に入りの論文を組み合わせて新しい研究アイデアを生成できます。',
    proposalGenerated: '研究提案を生成しました',
    proposalDeleted: '研究提案を削除しました',
    selectAtLeastOne: '少なくとも1つの論文を選択してください',
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
    
    // Search page
    searchPlaceholder: 'e.g., machine learning, quantum computing',
    searchSource: 'Search Source',
    both: 'Both',
    arxiv: 'arXiv',
    semanticScholar: 'Semantic Scholar',
    searchButton: 'Search',
    
    // Proposals page
    researchProposals: 'Research Proposals',
    researchProposalsDesc: 'Generate new research ideas from multiple papers',
    createNewProposal: 'Create New Proposal',
    aboutThisFeature: 'About This Feature',
    proposalFeatureDesc: 'Select multiple papers from your favorites and use AI to propose new research themes. Analyzes the content of selected papers and generates innovative research ideas by combining them.',
    selectPapersForProposal: 'Select papers for proposal',
    noFavoritesForProposal: 'No papers in favorites. Please search for papers and add them to favorites first.',
    generateProposal: 'Generate Proposal',
    generating: 'Generating...',
    proposalContent: 'Proposal Content',
    generatedAt: 'Generated At',
    basedOnPapers: 'Based on Papers',
    noProposalsYet: 'No research proposals yet',
    noProposalsDesc: 'Click "Create New Proposal" to generate new research ideas by combining your favorite papers.',
    proposalGenerated: 'Research proposal generated',
    proposalDeleted: 'Research proposal deleted',
    selectAtLeastOne: 'Please select at least one paper',
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
    
    // Search page
    searchPlaceholder: '例如：machine learning, quantum computing',
    searchSource: '搜索来源',
    both: '全部',
    arxiv: 'arXiv',
    semanticScholar: 'Semantic Scholar',
    searchButton: '搜索',
    
    // Proposals page
    researchProposals: '研究提案',
    researchProposalsDesc: '从多篇论文生成新的研究想法',
    createNewProposal: '创建新提案',
    aboutThisFeature: '关于此功能',
    proposalFeatureDesc: '从收藏中选择多篇论文，使用AI提出新的研究主题。分析所选论文的内容，并通过组合它们生成创新的研究想法。',
    selectPapersForProposal: '选择用于提案的论文',
    noFavoritesForProposal: '收藏中没有论文。请先搜索论文并添加到收藏。',
    generateProposal: '生成提案',
    generating: '生成中...',
    proposalContent: '提案内容',
    generatedAt: '生成时间',
    basedOnPapers: '基于论文',
    noProposalsYet: '还没有研究提案',
    noProposalsDesc: '点击"创建新提案"按钮，通过组合您收藏的论文来生成新的研究想法。',
    proposalGenerated: '研究提案已生成',
    proposalDeleted: '研究提案已删除',
    selectAtLeastOne: '请至少选择一篇论文',
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


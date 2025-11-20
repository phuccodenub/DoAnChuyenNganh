import React, { useEffect } from 'react';
import { Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface LanguageSwitcherProps {
  className?: string;
  variant?: 'dropdown' | 'inline';
  showLabel?: boolean;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  className = '',
  variant = 'dropdown',
  showLabel = false
}) => {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'vi', name: 'Tiếng Việt', flag: '🇻🇳' }
  ];

  const currentLang = languages.find((lang) => lang.code === i18n.language);

  const handleLanguageChange = (langCode: string) => {
    i18n.changeLanguage(langCode);
    // Persist to localStorage (i18n already does this via detection)
    localStorage.setItem('i18nextLng', langCode);
    // Also update document lang attribute
    document.documentElement.lang = langCode;
  };

  // Set document language on mount
  useEffect(() => {
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  if (variant === 'inline') {
    return (
      <div className={`flex items-center gap-2 ${className}`} role="group" aria-label={t('navigation.language')}>
        {languages.map((lang) => (
          <button
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={`px-3 py-1 rounded transition-all ${
              i18n.language === lang.code
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
            aria-label={`Switch to ${lang.name}`}
            aria-pressed={i18n.language === lang.code}
            title={lang.name}
          >
            {showLabel ? lang.name : lang.flag}
          </button>
        ))}
      </div>
    );
  }

  // Dropdown variant
  return (
    <div className={`relative group ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
        aria-label={t('navigation.language')}
        aria-expanded="false"
        aria-haspopup="listbox"
        title={`Current language: ${currentLang?.name}`}
      >
        <Globe className="w-5 h-5" />
        {showLabel && <span className="text-sm font-medium">{currentLang?.code.toUpperCase()}</span>}
      </button>

      {/* Dropdown Menu */}
      <ul
        className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50"
        role="listbox"
        aria-label={t('navigation.language')}
      >
        {languages.map((lang) => (
          <li key={lang.code} role="option" aria-selected={i18n.language === lang.code}>
            <button
              onClick={() => handleLanguageChange(lang.code)}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 focus:bg-gray-50 focus:outline-none transition-colors ${
                i18n.language === lang.code ? 'bg-blue-50 font-semibold' : ''
              }`}
              aria-label={`Switch to ${lang.name}`}
            >
              <span className="text-xl">{lang.flag}</span>
              <div>
                <div className="font-medium text-gray-900">{lang.name}</div>
                <div className="text-xs text-gray-500">{lang.code}</div>
              </div>
              {i18n.language === lang.code && <span className="ml-auto text-blue-500">✓</span>}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LanguageSwitcher;

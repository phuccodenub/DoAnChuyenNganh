import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'

// Import các file dịch
import enTranslations from './locales/en.json'
import viTranslations from './locales/vi.json'

// Cấu hình i18next
i18n
  .use(initReactI18next) // Kết nối với React
  .init({
    resources: {
      en: {
        translation: enTranslations,
      },
      vi: {
        translation: viTranslations,
      },
    },
    lng: 'vi', // Ngôn ngữ mặc định là tiếng Việt
    fallbackLng: 'en', // Fallback về tiếng Anh nếu không tìm thấy key dịch
    interpolation: {
      escapeValue: false, // Không cần escape HTML vì React đã xử lý
    },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },
  })

export default i18n


import { useTranslation } from 'react-i18next'
import { Button } from './Button'

const LanguageSwitcher = () => {
  const { i18n, t } = useTranslation()

  const toggleLanguage = () => {
    const newLanguage = i18n.language === 'vi' ? 'en' : 'vi'
    i18n.changeLanguage(newLanguage)
  }

  const currentLanguage = i18n.language === 'vi' ? 'EN' : 'VI'

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggleLanguage}
      className="flex items-center space-x-2"
      title={t('navigation.language')}
    >
      <span className="text-sm font-medium">{currentLanguage}</span>
    </Button>
  )
}

export default LanguageSwitcher


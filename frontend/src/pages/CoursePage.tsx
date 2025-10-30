import { useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

function CoursePage() {
  const { id } = useParams()
  const { t } = useTranslation()

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">{t('coursePage.title', { id })}</h1>
      <div className="bg-white p-6 rounded-lg shadow">
        <p className="text-gray-600">{t('coursePage.description')}</p>
        <ul className="mt-4 space-y-2 text-sm text-gray-600">
          <li>• {t('coursePage.items.materials')}</li>
          <li>• {t('coursePage.items.realtimeChat')}</li>
          <li>• {t('coursePage.items.assignments')}</li>
          <li>• {t('coursePage.items.liveSessions')}</li>
        </ul>
      </div>
    </div>
  )
}

export default CoursePage
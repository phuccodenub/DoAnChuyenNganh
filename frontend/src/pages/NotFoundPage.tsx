import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/Button'

function NotFoundPage() {
  const navigate = useNavigate()
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-9xl font-bold text-gray-300">404</h1>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Không tìm thấy trang</h2>
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi.
        </p>
        <Button onClick={() => navigate('/')}>
          Về trang chủ
        </Button>
      </div>
    </div>
  )
}

export default NotFoundPage
import { Link } from 'react-router-dom'
import { 
  Video, 
  Clock, 
  Users, 
  ArrowRight,
  Radio,
  Calendar
} from 'lucide-react'

export function LiveClassesSection() {
  // Mock data - sẽ kết nối với API sau
  const liveClasses = [
    {
      id: 1,
      title: 'Lập trình React từ Zero đến Hero',
      instructor: 'Nguyễn Văn A',
      thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=600&fit=crop',
      viewers: 245,
      status: 'live',
      startTime: new Date(),
    },
    {
      id: 2,
      title: 'Python cho Data Science',
      instructor: 'Trần Thị B',
      thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',
      viewers: 189,
      status: 'live',
      startTime: new Date(),
    },
  ]

  const upcomingClasses = [
    {
      id: 3,
      title: 'UI/UX Design Workshop',
      instructor: 'Lê Văn C',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      startTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 giờ sau
      enrolled: 156,
    },
    {
      id: 4,
      title: 'Blockchain Development Basics',
      instructor: 'Phạm Thị D',
      thumbnail: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&h=600&fit=crop',
      startTime: new Date(Date.now() + 5 * 60 * 60 * 1000), // 5 giờ sau
      enrolled: 203,
    },
  ]

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('vi-VN', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getTimeUntil = (date: Date) => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (hours > 0) {
      return `${hours} giờ ${minutes} phút`
    }
    return `${minutes} phút`
  }

  return (
    <section className="py-12 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Live Classes */}
        {liveClasses.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Radio className="w-6 h-6 text-red-500" />
                  <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Lớp học đang phát trực tiếp
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Tham gia ngay để không bỏ lỡ nội dung quan trọng
                  </p>
                </div>
              </div>
              <Link
                to="/livestream"
                className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {liveClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/livestream/${classItem.id}`}
                  className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="relative aspect-video bg-gray-900">
                    <img
                      src={classItem.thumbnail}
                      alt={classItem.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                    
                    {/* Live Badge */}
                    <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-500 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                      ĐANG PHÁT TRỰC TIẾP
                    </div>

                    {/* Viewers Count */}
                    <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm">
                      <Users className="w-4 h-4" />
                      <span>{classItem.viewers}</span>
                    </div>

                    {/* Content */}
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <h3 className="text-xl font-bold mb-2 group-hover:text-indigo-300 transition-colors">
                        {classItem.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-200">
                        <span>Giảng viên: {classItem.instructor}</span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTime(classItem.startTime)}
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Upcoming Classes */}
        {upcomingClasses.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Calendar className="w-6 h-6 text-indigo-600" />
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
                    Lớp học sắp diễn ra
                  </h2>
                  <p className="text-gray-600 text-sm mt-1">
                    Đăng ký ngay để nhận thông báo
                  </p>
                </div>
              </div>
              <Link
                to="/livestream?filter=upcoming"
                className="hidden md:flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
              >
                Xem tất cả
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {upcomingClasses.map((classItem) => (
                <Link
                  key={classItem.id}
                  to={`/livestream/${classItem.id}`}
                  className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-200"
                >
                  <div className="relative aspect-video bg-gray-200">
                    <img
                      src={classItem.thumbnail}
                      alt={classItem.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-4 right-4 bg-indigo-600 text-white px-3 py-1.5 rounded-full text-sm font-semibold">
                      Bắt đầu sau: {getTimeUntil(classItem.startTime)}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                      {classItem.title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-gray-600">
                      <span>Giảng viên: {classItem.instructor}</span>
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{classItem.enrolled} đã đăng ký</span>
                      </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 text-indigo-600 text-sm font-medium">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(classItem.startTime)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile View All */}
        <div className="mt-8 text-center md:hidden">
          <Link
            to="/livestream"
            className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Xem tất cả lớp học
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}


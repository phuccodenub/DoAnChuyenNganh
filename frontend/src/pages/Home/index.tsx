import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Users, 
  Award, 
  Star, 
  Clock,
  ArrowRight,
  PlayCircle,
  Zap
} from 'lucide-react'
import { MainLayout } from '@/layouts/MainLayout'
import { SliderBanner } from './components/SliderBanner'
import { categories } from '@/components/layout/data'

function Home() {

  // Mock data for featured courses
  const featuredCourses = [
    {
      id: 1,
      title: 'Lập trình Web Full Stack với React & Node.js',
      description: 'Học cách xây dựng ứng dụng web hoàn chỉnh từ frontend đến backend',
      thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&h=600&fit=crop',
      price: 2500000,
      isFree: false,
      students: 1245,
      rating: 4.8,
      duration: 40,
      difficulty: 'intermediate',
    },
    {
      id: 2,
      title: 'Python cho Data Science và Machine Learning',
      description: 'Khóa học toàn diện về phân tích dữ liệu và AI với Python',
      thumbnail: 'https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=800&h=600&fit=crop',
      price: 3200000,
      isFree: false,
      students: 892,
      rating: 4.9,
      duration: 50,
      difficulty: 'advanced',
    },
    {
      id: 3,
      title: 'UI/UX Design từ cơ bản đến nâng cao',
      description: 'Thiết kế giao diện đẹp mắt và trải nghiệm người dùng tuyệt vời',
      thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&h=600&fit=crop',
      price: 1800000,
      isFree: false,
      students: 2103,
      rating: 4.7,
      duration: 35,
      difficulty: 'beginner',
    },
    {
      id: 4,
      title: 'JavaScript ES6+ và Modern Web Development',
      description: 'Nắm vững JavaScript hiện đại và các công nghệ web mới nhất',
      thumbnail: 'https://images.unsplash.com/photo-1579468118864-1b9ea3c0db4a?w=800&h=600&fit=crop',
      price: 0,
      isFree: true,
      students: 3456,
      rating: 4.6,
      duration: 30,
      difficulty: 'beginner',
    },
  ]

  const stats = [
    { icon: Users, value: '50,000+', label: 'Học viên' },
    { icon: BookOpen, value: '500+', label: 'Khóa học' },
    { icon: Award, value: '200+', label: 'Giảng viên' },
    { icon: Star, value: '4.8/5', label: 'Đánh giá' },
  ]

  const features = [
    {
      icon: PlayCircle,
      title: 'Video chất lượng cao',
      description: 'Học với video HD, có phụ đề và tài liệu đầy đủ',
    },
    {
      icon: Users,
      title: 'Cộng đồng hỗ trợ',
      description: 'Tham gia cộng đồng học viên và nhận hỗ trợ từ giảng viên',
    },
    {
      icon: Award,
      title: 'Chứng chỉ xác thực',
      description: 'Nhận chứng chỉ sau khi hoàn thành khóa học',
    },
    {
      icon: Clock,
      title: 'Học mọi lúc mọi nơi',
      description: 'Truy cập khóa học 24/7 trên mọi thiết bị',
    },
  ]

  return (
    <MainLayout showSidebar={true}>
      <SliderBanner />
          
          {/* Statistics Section */}
          <section className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 py-12">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {stats.map((stat, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-3">
                      <div className="p-3 bg-blue-50 rounded-full">
                        <stat.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                    <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Featured Courses Section */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Khóa học nổi bật</h2>
                  <p className="text-gray-600">Những khóa học được yêu thích nhất</p>
                </div>
                <Link
                  to="/courses"
                  className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredCourses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/courses/${course.id}`}
                    className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="aspect-video bg-gray-200 relative overflow-hidden">
                      <img
                        src={course.thumbnail}
                        alt={course.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      {course.isFree && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white text-xs font-semibold px-2 py-1 rounded">
                          Miễn phí
                        </div>
                      )}
                      <div className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs font-semibold px-2 py-1 rounded">
                        {course.difficulty === 'beginner' ? 'Cơ bản' : 
                         course.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{course.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{course.students.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                          <span>{course.rating}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{course.duration}h</span>
                        </div>
                      </div>
                      <div className="text-lg font-bold text-gray-900">
                        {course.isFree ? 'Miễn phí' : `${course.price.toLocaleString('vi-VN')} đ`}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              <div className="mt-8 text-center md:hidden">
                <Link
                  to="/courses"
                  className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
                >
                  Xem tất cả khóa học
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          {/* Categories Section */}
          <section className="py-12 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Khám phá theo danh mục</h2>
                <p className="text-gray-600">Chọn lĩnh vực bạn quan tâm</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-4 gap-4">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    to={`/courses?category=${category.id}`}
                    className="group bg-white border border-gray-200 rounded-lg p-6 text-center hover:border-blue-500 hover:shadow-md transition-all duration-300"
                  >
                    <div className="text-4xl mb-3">{category.icon}</div>
                    <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">{category.count} khóa học</p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-12 bg-white">
            <div className="max-w-7xl mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Tại sao chọn chúng tôi?</h2>
                <p className="text-gray-600">Những lý do khiến hàng ngàn học viên tin tưởng</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {features.map((feature, index) => (
                  <div key={index} className="text-center">
                    <div className="flex justify-center mb-4">
                      <div className="p-4 bg-blue-50 rounded-full">
                        <feature.icon className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">{feature.title}</h3>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="max-w-4xl mx-auto px-4 text-center">
              <Zap className="w-16 h-16 text-white mx-auto mb-6" />
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Sẵn sàng bắt đầu hành trình học tập?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Tham gia cùng hàng ngàn học viên đang phát triển kỹ năng mỗi ngày
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  to="/courses"
                  className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Khám phá khóa học
                </Link>
                <Link
                  to="/register"
                  className="px-8 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
                >
                  Đăng ký ngay
                </Link>
              </div>
            </div>
          </section>
    </MainLayout>
  )
}

export default Home


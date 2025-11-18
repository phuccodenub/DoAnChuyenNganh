import { Link } from 'react-router-dom'
import { 
  MessageSquare, 
  Zap, 
  Users, 
  Trophy,
  ArrowRight,
  Radio,
  Brain,
  Clock
} from 'lucide-react'

export function InteractiveLearningSection() {
  const features = [
    {
      icon: MessageSquare,
      title: 'Chat real-time',
      description: 'Tương tác trực tiếp với giảng viên và học viên khác trong lớp học',
      color: 'from-blue-500 to-cyan-500',
      stat: '10,000+',
      statLabel: 'Tin nhắn/ngày',
    },
    {
      icon: Radio,
      title: 'Quiz tương tác',
      description: 'Tham gia quiz trực tiếp, xem kết quả real-time và bảng xếp hạng',
      color: 'from-purple-500 to-pink-500',
      stat: '500+',
      statLabel: 'Quiz/ngày',
    },
    {
      icon: Users,
      title: 'Livestream học tập',
      description: 'Tham gia lớp học trực tuyến, tương tác và đặt câu hỏi ngay lập tức',
      color: 'from-green-500 to-emerald-500',
      stat: '50+',
      statLabel: 'Lớp học/ngày',
    },
    {
      icon: Trophy,
      title: 'Bảng xếp hạng',
      description: 'Cạnh tranh với bạn bè, xem thứ hạng và nhận phần thưởng',
      color: 'from-orange-500 to-red-500',
      stat: 'Top 100',
      statLabel: 'Học viên xuất sắc',
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Zap className="w-4 h-4" />
            <span>Học tập tương tác thời gian thực</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Trải nghiệm học tập sống động
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Không chỉ xem video, bạn còn có thể tương tác trực tiếp với giảng viên, 
            tham gia quiz, chat và học cùng hàng ngàn học viên khác
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-white border-2 border-gray-200 rounded-xl p-6 hover:border-transparent hover:shadow-2xl transition-all duration-300 hover:-translate-y-2"
            >
              {/* Gradient Border on Hover */}
              <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-sm`} />
              
              <div className="relative">
                {/* Icon with Gradient */}
                <div className={`inline-flex p-4 bg-gradient-to-br ${feature.color} rounded-xl mb-4 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>

                {/* Stats */}
                <div className="mb-3">
                  <div className="text-2xl font-bold text-gray-900">{feature.stat}</div>
                  <div className="text-xs text-gray-500">{feature.statLabel}</div>
                </div>

                {/* Content */}
                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-purple-600 group-hover:to-pink-600 transition-all duration-300">
                  {feature.title}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Interactive Demo Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chat Feature */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-8 border border-blue-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-blue-500 rounded-lg">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Chat trong lớp học</h3>
                <p className="text-sm text-gray-600">Tương tác real-time với mọi người</p>
              </div>
            </div>
            
            {/* Mock Chat Preview */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Giảng viên</div>
                    <div className="bg-gray-100 rounded-lg p-2 text-sm text-gray-800">
                      Chào mừng các bạn đến với buổi học hôm nay! 👋
                    </div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-gray-700 mb-1">Học viên</div>
                    <div className="bg-blue-500 text-white rounded-lg p-2 text-sm">
                      Em có câu hỏi về phần này ạ
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Link
              to="/chat"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Thử chat ngay
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Quiz Feature */}
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-purple-500 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900">Quiz tương tác</h3>
                <p className="text-sm text-gray-600">Kiểm tra kiến thức real-time</p>
              </div>
            </div>
            
            {/* Mock Quiz Preview */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-700">Quiz đang diễn ra</div>
                <div className="flex items-center gap-1 text-xs text-purple-600">
                  <Clock className="w-3 h-3" />
                  <span>02:30</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900 mb-2">
                  Câu hỏi: React Hooks là gì?
                </div>
                <div className="space-y-2">
                  <div className="bg-purple-100 border-2 border-purple-500 rounded p-2 text-sm">
                    ✓ Functions để sử dụng state
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm text-gray-600">
                    Class components
                  </div>
                  <div className="bg-gray-50 border border-gray-200 rounded p-2 text-sm text-gray-600">
                    Lifecycle methods
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600">
                  <span>45 học viên đã trả lời</span>
                  <span className="font-semibold text-purple-600">Bảng xếp hạng →</span>
                </div>
              </div>
            </div>

            <Link
              to="/quiz"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium text-sm"
            >
              Tham gia quiz
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}


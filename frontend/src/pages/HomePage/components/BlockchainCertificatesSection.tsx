import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'
import { 
  Shield, 
  CheckCircle2, 
  Globe, 
  Award,
  ArrowRight,
  Lock,
  FileCheck
} from 'lucide-react'

export function BlockchainCertificatesSection() {
  const benefits = [
    {
      icon: Shield,
      title: 'Chống giả mạo',
      description: 'Chứng chỉ được lưu trữ trên blockchain, không thể chỉnh sửa hay làm giả',
    },
    {
      icon: Globe,
      title: 'Xác minh toàn cầu',
      description: 'Nhà tuyển dụng có thể xác minh chứng chỉ từ bất kỳ đâu trên thế giới',
    },
    {
      icon: Lock,
      title: 'Bảo mật cao',
      description: 'Dữ liệu được mã hóa và phân tán, đảm bảo an toàn tuyệt đối',
    },
    {
      icon: FileCheck,
      title: 'Xác minh tức thì',
      description: 'Quét QR code hoặc nhập mã để xác minh chứng chỉ trong vài giây',
    },
  ]

  const recentCertificates = [
    {
      id: 1,
      studentName: 'Nguyễn Văn A',
      courseName: 'Lập trình Web Full Stack',
      issuedDate: '15/11/2025',
      txHash: '0x1234...5678',
    },
    {
      id: 2,
      studentName: 'Trần Thị B',
      courseName: 'Python Data Science',
      issuedDate: '14/11/2025',
      txHash: '0xabcd...efgh',
    },
    {
      id: 3,
      studentName: 'Lê Văn C',
      courseName: 'Blockchain Development',
      issuedDate: '13/11/2025',
      txHash: '0x9876...5432',
    },
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-gray-900 via-gray-800 to-indigo-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Lock className="w-4 h-4" />
            <span>Công nghệ Blockchain</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Chứng chỉ số được xác thực bằng Blockchain
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Nhận chứng chỉ không thể làm giả, được lưu trữ vĩnh viễn trên blockchain 
            và có thể xác minh từ bất kỳ đâu trên thế giới
          </p>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {benefits.map((benefit, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="inline-flex p-3 bg-indigo-500/20 rounded-lg mb-4">
                <benefit.icon className="w-6 h-6 text-indigo-300" />
              </div>
              <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
              <p className="text-sm text-gray-300 leading-relaxed">
                {benefit.description}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Certificates & CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Certificates */}
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-6">
              <Award className="w-5 h-5 text-yellow-400" />
              <h3 className="text-xl font-bold">Chứng chỉ mới nhất</h3>
            </div>
            <div className="space-y-4">
              {recentCertificates.map((cert) => (
                <div
                  key={cert.id}
                  className="flex items-start gap-4 p-4 bg-white/5 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-white mb-1">{cert.studentName}</p>
                    <p className="text-sm text-gray-300 mb-1">{cert.courseName}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <span>{cert.issuedDate}</span>
                      <span className="font-mono truncate">{cert.txHash}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <Link
              to={ROUTES.CERTIFICATES}
              className="mt-6 inline-flex items-center gap-2 text-indigo-300 hover:text-indigo-200 text-sm font-medium"
            >
              Xem tất cả chứng chỉ
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* CTA Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-8 flex flex-col justify-center">
            <Award className="w-12 h-12 mb-4 text-white/90" />
            <h3 className="text-2xl font-bold mb-3">
              Nhận chứng chỉ Blockchain sau khi hoàn thành khóa học
            </h3>
            <p className="text-indigo-100 mb-6 leading-relaxed">
              Mỗi chứng chỉ được mã hóa và lưu trữ trên blockchain, 
              đảm bảo tính xác thực và không thể làm giả. 
              Chia sẻ chứng chỉ của bạn với nhà tuyển dụng một cách dễ dàng.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to={ROUTES.COURSES}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-indigo-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
              >
                Khám phá khóa học
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to={ROUTES.CERTIFICATES_VERIFY}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
              >
                Xác minh chứng chỉ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


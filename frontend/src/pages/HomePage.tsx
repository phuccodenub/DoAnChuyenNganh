import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  GraduationCap,
  Layers,
  LineChart,
  MessageSquare,
  Play,
  ShieldCheck,
  Sparkles,
  Star,
  Users
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useAuthStore } from '@/stores/authStore'

interface CourseCard {
  id: string
  title: string
  description: string
  thumbnail: string
  price: string
  level: string
  category: string
  rating: number
  students: number
  duration: string
}

interface CategoryItem {
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  stats: string
}

interface LiveCourse {
  id: string
  title: string
  instructor: string
  time: string
  price: string
  thumbnail: string
}

interface Testimonial {
  name: string
  role: string
  quote: string
}

interface ResourceItem {
  title: string
  author: string
  type: string
  thumbnail: string
}

interface PricingPlan {
  name: string
  price: string
  description: string
  highlights: string[]
  cta: string
  popular?: boolean
}

interface EventItem {
  title: string
  date: string
  time: string
  description: string
  instructor: string
}

interface FaqItem {
  question: string
  answer: string
}

const partnerLogos = ['LearnerX', 'Skylab', 'Classcloud', 'Scholar', 'Questline']

const skillTabs = [
  { label: 'Product & Design', value: 'design' },
  { label: 'Data & AI', value: 'data' },
  { label: 'Business & Leadership', value: 'business' },
  { label: 'Technology', value: 'technology' }
]

const courseCatalog: CourseCard[] = [
  {
    id: 'course-ux-ui',
    title: 'UX/UI Product Design từ cơ bản đến chuyên sâu',
    description: 'Học tư duy thiết kế sản phẩm, xây dựng prototype và kiểm thử với người dùng thực tế.',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '2.600.000₫',
    level: 'Intermediate',
    category: 'design',
    rating: 4.9,
    students: 1860,
    duration: '12 tuần'
  },
  {
    id: 'course-data-analytics',
    title: 'Data Analytics Foundation với Superset & Metabase',
    description: 'Phân tích dữ liệu doanh nghiệp, xây dựng dashboard realtime và kể chuyện bằng số liệu.',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '2.300.000₫',
    level: 'Beginner',
    category: 'data',
    rating: 4.8,
    students: 1420,
    duration: '10 tuần'
  },
  {
    id: 'course-business',
    title: 'Chiến lược chuyển đổi số & quản trị thay đổi',
    description: 'Xây dựng roadmap chuyển đổi, quản trị nhân sự, đo lường hiệu quả và tối ưu vận hành.',
    thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '3.100.000₫',
    level: 'Advanced',
    category: 'business',
    rating: 4.7,
    students: 980,
    duration: '8 tuần'
  },
  {
    id: 'course-tech',
    title: 'Fullstack Web với React, Node.js & Supabase',
    description: 'Triển khai LMS end-to-end: auth, realtime, analytics và CI/CD theo chuẩn doanh nghiệp.',
    thumbnail: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '2.900.000₫',
    level: 'Intermediate',
    category: 'technology',
    rating: 4.9,
    students: 2130,
    duration: '14 tuần'
  }
]

const categories: CategoryItem[] = [
  {
    title: 'Lộ trình bài bản',
    description: 'Học theo roadmap rõ ràng, được cá nhân hoá theo mục tiêu tổ chức.',
    icon: Layers,
    stats: '32+ chương trình'
  },
  {
    title: 'Dữ liệu & Báo cáo',
    description: 'Theo dõi tiến độ, điểm số, sự tham gia và ROI theo thời gian thực.',
    icon: LineChart,
    stats: '25+ dashboard'
  },
  {
    title: 'Tương tác trực tiếp',
    description: 'Livestream, chat realtime, quiz và assignment ngay trong lớp học.',
    icon: MessageSquare,
    stats: '96% giữ chân học viên'
  }
]

const liveCourses: LiveCourse[] = [
  {
    id: 'live-product',
    title: 'Thiết kế trải nghiệm người dùng cho LMS doanh nghiệp',
    instructor: 'Bởi Trần Hà Vy',
    time: '19:00 • Thứ 4, 24/11',
    price: 'Miễn phí cho thành viên',
    thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'live-security',
    title: 'Bảo mật & quản trị dữ liệu người học trên Supabase',
    instructor: 'Bởi Nguyễn Thành Lộc',
    time: '20:00 • Thứ 7, 26/11',
    price: '590.000₫',
    thumbnail: 'https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    id: 'live-facilitation',
    title: 'Kỹ năng dẫn dắt lớp học trực tuyến hiệu quả',
    instructor: 'Bởi Lê Quỳnh Anh',
    time: '09:30 • Chủ nhật, 27/11',
    price: '390.000₫',
    thumbnail: 'https://images.pexels.com/photos/1181350/pexels-photo-1181350.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
]

const testimonials: Testimonial[] = [
  {
    name: 'Nguyễn Hữu Minh',
    role: 'Trưởng phòng đào tạo, ABC Tech',
    quote: '“LMS giúp chúng tôi triển khai đào tạo nội bộ nhanh hơn 3 lần, mọi số liệu đều rõ ràng và minh bạch.”'
  },
  {
    name: 'Trần Thu Hà',
    role: 'Giảng viên Data Science',
    quote: '“Tôi chỉ tập trung vào nội dung, mọi công cụ dạy và tương tác đều có sẵn và vận hành ổn định.”'
  },
  {
    name: 'Phạm Đức Long',
    role: 'Alumni chương trình Fullstack',
    quote: '“Hệ thống gợi ý lộ trình học thông minh giúp tôi nâng cấp kỹ năng và đạt offer mới trong 6 tháng.”'
  }
]

const resources: ResourceItem[] = [
  {
    title: 'Bí quyết xây dựng chương trình đào tạo hiệu quả',
    author: 'LMS Academy Team',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/374751/pexels-photo-374751.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Checklist khởi chạy khoá học trực tuyến 14 ngày',
    author: 'Product Excellence',
    type: 'Template',
    thumbnail: 'https://images.pexels.com/photos/3153207/pexels-photo-3153207.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Workshop: Thiết kế trải nghiệm học tập hấp dẫn',
    author: 'Learning Experience Lab',
    type: 'Workshop',
    thumbnail: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800'
  }
]

const pricingPlans: PricingPlan[] = [
  {
    name: 'Starter Plan',
    price: '1.900.000₫',
    description: 'Phù hợp team nhỏ dưới 50 học viên cần khởi động nhanh.',
    highlights: ['Quản lý khóa học & quiz', 'Phòng học livestream cơ bản', 'Báo cáo tiến độ hằng tuần', 'Tích hợp Zoom, Google Drive'],
    cta: 'Dùng thử miễn phí'
  },
  {
    name: 'Growth Plan',
    price: '3.200.000₫',
    description: 'Nâng tầm đào tạo với phân quyền linh hoạt và analytics nâng cao.',
    highlights: ['Toàn bộ Starter', 'Dashboard tuỳ chỉnh theo role', 'Automation email & nhắc nhở', 'Chấm điểm và phản hồi AI'],
    cta: 'Đặt demo',
    popular: true
  },
  {
    name: 'Enterprise Plan',
    price: 'Liên hệ',
    description: 'Tùy chỉnh toàn diện, bảo mật và hỗ trợ SLA theo yêu cầu doanh nghiệp.',
    highlights: ['Triển khai chuyên sâu', 'Single Sign-On & SCIM', 'Private cloud hoặc on-premise', 'Chuyên gia đồng hành 1-1'],
    cta: 'Liên hệ đội ngũ'
  }
]

const events: EventItem[] = [
  {
    title: 'Panel: Digital Security cho nền tảng đào tạo',
    date: '30/11/2025',
    time: '10:00 - 11:30',
    description: 'Thảo luận cùng chuyên gia về bảo mật và tuân thủ khi vận hành LMS quy mô lớn.',
    instructor: 'Phạm Quang Vinh'
  },
  {
    title: 'Case study: Tăng trưởng 300% học viên nội bộ',
    date: '03/12/2025',
    time: '19:00 - 20:30',
    description: 'Chia sẻ từ doanh nghiệp F&B về hành trình chuyển đổi đào tạo số.',
    instructor: 'Ngô Thảo Uyên'
  }
]

const faqs: FaqItem[] = [
  {
    question: 'LMS hỗ trợ triển khai nhanh trong bao lâu?',
    answer: 'Thông thường chỉ 14 ngày với gói Starter hoặc Growth. Với Enterprise chúng tôi đồng hành xây dựng quy trình chi tiết và đào tạo đội ngũ nội bộ.'
  },
  {
    question: 'Dữ liệu người học được bảo mật như thế nào?',
    answer: 'Hệ thống dùng PostgreSQL trên Supabase với mã hóa ở trạng thái nghỉ, phân quyền theo role và audit log chi tiết. Chúng tôi cũng hỗ trợ triển khai trên hạ tầng riêng.'
  },
  {
    question: 'Tôi có thể tích hợp LMS với hệ thống hiện có?',
    answer: 'Có. API RESTful và webhook giúp đồng bộ với HRM, CRM hoặc BI. Với Enterprise chúng tôi hỗ trợ SSO, SCIM và tùy biến workflow.'
  },
  {
    question: 'Có sẵn nội dung mẫu hay không?',
    answer: 'Chúng tôi cung cấp thư viện khóa học nền tảng, template quiz và guideline sản xuất nội dung để đội ngũ bạn khởi động nhanh.'
  }
]

const navItems = [
  { label: 'Chương trình', target: 'catalog' },
  { label: 'Tính năng', target: 'features' },
  { label: 'Live', target: 'live-courses' },
  { label: 'Bảng giá', target: 'pricing' },
  { label: 'FAQ', target: 'faq' }
]

function HomePage() {
  const { isAuthenticated, user } = useAuthStore()
  const navigate = useNavigate()
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState(skillTabs[0].value)

  const handlePrimaryCta = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }

    navigate('/register')
  }

  const handleSecondaryCta = () => {
    if (isAuthenticated) {
      navigate('/courses')
      return
    }

    navigate('/login')
  }

  const filteredCourses = courseCatalog.filter((course) => course.category === activeTab)

  const handleScrollTo = (target: string) => {
    if (typeof window === 'undefined') {
      return
    }

    const element = document.getElementById(target)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-lg font-bold text-white shadow-md">
              LMS
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900">LMS Enterprise</p>
              <p className="text-xs text-slate-500">Learn • Grow • Scale</p>
            </div>
          </div>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
            {navItems.map((item) => (
              <button
                key={item.target}
                type="button"
                onClick={() => handleScrollTo(item.target)}
                className="transition hover:text-indigo-600"
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={handleSecondaryCta}
              className="hidden rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 md:inline-flex"
            >
              {isAuthenticated ? 'Dashboard' : 'Đăng nhập'}
            </Button>
            <Button
              onClick={handlePrimaryCta}
              className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              {isAuthenticated ? 'Bảng điều khiển' : 'Bắt đầu'}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section id="hero" className="border-b border-slate-100 bg-gradient-to-b from-slate-50 via-white to-white">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div id="live-courses">
            <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
              <ShieldCheck className="h-4 w-4" />
              LMS Enterprise Platform
            </div>
            <h1 className="mt-6 text-4xl font-black leading-tight text-slate-900 md:text-5xl">
              {t('home.title')}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-slate-600">
              {t('home.subtitle')}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                onClick={handlePrimaryCta}
                className="rounded-xl bg-indigo-600 px-8 py-4 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-700"
              >
                <span className="flex items-center gap-2">
                  {isAuthenticated ? t('home.goToDashboard') : 'Khám phá khóa học'}
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={handleSecondaryCta}
                className="rounded-xl border-2 border-slate-200 px-8 py-4 text-base font-semibold text-slate-900 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <span className="flex items-center gap-2">
                  {isAuthenticated ? 'Tiếp tục học' : 'Đăng nhập ngay'}
                  <Play className="h-5 w-5" />
                </span>
              </Button>
            </div>

            {isAuthenticated && (
              <p className="mt-4 text-sm text-slate-500">
                {t('home.welcomeBack')},{' '}
                <span className="font-semibold text-slate-700">{user?.full_name}</span>. Tiếp tục khám phá hành trình học tập của bạn!
              </p>
            )}

            <div className="mt-12 grid gap-6 sm:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Học viên hài lòng</p>
                    <p className="text-2xl font-bold text-slate-900">4.8/5</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">Đánh giá bởi hơn 2.500 học viên và giảng viên.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50 text-amber-600">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Giờ học trực tiếp mỗi tháng</p>
                    <p className="text-2xl font-bold text-slate-900">180+</p>
                  </div>
                </div>
                <p className="mt-4 text-sm text-slate-500">Mạng lưới chuyên gia và mentor đồng hành sát sao.</p>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute inset-0 -z-10 rounded-3xl bg-gradient-to-r from-indigo-100 to-purple-100 blur-2xl" />
            <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl">
              <div
                className="h-64 w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "url('https://images.pexels.com/photos/3861958/pexels-photo-3861958.jpeg?auto=compress&cs=tinysrgb&w=1200')"
                }}
              />
              <div className="space-y-5 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500">Dashboard tổ chức</p>
                    <p className="text-lg font-bold text-slate-900">85% tiến độ hoàn thành</p>
                  </div>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">Đang hoạt động</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase text-slate-500">Quiz tuần này</p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">92%</p>
                    <p className="text-xs text-slate-500">Hoàn thành đúng hạn</p>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-indigo-50 p-4">
                    <p className="text-xs font-semibold uppercase text-indigo-600">Lớp live</p>
                    <p className="mt-2 text-2xl font-bold text-indigo-700">+38%</p>
                    <p className="text-xs text-indigo-600">Tương tác tăng</p>
                  </div>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-slate-900 p-2">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm-1.5-5.5v-5l4.5 2.5-4.5 2.5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Workshop tuần này</p>
                      <p className="text-xs text-slate-500">Kỹ năng trình bày dữ liệu với D3.js</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partner Logos */}
      <section id="partners" className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center gap-8 px-4 text-sm font-semibold text-slate-500">
          {partnerLogos.map((logo) => (
            <div key={logo} className="flex items-center gap-2 text-slate-500">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span>{logo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Discover Courses */}
      <section id="catalog" className="bg-white py-20">
        <div className="mx-auto max-w-6xl space-y-12 px-4">
          <div className="space-y-4 text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Toàn bộ kỹ năng bạn cần, chỉ trong một nền tảng</h2>
            <p className="text-lg text-slate-600">Tìm khóa học, tài liệu, quiz và lớp live phù hợp chỉ với vài thao tác.</p>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-indigo-50">
            <div className="flex flex-wrap items-center gap-4 border-b border-slate-200 pb-4">
              {skillTabs.map((tab) => (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => setActiveTab(tab.value)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    activeTab === tab.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-600'
                      : 'border-transparent bg-slate-50 text-slate-500 hover:border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              {filteredCourses.map((course) => (
                <div key={course.id} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div
                    className="h-40 w-full bg-cover bg-center"
                    style={{ backgroundImage: `url('${course.thumbnail}')` }}
                  />
                  <div className="flex flex-1 flex-col gap-4 p-6">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                      <span>{course.level}</span>
                      <span>{course.duration}</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">{course.title}</h3>
                      <p className="mt-2 text-sm text-slate-500">{course.description}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500">
                      <div className="flex items-center gap-1 text-amber-500">
                        <Star className="h-4 w-4 fill-current" />
                        <span>{course.rating.toFixed(1)}</span>
                        <span className="text-slate-400">({course.students.toLocaleString()} học viên)</span>
                      </div>
                      <span className="text-base font-semibold text-indigo-600">{course.price}</span>
                    </div>
                    <Button
                      onClick={handleSecondaryCta}
                      className="mt-auto rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700"
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Categories and Live Courses */}
      <section id="features" className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Những gì chúng tôi cung cấp</h2>
            <p className="mt-3 text-lg text-slate-600">
              Đội ngũ LMS của bạn có thể phối hợp linh hoạt giữa học tập tự do và chương trình nội bộ được cá nhân hóa.
            </p>
            <div className="mt-8 space-y-6">
              {categories.map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.title} className="flex gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                    <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">{item.stats}</span>
                      </div>
                      <p className="text-sm text-slate-500">{item.description}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-semibold text-slate-900">Live Courses</h3>
                <p className="mt-1 text-sm text-slate-500">Tham gia lớp học trực tiếp cùng chuyên gia mỗi tuần.</p>
              </div>
              <Button
                variant="outline"
                onClick={handleSecondaryCta}
                className="rounded-xl border-slate-200 px-4 py-2 text-sm font-semibold"
              >
                Tất cả lớp live
              </Button>
            </div>
            <div className="mt-6 space-y-5">
              {liveCourses.map((course) => (
                <div key={course.id} className="flex gap-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div
                    className="h-28 w-32 flex-shrink-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('${course.thumbnail}')` }}
                  />
                  <div className="flex flex-1 flex-col gap-2 py-4 pr-4">
                    <div className="flex items-center gap-2 text-xs font-semibold text-indigo-600">
                      <Calendar className="h-4 w-4" /> {course.time}
                    </div>
                    <h4 className="text-base font-semibold text-slate-900">{course.title}</h4>
                    <p className="text-sm text-slate-500">{course.instructor}</p>
                    <div className="mt-auto flex items-center justify-between text-sm font-semibold text-indigo-600">
                      <span>{course.price}</span>
                      <Button
                        size="sm"
                        onClick={handlePrimaryCta}
                        className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                      >
                        Đăng ký ngay
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-slate-900 py-20 text-white">
        <div className="mx-auto max-w-6xl space-y-12 px-4">
          <div className="flex flex-col gap-4 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-indigo-300">Testimonials</p>
            <h2 className="text-3xl font-bold md:text-4xl">Điều học viên và đối tác chia sẻ</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((item) => (
              <div
                key={item.name}
                className="flex h-full flex-col gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="flex items-center gap-1 text-amber-300">
                  {[...Array(5)].map((_, index) => (
                    <Star key={index} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <p className="text-base leading-relaxed text-white/80">{item.quote}</p>
                <div className="mt-auto border-t border-white/10 pt-4 text-sm">
                  <p className="font-semibold text-white">{item.name}</p>
                  <p className="text-white/60">{item.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resources */}
      <section id="resources" className="bg-white py-20">
        <div className="mx-auto max-w-6xl space-y-8 px-4">
          <div className="flex flex-col gap-3">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Kho tài nguyên giúp đội ngũ bạn đi nhanh hơn</h2>
            <p className="text-lg text-slate-600">Mẫu kế hoạch, ebook và workshop được thiết kế bởi chuyên gia Learning & Development.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {resources.map((item) => (
              <div key={item.title} className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div
                  className="h-48 w-full bg-cover bg-center"
                  style={{ backgroundImage: `url('${item.thumbnail}')` }}
                />
                <div className="flex flex-1 flex-col gap-3 p-5">
                  <span className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600">
                    <BookOpen className="h-4 w-4" /> {item.type}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">{item.title}</h3>
                  <p className="text-sm text-slate-500">{item.author}</p>
                  <Button
                    variant="outline"
                    onClick={handleSecondaryCta}
                    className="mt-auto rounded-xl border-slate-200 text-sm font-semibold"
                  >
                    Tải về / Đăng ký
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Tăng tốc tăng trưởng cho tổ chức của bạn</h2>
            <p className="mt-3 text-lg text-slate-600">Chọn gói phù hợp hoặc tuỳ chỉnh với đội ngũ chuyên gia LMS của chúng tôi.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricingPlans.map((plan) => (
              <div
                key={plan.name}
                className={`flex h-full flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm transition hover:-translate-y-1 hover:shadow-xl ${
                  plan.popular ? 'border-indigo-500 shadow-indigo-100' : ''
                }`}
              >
                {plan.popular && (
                  <span className="inline-flex w-max rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-600">
                    Best Seller
                  </span>
                )}
                <div>
                  <h3 className="text-2xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="mt-2 text-sm text-slate-500">{plan.description}</p>
                </div>
                <p className="text-3xl font-bold text-indigo-600">{plan.price}</p>
                <ul className="space-y-3 text-sm text-slate-600">
                  {plan.highlights.map((highlight) => (
                    <li key={highlight} className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500" />
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  onClick={plan.popular ? handlePrimaryCta : handleSecondaryCta}
                  className={`rounded-xl px-6 py-3 text-sm font-semibold ${
                    plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-slate-900 text-white hover:bg-slate-800'
                  }`}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Events & Instructor CTA */}
      <section id="events" className="bg-white py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 md:grid-cols-[1fr_1fr]">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Upcoming Live Events</h2>
              <p className="mt-2 text-sm text-slate-500">Kết nối cộng đồng chuyên gia đào tạo và phát triển.</p>
            </div>
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-indigo-600">
                    <Calendar className="h-4 w-4" />
                    <span>{event.date}</span>
                    <span>•</span>
                    <span>{event.time}</span>
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-slate-900">{event.title}</h3>
                  <p className="mt-2 text-sm text-slate-500">{event.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>Diễn giả: {event.instructor}</span>
                    <Button
                      size="sm"
                      onClick={handlePrimaryCta}
                      className="rounded-lg bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-700"
                    >
                      Giữ chỗ
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-slate-900 p-8 text-white">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                Become an Instructor
              </span>
              <h3 className="mt-5 text-3xl font-bold">Trở thành giảng viên – lan tỏa chuyên môn của bạn</h3>
              <p className="mt-4 text-sm text-white/70">
                Đăng ký trở thành giảng viên, xây dựng cộng đồng học viên riêng và nhận hỗ trợ sản xuất nội dung từ đội ngũ Learning Experience.
              </p>
              <div className="mt-6 space-y-3 text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Thù lao cạnh tranh & minh bạch
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Studio livestream & biên tập nội dung
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                  Hỗ trợ marketing & xây dựng thương hiệu cá nhân
                </div>
              </div>
              <Button
                onClick={handlePrimaryCta}
                className="mt-8 rounded-xl bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-100"
              >
                Đăng ký giảng dạy
              </Button>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-indigo-50 p-8">
              <h3 className="text-2xl font-semibold text-slate-900">Tham gia Affiliate Program</h3>
              <p className="mt-3 text-sm text-slate-600">
                Giới thiệu LMS đến cộng đồng của bạn và nhận hoa hồng trọn đời cho mỗi học viên đăng ký.
              </p>
              <Button
                variant="outline"
                onClick={handleSecondaryCta}
                className="mt-6 rounded-xl border-indigo-300 bg-white text-sm font-semibold text-indigo-600 hover:bg-indigo-100"
              >
                Tìm hiểu ngay
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">Câu hỏi thường gặp</h2>
            <p className="text-lg text-slate-600">
              Nếu bạn vẫn còn thắc mắc, đội ngũ tư vấn sẵn sàng hỗ trợ qua chat hoặc demo trực tiếp.
            </p>
            <Button
              onClick={handlePrimaryCta}
              className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
            >
              Đặt lịch demo
            </Button>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <details key={faq.question} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <summary className="flex cursor-pointer list-none items-center justify-between text-base font-semibold text-slate-900">
                  {faq.question}
                  <ArrowRight className="h-4 w-4 rotate-90 text-slate-400 transition group-open:-rotate-90" />
                </summary>
                <p className="mt-3 text-sm text-slate-500">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section id="cta" className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 py-20 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent)]" />
        <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white/80">
              <Sparkles className="h-4 w-4" /> Sẵn sàng nâng cấp đào tạo?
            </div>
            <h2 className="text-4xl font-bold md:text-5xl">Khởi chạy LMS của bạn chỉ trong 14 ngày</h2>
            <p className="text-lg text-white/80">
              Dùng thử miễn phí, truy cập toàn bộ tính năng và nhận tư vấn triển khai 1-1 từ chuyên gia.
            </p>
          </div>
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button
              size="lg"
              onClick={handlePrimaryCta}
              className="rounded-xl bg-white px-8 py-4 text-base font-semibold text-slate-900 hover:bg-slate-100"
            >
              Dùng thử miễn phí 14 ngày
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={handleSecondaryCta}
              className="rounded-xl border-white/40 px-8 py-4 text-base font-semibold text-white hover:bg-white/10"
            >
              Xem bảng điều khiển demo
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-white/70">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Không cần thẻ tín dụng
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Hủy bất cứ lúc nào
            </span>
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-300" /> Hỗ trợ kỹ thuật 24/7
            </span>
          </div>
        </div>
      </section>

      {/* Footer-like summary */}
      <footer className="bg-slate-900 py-12 text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-300">
              <ShieldCheck className="h-4 w-4" /> LMS Enterprise Platform
            </div>
            <p className="mt-3 text-sm text-white/70">
              Nền tảng học tập dành cho doanh nghiệp Việt Nam – triển khai nhanh, bảo mật cao, hỗ trợ tận tâm.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 text-sm text-white/60">
            <span className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" /> 120+ khóa học chuyên sâu
            </span>
            <span className="flex items-center gap-2">
              <Award className="h-4 w-4" /> 15+ ngành nghề khác nhau
            </span>
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4" /> 2.500+ học viên đang hoạt động
            </span>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default HomePage
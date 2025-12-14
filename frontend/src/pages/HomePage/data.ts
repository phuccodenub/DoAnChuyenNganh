import type {
  CourseCard,
  FeatureItem,
  Testimonial,
  ResourceItem,
  PricingPlan,
  EventItem,
  InstructorTestimonial,
  FaqItem,
  LiveCourse
} from './types'

export const partnerLogos = ['LearnerX', 'Skylab', 'Classcloud', 'Scholar', 'Questline']

export const skillTabs = [
  { label: 'Sản phẩm & Thiết kế', value: 'design' },
  { label: 'Dữ liệu & AI', value: 'data' },
  { label: 'Kinh doanh & Quản lý', value: 'business' },
  { label: 'Công nghệ', value: 'technology' }
]

export const courseCatalog: CourseCard[] = [
  {
    id: 'course-ux-ui',
    title: 'UX/UI Product Design từ cơ bản đến chuyên sâu',
    description: 'Học tư duy thiết kế sản phẩm, xây dựng prototype và kiểm thử với người dùng thực tế.',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    price: '2.600.000₫',
    level: 'Trung bình',
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
    level: 'Cơ bản',
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
    level: 'Nâng cao',
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
    level: 'Trung bình',
    category: 'technology',
    rating: 4.9,
    students: 2130,
    duration: '14 tuần'
  }
]

export const featureItems: FeatureItem[] = [
  {
    title: 'Lớp học trực tiếp',
    description:
      'Cho phép đội ngũ của bạn tham gia lớp live với giảng viên thật, tương tác Q&A và workshop thực hành ngay trên nền tảng.',
    cta: 'Tìm hiểu thêm',
    image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Video học theo lộ trình',
    description:
      'Khoá học được cấu trúc rõ ràng với micro-learning, bài tập và quiz giúp ghi nhớ kiến thức nhanh chóng.',
    cta: 'Khám phá khoá học',
    image: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Tài liệu & checklist',
    description:
      'Tài nguyên đa dạng từ template kế hoạch đào tạo, checklist, workbook giúp đội nhóm triển khai liền mạch.',
    cta: 'Xem thư viện tài nguyên',
    image: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800'
  },
  {
    title: 'Khoá học miễn phí',
    description:
      'Những chương trình nền tảng giúp đội ngũ bắt đầu hành trình học tập mà không tốn chi phí khởi động.',
    cta: 'Đăng ký trải nghiệm',
    image: '/learning_banner.png'
  }
]

export const testimonials: Testimonial[] = [
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

export const resources: ResourceItem[] = [
  {
    title: 'Thiết kế UI/UX',
    description: 'Làm thế nào để tạo ra các trang web đẹp và thu hút người dùng?',
    author: 'Nguyễn Chidi',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/374751/pexels-photo-374751.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '2.000.000₫'
  },
  {
    title: 'Xây dựng website với HTML & CSS',
    description: 'Làm thế nào để tạo ra các trang web đẹp và thu hút người dùng?',
    author: 'Nguyễn Chidi',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/3153207/pexels-photo-3153207.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '2.000.000₫'
  },
  {
    title: 'Lập trình React với TypeScript',
    description: 'Làm thế nào để tạo ra các trang web đẹp và thu hút người dùng?',
    author: 'Nguyễn Chidi',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '2.000.000₫'
  },
  {
    title: 'Lập trình Node.js với Express',
    description: 'Làm thế nào để tạo ra các trang web đẹp và thu hút người dùng?',
    author: 'Nguyễn Chidi',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '2.000.000₫'
  }
]

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Gói cá nhân',
    price: '1.000.000₫ /tháng',
    description: 'Gói hoàn hảo cho các startup đang bắt đầu',
    highlights: [
      'Truy cập vào 12,000+ khóa học hàng đầu',
      'Chuẩn bị cho việc chứng nhận',
      'Hướng đến các gợi ý đích thực',
      'Bài tập lập trình được hỗ trợ bởi AI',
      'Thương hiệu độc quyền'
    ],
    cta: 'Chọn gói'
  },
  {
    name: 'Gói nhóm',
    price: '2.000.000₫ /tháng',
    description: 'Cho các startup và doanh nghiệp có nhu cầu thiết kế liên tục',
    highlights: [
      'Truy cập vào 12,000+ khóa học hàng đầu',
      'Chuẩn bị cho việc chứng nhận',
      'Hướng đến các gợi ý đích thực',
      'Bài tập lập trình được hỗ trợ bởi AI',
      'Báo cáo phân tích và triển khai',
      'Bảo mật website số'
    ],
    cta: 'Chọn gói',
    popular: true
  },
  {
    name: 'Gói doanh nghiệp',
    price: '4.000.000₫ /tháng',
    description: 'Cho các startup và doanh nghiệp có nhu cầu thiết kế và phát triển liên tục',
    highlights: [
      'Truy cập vào 12,000+ khóa học hàng đầu',
      'Chuẩn bị cho việc chứng nhận',
      'Hướng đến các gợi ý đích thực',
      'Bài tập lập trình được hỗ trợ bởi AI',
      'Báo cáo phân tích và triển khai',
      'Bảo mật website số'
    ],
    cta: 'Chọn gói'
  }
]

export const events: EventItem[] = [
  {
    title: 'Kỹ thuật nâng cao cho công nghệ bảo mật',
    date: '16/11/2025',
    description:
      'Khám phá các biện pháp bảo mật cắt ngang và mẹo để đứng vững trước các đe dọa cyber thay đổi và đảm bảo bảo mật tối đa.',
    image: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: 'Mẹo & Theo dõi',
    cta: 'Đăng ký ngay'
  },
  {
    title: 'Bảo mật website số',
    date: '16/11/2025',
    description: 'Đảm bảo an toàn cho website của bạn với các giải pháp bảo mật số mạnh mẽ. Bảo vệ khỏi các đe dọa cyber.',
    cta: 'Đăng ký ngay'
  },
  {
    title: 'Mẹo cho trải nghiệm an toàn trực tuyến',
    date: '16/11/2025',
    description: 'Học các bước cơ bản để bảo vệ thiết bị và dữ liệu của bạn với các mẹo thực tế.',
    cta: 'Đăng ký ngay'
  },
  {
    title: 'Bảo vệ an toàn trực tuyến',
    date: '16/11/2025',
    description: 'Nhận các lời khuyên cập nhật về việc bảo vệ cuộc sống số của bạn với các mẹo và công cụ cần thiết.',
    cta: 'Đăng ký ngay'
  }
]

export const instructorTestimonials: InstructorTestimonial[] = [
  {
    name: 'Nguyễn Sỹ Phúc',
    role: 'Senior Instructor · Web Development',
    quote:
      '"Tôi dùng GekLearn để khởi động mọi dự án đào tạo mới, học viên tương tác cực kỳ tích cực và tôi không thể thiếu được."',
    rating: 5,
    image: 'https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    name: 'Trần Kim Hương',
    role: 'Lead Instructor · Frontend Engineering',
    quote:
      '"Kho tài nguyên và công cụ của GekLearn giúp tôi chia sẻ chuyên môn tới hàng nghìn học viên mỗi tháng."',
    rating: 5,
    image: 'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=1200'
  },
  {
    name: 'Nguyễn Thành Lộc',
    role: 'Principal Instructor · Backend Systems',
    quote:
      '"Việc xây dựng thương hiệu cá nhân và kiếm thêm thu nhập trở nên đơn giản khi tôi gia nhập cộng đồng giảng viên GekLearn."',
    rating: 5,
    image: 'https://images.pexels.com/photos/1181414/pexels-photo-1181414.jpeg?auto=compress&cs=tinysrgb&w=1200'
  }
]

export const supportAvatars = [
  'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/1181686/pexels-photo-1181686.jpeg?auto=compress&cs=tinysrgb&w=200',
  'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=200'
]

export const faqs: FaqItem[] = [
  {
    question: 'Có bản dùng thử miễn phí không?',
    answer:
      "Có, bạn có thể dùng thử miễn phí trong 30 ngày. Nếu bạn muốn, chúng tôi sẽ cung cấp cho bạn một cuộc gọi onboarding miễn phí 30 phút được cá nhân hóa để giúp bạn bắt đầu sớm nhất có thể."
  },
  {
    question: 'Tôi có thể thay đổi gói sau này không?',
    answer: 'Có, bạn có thể nâng cấp hoặc hạ cấp gói của mình bất cứ lúc nào. Các thay đổi sẽ được phản ánh trong chu kỳ thanh toán tiếp theo của bạn.'
  },
  {
    question: 'Chính sách hủy của bạn là gì?',
    answer:
      'Bạn có thể hủy đăng ký của mình bất cứ lúc nào. Không có phí hủy, và bạn sẽ tiếp tục có quyền truy cập cho đến cuối chu kỳ thanh toán hiện tại của bạn.'
  },
  {
    question: 'Có thể thêm thông tin khác vào hóa đơn không?',
    answer:
      'Có, bạn có thể tùy chỉnh hóa đơn của mình với thông tin bổ sung như chi tiết công ty, thông tin thuế và ghi chú tùy chỉnh.'
  },
  {
    question: 'Cách thanh toán hoạt động như thế nào?',
    answer:
      'Chúng tôi cung cấp các tùy chọn thanh toán hàng tháng và hàng năm. Tất cả các gói được thanh toán trước, và bạn có thể cập nhật phương thức thanh toán của mình bất cứ lúc nào trong cài đặt tài khoản.'
  },
  {
    question: 'Làm thế nào để thay đổi email tài khoản của tôi?',
    answer:
      'Bạn có thể thay đổi email tài khoản của mình bằng cách vào cài đặt tài khoản và cập nhật địa chỉ email của bạn. Bạn sẽ cần xác minh địa chỉ email mới.'
  }
]

export const liveCourses: LiveCourse[] = [
  {
    id: 'live-1',
    title: 'Google UX Design Professional Certificate',
    description: 'Get on the fast track to a career in UX design...',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Digital Marketing',
    rating: 4.8,
    reviews: 25000,
    price: '$350.00'
  },
  {
    id: 'live-2',
    title: 'Google UX Design Professional Certificate',
    description: 'Get on the fast track to a career in UX design...',
    thumbnail: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Digital Marketing',
    rating: 4.8,
    reviews: 25000,
    price: '$350.00'
  },
  {
    id: 'live-3',
    title: 'Google UX Design Professional Certificate',
    description: 'Get on the fast track to a career in UX design...',
    thumbnail: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
    category: 'Digital Marketing',
    rating: 4.8,
    reviews: 25000,
    price: '$350.00'
  }
]

export const navItems = [
  { label: 'Kinh doanh & Quản lý', target: 'features' },
  { label: 'Tài nguyên', target: 'resources', isDropdown: true },
  { label: 'Thêm', target: 'faq', isDropdown: true }
]


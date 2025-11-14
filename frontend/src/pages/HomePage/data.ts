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
  { label: 'Product & Design', value: 'design' },
  { label: 'Data & AI', value: 'data' },
  { label: 'Business & Leadership', value: 'business' },
  { label: 'Technology', value: 'technology' }
]

export const courseCatalog: CourseCard[] = [
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
    title: 'Refactoring UI',
    description: 'How do you create compelling pres..',
    author: 'Alex Bejos',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/374751/pexels-photo-374751.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '$15.25'
  },
  {
    title: 'HTML Template',
    description: 'How do you create compelling pres..',
    author: 'Alex Bejos',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/3153207/pexels-photo-3153207.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '$15.25'
  },
  {
    title: 'Hooked: How to Build Habit..',
    description: 'How do you create compelling pres..',
    author: 'Alex Bejos',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/3862130/pexels-photo-3862130.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '$15.25'
  },
  {
    title: "Don't Make Me Think, Revis..",
    description: 'How do you create compelling pres..',
    author: 'Alex Bejos',
    authorAvatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=100',
    type: 'Ebook',
    thumbnail: 'https://images.pexels.com/photos/1181263/pexels-photo-1181263.jpeg?auto=compress&cs=tinysrgb&w=800',
    rating: 4.5,
    price: '$15.25'
  }
]

export const pricingPlans: PricingPlan[] = [
  {
    name: 'Personal Plan',
    price: '$1000 /month',
    description: 'The perfect package for startups just getting started',
    highlights: [
      'Access to 12,000+ top courses',
      'Certification prep',
      'Goal-focused recommendations',
      'AI-powered coding exercises',
      'Brand Identity'
    ],
    cta: 'Choose Plan'
  },
  {
    name: 'Team Plan',
    price: '$2000 /month',
    description: 'For startups and enterprises with on-going design needs',
    highlights: [
      'Access to 12,000+ top courses',
      'Certification prep',
      'Goal-focused recommendations',
      'AI-powered coding exercises',
      'Analytics and adoption reports',
      'Visual Design',
      'Visual Design'
    ],
    cta: 'Choose Plan',
    popular: true
  },
  {
    name: 'Enterprise Plan',
    price: '$4000 /month',
    description: 'For startups and enterprises with on-going design and development needs.',
    highlights: [
      'Access to 12,000+ top courses',
      'Certification prep',
      'Goal-focused recommendations',
      'AI-powered coding exercises',
      'Analytics and adoption reports',
      'Dedicated customer success team',
      'International course collection featuring',
      'Customizable content',
      'Hands-on tech training with add-on'
    ],
    cta: 'Choose Plan'
  }
]

export const events: EventItem[] = [
  {
    title: 'Advanced Techniques for Next-Level Tech Security',
    date: '21 Feb, 2024',
    description:
      'Explore cutting-edge security measures and tricks to stay ahead of evolving cyber threats and ensure maximum protection.',
    image: 'https://images.pexels.com/photos/3861964/pexels-photo-3861964.jpeg?auto=compress&cs=tinysrgb&w=1200',
    badge: 'Tips & Track',
    cta: 'Register Now'
  },
  {
    title: 'Website Digital Security',
    date: '21 Feb, 2024',
    description: "Ensure your website's safety with robust digital security solutions. Protect against cyber threats.",
    cta: 'Register Now'
  },
  {
    title: 'Tips for a Safer Online Experience',
    date: '21 Feb, 2024',
    description: 'Learn the foundational steps to secure your devices and data with practical tips.',
    cta: 'Register Now'
  },
  {
    title: 'Stay Protected Online',
    date: '21 Feb, 2024',
    description: 'Get up-to-date advice on protecting your digital life with essential tricks and tools.',
    cta: 'Register Now'
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
    question: 'Is there a free trial available?',
    answer:
      "Yes, you can try us for free for 30 days. If you want, we'll provide you with a free, personalized 30-minute onboarding call to get you up and running as soon as possible."
  },
  {
    question: 'Can I change my plan later?',
    answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.'
  },
  {
    question: 'What is your cancellation policy?',
    answer:
      'You can cancel your subscription at any time. There are no cancellation fees, and you will continue to have access until the end of your current billing period.'
  },
  {
    question: 'Can other info be added to an invoice?',
    answer:
      'Yes, you can customize your invoices with additional information such as company details, tax information, and custom notes.'
  },
  {
    question: 'How does billing work?',
    answer:
      'We offer monthly and annual billing options. All plans are billed in advance, and you can update your payment method at any time in your account settings.'
  },
  {
    question: 'How do I change my account email?',
    answer:
      'You can change your account email by going to your account settings and updating your email address. You will need to verify the new email address.'
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
  { label: 'For Business', target: 'features' },
  { label: 'Resources', target: 'resources', isDropdown: true },
  { label: 'More', target: 'faq', isDropdown: true }
]


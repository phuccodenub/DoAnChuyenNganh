import { SliderItem, SidebarMenuItem, Category } from './types'
import { ROUTES } from '@/constants/routes'

export const sliderData: SliderItem[] = [
  {
    id: '1',
    title: 'Học lập trình từ cơ bản đến nâng cao',
    description: 'Khám phá hàng ngàn khóa học lập trình chất lượng cao với giảng viên hàng đầu',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1200&h=600&fit=crop',
    link: ROUTES.COURSES,
    buttonText: 'Khám phá ngay',
  },
  {
    id: '2',
    title: 'Tham gia lớp học trực tuyến',
    description: 'Tương tác trực tiếp với giảng viên và học viên khác qua livestream',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=600&fit=crop',
    link: ROUTES.COURSES,
    buttonText: 'Xem lịch học',
  },
  {
    id: '3',
    title: 'Nâng cao kỹ năng của bạn',
    description: 'Học hỏi từ các chuyên gia và phát triển sự nghiệp của bạn',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1200&h=600&fit=crop',
    link: ROUTES.COURSES,
    buttonText: 'Bắt đầu học',
  },
]

export const sidebarMenuItems: SidebarMenuItem[] = [
  {
    id: 'home',
    label: 'Trang chủ',
    icon: '🏠',
    link: ROUTES.LANDING_PAGE,
  },
  {
    id: 'courses',
    label: 'Khóa học',
    icon: '📚',
    link: ROUTES.COURSES,
  },
  {
    id: 'livestream',
    label: 'Livestream',
    icon: '📹',
    link: ROUTES.LIVESTREAM.HUB,
  },
  {
    id: 'about',
    label: 'Về chúng tôi',
    icon: 'ℹ️',
    link: ROUTES.ABOUT,
  },
  {
    id: 'contact',
    label: 'Liên hệ',
    icon: '📞',
    link: '/contact',  // TODO: Add ROUTES.CONTACT when page is created
  },
]

export const categories: Category[] = [
  { id: 'web-dev', name: 'Lập trình Web', icon: '🌐', count: 45 },
  { id: 'mobile-dev', name: 'Lập trình Mobile', icon: '📱', count: 32 },
  { id: 'data-science', name: 'Khoa học Dữ liệu', icon: '📊', count: 28 },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: '🤖', count: 19 },
  { id: 'design', name: 'Thiết kế', icon: '🎨', count: 24 },
  { id: 'marketing', name: 'Marketing', icon: '📢', count: 15 },
]


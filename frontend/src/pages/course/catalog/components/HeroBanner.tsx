import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface Slide {
  id: string;
  title: string;
  description: string;
  image: string;
  gradient: string;
  tags: string[];
}

const slides: Slide[] = [
  {
    id: '1',
    title: 'Khám phá khóa học của bạn',
    description: 'Tìm kiếm từ hàng nghìn khóa học chất lượng cao với giảng viên hàng đầu',
    image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=600&fit=crop',
    gradient: 'from-green-500 via-teal-600 to-sky-900',
    tags: ['Kinh doanh', 'Marketing', 'Thiết kế'],
  },
  {
    id: '2',
    title: 'Học tập mọi lúc, mọi nơi',
    description: 'Nền tảng học tập trực tuyến linh hoạt, phù hợp với mọi lịch trình của bạn',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=1920&h=600&fit=crop',
    gradient: 'from-blue-500 via-purple-600 to-pink-700',
    tags: ['Tự học', 'Linh hoạt', 'Chứng chỉ'],
  },
  {
    id: '3',
    title: 'Nâng cao kỹ năng của bạn',
    description: 'Học hỏi từ các chuyên gia và phát triển sự nghiệp với hàng ngàn khóa học đa dạng',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=1920&h=600&fit=crop',
    gradient: 'from-orange-500 via-red-600 to-pink-700',
    tags: ['Phát triển', 'Kỹ năng', 'Nghề nghiệp'],
  },
];

/**
 * HeroBanner Component
 * 
 * Hero banner với slider tự động:
 * - Multiple slides với hình ảnh và gradient
 * - Auto-play với pause on hover
 * - Navigation buttons và dots
 * - Slogan và tags
 */
export function HeroBanner() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-play slider
  useEffect(() => {
    if (isPaused) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000); // Change slide every 5 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000); // Resume after 10 seconds
  };

  const goToPrevious = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  const goToNext = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsPaused(true);
    setTimeout(() => setIsPaused(false), 10000);
  };

  return (
    <div
      className="relative rounded-2xl overflow-hidden mb-8 h-[250px] md:h-[350px]"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Slides */}
      <div className="relative w-full h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
            }`}
          >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0">
              <img
                src={slide.image}
                alt={slide.title}
                className="w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.gradient} opacity-80`} />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 md:px-8">
              <div className="max-w-4xl w-full text-center">
                {/* Title & Description */}
                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 animate-fade-in">
                  {slide.title}
                </h1>
                <p className="text-lg md:text-xl text-blue-50 mb-8 animate-fade-in-delay">
                  {slide.description}
                </p>

                {/* Quick Filter Tags */}
                <div className="flex flex-wrap gap-2 justify-center animate-fade-in-delay-2">
                  {slide.tags.map((tag) => (
                    <button
                      key={tag}
                      className="px-4 py-2 bg-white/10 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors text-sm border border-white/20"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={goToNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}


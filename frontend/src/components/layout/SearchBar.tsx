import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, BookOpen, X } from 'lucide-react';
import { useCourseSearch } from '@/hooks/useCourseSearch';
import { generateRoute } from '@/constants/routes';
import type { Course } from '@/services/api/course.api';

interface SearchBarProps {
  placeholder?: string;
  className?: string;
  maxResults?: number;
}

/**
 * SearchBar Component
 * 
 * Component tìm kiếm khóa học với dropdown kết quả
 * - Debounce search input
 * - Hiển thị kết quả trong dropdown
 * - Navigation khi click vào kết quả
 * - Keyboard navigation (arrow keys, enter, escape)
 */
export function SearchBar({ 
  placeholder = 'Bạn muốn học gì?', 
  className = '',
  maxResults = 5 
}: SearchBarProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchBarRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search query
  const debouncedQuery = searchQuery.trim();
  const { data: courses = [], isLoading } = useCourseSearch(debouncedQuery, maxResults);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBarRef.current && !searchBarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Open dropdown when there are results
  useEffect(() => {
    if (debouncedQuery.length > 0 && courses.length > 0) {
      setIsOpen(true);
    } else if (debouncedQuery.length === 0) {
      setIsOpen(false);
    }
  }, [debouncedQuery, courses]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || courses.length === 0) {
      if (e.key === 'Enter' && debouncedQuery.length > 0) {
        // Navigate to search results page
        navigate(`/courses?search=${encodeURIComponent(debouncedQuery)}`);
        setIsOpen(false);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < courses.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < courses.length) {
          handleCourseClick(courses[selectedIndex]);
        } else if (debouncedQuery.length > 0) {
          navigate(`/courses?search=${encodeURIComponent(debouncedQuery)}`);
          setIsOpen(false);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
    }
  };

  const handleCourseClick = (course: Course) => {
    navigate(generateRoute.courseDetail(course.id));
    setIsOpen(false);
    setSearchQuery('');
    setSelectedIndex(-1);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setSelectedIndex(-1);
  };

  const handleClear = () => {
    setSearchQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const hasResults = debouncedQuery.length > 0 && courses.length > 0;
  const showDropdown = isOpen && (hasResults || isLoading);

  return (
    <div ref={searchBarRef} className={`relative ${className}`}>
      <div className="w-full flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-500 shadow-sm focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 transition-all">
        <Search className="h-4 w-4 text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (hasResults) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full border-none bg-transparent text-sm text-slate-600 outline-none placeholder:text-slate-400"
        />
        {isLoading && (
          <Loader2 className="h-4 w-4 text-slate-400 animate-spin flex-shrink-0" />
        )}
        {searchQuery && !isLoading && (
          <button
            type="button"
            onClick={handleClear}
            className="flex-shrink-0 p-1 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Clear search"
          >
            <X className="h-4 w-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* Dropdown Results */}
      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden z-50 max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-sm text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-indigo-600" />
              <p>Đang tìm kiếm...</p>
            </div>
          ) : hasResults ? (
            <>
              <div className="p-2 border-b border-slate-100">
                <p className="text-xs font-semibold text-slate-600 px-2">
                  Kết quả tìm kiếm ({courses.length})
                </p>
              </div>
              <div className="py-1">
                {courses.map((course, index) => (
                  <button
                    key={course.id}
                    type="button"
                    onClick={() => handleCourseClick(course)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors ${
                      selectedIndex === index ? 'bg-indigo-50' : ''
                    }`}
                    onMouseEnter={() => setSelectedIndex(index)}
                  >
                    <div className="flex-shrink-0">
                      {course.thumbnail_url ? (
                        <img
                          src={course.thumbnail_url}
                          alt={course.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center">
                          <BookOpen className="h-6 w-6 text-indigo-600" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {course.title}
                      </p>
                      {course.short_description && (
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {course.short_description}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        {course.instructor && (
                          <p className="text-xs text-slate-400">
                            {course.instructor.first_name} {course.instructor.last_name}
                          </p>
                        )}
                        {course.rating && (
                          <span className="text-xs text-slate-400">
                            ⭐ {course.rating.toFixed(1)}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              {debouncedQuery.length > 0 && (
                <div className="p-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigate(`/courses?search=${encodeURIComponent(debouncedQuery)}`);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Xem tất cả kết quả cho "{debouncedQuery}"
                  </button>
                </div>
              )}
            </>
          ) : debouncedQuery.length > 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-slate-500">
                Không tìm thấy kết quả cho "{debouncedQuery}"
              </p>
              <button
                type="button"
                onClick={() => {
                  navigate(`/courses?search=${encodeURIComponent(debouncedQuery)}`);
                  setIsOpen(false);
                }}
                className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Xem tất cả khóa học
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { 
  PlayCircle, 
  FileText, 
  Map, 
  HelpCircle, 
  Clock, 
  MoreHorizontal,
  CheckCircle2,
  Award
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';

export type MaterialType = 'course' | 'quiz' | 'learning-path' | 'page';
export type MaterialStatus = 'not-started' | 'in-progress' | 'completed';

export interface Material {
  id: string;
  type: MaterialType;
  title: string;
  thumbnail: string;
  badge: string;
  tags: string[];
  status: MaterialStatus;
  progress?: number;
  meta?: string; // e.g., "20pts", "80% Passing Score"
  nextLesson?: string; // For "Continue Learning" suggestion
}

interface MaterialCardProps {
  material: Material;
  className?: string;
  onAction?: (id: string) => void;
}

export function MaterialCard({ material, className, onAction }: MaterialCardProps) {
  const getTypeIcon = (type: MaterialType) => {
    switch (type) {
      case 'course': return <PlayCircle className="w-4 h-4" />;
      case 'quiz': return <HelpCircle className="w-4 h-4" />;
      case 'learning-path': return <Map className="w-4 h-4" />;
      case 'page': return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeLabel = (type: MaterialType) => {
    switch (type) {
      case 'course': return 'Khóa học';
      case 'quiz': return 'Bài kiểm tra';
      case 'learning-path': return 'Lộ trình học';
      case 'page': return 'Trang';
    }
  };

  const getStatusColor = (status: MaterialStatus) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in-progress': return 'text-blue-600';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className={cn(
      "group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full",
      className
    )}>
      {/* Thumbnail Section */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <img 
          src={material.thumbnail} 
          alt={material.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Badge overlay */}
        <div className="absolute top-3 left-3">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-black/60 text-white backdrop-blur-sm border border-white/10">
            {material.badge}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-1">
        {/* Type & Meta */}
        <div className="flex items-center gap-2 text-xs font-medium text-gray-500 mb-2">
          <span className={cn("flex items-center gap-1", 
            material.type === 'quiz' ? 'text-orange-600' : 
            material.type === 'course' ? 'text-blue-600' : 
            material.type === 'learning-path' ? 'text-purple-600' : 'text-gray-600'
          )}>
            {getTypeIcon(material.type)}
            {getTypeLabel(material.type)}
          </span>
          {material.type === 'quiz' && (
            <>
              <span>•</span>
              <span className="text-blue-600 flex items-center gap-1">
                <Award className="w-3 h-3" /> Đã chứng nhận
              </span>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {material.title}
        </h3>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {material.tags.map((tag, index) => (
            <span 
              key={index}
              className={cn(
                "px-2 py-1 rounded-md text-xs font-medium",
                tag === 'Urgent' || tag === 'Khẩn cấp' ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'
              )}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Footer (Spacer to push footer down) */}
        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          {/* Left Side: Progress or Meta */}
          <div className="flex items-center gap-2">
            {material.status === 'in-progress' ? (
              <div className="flex items-center gap-2">
                {/* Circular Progress Mini */}
                <div className="relative w-5 h-5">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" className="text-gray-200" />
                    <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="2" fill="transparent" 
                      className={getStatusColor(material.status)}
                      strokeDasharray={50.26}
                      strokeDashoffset={50.26 - (50.26 * (material.progress || 0)) / 100}
                    />
                  </svg>
                </div>
                <span className="text-xs font-medium text-gray-700">
                  Tiến độ: {material.progress}%
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs font-medium text-gray-600">
                {material.meta && (
                  <>
                    {material.type === 'quiz' ? <Award className="w-4 h-4 text-yellow-500" /> : <Clock className="w-4 h-4" />}
                    {material.meta}
                  </>
                )}
                {material.status === 'not-started' && !material.meta && (
                  <span className="text-gray-400">Chưa bắt đầu</span>
                )}
              </div>
            )}
          </div>

          {/* Right Side: Action Button */}
          <button
            onClick={() => onAction?.(material.id)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-sm font-medium transition-colors",
              material.status === 'in-progress' 
                ? "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50 hover:border-gray-300"
                : "bg-white border border-gray-200 text-gray-900 hover:bg-gray-50"
            )}
          >
            {material.status === 'in-progress' ? 'Tiếp tục' : 
             material.status === 'completed' ? 'Xem lại' : 
             material.type === 'quiz' ? 'Xem' : 'Bắt đầu'}
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  Bot, 
  ArrowRight,
  LayoutGrid,
  List,
  FileText
} from 'lucide-react';
import { MaterialCard, Material, MaterialStatus } from '@/components/domain/learning/MaterialCard';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { StudentDashboardLayout } from '@/layouts/StudentDashboardLayout';

// --- MOCK DATA ---
const MOCK_MATERIALS: Material[] = [
  {
    id: '1',
    type: 'course',
    title: 'Creating Engaging Learning Journeys: UI/UX Best Practices',
    thumbnail: 'https://images.unsplash.com/photo-1586717791821-3f44a5638d48?w=800&q=80',
    badge: '12 Materials',
    tags: ['UI/UX Design', 'Urgent'],
    status: 'in-progress',
    progress: 80,
    nextLesson: 'Mastering UI Design for Impactful Solutions'
  },
  {
    id: '2',
    type: 'course',
    title: 'The Art of Blending Aesthetics and Functionality in UI/UX Design',
    thumbnail: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&q=80',
    badge: '12 Materials',
    tags: ['UI/UX Design', 'Not Urgent'],
    status: 'in-progress',
    progress: 30,
    nextLesson: 'Advanced techniques commonly used in UI/UX Design'
  },
  {
    id: '3',
    type: 'quiz',
    title: '5 Steps Optimizing User Experience',
    thumbnail: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80',
    badge: '20 Questions',
    tags: ['UI/UX Design', 'Urgent'],
    status: 'not-started',
    meta: '20pts'
  },
  {
    id: '4',
    type: 'page',
    title: 'Heuristics: 10 Usability Principles To improve UI Design',
    thumbnail: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80',
    badge: '12 Chapters',
    tags: ['Learning Design', 'Not Urgent'],
    status: 'in-progress',
    progress: 40
  },
  {
    id: '5',
    type: 'learning-path',
    title: 'General Knowledge & Methodology - Layout & Spacing',
    thumbnail: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80',
    badge: '20 Paths',
    tags: ['Consistency', 'Not Urgent'],
    status: 'not-started'
  },
  {
    id: '6',
    type: 'course',
    title: 'Mastering UI Design for Impactful Solutions',
    thumbnail: 'https://images.unsplash.com/photo-1522542550221-31fd19575a2d?w=800&q=80',
    badge: '12 Materials',
    tags: ['UI/UX Design', 'Not Urgent'],
    status: 'in-progress',
    progress: 50
  }
];

const STATUS_TABS: { id: string; label: string; value: MaterialStatus | 'all' }[] = [
  { id: 'all', label: 'All Status', value: 'all' },
  { id: 'not-started', label: 'Not Started', value: 'not-started' },
  { id: 'in-progress', label: 'In Progress', value: 'in-progress' },
  { id: 'completed', label: 'Completed', value: 'completed' },
];

export function MyCoursesPage() {
  const [activeStatus, setActiveStatus] = useState<MaterialStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter logic
  const filteredMaterials = MOCK_MATERIALS.filter(item => {
    const matchesStatus = activeStatus === 'all' || item.status === activeStatus;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // Continue Learning items (Top 2 in-progress)
  const continueLearningItems = MOCK_MATERIALS
    .filter(m => m.status === 'in-progress')
    .slice(0, 2);

  // TODO: API Call - Fetch user learning progress
  // const { data: learningProgress } = useQuery({ ... });

  return (
    <StudentDashboardLayout>
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* --- SECTION 1: CONTINUE LEARNING --- */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Continue Learning</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {continueLearningItems.map((item) => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Thumbnail */}
                  <div className="relative w-full md:w-48 aspect-video md:aspect-auto rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                    <div className="absolute top-2 left-2">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-black/60 text-white backdrop-blur-sm">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between py-1">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-medium text-blue-600 mb-2">
                        <FileText className="w-3.5 h-3.5" />
                        <span>{item.type === 'course' ? 'Course' : 'Learning Path'}</span>
                      </div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight mb-3 line-clamp-2">
                        {item.title}
                      </h3>
                    </div>

                    <div>
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-1.5">
                        <span>Progress: {item.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm" className="rounded-lg">
                          Continue
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Suggestion */}
                {item.nextLesson && (
                  <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-500">
                        Advance your learning with <span className="text-indigo-600 font-medium cursor-pointer hover:underline">{item.nextLesson}</span>
                        <ArrowRight className="w-3 h-3 inline ml-1" />
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* --- SECTION 2: ALL MATERIALS --- */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">All Materials</h2>
            <span className="px-2.5 py-0.5 rounded-md bg-gray-200 text-gray-700 text-sm font-medium">
              {filteredMaterials.length}
            </span>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            {/* Left: Status Tabs */}
            <div className="flex flex-wrap gap-2 bg-gray-100/50 p-1 rounded-xl">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveStatus(tab.value)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    activeStatus === tab.value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
                  )}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
              <Button variant="outline" className="gap-2 hidden sm:flex">
                <Filter className="w-4 h-4" />
                Add Filter
              </Button>
              <Button variant="outline" className="gap-2 hidden sm:flex">
                <ArrowUpDown className="w-4 h-4" />
                Short by
              </Button>
            </div>
          </div>

          {/* Materials Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredMaterials.map((material) => (
              <MaterialCard 
                key={material.id} 
                material={material} 
                onAction={(id) => console.log('Action on:', id)}
              />
            ))}
          </div>

          {filteredMaterials.length === 0 && (
            <div className="text-center py-20">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">No materials found</h3>
              <p className="text-gray-500">Try adjusting your search or filters</p>
            </div>
          )}
        </section>

      </div>
    </div>
    </StudentDashboardLayout>
  );
}

export default MyCoursesPage;

import { Search } from 'lucide-react';

interface LobbyFiltersProps {
  selectedFilter: 'all' | 'live' | 'scheduled' | 'ended';
  onFilterChange: (filter: 'all' | 'live' | 'scheduled' | 'ended') => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const FILTER_TABS: Array<{ value: 'all' | 'live' | 'scheduled' | 'ended'; label: string }> = [
  { value: 'all', label: 'Tất cả' },
  { value: 'live', label: 'Đang phát' },
  { value: 'scheduled', label: 'Đã lên lịch' },
  { value: 'ended', label: 'Đã kết thúc' },
];

export function LobbyFilters({
  selectedFilter,
  onFilterChange,
  searchTerm,
  onSearchChange,
}: LobbyFiltersProps) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => onFilterChange(tab.value)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedFilter === tab.value
                  ? 'bg-blue-600 text-white shadow'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full lg:w-80">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm kiếm livestream..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  );
}


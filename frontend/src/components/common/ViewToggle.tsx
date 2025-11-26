import { LayoutGrid, List } from 'lucide-react';

export type ViewMode = 'grid' | 'list';

interface ViewToggleProps {
  view: ViewMode;
  onChange: (view: ViewMode) => void;
}

/**
 * ViewToggle Component
 * 
 * Nút toggle để chuyển đổi giữa Card view và Table view
 */
export function ViewToggle({ view, onChange }: ViewToggleProps) {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-1">
      <button
        type="button"
        onClick={() => onChange('grid')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          view === 'grid'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Xem dạng thẻ"
      >
        <LayoutGrid className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Thẻ</span>
      </button>
      <button
        type="button"
        onClick={() => onChange('list')}
        className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
          view === 'list'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
        title="Xem dạng bảng"
      >
        <List className="w-5 h-5" />
        <span className="text-sm font-medium hidden sm:inline">Bảng</span>
      </button>
    </div>
  );
}

export default ViewToggle;

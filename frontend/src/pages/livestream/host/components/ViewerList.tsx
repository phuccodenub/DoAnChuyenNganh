import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

interface ViewerListProps {
  viewers: any[];
  sessionStatus: string;
}

const getViewerDisplayName = (viewer: any) => {
  const fullName = `${viewer?.user?.first_name || ''} ${viewer?.user?.last_name || ''}`.trim();
  if (fullName) return fullName;
  if (viewer?.user?.email) return viewer.user.email;
  return 'Không rõ';
};

const getViewerInitial = (viewer: any) => {
  const fullName = `${viewer?.user?.first_name || ''} ${viewer?.user?.last_name || ''}`.trim();
  if (fullName) return fullName.charAt(0).toUpperCase();
  if (viewer?.user?.email) return viewer.user.email.charAt(0).toUpperCase();
  return '?';
};

export function ViewerList({ viewers, sessionStatus }: ViewerListProps) {
  if (viewers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4">
        Danh sách {sessionStatus === 'live' ? 'đang xem' : 'đã xem'}
      </h2>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {viewers
          .filter((viewer: any) => (sessionStatus === 'live' ? !viewer.left_at : true))
          .map((viewer: any) => (
            <div
              key={viewer.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50"
            >
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-sm font-medium text-blue-600">
                  {getViewerInitial(viewer)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {getViewerDisplayName(viewer)}
                </p>
                <p className="text-xs text-gray-500">
                  {format(new Date(viewer.joined_at), 'HH:mm', { locale: vi })}
                  {viewer.duration_minutes && ` • ${viewer.duration_minutes}m`}
                </p>
              </div>
              {!viewer.left_at && <div className="w-2 h-2 bg-green-500 rounded-full" />}
            </div>
          ))}
      </div>
    </div>
  );
}


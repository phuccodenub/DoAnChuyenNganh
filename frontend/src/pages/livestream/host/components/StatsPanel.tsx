interface StatsPanelProps {
  status: string;
  viewers: any[];
}

export function StatsPanel({ status, viewers }: StatsPanelProps) {
  const activeViewers = viewers.filter((viewer) => !viewer.left_at).length;

  const averageWatchTime =
    viewers.length > 0
      ? Math.round(
          viewers.reduce((sum: number, viewer: any) => sum + (viewer.duration_minutes || 0), 0) / viewers.length,
        )
      : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">Thống kê</h2>

      <div className="space-y-4">
        {status === 'live' && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Đang xem</p>
            <p className="text-3xl font-bold text-red-600">{activeViewers}</p>
          </div>
        )}

        <div>
          <p className="text-sm text-gray-600 mb-1">Tổng đã tham gia</p>
          <p className="text-2xl font-bold text-gray-900">{viewers.length}</p>
        </div>

        {status === 'ended' && viewers.length > 0 && (
          <div>
            <p className="text-sm text-gray-600 mb-1">Thời gian xem trung bình</p>
            <p className="text-lg font-medium text-gray-900">{averageWatchTime} phút</p>
          </div>
        )}
      </div>
    </div>
  );
}


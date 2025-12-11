import { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';
import { useContentEngagementOverview, useContentEngagementMatrix } from '@/hooks/useAnalytics';
import type { ContentEngagementItem, ContentEngagementMatrix } from '@/services/api/analytics.api';
import { useDebounce } from '@/hooks/useDebounce';

interface ContentTabProps {
  courseId: string;
}

export function ContentTab({ courseId }: ContentTabProps) {
  const [contentTypeFilter, setContentTypeFilter] = useState<'all' | 'lesson' | 'quiz' | 'assignment'>('all');
  const [contentDays, setContentDays] = useState<number>(30);
  const [matrixType, setMatrixType] = useState<'lesson' | 'quiz' | 'assignment'>('quiz');
  const [matrixDays, setMatrixDays] = useState<number>(30);
  const [matrixSearch, setMatrixSearch] = useState<string>('');
  const debouncedMatrixSearch = useDebounce(matrixSearch, 300);

  const { data: contentEngagement, isLoading: isContentLoading } = useContentEngagementOverview(
    courseId,
    contentTypeFilter,
    contentDays
  );
  const { data: contentMatrix, isLoading: isMatrixLoading } = useContentEngagementMatrix(
    courseId,
    matrixType,
    matrixDays,
    debouncedMatrixSearch || undefined
  );

  const formatContentType = (type: ContentEngagementItem['contentType']) => {
    if (type === 'lesson') return 'Bài học';
    if (type === 'quiz') return 'Quiz';
    return 'Assignment';
  };

  const formatTimeSpent = (seconds?: number | null) => {
    if (!seconds || Number.isNaN(seconds)) return '-';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    if (mins === 0) return `${secs}s`;
    return `${mins}p ${secs}s`;
  };

  const contentRows = useMemo(() => {
    if (!contentEngagement) return [];
    const combined: ContentEngagementItem[] = [
      ...(contentEngagement.lessons || []),
      ...(contentEngagement.quizzes || []),
      ...(contentEngagement.assignments || [])
    ];
    return combined
      .sort((a, b) => (b.interactions || 0) - (a.interactions || 0))
      .slice(0, 50);
  }, [contentEngagement]);

  const matrixTable = useMemo(() => {
    if (!contentMatrix) return null;
    const maxContents = 15; // limit columns for readability
    const contents = contentMatrix.contents.slice(0, maxContents);
    const contentIndex = new Map(contents.map((c, idx) => [c.id, idx]));

    // Build cell lookup
    const cellMap = new Map<string, ContentEngagementMatrix['records'][number]>();
    contentMatrix.records.forEach((r) => {
      if (contentIndex.has(r.contentId)) {
        cellMap.set(`${r.studentId}-${r.contentId}`, r);
      }
    });

    return { contents, cellMap };
  }, [contentMatrix]);

  return (
    <div className="space-y-4">
      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Tổng quan nội dung</h3>
              <p className="text-sm text-gray-600">
                Học viên tương tác theo bài học / quiz / assignment. Tỉ lệ hoàn thành/đạt = Hoàn thành/Đạt / Học viên tham gia.
              </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Loại nội dung</label>
            <select
              value={contentTypeFilter}
              onChange={(e) => setContentTypeFilter(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="lesson">Bài học</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>

            <label className="text-sm text-gray-700 ml-2">Thời gian</label>
            <select
              value={contentDays}
              onChange={(e) => setContentDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={90}>90 ngày</option>
              <option value={180}>180 ngày</option>
              <option value={365}>1 năm</option>
            </select>
          </div>
        </div>

        {isContentLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" />
            <span className="ml-2 text-gray-600">Đang tải dữ liệu nội dung...</span>
          </div>
        ) : contentRows.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Chưa có dữ liệu tương tác cho nội dung.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 pr-3">Nội dung</th>
                  <th className="py-2 pr-3">Loại</th>
                  <th className="py-2 pr-3 text-right">Học viên</th>
                  <th className="py-2 pr-3 text-right">Tương tác</th>
                  <th className="py-2 pr-3 text-right">Hoàn thành/Đạt</th>
                  <th className="py-2 pr-3 text-right">Tỉ lệ hoàn thành/đạt</th>
                  <th className="py-2 pr-3 text-right">Điểm TB</th>
                  <th className="py-2 pr-3 text-right">TG học TB</th>
                  <th className="py-2 pr-3 text-right">Hoạt động cuối</th>
                </tr>
              </thead>
              <tbody>
                {contentRows.map((item) => (
                  <tr key={item.contentId} className="border-b last:border-0">
                    <td className="py-2 pr-3">
                      <div className="font-semibold text-gray-900">{item.contentTitle}</div>
                      {item.sectionTitle && <div className="text-xs text-gray-500">Phần: {item.sectionTitle}</div>}
                    </td>
                    <td className="py-2 pr-3 text-gray-700">{formatContentType(item.contentType)}</td>
                    <td className="py-2 pr-3 text-right">{item.participants || 0}</td>
                    <td className="py-2 pr-3 text-right">{item.interactions || 0}</td>
                    <td className="py-2 pr-3 text-right">{item.completions || 0}</td>
                    <td className="py-2 pr-3 text-right">
                      {item.completionRate !== undefined ? `${Number(item.completionRate).toFixed(1)}%` : '-'}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {item.avgScore !== undefined && item.avgScore !== null ? item.avgScore.toFixed(1) : '-'}
                    </td>
                    <td className="py-2 pr-3 text-right">
                      {item.contentType === 'lesson'
                        ? `${Number(item.avgCompletionPct || 0).toFixed(0)}%`
                        : formatTimeSpent(item.avgTimeSpentSeconds)}
                    </td>
                    <td className="py-2 pr-3 text-right text-gray-600">
                      {item.lastActivity ? new Date(item.lastActivity).toLocaleDateString('vi-VN') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Card className="p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">Ma trận học viên x nội dung</h3>
            <p className="text-sm text-gray-600">
              Hàng: học viên, Cột: nội dung. Tỉ lệ hoàn thành/đạt tính theo trạng thái mới nhất của từng học viên.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <label className="text-sm text-gray-700">Loại</label>
            <select
              value={matrixType}
              onChange={(e) => setMatrixType(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="lesson">Bài học</option>
              <option value="quiz">Quiz</option>
              <option value="assignment">Assignment</option>
            </select>

            <label className="text-sm text-gray-700 ml-2">Thời gian</label>
            <select
              value={matrixDays}
              onChange={(e) => setMatrixDays(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value={7}>7 ngày</option>
              <option value={30}>30 ngày</option>
              <option value={90}>90 ngày</option>
              <option value={180}>180 ngày</option>
              <option value={365}>1 năm</option>
            </select>

            <input
              type="text"
              value={matrixSearch}
              onChange={(e) => setMatrixSearch(e.target.value)}
              placeholder="Tìm theo tên/email học viên"
              className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent w-60"
            />
          </div>
        </div>

        {isMatrixLoading ? (
          <div className="flex items-center justify-center py-10">
            <Spinner size="md" />
            <span className="ml-2 text-gray-600">Đang tải ma trận...</span>
          </div>
        ) : !contentMatrix || contentMatrix.students.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Chưa có dữ liệu cho loại nội dung này.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left">
              <thead>
                <tr className="text-gray-600 border-b">
                  <th className="py-2 pr-3 sticky left-0 bg-white z-10">Học viên</th>
                  {matrixTable?.contents.map((c) => (
                    <th key={c.id} className="py-2 px-3 text-center whitespace-nowrap">
                      {c.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {contentMatrix.students.map((stu) => (
                  <tr key={stu.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 sticky left-0 bg-white z-10">
                      <div className="font-semibold text-gray-900">{stu.name}</div>
                      {stu.email && <div className="text-xs text-gray-500">{stu.email}</div>}
                    </td>
                    {matrixTable?.contents.map((c) => {
                      const cell = matrixTable.cellMap.get(`${stu.id}-${c.id}`);
                      let badge = '-';
                      if (cell) {
                        if (c.type === 'lesson') {
                          badge =
                            cell.status === 'completed'
                              ? 'Hoàn thành'
                              : cell.status === 'in_progress'
                              ? `${Math.round(cell.completionPct || 0)}%`
                              : 'Chưa học';
                        } else if (c.type === 'quiz') {
                          badge =
                            cell.status === 'passed'
                              ? `Đạt (${cell.score ?? '-'})`
                              : cell.status === 'failed'
                              ? `Chưa đạt (${cell.score ?? '-'})`
                              : 'Đang làm';
                        } else {
                          badge =
                            cell.status === 'graded'
                              ? `Đã chấm (${cell.score ?? '-'})`
                              : cell.status === 'submitted'
                              ? 'Đã nộp'
                              : cell.status === 'returned'
                              ? 'Trả lại'
                              : 'Đang làm';
                        }
                      }
                      return (
                        <td key={c.id} className="py-2 px-3 text-center text-gray-800">
                          {badge}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}


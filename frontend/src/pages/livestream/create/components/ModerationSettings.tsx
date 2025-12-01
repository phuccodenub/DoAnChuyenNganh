import { useState } from 'react';
import { Shield, AlertTriangle, X, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ModerationSettingsData {
  comment_moderation_enabled: boolean;
  comment_ai_moderation: boolean;
  comment_manual_moderation: boolean;
  comment_blocked_keywords: string[];
  comment_max_length: number | null;
  comment_min_interval_seconds: number | null;
  content_moderation_enabled: boolean;
  content_ai_moderation: boolean;
  content_blocked_keywords: string[];
  auto_block_violations: boolean;
  auto_warn_violations: boolean;
  violation_threshold: number;
}

interface ModerationSettingsProps {
  value: ModerationSettingsData;
  onChange: (value: ModerationSettingsData) => void;
}

export function ModerationSettings({ value, onChange }: ModerationSettingsProps) {
  const [newKeyword, setNewKeyword] = useState('');
  const [newContentKeyword, setNewContentKeyword] = useState('');

  const updateField = <K extends keyof ModerationSettingsData>(
    field: K,
    newValue: ModerationSettingsData[K]
  ) => {
    onChange({ ...value, [field]: newValue });
  };

  const addCommentKeyword = () => {
    if (newKeyword.trim() && !value.comment_blocked_keywords.includes(newKeyword.trim())) {
      updateField('comment_blocked_keywords', [...value.comment_blocked_keywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const removeCommentKeyword = (keyword: string) => {
    updateField(
      'comment_blocked_keywords',
      value.comment_blocked_keywords.filter((k) => k !== keyword)
    );
  };

  const addContentKeyword = () => {
    if (newContentKeyword.trim() && !value.content_blocked_keywords.includes(newContentKeyword.trim())) {
      updateField('content_blocked_keywords', [...value.content_blocked_keywords, newContentKeyword.trim()]);
      setNewContentKeyword('');
    }
  };

  const removeContentKeyword = (keyword: string) => {
    updateField(
      'content_blocked_keywords',
      value.content_blocked_keywords.filter((k) => k !== keyword)
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Cài đặt kiểm duyệt</h3>
      </div>

      {/* Comment Moderation */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Kiểm duyệt bình luận</h4>
            <p className="text-sm text-gray-500">Tự động kiểm tra và chặn bình luận không phù hợp</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value.comment_moderation_enabled}
              onChange={(e) => updateField('comment_moderation_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {value.comment_moderation_enabled && (
          <div className="pl-4 border-l-2 border-blue-200 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comment_ai_moderation"
                checked={value.comment_ai_moderation}
                onChange={(e) => updateField('comment_ai_moderation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="comment_ai_moderation" className="text-sm text-gray-700">
                Sử dụng AI để tự động phát hiện nội dung không phù hợp
              </label>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="comment_manual_moderation"
                checked={value.comment_manual_moderation}
                onChange={(e) => updateField('comment_manual_moderation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="comment_manual_moderation" className="text-sm text-gray-700">
                Yêu cầu phê duyệt thủ công trước khi hiển thị bình luận
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Từ khóa bị chặn (bình luận)
              </label>
              <div className="flex gap-2 mb-2 min-w-0">
                <input
                  type="text"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addCommentKeyword();
                    }
                  }}
                  placeholder="Nhập từ khóa và nhấn Enter"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addCommentKeyword}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 flex-shrink-0 text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>
              {value.comment_blocked_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {value.comment_blocked_keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeCommentKeyword(keyword)}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Độ dài tối đa (ký tự)
                </label>
                <input
                  type="number"
                  value={value.comment_max_length || ''}
                  onChange={(e) =>
                    updateField('comment_max_length', e.target.value ? Number(e.target.value) : null)
                  }
                  min={1}
                  placeholder="500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">
                  Khoảng cách tối thiểu (giây)
                </label>
                <input
                  type="number"
                  value={value.comment_min_interval_seconds || ''}
                  onChange={(e) =>
                    updateField(
                      'comment_min_interval_seconds',
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  min={1}
                  placeholder="2"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Moderation */}
      <div className="space-y-4 border-t pt-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-medium text-gray-900">Kiểm duyệt nội dung livestream</h4>
            <p className="text-sm text-gray-500">Kiểm tra tiêu đề và mô tả livestream</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={value.content_moderation_enabled}
              onChange={(e) => updateField('content_moderation_enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
          </label>
        </div>

        {value.content_moderation_enabled && (
          <div className="pl-4 border-l-2 border-blue-200 space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="content_ai_moderation"
                checked={value.content_ai_moderation}
                onChange={(e) => updateField('content_ai_moderation', e.target.checked)}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="content_ai_moderation" className="text-sm text-gray-700">
                Sử dụng AI để kiểm tra nội dung
              </label>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 block mb-2">
                Từ khóa bị chặn (nội dung)
              </label>
              <div className="flex gap-2 mb-2 min-w-0">
                <input
                  type="text"
                  value={newContentKeyword}
                  onChange={(e) => setNewContentKeyword(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addContentKeyword();
                    }
                  }}
                  placeholder="Nhập từ khóa và nhấn Enter"
                  className="flex-1 min-w-0 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button
                  type="button"
                  onClick={addContentKeyword}
                  className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-1 flex-shrink-0 text-sm whitespace-nowrap"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm</span>
                </button>
              </div>
              {value.content_blocked_keywords.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {value.content_blocked_keywords.map((keyword) => (
                    <span
                      key={keyword}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 text-red-800 rounded-md text-sm"
                    >
                      {keyword}
                      <button
                        type="button"
                        onClick={() => removeContentKeyword(keyword)}
                        className="hover:text-red-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Violation Settings */}
      <div className="space-y-4 border-t pt-4">
        <h4 className="text-base font-medium text-gray-900">Cài đặt vi phạm</h4>
        <div className="pl-4 space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_block_violations"
              checked={value.auto_block_violations}
              onChange={(e) => updateField('auto_block_violations', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_block_violations" className="text-sm text-gray-700">
              Tự động chặn nội dung vi phạm
            </label>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="auto_warn_violations"
              checked={value.auto_warn_violations}
              onChange={(e) => updateField('auto_warn_violations', e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <label htmlFor="auto_warn_violations" className="text-sm text-gray-700">
              Tự động cảnh báo khi có rủi ro
            </label>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">
              Ngưỡng vi phạm (số lần trước khi bị chặn)
            </label>
            <input
              type="number"
              value={value.violation_threshold}
              onChange={(e) => updateField('violation_threshold', Number(e.target.value))}
              min={1}
              max={10}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-md border border-blue-200">
        <AlertTriangle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-800">
          <p className="font-medium mb-1">Lưu ý:</p>
          <p>
            Các cài đặt này sẽ được áp dụng tự động khi livestream bắt đầu. Bạn có thể thay đổi sau
            trong trang quản lý livestream.
          </p>
        </div>
      </div>
    </div>
  );
}


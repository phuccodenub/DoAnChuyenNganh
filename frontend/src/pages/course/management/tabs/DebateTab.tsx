import { useEffect, useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { aiApi } from '@/services/api/ai.api';
import { AlertCircle, Bot, Loader2, RefreshCw, Scale, ScrollText } from 'lucide-react';
import toast from 'react-hot-toast';

const extractErrorMessage = (error: any): string => {
  const status = error?.response?.status;
  const backendMessage = error?.response?.data?.message;

  if (status === 503) {
    return 'Debate workflow đang tắt (AI_DEBATE_ENABLED=false). Bật flag để sử dụng.';
  }

  if (status === 429) {
    return 'Bạn đã vượt giới hạn debate hôm nay. Vui lòng thử lại sau.';
  }

  if (status === 401) {
    return 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.';
  }

  if (status === 403) {
    return 'Không có quyền gọi model premium để judge. Vui lòng kiểm tra API key hoặc tier.';
  }

  if (status === 404) {
    return 'Không tìm thấy debateId. Vui lòng kiểm tra lại.';
  }

  if (status === 500) {
    return backendMessage || 'Server gặp lỗi khi xử lý debate. Thử lại sau.';
  }

  return backendMessage || error?.message || 'Đã có lỗi xảy ra.';
};

interface DebateTabProps {
  courseId: string;
}

type DebateType = 'project_design' | 'curriculum' | 'content_review' | 'decision';

type DebateRound = {
  round: number;
  agentA?: { position?: string; reasoning?: string };
  agentB?: { position?: string; reasoning?: string };
  agreement?: number;
  highlights?: string[];
};

type DebateResult = {
  debateId: string;
  topic: string;
  debateType: DebateType;
  rounds: DebateRound[];
  disagreement: number;
  requiresJudge: boolean;
  judgeDecision?: string;
  decision?: 'approved' | 'needs_revision' | 'rejected';
  createdAt?: string;
};

const decisionBadge = (decision?: string) => {
  if (decision === 'approved') return <Badge className="bg-green-100 text-green-700">APPROVED</Badge>;
  if (decision === 'needs_revision') return <Badge className="bg-yellow-100 text-yellow-700">NEEDS REVISION</Badge>;
  if (decision === 'rejected') return <Badge className="bg-red-100 text-red-700">REJECTED</Badge>;
  return <Badge className="bg-gray-100 text-gray-700">NO DECISION</Badge>;
};

export function DebateTab({ courseId }: DebateTabProps) {
  const [topic, setTopic] = useState('');
  const [context, setContext] = useState('');
  const [debateType, setDebateType] = useState<DebateType>('project_design');
  const [maxRounds, setMaxRounds] = useState(3);
  const [debateId, setDebateId] = useState('');
  const [lastError, setLastError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ topic?: string; context?: string; debateId?: string }>({});
  const [idNotice, setIdNotice] = useState('');

  const startDebate = useMutation({
    mutationFn: () => {
      setLastError('');
      setFieldErrors({});

      const trimmedTopic = topic.trim();
      const trimmedContext = context.trim();
      const nextErrors: { topic?: string; context?: string } = {};

      if (!trimmedTopic) {
        nextErrors.topic = 'Vui lòng nhập topic.';
      }
      if (!trimmedContext) {
        nextErrors.context = 'Vui lòng nhập context.';
      }

      if (Object.keys(nextErrors).length) {
        setFieldErrors(nextErrors);
        throw new Error('Vui lòng nhập topic và context');
      }

      setIdNotice('');

      return aiApi.startDebate({
        topic: trimmedTopic,
        context: trimmedContext,
        debateType,
        maxRounds,
        courseId,
      });
    },
    onSuccess: (data) => {
      const id = data?.debateId || data?.data?.debateId;
      if (id) {
        setDebateId(id);
        setIdNotice('Debate ID đã tạo. Dùng để xem lại lịch sử hoặc gọi Judge.');
      }
      toast.success('Debate hoàn tất');
    },
    onError: (error: any) => {
      const message = extractErrorMessage(error);
      setLastError(message);
      toast.error(message);
    },
  });

  const fetchResult = useMutation({
    mutationFn: async () => {
      setLastError('');
      setFieldErrors((prev) => ({ ...prev, debateId: undefined }));
      const id = debateId.trim();
      if (!id) {
        setFieldErrors((prev) => ({ ...prev, debateId: 'Vui lòng nhập debateId.' }));
        throw new Error('Vui lòng nhập debateId');
      }
      return aiApi.getDebateResult(id);
    },
    onError: (error: any) => {
      const message = extractErrorMessage(error);
      setLastError(message);
      toast.error(message);
    },
  });

  const fetchHistory = useMutation({
    mutationFn: async () => {
      setLastError('');
      setFieldErrors((prev) => ({ ...prev, debateId: undefined }));
      const id = debateId.trim();
      if (!id) {
        setFieldErrors((prev) => ({ ...prev, debateId: 'Vui lòng nhập debateId.' }));
        throw new Error('Vui lòng nhập debateId');
      }
      return aiApi.getDebateHistory(id);
    },
    onError: (error: any) => {
      const message = extractErrorMessage(error);
      setLastError(message);
      toast.error(message);
    },
  });

  const arbitrate = useMutation({
    mutationFn: async () => {
      setLastError('');
      setFieldErrors((prev) => ({ ...prev, debateId: undefined }));
      const id = debateId.trim();
      if (!id) {
        setFieldErrors((prev) => ({ ...prev, debateId: 'Vui lòng nhập debateId.' }));
        throw new Error('Vui lòng nhập debateId');
      }
      return aiApi.arbitrateDebate(id);
    },
    onSuccess: () => toast.success('Đã gọi Judge'),
    onError: (error: any) => {
      const message = extractErrorMessage(error);
      setLastError(message);
      toast.error(message);
    },
  });

  const normalizedResult: DebateResult | null = useMemo(() => {
    const raw = (fetchResult.data as any) || (startDebate.data as any);
    if (!raw) return null;
    const maybe = raw?.data ? raw.data : raw;
    if (!maybe?.debateId) return null;
    return maybe as DebateResult;
  }, [fetchResult.data, startDebate.data]);

  const normalizedHistory: DebateRound[] | null = useMemo(() => {
    const raw = fetchHistory.data as any;
    if (!raw) return null;
    const maybe = raw?.data ? raw.data : raw;
    if (!Array.isArray(maybe)) return null;
    return maybe as DebateRound[];
  }, [fetchHistory.data]);

  useEffect(() => {
    if (debateId.trim() && fieldErrors.debateId) {
      setFieldErrors((prev) => ({ ...prev, debateId: undefined }));
    }
  }, [debateId, fieldErrors.debateId]);

  const isBusy = startDebate.isPending || fetchResult.isPending || fetchHistory.isPending || arbitrate.isPending;


  useEffect(() => {
    if (topic.trim() && fieldErrors.topic) {
      setFieldErrors((prev) => ({ ...prev, topic: undefined }));
    }
  }, [topic, fieldErrors.topic]);

  useEffect(() => {
    if (context.trim() && fieldErrors.context) {
      setFieldErrors((prev) => ({ ...prev, context: undefined }));
    }
  }, [context, fieldErrors.context]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-base">Debate Workflow</CardTitle>
          </div>
          <p className="text-sm text-gray-600">Tạo debate, xem rounds và gọi Judge (GPT-5.2) khi cần.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <Input
              label="Topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="VD: MVC vs Clean Architecture"
              disabled={isBusy}
              error={fieldErrors.topic}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debate Type</label>
              <select
                value={debateType}
                onChange={(e) => setDebateType(e.target.value as DebateType)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={isBusy}
              >
                <option value="project_design">Project design</option>
                <option value="curriculum">Curriculum</option>
                <option value="content_review">Content review</option>
                <option value="decision">Decision</option>
              </select>
            </div>
            <Input
              label="Max rounds"
              type="number"
              min={1}
              max={6}
              value={maxRounds}
              onChange={(e) => setMaxRounds(Math.max(1, Math.min(6, Number(e.target.value) || 3)))}
              disabled={isBusy}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Context</label>
            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={6}
              placeholder="Mô tả bối cảnh, ràng buộc kỹ thuật, mục tiêu, deadline..."
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed ${fieldErrors.context ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'}`}
              aria-invalid={fieldErrors.context ? 'true' : 'false'}
              aria-describedby={fieldErrors.context ? 'debate-context-error' : undefined}
              disabled={isBusy}
            />
            {fieldErrors.context && (
              <p id="debate-context-error" className="mt-1 text-sm text-red-600">{fieldErrors.context}</p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button onClick={() => startDebate.mutate()} disabled={isBusy} className="gap-2">
              {startDebate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
              Start debate
            </Button>
            <div className="flex-1" />
            <Input
              label="Debate ID"
              value={debateId}
              onChange={(e) => {
                setDebateId(e.target.value);
                if (idNotice) {
                  setIdNotice('');
                }
              }}
              placeholder="Dán debateId để xem lại"
              disabled={isBusy}
              error={fieldErrors.debateId}
              helperText={idNotice || undefined}
              id="debate-id"
            />
          </div>

          {idNotice && (
            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              {idNotice}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => fetchResult.mutate()} disabled={fetchResult.isPending || !debateId.trim() || isBusy} className="gap-2">
              {fetchResult.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh result
            </Button>
            <Button variant="outline" onClick={() => fetchHistory.mutate()} disabled={fetchHistory.isPending || !debateId.trim() || isBusy} className="gap-2">
              {fetchHistory.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ScrollText className="h-4 w-4" />}
              Load history
            </Button>
            <Button variant="outline" onClick={() => arbitrate.mutate()} disabled={arbitrate.isPending || !debateId.trim() || isBusy} className="gap-2">
              {arbitrate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Scale className="h-4 w-4" />}
              Call Judge
            </Button>
          </div>

          {isBusy && (
            <div className="rounded-md border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              Đang xử lý debate... Vui lòng chờ.
            </div>
          )}

          {lastError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4" />
                <div>
                  <p className="font-semibold">Debate gặp lỗi</p>
                  <p className="mt-1 text-xs text-red-600">{lastError}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {normalizedResult && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle className="text-base">Kết quả</CardTitle>
              {decisionBadge(normalizedResult.decision)}
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <div className="rounded border bg-white p-3">
                <p className="text-xs text-gray-500">Debate ID</p>
                <p className="text-sm font-mono break-all">{normalizedResult.debateId}</p>
              </div>
              <div className="rounded border bg-white p-3">
                <p className="text-xs text-gray-500">Disagreement</p>
                <p className="text-sm font-semibold">{normalizedResult.disagreement}%</p>
              </div>
              <div className="rounded border bg-white p-3">
                <p className="text-xs text-gray-500">Requires Judge</p>
                <p className="text-sm font-semibold">{normalizedResult.requiresJudge ? 'Yes' : 'No'}</p>
              </div>
            </div>

            {normalizedResult.judgeDecision && (
              <div className="rounded border bg-gray-50 p-3">
                <p className="text-sm font-semibold mb-1">Judge Decision</p>
                <pre className="text-xs whitespace-pre-wrap break-words">{normalizedResult.judgeDecision}</pre>
              </div>
            )}

            {!normalizedResult.judgeDecision && !normalizedResult.requiresJudge && (
              <p className="text-xs text-gray-500">Chưa có quyết định từ Judge.</p>
            )}
          </CardContent>
        </Card>
      )}

      {normalizedHistory && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Debate history</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {normalizedHistory.length === 0 ? (
              <p className="text-sm text-gray-600">Chưa có round nào.</p>
            ) : (
              normalizedHistory.map((round) => (
                <div key={round.round} className="rounded-lg border p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Round {round.round + 1}</p>
                    <Badge className="bg-blue-100 text-blue-700">Agreement: {round.agreement ?? 0}%</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="rounded border bg-white p-2">
                      <p className="text-xs font-semibold text-gray-700">Agent A</p>
                      <pre className="text-xs whitespace-pre-wrap break-words">{round.agentA?.position || ''}</pre>
                    </div>
                    <div className="rounded border bg-white p-2">
                      <p className="text-xs font-semibold text-gray-700">Agent B</p>
                      <pre className="text-xs whitespace-pre-wrap break-words">{round.agentB?.position || ''}</pre>
                    </div>
                  </div>
                  {Array.isArray(round.highlights) && round.highlights.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-semibold text-gray-700">Highlights</p>
                      <ul className="list-disc pl-5 text-xs text-gray-700">
                        {round.highlights.map((h, idx) => (
                          <li key={idx}>{h}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

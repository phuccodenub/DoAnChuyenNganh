/**
 * Remediation Cards Component
 * Displays remediation cards after a quiz attempt with practice questions
 * 
 * Based on: docs/AI/16_INSTRUCTOR_STUDENT_LEARNING_SUPPORT_PLAN_MVP.md
 */

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { aiApi, RemediationCard, PracticeQuestion } from '@/services/api/ai.api';
import { 
  AlertCircle, 
  BookOpen, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Lightbulb, 
  Loader2, 
  XCircle,
  HelpCircle,
  RefreshCw
} from 'lucide-react';

interface RemediationCardsProps {
  attemptId: string;
  maxCards?: number;
  onClose?: () => void;
}

export function RemediationCards({ attemptId, maxCards = 5, onClose }: RemediationCardsProps) {
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [practiceAnswers, setPracticeAnswers] = useState<Record<string, Record<string, number>>>({});
  const [showResults, setShowResults] = useState<Record<string, boolean>>({});

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['remediation', attemptId],
    queryFn: () => aiApi.getRemediation(attemptId, maxCards),
    staleTime: 1000 * 60 * 30, // 30 minutes
  });

  const toggleCard = (cardId: string) => {
    setExpandedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handlePracticeAnswer = (cardId: string, questionId: string, answerIndex: number) => {
    setPracticeAnswers(prev => ({
      ...prev,
      [cardId]: {
        ...(prev[cardId] || {}),
        [questionId]: answerIndex,
      },
    }));
  };

  const checkPracticeAnswers = (cardId: string) => {
    setShowResults(prev => ({ ...prev, [cardId]: true }));
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex flex-col items-center justify-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            <p className="text-sm text-gray-600">Đang phân tích câu trả lời của bạn...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-red-600">
            <AlertCircle className="h-8 w-8" />
            <p className="text-sm">Không thể tải remediation cards</p>
            <Button variant="outline" size="sm" onClick={() => refetch()}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Thử lại
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="flex flex-col items-center justify-center gap-3 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
            <p className="text-sm font-medium">Tuyệt vời! Bạn đã trả lời đúng tất cả câu hỏi.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Remediation Cards</CardTitle>
            </div>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                Đóng
              </Button>
            )}
          </div>
          <p className="text-sm text-gray-600">
            Quiz: <span className="font-medium">{data.quizTitle}</span>
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-blue-50 p-3 text-center">
              <p className="text-2xl font-bold text-blue-700">{data.totalQuestions}</p>
              <p className="text-xs text-blue-600">Tổng câu hỏi</p>
            </div>
            <div className="rounded-lg bg-red-50 p-3 text-center">
              <p className="text-2xl font-bold text-red-700">{data.incorrectCount}</p>
              <p className="text-xs text-red-600">Câu sai</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3 text-center">
              <p className="text-2xl font-bold text-green-700">
                {Math.round((data.score / data.maxScore) * 100)}%
              </p>
              <p className="text-xs text-green-600">Điểm số</p>
            </div>
            <div className="rounded-lg bg-purple-50 p-3 text-center">
              <p className="text-2xl font-bold text-purple-700">{data.cards.length}</p>
              <p className="text-xs text-purple-600">Cards tạo</p>
            </div>
          </div>
          {data.metadata.cached && (
            <p className="mt-3 text-xs text-gray-500 text-center">
              ℹ️ Kết quả được cache. Refresh để cập nhật.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Remediation Cards */}
      {data.cards.map((card, index) => (
        <RemediationCardItem
          key={card.questionId}
          card={card}
          index={index}
          isExpanded={expandedCards.has(card.questionId)}
          onToggle={() => toggleCard(card.questionId)}
          practiceAnswers={practiceAnswers[card.questionId] || {}}
          onPracticeAnswer={(qId, ans) => handlePracticeAnswer(card.questionId, qId, ans)}
          showResults={showResults[card.questionId] || false}
          onCheckAnswers={() => checkPracticeAnswers(card.questionId)}
        />
      ))}
    </div>
  );
}

interface RemediationCardItemProps {
  card: RemediationCard;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  practiceAnswers: Record<string, number>;
  onPracticeAnswer: (questionId: string, answer: number) => void;
  showResults: boolean;
  onCheckAnswers: () => void;
}

function RemediationCardItem({
  card,
  index,
  isExpanded,
  onToggle,
  practiceAnswers,
  onPracticeAnswer,
  showResults,
  onCheckAnswers,
}: RemediationCardItemProps) {
  return (
    <Card className="overflow-hidden">
      <CardHeader
        className="cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-red-100 text-red-700">
                Câu {index + 1}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Cần ôn tập
              </Badge>
            </div>
            <p className="text-sm font-medium text-gray-900 line-clamp-2">
              {card.originalQuestion}
            </p>
          </div>
          <Button variant="ghost" size="sm">
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="border-t bg-gray-50/50 space-y-4">
          {/* Student's Answer vs Correct Answer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="rounded-lg bg-red-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-xs font-medium text-red-700">Bạn đã chọn</span>
              </div>
              <p className="text-sm text-red-900">{card.studentAnswer}</p>
            </div>
            <div className="rounded-lg bg-green-50 p-3">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-xs font-medium text-green-700">Đáp án đúng</span>
              </div>
              <p className="text-sm text-green-900">{card.correctAnswer}</p>
            </div>
          </div>

          {/* Misconception */}
          <div className="rounded-lg bg-amber-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-800">Bạn sai ở đâu?</span>
            </div>
            <p className="text-sm text-amber-900">{card.misconception}</p>
          </div>

          {/* Concept Explanation */}
          <div className="rounded-lg bg-blue-50 p-3">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Khái niệm cần nắm</span>
            </div>
            <p className="text-sm text-blue-900">{card.conceptExplanation}</p>
          </div>

          {/* Practice Questions */}
          <div className="rounded-lg bg-purple-50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <HelpCircle className="h-4 w-4 text-purple-600" />
              <span className="text-sm font-medium text-purple-800">Luyện tập ngay</span>
            </div>

            <div className="space-y-4">
              {card.practiceQuestions.map((pq, pqIndex) => (
                <PracticeQuestionItem
                  key={pq.id}
                  question={pq}
                  index={pqIndex}
                  selectedAnswer={practiceAnswers[pq.id]}
                  onSelect={(ans) => onPracticeAnswer(pq.id, ans)}
                  showResult={showResults}
                />
              ))}
            </div>

            {!showResults && Object.keys(practiceAnswers).length > 0 && (
              <Button
                className="mt-4 w-full"
                onClick={onCheckAnswers}
              >
                Kiểm tra đáp án
              </Button>
            )}

            {showResults && (
              <div className="mt-4 p-3 rounded-lg bg-white border">
                <p className="text-sm font-medium text-gray-700">
                  Kết quả: {' '}
                  <span className="text-green-600">
                    {card.practiceQuestions.filter(
                      (pq) => practiceAnswers[pq.id] === (pq.correctAnswer as number)
                    ).length}
                  </span>
                  /{card.practiceQuestions.length} câu đúng
                </p>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}

interface PracticeQuestionItemProps {
  question: PracticeQuestion;
  index: number;
  selectedAnswer?: number;
  onSelect: (answer: number) => void;
  showResult: boolean;
}

function PracticeQuestionItem({
  question,
  index,
  selectedAnswer,
  onSelect,
  showResult,
}: PracticeQuestionItemProps) {
  const correctAnswer = question.correctAnswer as number;
  const isCorrect = selectedAnswer === correctAnswer;

  return (
    <div className="bg-white rounded-lg p-3 border">
      <p className="text-sm font-medium text-gray-900 mb-2">
        {index + 1}. {question.question}
      </p>

      <div className="space-y-2">
        {question.options.map((option, optIndex) => {
          const isSelected = selectedAnswer === optIndex;
          const isCorrectOption = optIndex === correctAnswer;

          let optionClass = 'border-gray-200 hover:border-purple-300';
          if (showResult) {
            if (isCorrectOption) {
              optionClass = 'border-green-500 bg-green-50';
            } else if (isSelected && !isCorrectOption) {
              optionClass = 'border-red-500 bg-red-50';
            }
          } else if (isSelected) {
            optionClass = 'border-purple-500 bg-purple-50';
          }

          return (
            <button
              key={optIndex}
              onClick={() => !showResult && onSelect(optIndex)}
              disabled={showResult}
              className={`w-full text-left px-3 py-2 rounded-lg border text-sm transition-colors ${optionClass}`}
            >
              <span className="font-medium mr-2">
                {String.fromCharCode(65 + optIndex)}.
              </span>
              {option}
              {showResult && isCorrectOption && (
                <CheckCircle2 className="inline-block ml-2 h-4 w-4 text-green-500" />
              )}
              {showResult && isSelected && !isCorrectOption && (
                <XCircle className="inline-block ml-2 h-4 w-4 text-red-500" />
              )}
            </button>
          );
        })}
      </div>

      {showResult && (
        <p className="mt-2 text-xs text-gray-600 bg-gray-50 p-2 rounded">
          💡 {question.explanation}
        </p>
      )}
    </div>
  );
}

export default RemediationCards;

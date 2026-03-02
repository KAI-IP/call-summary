import { useState } from 'react';
import { formatSummaryText, formatEmailText } from '../utils/formatSummary';

const SECTIONS = [
  { key: 'overview', label: '통화 요약', icon: '📋', type: 'text' },
  { key: 'discussions', label: '논의 사항', icon: '💬', type: 'list' },
  { key: 'decisions', label: '결정 사항', icon: '✅', type: 'list' },
  { key: 'actions', label: '후속 조치', icon: '📌', type: 'list' },
  { key: 'notes', label: '참고 사항', icon: '📝', type: 'list' },
];

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
      {message}
    </div>
  );
}

function SkeletonLoader() {
  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-4/6" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-full" />
        <div className="h-3 bg-gray-200 rounded w-3/4" />
      </div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mt-4" />
      <div className="space-y-2">
        <div className="h-3 bg-gray-200 rounded w-5/6" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}

export default function SummaryResult({ summary, customerName, transcript, isLoading, error }) {
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2000);
  };

  const copyToClipboard = async (text, label) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast(`${label} 복사되었습니다`);
    } catch {
      showToast('복사에 실패했습니다');
    }
  };

  if (isLoading) return <SkeletonLoader />;

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
          <span className="font-medium">요약 생성 실패:</span> {error}
        </div>
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
      {/* 섹션들 */}
      {SECTIONS.map(({ key, label, icon, type }) => {
        const value = summary[key];
        if (!value || (Array.isArray(value) && value.length === 0)) return null;

        return (
          <div key={key} className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-gray-800 mb-2">
              {icon} {label}
            </h3>
            {type === 'text' ? (
              <p className="text-sm text-gray-700 leading-relaxed">{value}</p>
            ) : (
              <ul className="space-y-1">
                {value.map((item, i) => (
                  <li key={i} className="text-sm text-gray-700 flex">
                    <span className="text-gray-400 mr-2">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}

      {/* 태그 */}
      {summary.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {summary.tags.map((tag, i) => (
            <span
              key={i}
              className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* 복사 버튼들 */}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => copyToClipboard(formatSummaryText(summary), '요약이')}
          className="flex-1 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          📋 요약 복사
        </button>
        <button
          onClick={() =>
            copyToClipboard(formatEmailText(summary, customerName), '이메일 형식이')
          }
          className="flex-1 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          📧 이메일 복사
        </button>
        <button
          onClick={() => copyToClipboard(transcript, '전사 전문이')}
          className="flex-1 py-2.5 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          📝 전사 복사
        </button>
      </div>

      {toast && <Toast message={toast} />}
    </div>
  );
}

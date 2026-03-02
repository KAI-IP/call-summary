import { useState, useEffect, useRef } from 'react';
import { formatSummaryText, formatEmailText } from '../utils/formatSummary';

const SECTIONS = [
  { key: 'overview', label: '통화 요약', icon: '📋', type: 'text' },
  { key: 'discussions', label: '논의 사항', icon: '💬', type: 'list' },
  { key: 'decisions', label: '결정 사항', icon: '✅', type: 'list' },
  { key: 'actions', label: '후속 조치', icon: '📌', type: 'list' },
  { key: 'notes', label: '참고 사항', icon: '📝', type: 'list' },
];

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

function formatDuration(seconds) {
  if (!seconds) return '';
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}분 ${s}초`;
}

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
      {message}
    </div>
  );
}

function DetailModal({ call, onClose, onDelete }) {
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
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

  const handleDelete = () => {
    if (window.confirm(`${call.customerName}님의 통화 기록을 삭제하시겠습니까?`)) {
      onDelete(call.id);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-50 bg-white w-full max-w-lg max-h-[85vh] rounded-t-2xl sm:rounded-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 헤더 */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-gray-900">{call.customerName}</h2>
            <p className="text-xs text-gray-500">
              {formatDate(call.date)}
              {call.duration ? ` · ${formatDuration(call.duration)}` : ''}
              {call.caseReference ? ` · ${call.caseReference}` : ''}
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">
            ✕
          </button>
        </div>

        {/* 요약 섹션 */}
        <div className="px-4 py-4 space-y-3">
          {call.summary &&
            SECTIONS.map(({ key, label, icon, type }) => {
              const value = call.summary[key];
              if (!value || (Array.isArray(value) && value.length === 0)) return null;

              return (
                <div key={key} className="bg-gray-50 rounded-lg p-3">
                  <h3 className="text-sm font-semibold text-gray-800 mb-1.5">
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
          {call.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {call.tags.map((tag, i) => (
                <span key={i} className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 하단 버튼 */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-3 space-y-2">
          <div className="flex gap-2">
            <button
              onClick={() => copyToClipboard(formatSummaryText(call.summary), '요약이')}
              className="flex-1 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📋 요약 복사
            </button>
            <button
              onClick={() =>
                copyToClipboard(formatEmailText(call.summary, call.customerName), '이메일 형식이')
              }
              className="flex-1 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              📧 이메일 복사
            </button>
          </div>
          <button
            onClick={handleDelete}
            className="w-full py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
          >
            삭제
          </button>
        </div>

        {toast && <Toast message={toast} />}
      </div>
    </div>
  );
}

export default function CallHistory({ calls, onDelete, onSearch, onExport, onImport }) {
  const [keyword, setKeyword] = useState('');
  const [filteredCalls, setFilteredCalls] = useState(calls);
  const [selectedCall, setSelectedCall] = useState(null);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    if (!keyword.trim()) {
      setFilteredCalls(calls);
      return;
    }

    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const results = await onSearch(keyword);
      setFilteredCalls(results);
    }, 300);

    return () => clearTimeout(debounceRef.current);
  }, [keyword, calls, onSearch]);

  const handleDelete = async (id) => {
    await onDelete(id);
    setSelectedCall(null);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await onImport(file);
    } catch {
      alert('파일을 가져오는데 실패했습니다.');
    }
    e.target.value = '';
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-4 space-y-4">
      {/* 검색 + 액션 */}
      <div className="space-y-3">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="고객명, 건명, 태그로 검색..."
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
        <div className="flex gap-2">
          <button
            onClick={onExport}
            disabled={calls.length === 0}
            className="flex-1 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            JSON 내보내기
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex-1 py-2 text-sm font-medium bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            JSON 가져오기
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </div>
      </div>

      {/* 통화 목록 */}
      {filteredCalls.length === 0 ? (
        <div className="py-12 text-center text-gray-400 text-sm">
          {keyword ? '검색 결과가 없습니다.' : '아직 통화 이력이 없습니다.'}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredCalls.map((call) => (
            <button
              key={call.id}
              onClick={() => setSelectedCall(call)}
              className="w-full text-left bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-1">
                <span className="font-medium text-sm text-gray-900">{call.customerName}</span>
                <span className="text-xs text-gray-400 shrink-0 ml-2">{formatDate(call.date)}</span>
              </div>
              {call.caseReference && (
                <div className="text-xs text-gray-500 mb-1">{call.caseReference}</div>
              )}
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                {call.duration && <span>{formatDuration(call.duration)}</span>}
              </div>
              {call.summary?.overview && (
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                  {call.summary.overview}
                </p>
              )}
              {call.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {call.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {/* 상세 모달 */}
      {selectedCall && (
        <DetailModal call={selectedCall} onClose={() => setSelectedCall(null)} onDelete={handleDelete} />
      )}
    </div>
  );
}

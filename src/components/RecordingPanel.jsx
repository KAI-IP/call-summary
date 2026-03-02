import { useState, useEffect, useRef } from 'react';
import useSpeechRecognition from '../hooks/useSpeechRecognition';
import { summarizeCall } from '../services/claudeApi';
import SummaryResult from './SummaryResult';

function Toast({ message }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-sm px-4 py-2 rounded-lg shadow-lg animate-fade-in z-50">
      {message}
    </div>
  );
}

export default function RecordingPanel({ onStatusChange, onSaveCall }) {
  const [customerName, setCustomerName] = useState('');
  const [relatedCase, setRelatedCase] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [summary, setSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [savedTranscript, setSavedTranscript] = useState('');
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);
  const transcriptEndRef = useRef(null);
  const durationRef = useRef(0);

  const {
    transcript,
    interimText,
    isListening,
    startListening,
    stopListening,
    resetTranscript,
  } = useSpeechRecognition();

  useEffect(() => {
    onStatusChange?.(isListening);
  }, [isListening, onStatusChange]);

  useEffect(() => {
    if (transcriptEndRef.current) {
      transcriptEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [transcript, interimText]);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2500);
  };

  const formatTime = (s) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  };

  const handleSummarize = async (transcriptText) => {
    setSummaryLoading(true);
    setSummaryError(null);
    setSummary(null);

    try {
      const result = await summarizeCall({
        customerName,
        relatedCase,
        transcript: transcriptText,
      });
      setSummary(result);

      // 자동 저장
      if (onSaveCall) {
        await onSaveCall({
          customerName,
          caseReference: relatedCase,
          date: new Date().toISOString(),
          duration: durationRef.current,
          transcript: transcriptText,
          summary: result,
          tags: result.tags || [],
        });
        showToast('통화 기록이 저장되었습니다');
      }
    } catch (err) {
      setSummaryError(err.message);
    } finally {
      setSummaryLoading(false);
    }
  };

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      clearInterval(timerRef.current);
      timerRef.current = null;
      durationRef.current = seconds;
      setSavedTranscript(transcript);
      if (transcript.trim()) {
        handleSummarize(transcript);
      }
    } else {
      if (!customerName.trim()) {
        alert('고객명을 입력해주세요.');
        return;
      }
      resetTranscript();
      setSummary(null);
      setSummaryError(null);
      setSavedTranscript('');
      setSeconds(0);
      durationRef.current = 0;
      startListening();
      timerRef.current = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const showTranscript = isListening || transcript || interimText;
  const showSummary = !isListening && (summaryLoading || summaryError || summary);

  return (
    <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
      {/* 입력 필드 */}
      <div className="space-y-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            고객명 <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="고객명을 입력하세요"
            disabled={isListening || summaryLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            관련 건 <span className="text-gray-400 text-xs">(선택)</span>
          </label>
          <input
            type="text"
            value={relatedCase}
            onChange={(e) => setRelatedCase(e.target.value)}
            placeholder="관련 건을 입력하세요"
            disabled={isListening || summaryLoading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
          />
        </div>
      </div>

      {/* 녹음 버튼 + 타이머 */}
      <div className="flex flex-col items-center space-y-3">
        <div className="relative">
          {isListening && (
            <div className="absolute inset-0 rounded-full bg-red-400 animate-pulse-ring" />
          )}
          <button
            onClick={handleToggle}
            disabled={summaryLoading}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl shadow-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isListening
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-red-500 hover:bg-red-600'
            }`}
          >
            {isListening ? '⏹' : '🎙'}
          </button>
        </div>
        <div className="text-2xl font-mono text-gray-700 tabular-nums">
          {formatTime(seconds)}
        </div>
        <div className="text-sm text-gray-500">
          {summaryLoading
            ? '요약 생성 중...'
            : isListening
              ? '녹음 중... 탭하여 중지'
              : '탭하여 녹음 시작'}
        </div>
      </div>

      {/* 실시간 전사 영역 */}
      {showTranscript && (
        <div className="border border-gray-200 rounded-lg bg-gray-50 p-4 max-h-64 overflow-y-auto">
          <div className="text-xs font-medium text-gray-500 mb-2">실시간 전사</div>
          <div className="text-sm leading-relaxed whitespace-pre-wrap">
            <span className="text-gray-900">{transcript}</span>
            {interimText && (
              <span className="text-gray-400">{interimText}</span>
            )}
            {!transcript && !interimText && isListening && (
              <span className="text-gray-400">음성을 인식하고 있습니다...</span>
            )}
            <div ref={transcriptEndRef} />
          </div>
        </div>
      )}

      {/* 요약 결과 */}
      {showSummary && (
        <SummaryResult
          summary={summary}
          customerName={customerName}
          transcript={savedTranscript}
          isLoading={summaryLoading}
          error={summaryError}
        />
      )}

      {toast && <Toast message={toast} />}
    </div>
  );
}

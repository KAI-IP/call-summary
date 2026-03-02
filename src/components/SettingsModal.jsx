import { useState } from 'react';

export default function SettingsModal({ onClose, onKeyChange }) {
  const current = sessionStorage.getItem('anthropic_api_key') || '';
  const [apiKey, setApiKey] = useState(current);
  const [error, setError] = useState('');

  const maskedKey = current
    ? current.slice(0, 10) + '...' + current.slice(-4)
    : '(없음)';

  const handleSave = () => {
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('API 키를 입력해주세요.');
      return;
    }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('올바른 Anthropic API 키 형식이 아닙니다.');
      return;
    }
    sessionStorage.setItem('anthropic_api_key', trimmed);
    onKeyChange?.();
    onClose();
  };

  const handleClear = () => {
    sessionStorage.removeItem('anthropic_api_key');
    onKeyChange?.();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center" onClick={onClose}>
      <div className="fixed inset-0 bg-black/40" />
      <div
        className="relative z-50 bg-white w-full max-w-sm mx-4 rounded-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="font-semibold text-gray-900">설정</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl p-1">
            ✕
          </button>
        </div>

        <div className="px-4 py-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Anthropic API Key
            </label>
            <p className="text-xs text-gray-400 mb-2">현재: {maskedKey}</p>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="sk-ant-..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              저장
            </button>
            <button
              onClick={handleClear}
              className="py-2 px-4 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
            >
              키 삭제
            </button>
          </div>

          <p className="text-xs text-gray-400 text-center">
            세션 스토리지에 저장 · 탭을 닫으면 삭제됩니다
          </p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';

export default function ApiKeySetup({ onComplete }) {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = apiKey.trim();
    if (!trimmed) {
      setError('API 키를 입력해주세요.');
      return;
    }
    if (!trimmed.startsWith('sk-ant-')) {
      setError('올바른 Anthropic API 키 형식이 아닙니다. (sk-ant-로 시작)');
      return;
    }
    sessionStorage.setItem('anthropic_api_key', trimmed);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-sm w-full">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">📞</div>
          <h1 className="text-xl font-bold text-gray-900">Call Summary</h1>
          <p className="text-sm text-gray-500 mt-1">시작하려면 Anthropic API 키를 입력하세요</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => {
                setApiKey(e.target.value);
                setError('');
              }}
              placeholder="sk-ant-..."
              autoFocus
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            시작하기
          </button>

          <p className="text-xs text-gray-400 text-center leading-relaxed">
            API 키는 브라우저 세션에만 저장되며,
            탭을 닫으면 자동으로 삭제됩니다.
          </p>
        </form>
      </div>
    </div>
  );
}

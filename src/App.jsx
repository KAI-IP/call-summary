import { useState, useCallback } from 'react';
import RecordingPanel from './components/RecordingPanel';
import CallHistory from './components/CallHistory';
import ApiKeySetup from './components/ApiKeySetup';
import SettingsModal from './components/SettingsModal';
import useCallStorage from './hooks/useCallStorage';

function App() {
  const [hasApiKey, setHasApiKey] = useState(
    () => !!sessionStorage.getItem('anthropic_api_key'),
  );
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState('new');
  const [isRecording, setIsRecording] = useState(false);
  const { calls, saveCall, deleteCall, searchCalls, exportJSON, importJSON } =
    useCallStorage();

  const handleStatusChange = useCallback((recording) => {
    setIsRecording(recording);
  }, []);

  const refreshKeyState = useCallback(() => {
    setHasApiKey(!!sessionStorage.getItem('anthropic_api_key'));
  }, []);

  if (!hasApiKey) {
    return <ApiKeySetup onComplete={refreshKeyState} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">📞 Call Summary</h1>
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-medium px-2.5 py-1 rounded-full ${
                isRecording
                  ? 'bg-red-100 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isRecording ? '🔴 녹음중' : '대기중'}
            </span>
            <button
              onClick={() => setShowSettings(true)}
              className="text-gray-400 hover:text-gray-600 p-1 transition-colors"
              title="설정"
            >
              ⚙️
            </button>
          </div>
        </div>
      </header>

      {/* 탭 */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto flex">
          <button
            onClick={() => setActiveTab('new')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors ${
              activeTab === 'new'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            새 통화
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium text-center border-b-2 transition-colors relative ${
              activeTab === 'history'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            통화 이력
            {calls.length > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-semibold bg-blue-100 text-blue-700 rounded-full">
                {calls.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 콘텐츠 */}
      <main>
        {activeTab === 'new' ? (
          <RecordingPanel
            onStatusChange={handleStatusChange}
            onSaveCall={saveCall}
          />
        ) : (
          <CallHistory
            calls={calls}
            onDelete={deleteCall}
            onSearch={searchCalls}
            onExport={exportJSON}
            onImport={importJSON}
          />
        )}
      </main>

      {/* 설정 모달 */}
      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onKeyChange={refreshKeyState}
        />
      )}
    </div>
  );
}

export default App;

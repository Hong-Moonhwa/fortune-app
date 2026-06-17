'use client';

import { useState, useEffect } from 'react';
import SetupForm from '@/components/SetupForm';
import FortuneDisplay from '@/components/FortuneDisplay';

const STORAGE_KEY = 'fortune_user_data';

export default function Home() {
  const [screen, setScreen] = useState('loading');
  const [userData, setUserData] = useState(null);
  const [fortune, setFortune] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setUserData(parsed);
        fetchFortune(parsed);
      } else {
        setScreen('setup');
      }
    } catch {
      setScreen('setup');
    }
  }, []);

  async function fetchFortune(data) {
    setScreen('loading');
    setError(null);
    try {
      const res = await fetch('/api/fortune', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || '운세 생성 실패');
      setFortune(json);
      setScreen('fortune');
    } catch (err) {
      setError(err.message);
      setScreen('error');
    }
  }

  function handleSetupSubmit(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setUserData(data);
    fetchFortune(data);
  }

  function handleReset() {
    localStorage.removeItem(STORAGE_KEY);
    setUserData(null);
    setFortune(null);
    setError(null);
    setScreen('setup');
  }

  if (screen === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <div className="relative w-16 h-16">
          <div className="w-16 h-16 rounded-full border-4 border-purple-900 border-t-purple-400 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-2xl">🔮</div>
        </div>
        <p className="text-purple-300 text-sm animate-pulse">운세를 분석하는 중...</p>
      </div>
    );
  }

  if (screen === 'error') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-4">
        <div className="text-4xl">😞</div>
        <p className="text-white font-semibold">운세 생성에 실패했습니다</p>
        <p className="text-gray-400 text-sm text-center max-w-xs">{error}</p>
        {(error?.includes('API') || error?.includes('401') || error?.includes('key')) && (
          <div className="bg-yellow-900/30 border border-yellow-500/30 rounded-xl p-4 max-w-sm text-sm text-yellow-200">
            <p className="font-semibold mb-1">⚠️ API 키 설정 필요</p>
            <p><code className="bg-black/30 px-1 rounded">.env.local</code> 파일에 <code className="bg-black/30 px-1 rounded">ANTHROPIC_API_KEY</code>를 설정해 주세요.</p>
          </div>
        )}
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => fetchFortune(userData)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-sm transition-all"
          >
            다시 시도
          </button>
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-white/10 text-gray-300 rounded-xl text-sm hover:bg-white/5 transition-all"
          >
            처음으로
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'setup') {
    return <SetupForm onSubmit={handleSetupSubmit} />;
  }

  if (screen === 'fortune' && fortune) {
    return <FortuneDisplay userData={userData} fortune={fortune} onReset={handleReset} />;
  }

  return null;
}

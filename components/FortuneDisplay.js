'use client';

import { MBTI_DATA } from '@/lib/mbti';

const CATEGORY_META = {
  money: { label: '금전운', emoji: '💰' },
  love: { label: '연애운', emoji: '💕' },
  work: { label: '직장운', emoji: '💼' },
  health: { label: '건강운', emoji: '💪' },
  social: { label: '인간관계', emoji: '🤝' },
};

function scoreColor(score) {
  if (score >= 80) return '#a78bfa';
  if (score >= 60) return '#60a5fa';
  if (score >= 40) return '#fbbf24';
  return '#f87171';
}

function ScoreCircle({ score, size = 120, strokeWidth = 10 }) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const dash = (score / 100) * c;
  const color = scoreColor(score);

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeDasharray={`${dash} ${c - dash}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 1s ease' }}
      />
    </svg>
  );
}

function ScoreBar({ score }) {
  const color = scoreColor(score);
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${score}%`, backgroundColor: color }} />
      </div>
      <span className="text-xs font-bold w-8 text-right" style={{ color }}>{score}</span>
    </div>
  );
}

export default function FortuneDisplay({ userData, fortune, onReset }) {
  const mbtiInfo = MBTI_DATA[userData.mbti] || {};
  const today = new Date();
  const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일`;
  const dayNames = ['일', '월', '화', '수', '목', '금', '토'];

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-lg mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-purple-300 text-sm">{todayStr} ({dayNames[today.getDay()]})</p>
            <h1 className="text-white font-bold text-xl">
              {userData.nickname ? `${userData.nickname}님의 ` : ''}오늘의 운세
            </h1>
          </div>
          <div className="text-right">
            <span className="inline-block bg-purple-600/40 border border-purple-500/40 text-purple-200 text-xs px-2.5 py-1 rounded-full font-bold">
              {mbtiInfo.emoji} {userData.mbti}
            </span>
          </div>
        </div>

        {/* Total score */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex items-center gap-6">
          <div className="relative shrink-0">
            <ScoreCircle score={fortune.total} size={110} strokeWidth={9} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-black text-white">{fortune.total}</span>
              <span className="text-xs text-gray-400">종합</span>
            </div>
          </div>
          <div>
            <p className="text-gray-200 text-sm leading-relaxed">{fortune.summary}</p>
          </div>
        </div>

        {/* Category scores */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-4">분야별 운세</h2>
          <div className="space-y-3">
            {Object.entries(CATEGORY_META).map(([key, meta]) => {
              const cat = fortune.categories?.[key];
              if (!cat) return null;
              return (
                <div key={key}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-gray-300 text-sm">{meta.emoji} {meta.label}</span>
                  </div>
                  <ScoreBar score={cat.score} />
                  <p className="text-gray-400 text-xs mt-1 leading-relaxed">{cat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/5 backdrop-blur-md border border-green-500/20 rounded-2xl p-4">
            <h3 className="text-green-400 text-sm font-semibold mb-2">✅ 추천 행동</h3>
            <ul className="space-y-1.5">
              {fortune.actions?.do?.map((item, i) => (
                <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                  <span className="text-green-400 mt-0.5">·</span>{item}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-white/5 backdrop-blur-md border border-red-500/20 rounded-2xl p-4">
            <h3 className="text-red-400 text-sm font-semibold mb-2">⚠️ 주의 사항</h3>
            <ul className="space-y-1.5">
              {fortune.actions?.avoid?.map((item, i) => (
                <li key={i} className="text-gray-300 text-xs flex items-start gap-1.5">
                  <span className="text-red-400 mt-0.5">·</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Lucky info */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-5">
          <h2 className="text-white font-semibold mb-3">🍀 오늘의 행운</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: '행운의 색상', value: fortune.lucky?.color, icon: '🎨' },
              { label: '행운의 숫자', value: fortune.lucky?.number, icon: '🔢' },
              { label: '행운의 방향', value: fortune.lucky?.direction, icon: '🧭' },
              { label: '행운의 시간', value: fortune.lucky?.time, icon: '⏰' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3">
                <p className="text-gray-500 text-xs">{item.icon} {item.label}</p>
                <p className="text-white font-semibold text-sm mt-0.5">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* MBTI advice */}
        <div className="bg-purple-900/30 border border-purple-500/30 rounded-2xl p-5">
          <h2 className="text-purple-300 font-semibold mb-2">{mbtiInfo.emoji} {userData.mbti} 맞춤 조언</h2>
          <p className="text-gray-200 text-sm leading-relaxed">{fortune.mbti_advice}</p>
        </div>

        {/* Guide */}
        <div className="bg-indigo-900/30 border border-indigo-500/30 rounded-2xl p-5">
          <h2 className="text-indigo-300 font-semibold mb-2">📖 오늘의 가이드</h2>
          <p className="text-gray-200 text-sm leading-relaxed">{fortune.guide}</p>
        </div>

        {/* Reset */}
        <button
          onClick={onReset}
          className="w-full py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white hover:bg-white/5 transition-all text-sm"
        >
          ↩ 정보 다시 입력하기
        </button>

        <p className="text-center text-gray-600 text-xs pb-2">MBTI × 사주명리학 결합 운세 · Claude AI 생성</p>
      </div>
    </div>
  );
}

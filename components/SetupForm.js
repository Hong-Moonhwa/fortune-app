'use client';

import { useState } from 'react';
import { MBTI_LIST, MBTI_DATA } from '@/lib/mbti';

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: 80 }, (_, i) => CURRENT_YEAR - i);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const HOURS_AM = Array.from({ length: 12 }, (_, i) => i);
const HOURS_PM = Array.from({ length: 12 }, (_, i) => i + 12);

export default function SetupForm({ onSubmit }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    mbti: '',
    gender: '',
    calendarType: 'solar',
    birthYear: '',
    birthMonth: '',
    birthDay: '',
    ampm: '',
    birthHour: null,
    nickname: '',
  });

  const set = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

  const canNext1 = form.mbti !== '';
  const canNext2 = form.gender !== '' && form.birthYear !== '' && form.birthMonth !== '' && form.birthDay !== '';

  function handleSubmit() {
    onSubmit({
      ...form,
      birthYear: parseInt(form.birthYear),
      birthMonth: parseInt(form.birthMonth),
      birthDay: parseInt(form.birthDay),
      birthHour: form.birthHour !== null ? parseInt(form.birthHour) : null,
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🔮</div>
          <h1 className="text-3xl font-bold text-white mb-1">오늘의 운세</h1>
          <p className="text-purple-300 text-sm">MBTI × 사주명리학</p>
        </div>

        <div className="flex gap-2 mb-6">
          {[1, 2, 3].map(n => (
            <div key={n} className={`flex-1 h-1 rounded-full transition-all duration-300 ${step >= n ? 'bg-purple-400' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6">
          {step === 1 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">나의 MBTI는?</h2>
              <p className="text-purple-300 text-sm mb-4">유형을 선택해 주세요</p>
              <div className="grid grid-cols-4 gap-2">
                {MBTI_LIST.map(type => {
                  const info = MBTI_DATA[type];
                  const selected = form.mbti === type;
                  return (
                    <button
                      key={type}
                      onClick={() => set('mbti', type)}
                      className={`p-2 rounded-xl border transition-all duration-150 text-center ${
                        selected
                          ? 'bg-purple-600 border-purple-400 text-white'
                          : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="text-lg">{info.emoji}</div>
                      <div className="text-xs font-bold mt-0.5">{type}</div>
                    </button>
                  );
                })}
              </div>
              {form.mbti && (
                <div className="mt-4 p-3 bg-purple-900/40 rounded-xl border border-purple-500/30">
                  <p className="text-purple-200 text-sm">
                    <span className="font-bold text-white">{form.mbti}</span> · {MBTI_DATA[form.mbti]?.title} — {MBTI_DATA[form.mbti]?.traits}
                  </p>
                </div>
              )}
              <button
                disabled={!canNext1}
                onClick={() => setStep(2)}
                className="mt-5 w-full py-3 rounded-xl font-semibold transition-all duration-150 bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed"
              >
                다음 →
              </button>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">기본 정보</h2>
              <p className="text-purple-300 text-sm mb-4">생년월일과 성별을 입력해 주세요</p>

              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">성별</label>
                  <div className="flex gap-2">
                    {[['male','남성 ♂'], ['female','여성 ♀']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => set('gender', val)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.gender === val
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">달력 종류</label>
                  <div className="flex gap-2">
                    {[['solar','양력'], ['lunar','음력']].map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => set('calendarType', val)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                          form.calendarType === val
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">생년월일</label>
                  <div className="flex gap-2">
                    <select
                      value={form.birthYear}
                      onChange={e => set('birthYear', e.target.value)}
                      className="flex-[2] bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="" className="bg-gray-900">년도</option>
                      {YEARS.map(y => <option key={y} value={y} className="bg-gray-900">{y}년</option>)}
                    </select>
                    <select
                      value={form.birthMonth}
                      onChange={e => set('birthMonth', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="" className="bg-gray-900">월</option>
                      {MONTHS.map(m => <option key={m} value={m} className="bg-gray-900">{m}월</option>)}
                    </select>
                    <select
                      value={form.birthDay}
                      onChange={e => set('birthDay', e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      <option value="" className="bg-gray-900">일</option>
                      {DAYS.map(d => <option key={d} value={d} className="bg-gray-900">{d}일</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-gray-400 text-xs mb-1.5 block">출생 시간 <span className="text-gray-600">(선택)</span></label>
                  <div className="flex gap-2 mb-2">
                    {[['am','오전'], ['pm','오후'], ['','모름']].map(([val, label]) => (
                      <button
                        key={label}
                        onClick={() => { set('ampm', val); set('birthHour', val === '' ? null : (val === 'am' ? 0 : 12)); }}
                        className={`flex-1 py-2 rounded-xl border text-sm transition-all ${
                          form.ampm === val
                            ? 'bg-purple-600 border-purple-400 text-white'
                            : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {form.ampm !== '' && (
                    <select
                      value={form.birthHour ?? ''}
                      onChange={e => set('birthHour', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm focus:outline-none focus:border-purple-400"
                    >
                      {(form.ampm === 'am' ? HOURS_AM : HOURS_PM).map(h => (
                        <option key={h} value={h} className="bg-gray-900">
                          {form.ampm === 'am' ? h : h - 12}시 ({h}:00)
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div className="flex gap-2 mt-5">
                <button
                  onClick={() => setStep(1)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                >
                  ← 이전
                </button>
                <button
                  disabled={!canNext2}
                  onClick={() => setStep(3)}
                  className="flex-1 py-3 rounded-xl font-semibold transition-all bg-purple-600 hover:bg-purple-500 text-white disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  다음 →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-white font-semibold text-lg mb-1">마지막 단계</h2>
              <p className="text-purple-300 text-sm mb-4">닉네임을 입력하면 더 개인화된 운세를 제공해요</p>

              <div className="mb-4">
                <label className="text-gray-400 text-xs mb-1.5 block">닉네임 <span className="text-gray-600">(선택)</span></label>
                <input
                  type="text"
                  value={form.nickname}
                  onChange={e => set('nickname', e.target.value)}
                  placeholder="예) 운세러버, 지민 등"
                  maxLength={10}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-purple-400"
                />
              </div>

              <div className="p-4 bg-white/5 rounded-xl border border-white/10 mb-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">MBTI</span>
                  <span className="text-white font-medium">{form.mbti} · {MBTI_DATA[form.mbti]?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">성별</span>
                  <span className="text-white">{form.gender === 'male' ? '남성' : '여성'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">생년월일</span>
                  <span className="text-white">{form.birthYear}년 {form.birthMonth}월 {form.birthDay}일 ({form.calendarType === 'solar' ? '양력' : '음력'})</span>
                </div>
                {form.birthHour !== null && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">출생시간</span>
                    <span className="text-white">{form.birthHour}시</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStep(2)}
                  className="px-4 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all"
                >
                  ← 이전
                </button>
                <button
                  onClick={handleSubmit}
                  className="flex-1 py-3 rounded-xl font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white transition-all shadow-lg shadow-purple-900/50"
                >
                  🔮 오늘의 운세 보기
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

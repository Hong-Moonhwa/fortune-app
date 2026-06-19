import { GoogleGenerativeAI } from '@google/generative-ai';
import { calculateFourPillars } from '@/lib/saju';
import { MBTI_DATA } from '@/lib/mbti';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { mbti, gender, birthYear, birthMonth, birthDay, birthHour, calendarType, nickname } = await request.json();

    const hour = birthHour !== null && birthHour !== undefined ? parseInt(birthHour) : -1;
    const saju = calculateFourPillars(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay), hour >= 0 ? hour : 12);
    const mbtiInfo = MBTI_DATA[mbti] || {};

    const today = new Date();
    const todayStr = `${today.getFullYear()}년 ${today.getMonth() + 1}월 ${today.getDate()}일 (${['일','월','화','수','목','금','토'][today.getDay()]}요일)`;

    const prompt = `당신은 사주명리학과 MBTI 성격유형론을 결합한 운세 전문가입니다.

[사용자 정보]
- 닉네임: ${nickname || '사용자'}
- MBTI: ${mbti} (${mbtiInfo.title || ''}) — ${mbtiInfo.traits || ''}
- 성별: ${gender === 'male' ? '남성' : '여성'}
- 생년: ${birthYear}년 ${calendarType === 'lunar' ? '(음력)' : '(양력)'}
- 사주팔자: 년주 ${saju.yearPillar} / 월주 ${saju.monthPillar} / 일주 ${saju.dayPillar} / 시주 ${saju.hourPillar}
- 일간 오행: ${saju.mainElement}
- 오늘 오행: ${saju.todayElement}
- 오늘 날짜: ${todayStr}

[지시사항]
MBTI 성향 70%, 사주명리학 30%를 반영해 오늘의 운세를 생성하세요.
점수는 각각 다르게, 사용자의 MBTI와 사주 특성을 반영하세요.

다음 JSON만 출력하세요 (다른 텍스트 없이):
{
  "total": <50~95 사이 정수>,
  "summary": "<오늘 운세 요약 2~3문장, MBTI 특성 언급>",
  "categories": {
    "money": { "score": <0~100 정수>, "desc": "<금전운 설명 1~2문장>" },
    "love": { "score": <0~100 정수>, "desc": "<연애운 설명 1~2문장>" },
    "work": { "score": <0~100 정수>, "desc": "<직장운 설명 1~2문장>" },
    "health": { "score": <0~100 정수>, "desc": "<건강운 설명 1~2문장>" },
    "social": { "score": <0~100 정수>, "desc": "<인간관계운 설명 1~2문장>" }
  },
  "actions": {
    "do": ["<추천행동1>", "<추천행동2>", "<추천행동3>"],
    "avoid": ["<주의사항1>", "<주의사항2>"]
  },
  "lucky": {
    "color": "<색상명>",
    "number": <1~99 정수>,
    "direction": "<방향>",
    "time": "<시간대>"
  },
  "mbti_advice": "<${mbti} 유형 맞춤 조언 1~2문장>",
  "guide": "<오늘 하루 종합 가이드 2~3문장>"
}`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const response = await model.generateContent(prompt);
    const text = response.response.text().trim();
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: '운세 생성에 실패했습니다.' }, { status: 500 });
    }

    const fortune = JSON.parse(jsonMatch[0]);
    return Response.json(fortune);
  } catch (err) {
    console.error('[fortune API error]', err);
    return Response.json({ error: err.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

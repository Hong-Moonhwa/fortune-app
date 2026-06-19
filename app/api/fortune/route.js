import { calculateFourPillars } from '@/lib/saju';
import { MBTI_DATA } from '@/lib/mbti';

function createRng(seed) {
  let s = seed >>> 0;
  return function () {
    s += 0x6D2B79F5;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function getSeed(birthYear, birthMonth, birthDay, today) {
  const d = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
  return (birthYear * 1000 + birthMonth * 31 + birthDay) ^ (d * 7);
}

function pick(arr, rng) {
  return arr[Math.floor(rng() * arr.length)];
}

function pickUnique(arr, count, rng) {
  const shuffled = [...arr].sort(() => rng() - 0.5);
  return shuffled.slice(0, count);
}

function calcScore(base, rng, variance = 15) {
  return Math.min(100, Math.max(0, Math.round(base + (rng() - 0.5) * variance * 2)));
}

const ELEMENT_COMPAT = {
  '목': { '목': 0, '화': 15, '토': -15, '금': -10, '수': 10 },
  '화': { '목': 10, '화': 0, '토': 15, '금': -15, '수': -10 },
  '토': { '목': -10, '화': 10, '토': 0, '금': 15, '수': -15 },
  '금': { '목': -15, '화': -10, '토': 10, '금': 0, '수': 15 },
  '수': { '목': 15, '화': -15, '토': -10, '금': 10, '수': 0 },
};

function getElementBonus(mainEl, todayEl) {
  const m = mainEl?.charAt(0);
  const t = todayEl?.charAt(0);
  return (m && t && ELEMENT_COMPAT[m]?.[t]) ?? 0;
}

const MBTI_BASE = {
  INTJ: { money: 75, love: 55, work: 80, health: 65, social: 55 },
  INTP: { money: 65, love: 55, work: 75, health: 60, social: 50 },
  ENTJ: { money: 80, love: 60, work: 85, health: 65, social: 70 },
  ENTP: { money: 70, love: 65, work: 75, health: 65, social: 72 },
  INFJ: { money: 62, love: 78, work: 72, health: 65, social: 68 },
  INFP: { money: 58, love: 80, work: 65, health: 62, social: 65 },
  ENFJ: { money: 68, love: 82, work: 78, health: 70, social: 85 },
  ENFP: { money: 65, love: 80, work: 70, health: 68, social: 82 },
  ISTJ: { money: 78, love: 62, work: 82, health: 72, social: 60 },
  ISFJ: { money: 70, love: 75, work: 75, health: 70, social: 72 },
  ESTJ: { money: 80, love: 62, work: 85, health: 68, social: 72 },
  ESFJ: { money: 72, love: 78, work: 75, health: 70, social: 82 },
  ISTP: { money: 68, love: 58, work: 72, health: 75, social: 58 },
  ISFP: { money: 60, love: 75, work: 65, health: 72, social: 68 },
  ESTP: { money: 72, love: 70, work: 75, health: 78, social: 78 },
  ESFP: { money: 65, love: 78, work: 68, health: 75, social: 85 },
};

const TEXTS = {
  money: {
    high: [
      '재물운이 좋습니다. 계획한 지출은 이익으로 돌아올 가능성이 높으니 적극적으로 행동하세요.',
      '금전적인 기회가 찾아올 수 있습니다. 신중하게 판단하되 좋은 흐름을 놓치지 마세요.',
      '재정 관련 결정에 좋은 날입니다. 소득 증가의 기운이 감돕니다.',
    ],
    mid: [
      '재물운은 평범합니다. 불필요한 지출을 줄이고 절약하는 자세가 필요합니다.',
      '금전 흐름이 안정적입니다. 큰 투자보다는 현상 유지에 집중하세요.',
      '수입과 지출의 균형을 맞추는 날입니다. 충동 구매를 조심하세요.',
    ],
    low: [
      '재물운이 다소 약합니다. 큰 지출이나 투자는 미루는 것이 좋습니다.',
      '금전적 손실 가능성이 있으니 계획에 없는 지출을 삼가세요.',
      '오늘은 돈 관련 결정을 서두르지 마세요. 충분히 검토 후 행동하세요.',
    ],
  },
  love: {
    high: [
      '연애운이 상승 중입니다. 감정 표현에 적극적으로 나서면 좋은 결과가 있을 거예요.',
      '인연과의 관계가 깊어질 수 있는 날입니다. 진심을 담은 대화가 효과적입니다.',
      '사랑의 기운이 충만합니다. 새로운 만남이나 기존 관계 발전에 좋은 날이에요.',
    ],
    mid: [
      '연애운은 평온합니다. 상대방의 마음을 세심히 살피는 하루가 되세요.',
      '감정적으로 안정된 날입니다. 무리한 감정 표현보다 자연스럽게 흐르세요.',
      '연인과의 관계는 안정적입니다. 작은 배려가 큰 감동을 줄 수 있어요.',
    ],
    low: [
      '연애운이 약간 불안정합니다. 감정적인 충돌을 피하고 차분하게 대화하세요.',
      '오해가 생기기 쉬운 날입니다. 말 한마디에 신중을 기하세요.',
      '무리한 기대는 실망으로 이어질 수 있습니다. 여유를 가지세요.',
    ],
  },
  work: {
    high: [
      '업무 능력이 돋보이는 날입니다. 중요한 미팅이나 발표에 자신감을 가지세요.',
      '직장에서 좋은 평가를 받을 수 있는 기회가 있습니다. 적극적으로 의견을 표현하세요.',
      '집중력이 높아지는 날입니다. 미뤄온 업무를 처리하기에 좋은 타이밍이에요.',
    ],
    mid: [
      '업무는 순조롭게 진행됩니다. 꾸준한 노력이 성과로 이어지는 날이에요.',
      '직장 운세는 안정적입니다. 맡은 일에 충실하면 충분합니다.',
      '평범하지만 착실한 하루가 될 것입니다. 기본에 충실하세요.',
    ],
    low: [
      '업무에서 예상치 못한 변수가 생길 수 있습니다. 유연하게 대처하세요.',
      '집중력이 흐트러지기 쉬운 날입니다. 중요한 결정은 내일로 미루세요.',
      '직장에서 갈등이 생길 수 있습니다. 인내심을 갖고 침착하게 행동하세요.',
    ],
  },
  health: {
    high: [
      '체력이 좋은 날입니다. 운동이나 야외 활동을 즐기기에 최적의 날이에요.',
      '건강 기운이 충만합니다. 새로운 건강 습관을 시작하기에 좋은 타이밍이에요.',
      '활력이 넘치는 하루가 될 것입니다. 적극적인 활동을 권장합니다.',
    ],
    mid: [
      '건강은 무난합니다. 규칙적인 식사와 수면을 유지하세요.',
      '체력이 보통 수준입니다. 무리하지 않는 선에서 활동하세요.',
      '건강에 큰 문제는 없지만 과로를 피하고 충분한 휴식을 취하세요.',
    ],
    low: [
      '피로가 쌓이기 쉬운 날입니다. 충분한 휴식을 취하고 무리한 활동을 삼가세요.',
      '소화기나 두통에 주의하세요. 스트레스 관리가 중요합니다.',
      '체력 소모가 큰 날입니다. 영양 보충과 수면에 신경 쓰세요.',
    ],
  },
  social: {
    high: [
      '대인관계 운이 좋습니다. 새로운 사람과의 만남이 뜻깊은 인연으로 발전할 수 있어요.',
      '주변 사람들과의 소통이 원활한 날입니다. 협력 관계에서 좋은 성과가 기대됩니다.',
      '사교적인 기운이 강합니다. 모임이나 네트워킹에 적극 참여하세요.',
    ],
    mid: [
      '인간관계는 안정적입니다. 기존 관계를 소중히 유지하는 하루가 되세요.',
      '대인관계에서 큰 변화는 없습니다. 편안한 관계를 이어가세요.',
      '주변 사람들과 무난하게 지낼 수 있는 날입니다.',
    ],
    low: [
      '대인관계에서 오해나 마찰이 생길 수 있습니다. 언행에 주의하세요.',
      '혼자만의 시간을 갖는 것이 더 좋을 수 있습니다. 불필요한 충돌을 피하세요.',
      '타인의 말에 쉽게 상처받을 수 있습니다. 감정 조절이 필요한 날이에요.',
    ],
  },
};

const MBTI_ADVICE = {
  INTJ: ['전략적 사고를 믿으세요. 오늘의 직관이 내일의 성과로 이어집니다.', '완벽주의를 잠시 내려두고 80%의 완성도로 행동에 옮기는 것도 방법입니다.'],
  INTP: ['분석도 중요하지만 오늘은 행동으로 옮기는 연습을 해보세요.', '논리적 판단을 믿되 감정적 신호도 무시하지 마세요.'],
  ENTJ: ['리더십을 발휘하기 좋은 날입니다. 팀원의 의견에도 귀 기울여 보세요.', '목표를 향한 추진력이 빛나는 날입니다. 다만 주변 사람도 챙기세요.'],
  ENTP: ['창의적인 아이디어가 샘솟는 날입니다. 하나라도 실행에 옮겨보세요.', '토론보다 실행이 더 가치 있는 하루입니다.'],
  INFJ: ['직관을 믿으세요. 오늘의 느낌은 틀리지 않을 가능성이 높습니다.', '타인을 돕는 것도 중요하지만 자신을 먼저 챙기는 하루가 되세요.'],
  INFP: ['감성이 풍부한 날입니다. 창작 활동이나 일기 쓰기를 추천합니다.', '이상과 현실 사이에서 균형을 찾는 하루가 되세요.'],
  ENFJ: ['따뜻한 에너지로 주변을 밝히는 날입니다. 당신의 말 한마디가 큰 힘이 됩니다.', '타인의 감정에 공감하되 자신의 경계도 지키세요.'],
  ENFP: ['열정적인 에너지가 넘치는 날입니다. 새로운 도전을 두려워하지 마세요.', '시작한 일을 마무리하는 데 집중해보세요. 완성의 기쁨을 느낄 수 있어요.'],
  ISTJ: ['계획대로 차근차근 진행하세요. 오늘의 성실함이 빛을 발합니다.', '변화에 유연하게 대처하는 연습이 도움이 될 수 있습니다.'],
  ISFJ: ['헌신적인 노력이 오늘 인정받을 수 있습니다. 자신을 내세우는 것도 필요해요.', '소중한 사람들을 챙기되 자신의 필요도 표현하세요.'],
  ESTJ: ['체계적인 접근이 빛을 발하는 날입니다. 리스트를 만들어 하나씩 해결하세요.', '효율을 추구하되 관계의 온도도 신경 쓰세요.'],
  ESFJ: ['사람들과의 조화가 오늘의 키워드입니다. 당신의 배려가 큰 감동을 줄 거예요.', '타인의 기대에 맞추려 너무 애쓰지 마세요. 자신의 필요도 중요합니다.'],
  ISTP: ['실용적인 접근으로 문제를 해결하기 좋은 날입니다.', '혼자만의 시간을 충분히 갖되 가끔은 마음을 열고 소통해보세요.'],
  ISFP: ['감각적인 즐거움을 찾는 하루가 되세요. 작은 아름다움에 주목하세요.', '자신만의 속도로 나아가도 괜찮습니다. 비교하지 마세요.'],
  ESTP: ['행동력이 빛나는 날입니다. 기회가 오면 주저하지 말고 잡으세요.', '즉흥적인 결정도 좋지만 한 번쯤 결과를 생각해보세요.'],
  ESFP: ['활기찬 에너지로 주변을 환하게 만드는 날입니다.', '현재를 즐기되 미래를 위한 작은 준비도 해두세요.'],
};

const SUMMARIES = [
  (n, mbti) => `${n}님, 오늘은 ${mbti} 특유의 감각이 빛나는 날입니다. 주어진 상황에서 최선을 다하면 좋은 결과가 따라올 거예요. 작은 성취에도 스스로 칭찬을 아끼지 마세요.`,
  (n, mbti) => `${n}님의 오늘은 ${mbti} 성향을 충분히 발휘할 수 있는 하루입니다. 꾸준한 노력이 서서히 결실을 맺고 있으니 자신을 믿으세요. 주변의 에너지가 당신을 돕고 있습니다.`,
  (n, mbti) => `오늘은 ${n}님에게 의미 있는 변화의 기운이 흐릅니다. ${mbti} 유형의 강점을 살려 도전하면 예상보다 좋은 결과를 얻을 수 있습니다. 하루를 긍정적인 마음으로 시작해보세요.`,
  (n, mbti) => `${n}님, 오늘의 에너지는 차분하지만 단단합니다. ${mbti} 유형인 당신은 내면의 힘으로 어떤 상황도 헤쳐나갈 수 있습니다. 자신의 페이스를 지키며 나아가세요.`,
];

const GUIDES = [
  (n) => `${n}님, 오늘 하루는 준비된 자에게 기회가 찾아오는 날입니다. 계획을 점검하고 적극적으로 실행에 옮기세요. 작은 행동 하나하나가 큰 변화의 시작이 됩니다.`,
  (n) => `오늘은 균형 잡힌 하루를 보내는 것이 중요합니다. 일과 휴식, 관계와 혼자만의 시간 사이에서 조화를 찾아보세요. ${n}님의 내면이 알려주는 신호에 귀 기울이세요.`,
  (n) => `${n}님에게 오늘은 새로운 가능성이 열리는 날입니다. 두려움보다 설렘을 선택하고 한 걸음씩 앞으로 나아가세요. 진심 어린 노력은 반드시 결실을 맺습니다.`,
  (n) => `오늘은 소소한 일상에서 행복을 찾는 하루가 되세요. 거창한 목표보다 지금 이 순간에 집중하는 것이 ${n}님에게 더 큰 만족을 줄 것입니다. 오늘도 수고하는 자신을 격려해주세요.`,
];

const DO_POOL = [
  '아침 산책으로 하루를 시작하세요', '중요한 결정을 오전에 처리하세요', '주변 사람에게 감사를 표현하세요',
  '새로운 아이디어를 메모해두세요', '충분한 수분 섭취를 챙기세요', '명상이나 심호흡으로 마음을 다스리세요',
  '독서나 학습에 시간을 투자하세요', '오랜 지인에게 연락해보세요', '자신을 위한 작은 선물을 준비하세요',
  '계획을 꼼꼼히 점검하는 시간을 가지세요', '스트레칭으로 몸의 긴장을 풀어주세요', '감사 일기를 써보세요',
];

const AVOID_POOL = [
  '충동적인 소비를 삼가세요', '중요한 결정을 감정적으로 내리지 마세요', '과식이나 야식을 피하세요',
  '불필요한 논쟁을 피하세요', '과로하지 마세요', '늦은 밤 SNS 사용을 줄이세요',
  '무리한 약속을 잡지 마세요', '근거 없는 소문에 휘말리지 마세요',
];

const LUCKY_COLORS = ['빨강', '주황', '노랑', '초록', '파랑', '남색', '보라', '분홍', '흰색', '금색', '은색', '하늘색'];
const LUCKY_DIRS = ['동', '서', '남', '북', '동남', '동북', '서남', '서북'];
const LUCKY_TIMES = ['오전 7~9시', '오전 9~11시', '오전 11시~오후 1시', '오후 1~3시', '오후 3~5시', '오후 5~7시', '저녁 7~9시'];

function tier(s) {
  return s >= 70 ? 'high' : s >= 45 ? 'mid' : 'low';
}

export async function POST(request) {
  try {
    const { mbti, gender, birthYear, birthMonth, birthDay, birthHour, calendarType, nickname } = await request.json();

    const hour = birthHour !== null && birthHour !== undefined ? parseInt(birthHour) : -1;
    const saju = calculateFourPillars(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay), hour >= 0 ? hour : 12);

    const today = new Date();
    const rng = createRng(getSeed(parseInt(birthYear), parseInt(birthMonth), parseInt(birthDay), today));

    const elBonus = getElementBonus(saju.mainElement, saju.todayElement);
    const base = MBTI_BASE[mbti] || { money: 68, love: 68, work: 68, health: 68, social: 68 };

    const money = calcScore(base.money + elBonus, rng);
    const love = calcScore(base.love + elBonus * 0.5, rng);
    const work = calcScore(base.work + elBonus * 0.8, rng);
    const health = calcScore(base.health + elBonus * 0.3, rng);
    const social = calcScore(base.social + elBonus * 0.6, rng);
    const total = Math.min(95, Math.max(50, Math.round((money + love + work + health + social) / 5)));

    const name = nickname || '사용자';

    return Response.json({
      total,
      summary: pick(SUMMARIES, rng)(name, mbti),
      categories: {
        money: { score: money, desc: pick(TEXTS.money[tier(money)], rng) },
        love: { score: love, desc: pick(TEXTS.love[tier(love)], rng) },
        work: { score: work, desc: pick(TEXTS.work[tier(work)], rng) },
        health: { score: health, desc: pick(TEXTS.health[tier(health)], rng) },
        social: { score: social, desc: pick(TEXTS.social[tier(social)], rng) },
      },
      actions: {
        do: pickUnique(DO_POOL, 3, rng),
        avoid: pickUnique(AVOID_POOL, 2, rng),
      },
      lucky: {
        color: pick(LUCKY_COLORS, rng),
        number: Math.floor(rng() * 99) + 1,
        direction: pick(LUCKY_DIRS, rng),
        time: pick(LUCKY_TIMES, rng),
      },
      mbti_advice: pick(MBTI_ADVICE[mbti] || ['오늘도 자신을 믿고 나아가세요.'], rng),
      guide: pick(GUIDES, rng)(name),
    });
  } catch (err) {
    console.error('[fortune API error]', err);
    return Response.json({ error: err.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}

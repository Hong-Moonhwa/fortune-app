const HEAVENLY_STEMS = ['갑','을','병','정','무','기','경','신','임','계'];
const EARTHLY_BRANCHES = ['자','축','인','묘','진','사','오','미','신','유','술','해'];
const FIVE_ELEMENTS = ['목(木)','화(火)','토(土)','금(金)','수(水)'];
const STEM_ELEMENT = [0, 0, 1, 1, 2, 2, 3, 3, 4, 4];
const BRANCH_ELEMENT = [4, 2, 0, 0, 2, 1, 1, 2, 3, 3, 2, 4];

function julianDayNumber(year, month, day) {
  const a = Math.floor((14 - month) / 12);
  const y = year + 4800 - a;
  const m = month + 12 * a - 3;
  return day + Math.floor((153 * m + 2) / 5) + 365 * y +
    Math.floor(y / 4) - Math.floor(y / 100) + Math.floor(y / 400) - 32045;
}

export function calculateFourPillars(year, month, day, hour) {
  const yearStem = ((year - 4) % 10 + 10) % 10;
  const yearBranch = ((year - 4) % 12 + 12) % 12;

  const monthStem = (Math.floor(yearStem / 2) * 2 + month + 1) % 10;
  const monthBranch = (month + 1) % 12;

  const jdn = julianDayNumber(year, month, day);
  const dayStem = (jdn + 9) % 10;
  const dayBranch = (jdn + 11) % 12;

  const hourBranch = Math.floor(((hour + 1) % 24) / 2) % 12;
  const hourStem = (Math.floor(dayStem / 2) * 2 + hourBranch) % 10;

  const todayJdn = julianDayNumber(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate()
  );
  const todayStem = (todayJdn + 9) % 10;

  const elements = [0, 0, 0, 0, 0];
  for (const [s, b] of [[yearStem, yearBranch], [monthStem, monthBranch], [dayStem, dayBranch], [hourStem, hourBranch]]) {
    elements[STEM_ELEMENT[s]]++;
    elements[BRANCH_ELEMENT[b]]++;
  }

  return {
    yearPillar: `${HEAVENLY_STEMS[yearStem]}${EARTHLY_BRANCHES[yearBranch]}`,
    monthPillar: `${HEAVENLY_STEMS[monthStem]}${EARTHLY_BRANCHES[monthBranch]}`,
    dayPillar: `${HEAVENLY_STEMS[dayStem]}${EARTHLY_BRANCHES[dayBranch]}`,
    hourPillar: hour >= 0 ? `${HEAVENLY_STEMS[hourStem]}${EARTHLY_BRANCHES[hourBranch]}` : '미정',
    mainElement: FIVE_ELEMENTS[STEM_ELEMENT[dayStem]],
    todayElement: FIVE_ELEMENTS[STEM_ELEMENT[todayStem]],
    elements: FIVE_ELEMENTS.map((name, i) => ({ name, count: elements[i] })),
  };
}

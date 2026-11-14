/*
 * When an order may be for, in Indian time -- the website's half of the
 * server's service/orderDates.js (and the app's lib/utils/order_dates.dart).
 * Same rules, same admin settings, read from /api/settings:
 *
 *   catering    the meal's IST serving time at least cateringNoticeHours away
 *   meal boxes  today only before mealboxCutoffHour IST
 *
 * IST whatever the browser's clock or zone says. Dates are 'YYYY-MM-DD'
 * strings, the format of <input type="date">.
 */
const IST_OFFSET_MS = 330 * 60 * 1000;
export const MEAL_HOUR_IST = { breakfast: 7, lunch: 11, dinner: 19, exotic: 11 };
export const DEFAULT_RULES = { cateringNoticeHours: 24, mealboxCutoffHour: 12 };

const pad = (n) => String(n).padStart(2, '0');

/** Now as IST wall-clock parts. */
function nowIst() {
  const d = new Date(Date.now() + IST_OFFSET_MS);
  return { y: d.getUTCFullYear(), m: d.getUTCMonth() + 1, d: d.getUTCDate(), h: d.getUTCHours() };
}

const ymd = ({ y, m, d }) => `${y}-${pad(m)}-${pad(d)}`;
const addDays = (day, n) => {
  const t = new Date(Date.UTC(day.y, day.m - 1, day.d) + n * 86400000);
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
};
const istInstant = (day, hour) => Date.UTC(day.y, day.m - 1, day.d, hour) - IST_OFFSET_MS;

/** Today in India, 'YYYY-MM-DD'. */
export const todayIst = () => ymd(nowIst());

/** The first date a meal box can be for. */
export function earliestMealboxDate(cutoffHour = DEFAULT_RULES.mealboxCutoffHour) {
  const now = nowIst();
  return ymd(now.h >= cutoffHour ? addDays(now, 1) : now);
}

/** The first date catering for this meal can be for. */
export function earliestCateringDate(mealType, noticeHours = DEFAULT_RULES.cateringNoticeHours) {
  const hour = MEAL_HOUR_IST[String(mealType || '').toLowerCase()] ?? 11;
  let day = nowIst();
  for (let i = 0; i < 8; i++, day = addDays(day, 1)) {
    if (istInstant(day, hour) - Date.now() >= noticeHours * 3600000) return ymd(day);
  }
  return ymd(day);
}

/** Load the admin's numbers; the defaults stand in if the request fails. */
export async function fetchOrderRules(api) {
  try {
    const res = await fetch(`${api}/api/settings`);
    const s = await res.json();
    return {
      cateringNoticeHours: s.cateringNoticeHours ?? DEFAULT_RULES.cateringNoticeHours,
      mealboxCutoffHour: s.mealboxCutoffHour ?? DEFAULT_RULES.mealboxCutoffHour,
    };
  } catch {
    return DEFAULT_RULES;
  }
}

export const noticeLabel = (h) => (h === 24 ? '1 day' : h % 24 === 0 ? `${h / 24} days` : `${h} hours`);
export const hourLabel = (h) => (h === 0 ? 'midnight' : h === 12 ? '12 noon' : h < 12 ? `${h} am` : `${h - 12} pm`);

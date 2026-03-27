import { getDatabase } from './database';
import { generateId } from '../utils/uuid';
import { today } from '../utils/date';

export async function markDayLogged(date?: string): Promise<void> {
  const db = await getDatabase();
  const d = date ?? today();
  await db.runAsync(
    `INSERT INTO streaks (id, date, has_logged) VALUES (?, ?, 1)
     ON CONFLICT(date) DO UPDATE SET has_logged = 1`,
    generateId(),
    d
  );
}

export async function getCurrentStreak(): Promise<number> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<{ date: string }>(
    'SELECT date FROM streaks WHERE has_logged = 1 ORDER BY date DESC'
  );

  if (rows.length === 0) return 0;

  let streak = 0;
  const todayDate = today();
  const checkDate = new Date(todayDate);

  for (let i = 0; i < rows.length; i++) {
    const expected = checkDate.toISOString().split('T')[0];
    if (rows[i].date === expected) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else if (i === 0 && streak === 0) {
      // Today might not be logged yet, check if yesterday starts the streak
      checkDate.setDate(checkDate.getDate() - 1);
      const yesterdayStr = checkDate.toISOString().split('T')[0];
      if (rows[i].date === yesterdayStr) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    } else {
      break;
    }
  }

  return streak;
}

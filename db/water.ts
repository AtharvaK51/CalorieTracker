import { getDatabase } from './database';
import { generateId } from '../utils/uuid';
import { now } from '../utils/date';

export interface WaterEntry {
  id: string;
  amount_ml: number;
  logged_at: string;
  created_at: string;
  sync_status: string;
}

export async function addWater(amountMl: number): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const timestamp = now();
  await db.runAsync(
    'INSERT INTO water_intake (id, amount_ml, logged_at, created_at) VALUES (?, ?, ?, ?)',
    id,
    amountMl,
    timestamp,
    timestamp
  );
  return id;
}

export async function removeLastWater(date: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `DELETE FROM water_intake WHERE id = (
      SELECT id FROM water_intake WHERE logged_at LIKE ? ORDER BY logged_at DESC LIMIT 1
    )`,
    `${date}%`
  );
}

export async function getWaterForDate(date: string): Promise<number> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<{ total: number }>(
    'SELECT COALESCE(SUM(amount_ml), 0) as total FROM water_intake WHERE logged_at LIKE ?',
    `${date}%`
  );
  return result?.total ?? 0;
}

export async function getWaterEntriesForDate(
  date: string
): Promise<WaterEntry[]> {
  const db = await getDatabase();
  return await db.getAllAsync<WaterEntry>(
    'SELECT * FROM water_intake WHERE logged_at LIKE ? ORDER BY logged_at DESC',
    `${date}%`
  );
}

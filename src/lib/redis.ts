import { Redis } from '@upstash/redis';
import type {
  MonthlySnapshot,
  SnapshotIndex,
  Settings,
} from '@/types/financial';
import { REDIS_KEYS } from './constants';

// Redis client — reads UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN from env
export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ── Snapshot Index ─────────────────────────────────────────────────────────────

export async function getSnapshotIndex(): Promise<SnapshotIndex> {
  const index = await redis.get<SnapshotIndex>(REDIS_KEYS.snapshotIndex);
  return index ?? { months: [], latestMonth: '' };
}

async function updateSnapshotIndex(yearMonth: string): Promise<void> {
  const index = await getSnapshotIndex();
  if (!index.months.includes(yearMonth)) {
    index.months.push(yearMonth);
    index.months.sort();
  }
  index.latestMonth = index.months[index.months.length - 1] ?? '';
  await redis.set(REDIS_KEYS.snapshotIndex, index);
}

// ── Snapshots ──────────────────────────────────────────────────────────────────

export async function getSnapshot(
  yearMonth: string
): Promise<MonthlySnapshot | null> {
  return redis.get<MonthlySnapshot>(REDIS_KEYS.snapshot(yearMonth));
}

export async function getLatestSnapshot(): Promise<MonthlySnapshot | null> {
  const index = await getSnapshotIndex();
  if (!index.latestMonth) return null;
  return getSnapshot(index.latestMonth);
}

export async function saveSnapshot(snapshot: MonthlySnapshot): Promise<void> {
  await redis.set(REDIS_KEYS.snapshot(snapshot.yearMonth), snapshot);
  await updateSnapshotIndex(snapshot.yearMonth);
}

/** Fetch all snapshots in parallel */
export async function getAllSnapshots(): Promise<MonthlySnapshot[]> {
  const index = await getSnapshotIndex();
  if (index.months.length === 0) return [];
  const snapshots = await Promise.all(
    index.months.map((m) => getSnapshot(m))
  );
  return snapshots.filter((s): s is MonthlySnapshot => s !== null);
}

// ── Settings ───────────────────────────────────────────────────────────────────

export async function getSettings(): Promise<Settings | null> {
  return redis.get<Settings>(REDIS_KEYS.settings);
}

export async function saveSettings(settings: Settings): Promise<void> {
  await redis.set(REDIS_KEYS.settings, settings);
}

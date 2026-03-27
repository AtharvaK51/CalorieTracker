export function now(): string {
  return new Date().toISOString();
}

export function today(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatTime(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
}

export function formatDateFull(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function isToday(iso: string): boolean {
  return iso.startsWith(today());
}

export function daysAgo(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
}

export function daysBetween(dateA: string, dateB: string): number {
  const a = new Date(dateA);
  const b = new Date(dateB);
  const diff = Math.abs(a.getTime() - b.getTime());
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

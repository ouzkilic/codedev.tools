import { useEffect, useState } from 'react';

const KEY = 'codedev.recent';
const MAX = 8;
const EVENT = 'recent-tools-changed';

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr.filter((x): x is string => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

/** Records a visited tool id at the front of the recent list (deduped, capped). */
export function recordRecent(id: string) {
  try {
    const next = [id, ...read().filter((x) => x !== id)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // localStorage unavailable (private mode / disabled) — recents simply don't persist.
  }
}

/** Reactive list of recently visited tool ids (most recent first). */
export function useRecentTools(): string[] {
  const [ids, setIds] = useState<string[]>(read);
  useEffect(() => {
    const sync = () => setIds(read());
    window.addEventListener(EVENT, sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener(EVENT, sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return ids;
}

import { useCallback, useEffect, useRef, useState } from 'react';
import { PROGRESS_TABLE, supabase } from '../lib/supabase';
import {
  BlockProgress,
  CourseProgress,
  blockProgressOf,
  emptyBlockProgress,
  mergeProgress,
  normalizeProgress,
} from '../utils/progress';

/** idle: nothing to sync (local mode) · saving/saved: account sync · error: last sync failed (kept locally, retried). */
export type SyncStatus = 'idle' | 'loading' | 'saving' | 'saved' | 'error';

const LEGACY_KEY = 'quantum_codebook_progress_v2';
const cacheKey = (userId: string | null) => `quantum_codebook_progress_v3:${userId ?? 'local'}`;
const importedKey = (userId: string) => `quantum_codebook_guest_imported:${userId}`;
const SYNC_DELAY_MS = 800;

function readJson(key: string): unknown {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full or disabled: progress stays in memory (and in the account when signed in).
  }
}

/** Progress kept in this browser for a user (or for the guest), migrating the old v2 format. */
function loadCached(userId: string | null): CourseProgress {
  const cached = readJson(cacheKey(userId));
  if (cached) return normalizeProgress(cached);
  if (!userId) return normalizeProgress(readJson(LEGACY_KEY));
  return normalizeProgress(null);
}

/**
 * Learner progress for the signed-in user (synced with Supabase) or for the guest in local mode.
 * Every change is cached in localStorage at once and pushed to the account shortly after.
 */
export function useProgress(userId: string | null) {
  const [progress, setProgress] = useState<CourseProgress>(() => loadCached(userId));
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(userId && supabase ? 'loading' : 'idle');
  const [ready, setReady] = useState(!(userId && supabase));
  const syncTimer = useRef<number | undefined>(undefined);
  const userRef = useRef(userId);

  // Load (and merge) when the user changes.
  useEffect(() => {
    userRef.current = userId;
    const local = loadCached(userId);
    setProgress(local);
    if (!userId || !supabase) {
      setReady(true);
      setSyncStatus('idle');
      return;
    }
    let cancelled = false;
    setReady(false);
    setSyncStatus('loading');
    (async () => {
      const { data, error } = await supabase!.from(PROGRESS_TABLE).select('data').eq('user_id', userId).maybeSingle();
      if (cancelled) return;
      let merged = local;
      if (!error && data?.data) merged = mergeProgress(merged, normalizeProgress(data.data));
      // First sign-in on this browser: bring along what the learner did before having an account.
      if (!readJson(importedKey(userId))) {
        merged = mergeProgress(merged, loadCached(null));
        writeJson(importedKey(userId), true);
      }
      setProgress(merged);
      writeJson(cacheKey(userId), merged);
      setReady(true);
      if (error) {
        setSyncStatus('error');
        return;
      }
      const { error: saveError } = await supabase!.from(PROGRESS_TABLE).upsert({ user_id: userId, data: merged, updated_at: new Date().toISOString() });
      if (!cancelled) setSyncStatus(saveError ? 'error' : 'saved');
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  const persist = useCallback((next: CourseProgress) => {
    const currentUser = userRef.current;
    writeJson(cacheKey(currentUser), next);
    if (!currentUser || !supabase) return;
    setSyncStatus('saving');
    window.clearTimeout(syncTimer.current);
    syncTimer.current = window.setTimeout(async () => {
      const { error } = await supabase!.from(PROGRESS_TABLE).upsert({ user_id: currentUser, data: next, updated_at: new Date().toISOString() });
      if (userRef.current === currentUser) setSyncStatus(error ? 'error' : 'saved');
    }, SYNC_DELAY_MS);
  }, []);

  useEffect(() => () => window.clearTimeout(syncTimer.current), []);

  // Changes made by the learner are marked dirty and persisted after React commits them
  // (never inside a state updater, which React may call twice).
  const dirty = useRef(false);
  useEffect(() => {
    if (!dirty.current) return;
    dirty.current = false;
    persist(progress);
  }, [progress, persist]);

  const update = useCallback((change: (previous: CourseProgress) => CourseProgress) => {
    setProgress((previous) => {
      const next = change(previous);
      if (next === previous) return previous;
      dirty.current = true;
      return { ...next, updatedAt: new Date().toISOString() };
    });
  }, []);

  const updateBlock = useCallback((blockId: string, change: (block: BlockProgress) => BlockProgress) => {
    update((previous) => {
      const current = previous.blocks[blockId] ?? emptyBlockProgress();
      const next = change(current);
      return next === current ? previous : { ...previous, blocks: { ...previous.blocks, [blockId]: next } };
    });
  }, [update]);

  const markExerciseSolved = useCallback((blockId: string, slug: string) => updateBlock(blockId, (block) =>
    block.solvedExercises.includes(slug) ? block : { ...block, solvedExercises: [...block.solvedExercises, slug] }), [updateBlock]);

  const markLessonComplete = useCallback((blockId: string, slug: string) => updateBlock(blockId, (block) =>
    block.completedLessons.includes(slug) ? block : { ...block, completedLessons: [...block.completedLessons, slug] }), [updateBlock]);

  const saveQuizResult = useCallback((blockId: string, score: number, maxScore: number) => updateBlock(blockId, (block) => {
    const passed = maxScore > 0 && score / maxScore >= 0.7;
    if (block.quizScore >= score && (block.quizPassed || !passed)) return block;
    return { ...block, quizPassed: block.quizPassed || passed, quizScore: Math.max(block.quizScore, score) };
  }), [updateBlock]);

  const completeMiniProject = useCallback((blockId: string) => updateBlock(blockId, (block) =>
    block.miniProjectCompleted ? block : { ...block, miniProjectCompleted: true }), [updateBlock]);

  const setNote = useCallback((key: string, text: string) => update((previous) => {
    if ((previous.notes[key] ?? '') === text) return previous;
    const notes = { ...previous.notes };
    if (text.trim()) notes[key] = text;
    else delete notes[key];
    return { ...previous, notes };
  }), [update]);

  const setActiveBlock = useCallback((blockId: string) => update((previous) =>
    previous.activeBlockId === blockId ? previous : { ...previous, activeBlockId: blockId }), [update]);

  return {
    progress,
    ready,
    syncStatus,
    blockProgress: (blockId: string) => blockProgressOf(progress, blockId),
    markExerciseSolved,
    markLessonComplete,
    saveQuizResult,
    completeMiniProject,
    setNote,
    setActiveBlock,
  };
}

import { useMemo, useSyncExternalStore } from 'react';
import { localDriver } from './localDriver.js';
import { apiDriver } from './apiDriver.js';
import { useSession } from '@/state/session.js';

export const collab = import.meta.env.VITE_COLLAB_DRIVER === 'api' ? apiDriver : localDriver;
export const useAllWorkspaces = () => useSyncExternalStore(collab.subscribe, collab.snapshot);
export function useMyWorkspaces() {
  const all = useAllWorkspaces(); const uid = useSession((s) => s.uid);
  return useMemo(() => Object.values(all).filter((w) => w.members.some((m) => m.id === uid)).sort((a, b) => b.created - a.created), [all, uid]);
}
export const useWorkspace = (id) => useAllWorkspaces()[id];
export const roleOf = (ws, uid) => ws?.members.find((m) => m.id === uid)?.role || null;
export const canEdit = (role) => role === 'owner' || role === 'editor';

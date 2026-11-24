import { useMemo, useSyncExternalStore } from 'react';
import { localFeedback } from './localDriver.js';
export const feedback = localFeedback; // swap for an API driver with the same methods
export const useAllFeedback = () => useSyncExternalStore(feedback.subscribe, feedback.snapshot);
export const useMyFeedback = (userId) => { const all = useAllFeedback(); return useMemo(() => all.filter((x) => x.userId === userId), [all, userId]); };

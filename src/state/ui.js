import { createStore } from '@/lib/store.js';
/** App-wide UI flags that several screens can trigger, such as the feedback dialog. */
export const ui = createStore({ feedbackOpen: false, feedbackType: 'idea' });
export const openFeedback = (type = 'idea') => ui.set({ feedbackOpen: true, feedbackType: type });
export const closeFeedback = () => ui.set({ feedbackOpen: false });

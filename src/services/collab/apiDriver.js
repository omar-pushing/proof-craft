/**
 * Placeholder for the ProofCraft API driver. Implement the same method set as localDriver:
 * isLocal=false, snapshot(), subscribe(), create, join, addTask, moveTask, removeTask, comment, share, setRole, removeMember, leave.
 * Transport (REST plus SSE or WebSocket) lives here; no component should change. See README, "Collaboration contract".
 */
const missing = () => { throw new Error('API collaboration driver is not configured. Set VITE_COLLAB_DRIVER=local or implement apiDriver.'); };
export const apiDriver = { isLocal: false, snapshot: () => ({}), subscribe: () => () => {}, create: missing, join: missing, addTask: missing, moveTask: missing, removeTask: missing, comment: missing, share: missing, setRole: missing, removeMember: missing, leave: missing };

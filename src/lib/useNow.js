import { useEffect, useState } from 'react';

/** A shared wall-clock hook that does not pull the full timer screen into the app shell bundle. */
export function useNow(on) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!on) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [on]);
  return now;
}

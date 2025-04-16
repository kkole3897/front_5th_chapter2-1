export const createObserver = () => {
  const listeners = new Set();
  const subscribe = (fn) => listeners.add(fn);
  const unsubscribe = (fn) => listeners.delete(fn);
  const notify = () => listeners.forEach((listener) => listener());
  return { subscribe, unsubscribe, notify };
};

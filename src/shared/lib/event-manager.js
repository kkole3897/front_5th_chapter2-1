export const createEventManager = () => {
  const eventHandlers = {};

  const addEvent = (eventType, selector, handler) => {
    if (!eventHandlers[eventType]) {
      eventHandlers[eventType] = {};
    }

    eventHandlers[eventType][selector] = handler;
  };

  const handleEvent = (e) => {
    const handlers = eventHandlers[e.type];
    if (!handlers) {
      return;
    }

    const foundSelector = Object.keys(handlers).find((selector) =>
      e.target.matches(selector),
    );

    if (foundSelector) {
      handlers[foundSelector](e);
    }
  };

  let init = false;
  const registerEvents = () => {
    if (init) return;
    init = true;

    Object.keys(eventHandlers).forEach((eventType) => {
      document.body.addEventListener(eventType, handleEvent);
    });
  };

  return {
    addEvent,
    registerEvents,
  };
};

function EventEmitter() {
  this.eventListeners = [];

  this.addEventListener = function (eventName, eventHandler) {
    log(`[EVENT:REGISTERED]`, eventName);
    this.eventListeners.push({ eventName: eventName, handler: eventHandler });
  };

  this.emit = function (eventName, arguments) {
    this.eventListeners
      .filter((ev) => ev.eventName == eventName)
      .forEach((l) => {
        log(`[EVENT:${eventName}]`, l, arguments);
        l.handler(arguments);
      });
  };

  return this;
}

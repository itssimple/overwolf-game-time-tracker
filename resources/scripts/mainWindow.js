/// <reference path="eventEmitter.js" />

const eventEmitter = overwolf.windows.getMainWindow().eventEmitter;

eventEmitter.addEventListener("game-launched", function (gameInfo) {
  // TODO: Show that we've launched a new game, and start ticking a timer up
});

eventEmitter.addEventListener("game-exited", function (gameInfo) {
  // TODO: Show that we've exited the game we were currently in, and fade away
});

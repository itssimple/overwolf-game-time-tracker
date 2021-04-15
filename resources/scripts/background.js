/// <reference path="log.js" />
/// <reference path="database.js" />
/// <reference path="eventEmitter.js" />

var firstLaunch = true;

function openWindow(event) {
  if (event && event.origin == "overwolfstartlaunchevent") {
    return;
  }
  overwolf.windows.obtainDeclaredWindow("mainWindow", (result) => {
    if (result.status !== "success") {
      return;
    }

    overwolf.windows.restore(result.window.id);
  });
}

function gameLaunched(game) {
  eventEmitter.emit("game-launched", game);
}

function gameInfoUpdated(game) {
  if (!game.gameInfo.isRunning) {
    eventEmitter.emit("game-exited", game);
  }
}

if (firstLaunch) {
  log(
    "[INIT]",
    "Initializing all event handlers and getting all the recently played games (to see if we missed anything)"
  );

  if (!window.eventEmitter) {
    window.eventEmitter = new EventEmitter();
  }

  if (!window.db) {
    window.db = new GameTimeTrackerDatabase();
    db.initializeDatabase();
  }

  firstLaunch = false;

  overwolf.extensions.onAppLaunchTriggered.removeListener(openWindow);
  overwolf.extensions.onAppLaunchTriggered.addListener(openWindow);

  overwolf.games.onGameLaunched.removeListener(gameLaunched);
  overwolf.games.onGameLaunched.addListener(gameLaunched);

  overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdated);
  overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

  window.eventEmitter.addEventListener("game-launched", function (gameInfo) {
    db.newGameSession(gameInfo);
  });

  window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
    db.updateGameSession(gameInfo);
  });

  log("[INIT]", "All eventhandlers have been set");

  openWindow(null);
}

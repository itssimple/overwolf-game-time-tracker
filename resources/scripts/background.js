/// <reference path="log.js" />
/// <reference path="database.js" />
/// <reference path="eventEmitter.js" />

var firstLaunch = true;

var mainWindowId = null;

function openWindow(event) {
  if (event && event.origin == "overwolfstartlaunchevent") {
    return;
  }
  overwolf.windows.obtainDeclaredWindow("mainWindow", (result) => {
    if (!result.success) {
      return;
    }

    mainWindowId = result.window.id;
    overwolf.windows.restore(result.window.id);
  });
}

function gameLaunched(game) {
  if (game) {
    if (window.possibleGameName && window.possibleGameName != null) {
      game.title = window.possibleGameName;
    }

    eventEmitter.emit("game-launched", game);
  }
}

function gameInfoUpdated(game) {
  if (
    game &&
    game.gameInfo &&
    !game.gameInfo.isRunning &&
    game.runningChanged
  ) {
    eventEmitter.emit("game-exited", game);
  }
}

/**
 * Will contain a possible game name replacement,
 */
window.possibleGameName = null;

function launcherInfoUpdates(info) {
  if (info && info.launcherClassId && info.launcherClassId == 10902) {
    if (
      info.feature &&
      info.feature == "lobby_info" &&
      info.info &&
      info.info.lobby_info &&
      info.info.lobby_info.queueId
    ) {
      switch (info.info.lobby_info.queueId) {
        case "1090":
        case "1100":
        case "1130":
          window.possibleGameName = "Teamfight Tactics";
          break;
        default:
          window.possibleGameName = null;
          break;
      }
    }
  }
}

function setLauncherEvents(finishedSettingFeatures) {
  overwolf.games.launchers.events.setRequiredFeatures(
    10902,
    ["lobby_info"],
    function (info) {
      if (info.status == "error") {
        setTimeout(function () {
          setLauncherEvents(finishedSettingFeatures);
        }, 2000);
        return;
      }
      log("[LOL-LAUNCHER]", info);
      if (finishedSettingFeatures) {
        finishedSettingFeatures(info);
      }
    }
  );
}

function onLauncherLaunched(launcherInfo) {
  log("[LAUNCHER]", launcherInfo);
  if (launcherInfo.classId == 10902) {
    setLauncherEvents();
  }
}

function onLauncherTerminated(result) {
  log("[LAUNCHER]", result);
  window.possibleGameName = null;
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

  overwolf.games.launchers.events.onInfoUpdates.removeListener(
    launcherInfoUpdates
  );
  overwolf.games.launchers.events.onInfoUpdates.addListener(
    launcherInfoUpdates
  );

  overwolf.games.launchers.onLaunched.removeListener(onLauncherLaunched);
  overwolf.games.launchers.onLaunched.addListener(onLauncherLaunched);

  overwolf.games.launchers.onTerminated.removeListener(onLauncherTerminated);
  overwolf.games.launchers.onTerminated.addListener(onLauncherTerminated);

  overwolf.games.launchers.getRunningLaunchersInfo(function (res) {
    if (res && res.success && res.launchers.length > 0) {
      for (let launcher of res.launchers) {
        if (launcher.classId == 10902) {
          setLauncherEvents(function (info) {
            overwolf.games.launchers.events.getInfo(10902, function (data) {
              launcherInfoUpdates({
                launcherClassId: res.launchers[0].classId,
                feature: "lobby_info",
                info: {
                  lobby_info: {
                    queueId: data.res.lobby_info.queueId,
                  },
                },
              });
            });
          });
        }
      }
    }
  });

  window.eventEmitter.addEventListener("game-launched", function (gameInfo) {
    db.newGameSession(gameInfo);
  });

  window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
    db.updateGameSession(gameInfo);

    if (!mainWindowId) {
      window.eventEmitter.emit("shutdown", null);
      return;
    }

    overwolf.windows.getWindowState(mainWindowId, function (state) {
      if (
        state.success &&
        (state.window_state_ex == "closed" || state.window_state_ex == "hidden")
      ) {
        window.eventEmitter.emit("shutdown", null);
      }
    });
  });

  window.eventEmitter.addEventListener("shutdown", function () {
    log("[EXIT]", "Got told to exit the application, doing that!");
    overwolf.windows.getCurrentWindow(function (window) {
      overwolf.windows.close(window.window.id, function () {});
    });
  });

  log("[INIT]", "All eventhandlers have been set");

  if (
    location.search.indexOf("-from-desktop") > -1 ||
    location.search.indexOf("source=commandline") > -1 ||
    location.search.indexOf("source=tray") > -1
  ) {
    openWindow(null);
  }
}

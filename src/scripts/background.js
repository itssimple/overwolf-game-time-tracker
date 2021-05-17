/// <reference path="log.js" />
/// <reference path="database.js" />
/// <reference path="eventEmitter.js" />

var firstLaunch = true;

var mainWindowId = null;

var gameDetector = null;

function openWindow(event, originEvent) {
  if (event) {
    log("[WINDOW]", "Got launch event: ", event);
  }

  if (event && event.origin == "overwolfstartlaunchevent") {
    return;
  }
  overwolf.windows.obtainDeclaredWindow("mainWindow", (result) => {
    if (!result.success) {
      return;
    }

    mainWindowId = result.window.id;
    overwolf.windows.restore(result.window.id);
    log("[WINDOW]", `Opening window. Reason: ${originEvent}`, event);
  });
}

var backgroundGameUpdater = null;

function gameLaunched(game) {
  if (game) {
    if (window.possibleGameName && window.possibleGameName != null) {
      game.title = window.possibleGameName;
      log("[GAME:TITLE]", "Custom title", game.title);
    }

    log("[GAME:LAUNCH]", game);
    eventEmitter.emit("game-launched", game);

    backgroundGameUpdater = setInterval(function () {
      window.db.updateGameSessionBySessionId(game.sessionId, {
        endDate: Date.now(),
      });
    }, 10000);
  }
}

function gameInfoUpdated(game) {
  if (
    game &&
    game.gameInfo &&
    !game.gameInfo.isRunning &&
    game.runningChanged
  ) {
    log("[GAME:UPDATE]", game);
    eventEmitter.emit("game-exited", game);

    clearInterval(backgroundGameUpdater);
    backgroundGameUpdater = null;
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
  log("[GAME:LAUNCHER]", launcherInfo);
  if (launcherInfo.classId == 10902) {
    setLauncherEvents();
  }
}

function onLauncherTerminated(result) {
  log("[GAME:LAUNCHER]", result);
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
    log("[DATABASE]", "Initializing database");
    window.db = new GameTimeTrackerDatabase();

    db.initializeDatabase(function () {
      if (location.search.indexOf("overwolfstartlaunchevent")) {
        // When Overwolf starts up, we check if there's an ongoing session, and then abort it, unless the game is still active.
        window.db.getUnfinishedSessions(function (unfinishedSessions) {
          if (unfinishedSessions && unfinishedSessions.length > 0) {
            log(
              "[SESSION:CLEANUP]",
              `Found ${unfinishedSessions.length} unfinished sessions to fix.`
            );

            for (let session of unfinishedSessions) {
              log("[SESSION:CLEANUP]", "Unfinished session", session);

              // Lets just set it as one minute extra from start right now.
              session.endDate = session.startDate + 60000;
              window.db.updateGameSessionBySessionId(
                session.sessionId,
                session,
                function () {
                  window.eventEmitter.emit("reload-window", "mainWindow");
                }
              );
            }

            overwolf.games.getRunningGameInfo(function (data) {
              if (!data) {
                // No game is running, so we'll just exit the application again, so we don't take any resources
                window.eventEmitter.emit("shutdown", null);
              }
            });
          }
        });
      }

      log("[GAMEDETECTOR]", "Initializing GameDetector plugin");

      overwolf.extensions.current.getExtraObject("game-detector", (result) => {
        if (result.status == "success") {
          gameDetector = result.object;

          gameDetector.LoadGameDBData(function (data) {
            log("[GAMEDETECTOR]", "Loaded data from server", data);
          });
        }
      });

      log("[DATABASE]", "Done initializing the database");

      log("[INIT:LAUNCHREASON]", location.search);

      if (
        location.search.indexOf("-from-desktop") > -1 ||
        location.search.indexOf("source=commandline") > -1 ||
        location.search.indexOf("source=dock") > -1 ||
        location.search.indexOf("source=storeapi") > -1 ||
        location.search.indexOf("source=odk") > -1 ||
        location.search.indexOf("source=after-install") > -1 ||
        location.search.indexOf("source=tray") > -1
      ) {
        openWindow(null, location.search);
      } else if (location.search.indexOf("source=gamelaunchevent")) {
        log("[GAME:LAUNCH]", "Application was started by game");
        overwolf.games.getRunningGameInfo(function (data) {
          if (!data) {
            // No game is running, so we'll just exit the application again, so we don't take any resources
            window.eventEmitter.emit("shutdown", null);
          } else {
            gameLaunched(data);
          }
        });
      }

      // Removes the source-value from location.search, so we don't trigger multiple times
      history.replaceState(
        {},
        window.title,
        location.href.replace(location.search, "")
      );
    });
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
}

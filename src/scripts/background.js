/// <reference path="log.js" />
/// <reference path="database.js" />
/// <reference path="eventEmitter.js" />

var firstLaunch = true;

var mainWindowId = null;

var gameDetector = null;

function openWindow(event, originEvent) {
  if (event) {
    log("WINDOW", "Got launch event: ", event);
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
    log("WINDOW", `Opening window. Reason: ${originEvent}`, event);
  });
}

const trayMenu = {
  menu_items: [
    {
      label: "Open Game Time Tracker",
      id: "open_gtt_mainWindow",
    },
    {
      label: "-",
    },
    {
      label: "Exit",
      id: "exit_gtt",
    },
  ],
};

overwolf.os.tray.setMenu(trayMenu, (res) => {
  // Ignore if we don't manage to create it
});

overwolf.os.tray.onTrayIconDoubleClicked.addListener(() => {
  openWindow(null, "tray_icon");
});

overwolf.os.tray.onMenuItemClicked.addListener((event) => {
  switch (event.item) {
    case "open_gtt_mainWindow":
      openWindow(null, "tray_menu");
      break;
    case "exit_gtt":
      exitApp("Clicked exit-menu item");
      break;
  }
});

var backgroundGameUpdater = null;

var gameDetectorGameInfoUpdater = null;
var gameDetectorGameSessionDetector = null;

function gameLaunched(game) {
  if (game) {
    if (window.possibleGameName && window.possibleGameName != null) {
      game.title = window.possibleGameName;
      log("GAME:TITLE", "Custom title", game.title);
    }

    log("GAME:LAUNCH", game);
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
    log("GAME:UPDATE", game);
    eventEmitter.emit("game-exited", game);

    clearInterval(backgroundGameUpdater);
    backgroundGameUpdater = null;
  }
}

window.owSupportedGames = [];

function loadOverwolfGameList() {
  log("OVERWOLF", "Finding latest GamesList-file");
  overwolf.io.dir(`${overwolf.io.paths.localAppData}/overwolf`, (dirResult) => {
    if (dirResult && dirResult.success) {
      for (let entry of dirResult.data) {
        if (entry.type === "file" && entry.name.indexOf("GamesList.") > -1) {
          log("OVERWOLF", "Found file: ", entry.name);

          let loadFile = `${overwolf.io.paths.localAppData}/overwolf/${entry.name}`;
          overwolf.io.readTextFile(loadFile, {}, (content) => {
            if (content.success) {
              log("OVERWOLF", "Loading GameList file parsing the results");
              const parser = new DOMParser();
              const document = parser.parseFromString(
                content.content,
                "application/xml"
              );

              let allGameInfo = document.querySelectorAll("GameInfo");

              for (let gameInfo of allGameInfo) {
                let game = {};

                let injectionDecisionElement =
                  gameInfo.querySelector("InjectionDecision");

                let injectionDecision = "NotSupported";

                if (injectionDecisionElement) {
                  injectionDecision = injectionDecisionElement.textContent;
                }

                let ignoreThisGame = false;

                switch (injectionDecision) {
                  case "Supported":
                    //ignoreThisGame = true;
                    break;
                }

                let gameRendererElement =
                  gameInfo.querySelector("GameRenderers");

                // Potentially gets rid of all launchers and other apps that we don't want to track
                if (
                  gameRendererElement &&
                  gameRendererElement.textContent === "Unknown"
                ) {
                  let launchParamElement =
                    gameInfo.querySelector("LaunchParams");
                  if (!launchParamElement) {
                    continue;
                  }
                }

                if (ignoreThisGame) {
                  continue;
                }

                let gameTitle = gameInfo.querySelector("GameTitle").textContent;

                let gameId = parseInt(
                  parseInt(gameInfo.querySelector("ID").textContent, 0) / 10
                );

                game.classId = gameId;
                game.gameTitle = gameTitle;
                game.processNames = [];
                game.injectionDecision = injectionDecision;

                let processNames = gameInfo.querySelectorAll(
                  "ProcessNames string"
                );
                for (let process of processNames) {
                  if (!game.processNames.includes(process.textContent)) {
                    game.processNames.push(
                      process.textContent.substring(
                        process.textContent.indexOf("*") + 1
                      )
                    );
                  }
                }

                /*if (game.processNames.length == 0) {
                  let launcherNames = gameInfo.querySelectorAll(
                    "LuancherNames string"
                  );
                  for (let launcher of launcherNames) {
                    if (!game.processNames.includes(launcher.textContent)) {
                      game.processNames.push(launcher.textContent);
                    }
                  }
                }*/

                if (game.processNames.length > 0) {
                  window.owSupportedGames[gameId] = game;
                }
              }

              log("OVERWOLF", "Done loading Overwolf games");
            }
          });
        }
      }
    } else {
      log("OVERWOLF", "Could not load folder where GameList is supposed to be");
    }
  });
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
      log("LOL-LAUNCHER", info);
      if (finishedSettingFeatures) {
        finishedSettingFeatures(info);
      }
    }
  );
}

function onLauncherLaunched(launcherInfo) {
  log("GAME:LAUNCHER", launcherInfo);
  if (launcherInfo.classId == 10902) {
    setLauncherEvents();
  }
}

function onLauncherTerminated(result) {
  log("GAME:LAUNCHER", result);
  window.possibleGameName = null;
}

function exitApp(reason) {
  overwolf.os.tray.destroy();

  log("EXIT", reason);
  overwolf.windows.getCurrentWindow(function (window) {
    overwolf.windows.close(window.window.id, function () {});
  });
}

var otherGameProcess = null;

function checkInterestingProcesses(processList) {
  if (processList && processList.length > 0) {
    for (let process of processList) {
      if (process.Application) {
        let owSupport = isOwSupportedGame(process.Application.ProcessPath);
        if (owSupport && owSupport.injectionDecision !== "Supported") {
          otherGameProcess = {
            classId: owSupport.classId,
            title: owSupport.gameTitle,
            isGame: true,
            isPossibleGame: true,
            sessionId: null,
          };
        } else if (!owSupport) {
          let gttGame = isGTTSupportedGame(process.Application.ProcessPath);
          if (gttGame) {
            otherGameProcess = {
              classId: `gtt-${gttGame.Id}`,
              title: gttGame.DisplayName,
              isGame: true,
              isPossibleGame: true,
              sessionId: null,
            };
          }
        }
      }
    }
  }

  if (otherGameProcess && otherGameProcess != null) {
    getOpenGameSessions(otherGameProcess.classId, (openSession) => {
      if (!openSession) {
        // Create new session
        otherGameProcess.sessionId = generateUUID();
        otherGameProcess = otherGameProcess;
        gameLaunched(otherGameProcess);
      } else {
        // This is an un-ended session with the same classId, let's pretend its the same session
      }
    });
  }
}

function isOwSupportedGame(path) {
  let executable = path.substr(path.lastIndexOf("\\") + 1);
  return owSupportedGames
    .flatMap((item) => item)
    .find((item) => {
      for (let process of item.processNames) {
        if (process.indexOf(executable) > -1) {
          return true;
        }
      }
      return false;
    });
}

function isGTTSupportedGame(path) {
  let executable = path.substr(path.lastIndexOf("\\") + 1);
  return gameDetector.GameInfo.map((item) => item).find((item) => {
    for (let proc of item.ProcessNames) {
      if (executable.indexOf(proc) > -1) {
        return true;
      }
      return false;
    }
  });
}

function getOpenGameSessions(classId, resultCallback) {
  db.getGameSessionByUnendedSessionAndClass(classId, resultCallback);
}

if (firstLaunch) {
  log(
    "INIT",
    "Initializing all event handlers and getting all the recently played games (to see if we missed anything)"
  );

  if (!window.eventEmitter) {
    window.eventEmitter = new EventEmitter();
  }

  if (!window.db) {
    log("DATABASE", "Initializing database");
    window.db = new GameTimeTrackerDatabase();

    db.initializeDatabase(function () {
      if (location.search.indexOf("overwolfstartlaunchevent")) {
        // When Overwolf starts up, we check if there's an ongoing session, and then abort it, unless the game is still active.
        window.db.getUnfinishedSessions(function (unfinishedSessions) {
          if (unfinishedSessions && unfinishedSessions.length > 0) {
            log(
              "SESSION:CLEANUP",
              `Found ${unfinishedSessions.length} unfinished sessions to fix.`
            );

            for (let session of unfinishedSessions) {
              log("SESSION:CLEANUP", "Unfinished session", session);

              // Lets just set it as one minute extra from start right now.
              if (!session.endDate) {
                session.endDate = session.startDate + 60000;
              }
              session.sessionEnded = true;
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
                window.eventEmitter.emit(
                  "shutdown",
                  "No game is running, we finished cleanup of unfinished sessions"
                );
              }
            });
          }
        });
      }

      log("GAMEDETECTOR", "Initializing GameDetector plugin");

      overwolf.extensions.current.getExtraObject("game-detector", (result) => {
        if (result.status == "success") {
          gameDetector = result.object;

          gameDetector.LoadGameDBData(function (data) {
            log("GAMEDETECTOR", "Loaded data from server", data);

            db.getSettings((settings) => {
              clearInterval(gameDetectorGameInfoUpdater);
              if (settings && settings.experimentalGameTracking) {
                log("GAMEDETECTOR", "Enabling background updates");
                gameDetectorGameInfoUpdater = setInterval(function () {
                  gameDetector.LoadGameDBData();
                }, 30000);

                gameDetectorGameSessionDetector = setInterval(function () {
                  gameDetector.CheckProcesses((processes) => {
                    if (
                      processes &&
                      processes.InterestingApplications.length > 0
                    ) {
                      checkInterestingProcesses(
                        processes.InterestingApplications
                      );
                    } else {
                      if (
                        otherGameProcess &&
                        otherGameProcess.sessionId != null
                      ) {
                        otherGameProcess.isRunning = false;
                        gameInfoUpdated({
                          gameInfo: otherGameProcess,
                          runningChanged: true,
                        });

                        otherGameProcess = null;
                      } else if (
                        otherGameProcess &&
                        otherGameProcess.sessionId == null
                      ) {
                        getOpenGameSessions(
                          otherGameProcess.classId,
                          (session) => {
                            otherGameProcess.isRunning = false;
                            otherGameProcess.sessionId = session.sessionId;
                            gameInfoUpdated({
                              gameInfo: otherGameProcess,
                              runningChanged: true,
                            });

                            otherGameProcess = null;
                          }
                        );
                      }
                    }
                  });
                }, 10000);
              }
            });
          });
        }
      });

      log("DATABASE", "Done initializing the database");
      log("INIT:LAUNCHREASON", location.search);

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
      } else if (location.search.indexOf("source=gamelaunchevent") > -1) {
        log("GAME:LAUNCH", "Application was started by game");
        overwolf.games.getRunningGameInfo(function (data) {
          if (!data) {
            // No game is running, so we'll just exit the application again, so we don't take any resources
            window.eventEmitter.emit(
              "shutdown",
              "Launched by game event, but no game is present, exiting"
            );
          } else {
            gameLaunched(data);
          }
        });
      } else {
        overwolf.extensions.current.getManifest((manifest) => {
          if (manifest.has_devtools) {
            //openWindow(null, location.search);
          }
        });
      }

      // Removes the source-value from location.search, so we don't trigger multiple times
      history.replaceState(
        {},
        window.title,
        location.href.replace(location.search, "")
      );

      loadOverwolfGameList();
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
    getOpenGameSessions(gameInfo.classId, function (ongoingSession) {
      if (ongoingSession) {
        // Session ongoing, keep updating that one
      } else {
        // No previous session, create new session
        db.newGameSession(gameInfo, true, true);
      }
    });
  });

  window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
    window.db.updateGameSessionBySessionId(gameInfo.gameInfo.sessionId, {
      endDate: Date.now(),
      sessionEnded: true,
    });

    if (!mainWindowId) {
      window.eventEmitter.emit(
        "shutdown",
        "Main window not open or hidden, closing application"
      );
      return;
    }

    overwolf.windows.getWindowState(mainWindowId, function (state) {
      if (
        state.success &&
        (state.window_state_ex == "closed" || state.window_state_ex == "hidden")
      ) {
        window.eventEmitter.emit(
          "shutdown",
          "Main window not open or hidden, closing application"
        );
      }
    });
  });

  window.eventEmitter.addEventListener("shutdown", function (reason) {
    log("EXIT", "Supposed to exit:", reason);
    db.getSettings((settings) => {
      if (settings && settings.experimentalGameTracking) {
        log(
          "EXIT",
          "Not exiting, since the user uses experimental game tracking."
        );

        return;
      }

      exitApp(reason);
    });
  });

  log("INIT", "All eventhandlers have been set");
}

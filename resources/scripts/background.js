/// <reference path="log.js" />
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
    initializeGameTrackerDatabase();
  }

  firstLaunch = false;

  overwolf.extensions.onAppLaunchTriggered.removeListener(openWindow);
  overwolf.extensions.onAppLaunchTriggered.addListener(openWindow);

  overwolf.games.onGameLaunched.removeListener(gameLaunched);
  overwolf.games.onGameLaunched.addListener(gameLaunched);

  overwolf.games.onGameInfoUpdated.removeListener(gameInfoUpdated);
  overwolf.games.onGameInfoUpdated.addListener(gameInfoUpdated);

  window.eventEmitter.addEventListener("game-launched", function (gameInfo) {
    log("[GAME-LAUNCH]", gameInfo);

    db.transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .add({
        sessionId: gameInfo.sessionId,
        gameClass: gameInfo.classId,
        gameTitle: gameInfo.title,
        startDate: Date.now(),
        endDate: null,
      });
  });
  window.eventEmitter.addEventListener("game-exited", function (gameInfo) {
    log("[GAME-EXIT]", gameInfo);

    gameSessionStore = db
      .transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .index("by_gameclass")
      .openCursor(
        IDBKeyRange.only(gameInfo.gameInfo.classId),
        "prev"
      ).onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        if (cursor.value.endDate == null) {
          const updateSession = cursor.value;
          updateSession.endDate = Date.now();
          cursor.update(updateSession);

          return;
        }
        cursor.continue();
      }
    };
  });

  log("[INIT]", "All eventhandlers have been set");

  openWindow(null);
}

function initializeGameTrackerDatabase() {
  let dbRequest = window.indexedDB.open("gameTimeTracker", 1);

  dbRequest.onupgradeneeded = function (event) {
    const db = dbRequest.result;

    if (event.oldVersion < 1) {
      log(
        "[DB]",
        "Creating first version of database, since it never existed on this installation."
      );
      const gameSessionStore = db.createObjectStore("gameSessions", {
        autoIncrement: true,
      });

      gameSessionStore.createIndex("by_gameclass", "gameClass");
      gameSessionStore.createIndex("by_sessionid", "sessionId");
    }
  };

  dbRequest.onsuccess = function () {
    window.db = dbRequest.result;
  };
}

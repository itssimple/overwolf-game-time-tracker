function GameTimeTrackerDatabase() {
  this.DBInstance = null;

  this.initializeDatabase = function (finishedLoadingCallback = null) {
    let dbRequest = window.indexedDB.open("gameTimeTracker", 4);

    dbRequest.onupgradeneeded = function (event) {
      const db = dbRequest.result;
      const upgradeTransaction = event.target.transaction;
      log("DB", "Old", event.oldVersion, "New", event.newVersion);
      if (event.oldVersion < 1) {
        log(
          "DB",
          "Creating first version of database, since it never existed on this installation."
        );
        const gameSessionStore = db.createObjectStore("gameSessions", {
          autoIncrement: true,
        });

        gameSessionStore.createIndex("by_gameclass", "gameClass");
        gameSessionStore.createIndex("by_sessionid", "sessionId");
      }

      if (event.oldVersion < 2) {
        upgradeTransaction
          .objectStore("gameSessions")
          .createIndex("by_startdate", "startDate");
      }

      if (event.oldVersion < 3) {
        upgradeTransaction
          .objectStore("gameSessions")
          .createIndex("by_possibleGameSession", "isPossibleGame");

        upgradeTransaction
          .objectStore("gameSessions")
          .createIndex("by_isGameSession", "isGame");

        var gttSettingsStore = db.createObjectStore("gttSettings");

        gttSettingsStore.createIndex("by_settingsId", "settingsId");
      }

      if (event.oldVersion < 4) {
        upgradeTransaction
          .objectStore("gameSessions")
          .createIndex("by_endedSessions", "sessionEnded");
      }
    };

    dbRequest.onsuccess = function () {
      log("DB", "Loaded database");
      window.db.DBInstance = dbRequest.result;

      if (finishedLoadingCallback) {
        finishedLoadingCallback();
      }
    };
  };

  this.newGameSession = function (gameInfo, isGame, isPossibleGame) {
    this.DBInstance.transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .add({
        sessionId: gameInfo.sessionId,
        gameClass: gameInfo.classId,
        gameTitle: gameInfo.title,
        startDate: Date.now(),
        endDate: null,
        isGame: isGame,
        isPossibleGame: isPossibleGame,
        sessionEnded: false,
        processId: gameInfo.processId,
      });
  };

  this.getGameSessionByClassIdAndProcessId = function (
    classId,
    processId,
    filterFunction
  ) {
    let _dbInstance = this.DBInstance;
    return new Promise(function (resolve, reject) {
      _dbInstance
        .transaction("gameSessions", "readwrite")
        .objectStore("gameSessions")
        .index("by_gameclass")
        .openCursor(IDBKeyRange.only(classId), "prev").onsuccess = function (
        event
      ) {
        var cursor = event.target.result;

        if (cursor) {
          if (cursor.value && cursor.value.processId == processId) {
            if (filterFunction(cursor.value)) {
              resolve(cursor.value);
              return;
            }
          }
          cursor.continue();
        }

        resolve(null);
      };
    });
  };

  this.getGameSessionByUnendedSessionAndClass = function (
    classId,
    resultCallback
  ) {
    this.DBInstance.transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .openCursor().onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        if (
          cursor.value &&
          !cursor.value.sessionEnded &&
          cursor.value.gameClass == classId
        ) {
          resultCallback(cursor.value);
          return;
        }
        cursor.continue();
      } else {
        resultCallback(null);
      }
    };
  };

  this.updateGameSessionBySessionId = function (
    sessionId,
    sessionData,
    updateComplete
  ) {
    this.DBInstance.transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .index("by_sessionid")
      .openCursor(IDBKeyRange.only(sessionId), "prev").onsuccess = function (
      event
    ) {
      var cursor = event.target.result;

      if (cursor) {
        const updateSession = cursor.value;

        if (typeof sessionData.endDate != "undefined") {
          updateSession.endDate = sessionData.endDate;
        }

        if (typeof sessionData.gameClass != "undefined") {
          updateSession.gameClass = sessionData.gameClass;
        }

        if (typeof sessionData.gameTitle != "undefined") {
          updateSession.gameTitle = sessionData.gameTitle;
        }

        if (typeof sessionData.startDate != "undefined") {
          updateSession.startDate = sessionData.startDate;
        }

        if (typeof sessionData.isGame != "undefined") {
          updateSession.isGame = sessionData.isGame;
        }

        if (typeof sessionData.isPossibleGame != "undefined") {
          updateSession.isPossibleGame = sessionData.isPossibleGame;
        }

        if (typeof sessionData.sessionEnded != "undefined") {
          updateSession.sessionEnded = sessionData.sessionEnded;
        }

        if (typeof sessionData.processId != "undefined") {
          updateSession.processId = sessionData.processId;
        }

        cursor.update(updateSession);

        if (updateComplete) {
          updateComplete(updateSession);
        }

        return;
      }
    };
  };

  this.getSettings = function (resultCallback) {
    log("DB:SETTINGS", "Fetching settings");
    this.DBInstance.transaction("gttSettings", "readwrite")
      .objectStore("gttSettings")
      .openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      log("DB:SETTINGS", "Got response", cursor ? cursor.value : null);
      if (resultCallback) {
        resultCallback(cursor ? cursor.value : null);
      }
    };
  };

  this.insertNewSetting = function (settingsObject, resultCallback) {
    log("DB:SETTINGS", "Creating new settings object", settingsObject);
    this.DBInstance.transaction("gttSettings", "readwrite")
      .objectStore("gttSettings")
      .add(settingsObject, 1);

    this.getSettings(resultCallback);
  };

  this.updateSetting = function (settingsObject, resultCallback) {
    log("DB:SETTINGS", "Updating settings object", settingsObject);
    this.DBInstance.transaction("gttSettings", "readwrite")
      .objectStore("gttSettings")
      .openCursor().onsuccess = function (event) {
      var cursor = event.target.result;
      if (cursor) {
        const updateSession = cursor.value;

        if (settingsObject.experimentalGameTracking !== undefined) {
          updateSession.experimentalGameTracking =
            settingsObject.experimentalGameTracking;
        }

        if (settingsObject.sendPossibleGameData !== undefined) {
          updateSession.sendPossibleGameData =
            settingsObject.sendPossibleGameData;
        }

        if (settingsObject.ignoreOverwolf !== undefined) {
          updateSession.ignoreOverwolf = settingsObject.ignoreOverwolf;
        }

        cursor.update(updateSession);
      }
    };
    this.getSettings(resultCallback);
  };

  this.setSettings = function (settingsObject, resultCallback) {
    this.getSettings((settings) => {
      log("DB:SETTINGS", settings, settingsObject);
      if (!settings) {
        this.insertNewSetting(settingsObject, resultCallback);
      } else {
        this.updateSetting(settingsObject, resultCallback);
      }
    });
  };

  this.getSessions = function (resultCallback) {
    let rows = [];
    this.DBInstance.transaction("gameSessions", "readonly")
      .objectStore("gameSessions")
      .index("by_startdate")
      .openCursor(null, "prev").onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        rows.push(cursor.value);

        cursor.continue();
      } else {
        resultCallback(rows);
      }
    };
  };

  this.getUnfinishedSessions = function (resultCallback) {
    let rows = [];
    this.DBInstance.transaction("gameSessions", "readonly")
      .objectStore("gameSessions")
      .index("by_startdate")
      .openCursor(null, "prev").onsuccess = function (event) {
      var cursor = event.target.result;

      if (cursor) {
        if (!cursor.value.endDate || !cursor.value.sessionEnded) {
          rows.push(cursor.value);
        }

        cursor.continue();
      } else {
        resultCallback(rows);
      }
    };
  };

  return this;
}

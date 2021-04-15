function GameTimeTrackerDatabase() {
  this.DBInstance = null;

  this.initializeDatabase = function () {
    let dbRequest = window.indexedDB.open("gameTimeTracker", 2);

    dbRequest.onupgradeneeded = function (event) {
      const db = dbRequest.result;
      const upgradeTransaction = event.target.transaction;
      log("[DB]", "Old", event.oldVersion, "New", event.newVersion);
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

      if (event.oldVersion < 2) {
        upgradeTransaction
          .objectStore("gameSessions")
          .createIndex("by_startdate", "startDate");
      }
    };

    dbRequest.onsuccess = function () {
      log("[DB]", "Loaded database");
      window.db.DBInstance = dbRequest.result;
    };
  };
  this.newGameSession = function (gameInfo) {
    this.DBInstance.transaction("gameSessions", "readwrite")
      .objectStore("gameSessions")
      .add({
        sessionId: gameInfo.sessionId,
        gameClass: gameInfo.classId,
        gameTitle: gameInfo.title,
        startDate: Date.now(),
        endDate: null,
      });
  };

  this.updateGameSession = function (gameInfo) {
    this.DBInstance.transaction("gameSessions", "readwrite")
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

  return this;
}

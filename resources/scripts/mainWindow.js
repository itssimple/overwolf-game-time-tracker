/// <reference path="eventEmitter.js" />
/// <reference path="database.js" />
/// <reference path="log.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;
/** @type GameTimeTrackerDatabase */
const db = backgroundWindow.db;

var activeGameTicker = null;

eventEmitter.addEventListener("game-launched", function () {
  activeGameTicker = setInterval(loadLatestSessions, 5000);
  loadLatestSessions();
});

eventEmitter.addEventListener("game-exited", function () {
  if (activeGameTicker != null) {
    clearInterval(activeGameTicker);
    activeGameTicker = null;
    loadLatestSessions();
  }
});

function loadLatestSessions() {
  db.getSessions(function (_rows) {
    let gameSessionTable = document.querySelector("#sessionStats");
    gameSessionTable.innerHTML = "";
    if (_rows.length === 0) {
      gameSessionTable.appendChild(
        addElement(
          `<tr><td colspan="3"><em>No played games so far</em></td></tr>`
        )
      );
    } else {
      let latestSession = true;
      for (let session of _rows) {
        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${session.gameTitle}</td>
        <td class="text-right" style="width: 150px;">${formatTimespan(
          session.startDate,
          session.endDate,
          latestSession
        )}</td>
        <td class="text-center" style="width: 120px;">${formatDate(
          new Date(session.startDate)
        )}</td>`;

        gameSessionTable.appendChild(row);
        latestSession = false;
      }
    }
  });
}

/**
 *
 * @param {Date} date
 */
function formatDate(date) {
  let retVal = "";

  retVal += date.getFullYear() + "-";
  if (date.getMonth() + 1 < 10) {
    retVal += "0";
  }
  retVal += date.getMonth() + 1 + "-";

  if (date.getDate() < 10) {
    retVal += "0";
  }
  retVal += date.getDate();

  return retVal;
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @param {Boolean} latestSession
 */
function formatTimespan(startDate, endDate, latestSession) {
  if (!latestSession && !endDate) return `Unknown, no end time`;
  if (!endDate) endDate = Date.now();

  let differenceInSeconds = (endDate - startDate) / 1000;

  let days = Math.floor(differenceInSeconds / (24 * 3600));
  let hours = Math.floor((differenceInSeconds % (24 * 3600)) / 3600);
  let minutes = Math.floor((differenceInSeconds % 3600) / 60);
  let seconds = Math.floor(differenceInSeconds % 60);

  return `${days > 0 ? days + "d, " : ""}${hours > 0 ? hours + "h, " : ""}${
    minutes > 0 ? minutes + "m, " : ""
  }${seconds + "s"}`;
}

(function () {
  loadLatestSessions();
})();

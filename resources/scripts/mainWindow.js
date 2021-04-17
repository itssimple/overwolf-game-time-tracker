/// <reference path="eventEmitter.js" />
/// <reference path="database.js" />
/// <reference path="date.js" />
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

    let topGameTitle = document.querySelector("#topGameTitle");
    let topGameTime = document.querySelector("#topGameTime");

    let gameStarts = document.querySelector("#gameStarts");

    gameSessionTable.innerHTML = "";
    gameStarts.innerHTML = "";
    if (_rows.length === 0) {
      gameSessionTable.appendChild(
        addElement(
          `<tr><td colspan="3"><em>No played games so far</em></td></tr>`
        )
      );

      gameStarts.innerHTML = "<em>You have not played any games yet</em>";
    } else {
      let latestSession = true;

      let gameStartItems = {};

      let rowCount = 0;
      for (let session of _rows) {
        if (rowCount < 10) {
          let row = document.createElement("tr");
          row.innerHTML = `
        <td>${shorten(session.gameTitle, 40)}</td>
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

        if (!gameStartItems[session.gameClass]) {
          gameStartItems[session.gameClass] = {
            gameTitle: session.gameTitle,
            startCount: 0,
            sessions: [],
          };
        }

        gameStartItems[session.gameClass].startCount++;
        gameStartItems[session.gameClass].sessions.push(session);

        rowCount++;
      }

      let gameStartArray = sortDictionaryByProperty(
        gameStartItems,
        "startCount",
        false
      );

      let gameTotalTime = {};
      let gameStartRows = 0;

      for (var start of gameStartArray) {
        var game = start[1];
        if (gameStartRows < 10) {
          let gStart = document.createElement("div");
          gStart.innerHTML = `${game.startCount}x ${shorten(
            game.gameTitle,
            30
          )}`;
          gameStarts.appendChild(gStart);
        }

        gameTotalTime[start[0]] = {
          gameTitle: game.gameTitle,
          totalTime: start[1].sessions
            .map(function (session) {
              return getTimeDifference(session.startDate, session.endDate);
            })
            .reduce(function (a, b) {
              return a + b;
            }, 0),
        };

        gameStartRows++;
      }
      let totalTimeByTime = sortDictionaryByProperty(
        gameTotalTime,
        "totalTime",
        false
      );

      topGameTitle.innerHTML = shorten(totalTimeByTime[0][1].gameTitle, 45);
      topGameTime.innerHTML = `Played: ${outputTimesObjectFromDifference(
        totalTimeByTime[0][1].totalTime
      )}`;

      window.gameStartItems = gameStartItems;

      let allSessions = Object.keys(gameStartItems).flatMap(function (key) {
        return gameStartItems[key].sessions;
      });
      let sevenDaysAgo = new NDate(Date.now()).addDay(-7);
      let sevenDays = allSessions
        .filter((i) => i.startDate >= sevenDaysAgo.timestamp)
        .map((s) => getTimeDifference(s.startDate, s.endDate))
        .reduce((a, b) => a + b);

      let weekObject = getTimeObject(sevenDays);
      let weekSummary = document.querySelector("#weekSummaryText");

      let hours = "";
      if (weekObject.hours && weekObject.hours === 1) {
        hours = `${weekObject.hours} hour<br />and `;
      } else if (weekObject.hours > 1) {
        hours = `${weekObject.hours} hours<br />and `;
      }

      let minutes = "";
      if (weekObject.minutes && weekObject.minutes === 1) {
        minutes = `${weekObject.minutes} minute`;
      } else if (weekObject.minutes > 1) {
        minutes = `${weekObject.minutes} minutes`;
      }

      weekSummary.innerHTML = `The last 7 days you spent ${hours}${minutes} in-game.`;
    }
  });
}

/**
 * Shortens the text if it's longer than the max length
 * @param {String} string
 * @param {Number} maxLength
 * @returns {String}
 */
function shorten(string, maxLength) {
  if (string.length > maxLength) {
    return string.substring(0, maxLength).trim() + " ...";
  }

  return string;
}

/**
 * Sorts a the dictionary you send, based on the property (numbers)
 * @param {Object} dictionary
 * @param {String} property The property in the dictionary to sort on
 * @param {Boolean} ascending Sort ascending or descending (Default descending)
 */
function sortDictionaryByProperty(dictionary, property, ascending) {
  let items = Object.keys(dictionary).map(function (key) {
    return [key, dictionary[key]];
  });

  items.sort(function (first, second) {
    if (ascending) return first[1][property] - second[1][property];
    return second[1][property] - first[1][property];
  });

  return items;
}

/**
 * Outputs a date in YYYY-MM-DD format
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
 * @returns {String}
 */
function formatTimespan(startDate, endDate, latestSession) {
  if (!latestSession && !endDate) return `Unknown, no end time`;
  return outputTimesObjectFromDifference(getTimeDifference(startDate, endDate));
}

/**
 *
 * @param {Number} days
 * @param {Number} hours
 * @param {Number} minutes
 * @param {Number} seconds
 * @returns {String}
 */
function outputTimesObject(days, hours, minutes, seconds) {
  return `${days > 0 ? days + "d, " : ""}${hours > 0 ? hours + "h, " : ""}${
    minutes > 0 ? minutes + "m, " : ""
  }${seconds + "s"}`;
}

function outputTimesObjectFromDifference(differenceInSeconds) {
  let { days, hours, minutes, seconds } = getTimeObject(differenceInSeconds);
  return outputTimesObject(days, hours, minutes, seconds);
}

/**
 *
 * @param {Date} startDate
 * @param {Date} endDate
 * @returns {Number}
 */
function getTimeDifference(startDate, endDate) {
  if (!endDate) endDate = Date.now();
  return (endDate - startDate) / 1000;
}

function getTimeObject(differenceInSeconds) {
  let days = Math.floor(differenceInSeconds / (24 * 3600));
  let hours = Math.floor((differenceInSeconds % (24 * 3600)) / 3600);
  let minutes = Math.floor((differenceInSeconds % 3600) / 60);
  let seconds = Math.floor(differenceInSeconds % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

(function () {
  loadLatestSessions();
})();

/// <reference path="eventEmitter.js" />
/// <reference path="database.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="../../resources/scripts/bootstrap.min.js" />
/// <reference path="../../resources/scripts/chartist.min.js" />

const backgroundWindow = overwolf.windows.getMainWindow();

/** @type EventEmitter */
const eventEmitter = backgroundWindow.eventEmitter;
/** @type GameTimeTrackerDatabase */
const db = backgroundWindow.db;

var activeGameTicker = null;

var overwolfAdvertiseObject = null;
var overwolfAdvertiseInitialized = false;

eventEmitter.addEventListener("game-launched", function (game) {
  activeGameTicker = setInterval(loadLatestSessions, 5000);
  loadLatestSessions();
  document.querySelector(".currentlyPlaying").textContent =
    "Currently playing: " + game.title;
});

var windowReload = null;

eventEmitter.addEventListener("refresh-window", function (window) {
  if (window == "mainWindow") {
    if (windowReload != null) {
      clearTimeout(windowReload);
    }
    windowReload = setTimeout(function () {
      loadLatestSessions();
      windowReload = null;
    }, 100);
  }
});

eventEmitter.addEventListener("game-exited", function () {
  if (activeGameTicker != null) {
    clearInterval(activeGameTicker);
    activeGameTicker = null;
    loadLatestSessions();
  }

  document.querySelector(".currentlyPlaying").textContent =
    "Currently playing: Nothing";
});

function loadLatestSessions() {
  db.getSessions(function (_rows) {
    let gameSessionTable = document.querySelector("#sessionStats");

    let allSessionTable = document.querySelector("#summaryStats");

    let topGameTitle = document.querySelector("#topGameTitle");
    let topGameTime = document.querySelector("#topGameTime");

    let totalGameTime = document.querySelector("#totalGameTime");

    let gameStarts = document.querySelector("#gameStarts");

    let weekSummary = document.querySelector("#weekSummaryText");

    gameSessionTable.innerHTML = "";
    gameStarts.innerHTML = "";
    weekSummary.innerHTML = "";
    allSessionTable.innerHTML = "";

    if (_rows.length == 0) {
      let noGames = document.createElement("tr");
      noGames.innerHTML = `<td colspan="3" class="text-center" style="height: 305px; vertical-align: middle;"><em>No played games so far</em></td>`;
      gameSessionTable.appendChild(noGames);
      allSessionTable.appendChild(noGames);

      gameStarts.innerHTML = "<em>You have not played any games yet</em>";
      weekSummary.innerHTML = "No data tracked yet, play some games! :)";

      topGameTitle.innerHTML = shorten("No games played yet", 45);
      topGameTime.innerHTML = "";

      totalGameTime.innerHTML = "No games played yet";

      renderGraph(null);
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

        if (!gameStartItems[session.gameTitle]) {
          gameStartItems[session.gameTitle] = {
            gameTitle: session.gameTitle,
            startCount: 0,
            sessions: [],
          };
        }

        gameStartItems[session.gameTitle].startCount++;
        gameStartItems[session.gameTitle].sessions.push(session);

        rowCount++;
      }

      if (rowCount < 10) {
        let row = document.createElement("tr");
        row.innerHTML = `
<td colspan="3" rowspan="${
          10 - rowCount
        }" class="text-center" style="vertical-align: middle; height: ${
          (10 - rowCount) * 31
        }px;">
  <em>Play more games to fill this area!</em>
</td>`;

        gameSessionTable.appendChild(row);
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
          gStart.innerHTML = `<span class="badge badge-secondary">${
            game.startCount
          }</span> ${shorten(game.gameTitle, 30)}`;
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

      let allGamesArray = sortDictionaryByPropertyAlphabetically(
        gameStartItems,
        "gameTitle",
        true
      );

      let totalTimeSum = 0;

      for (let game of allGamesArray) {
        let _game = game[1];

        let totalGameTime = _game.sessions
          .map((s) => getTimeDifference(s.startDate, s.endDate))
          .reduce((a, b) => a + b);

        totalTimeSum += totalGameTime;

        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${shorten(_game.gameTitle, 50)}</td>
        <td class="text-right" style="width: 60px;">${_game.startCount}</td>
        <td class="text-right" style="width: 120px;">${outputTimesObjectFromDifference(
          totalGameTime
        )}</td>`;

        allSessionTable.appendChild(row);
      }

      totalGameTime.innerHTML = outputTimesObjectFromDifference(totalTimeSum);

      window.gameStartItems = gameStartItems;

      let allSessions = Object.keys(gameStartItems).flatMap(function (key) {
        return gameStartItems[key].sessions;
      });
      let sevenDaysAgo = new NDate(Date.now()).removeTime().addDay(-6);
      let sevenDays = allSessions
        .filter((i) => i.startDate >= sevenDaysAgo.timestamp)
        .map((s) => getTimeDifference(s.startDate, s.endDate))
        .reduce((a, b) => a + b);

      let weekObject = getTimeObject(sevenDays);

      let days =
        weekObject.days >= 1
          ? `${pluralize(weekObject.days, "day", "days")} and `
          : "";

      let hours =
        weekObject.hours >= 1
          ? `${pluralize(weekObject.hours, "hour", "hours")} and `
          : "";

      let minutes =
        weekObject.minutes >= 1
          ? `${pluralize(weekObject.minutes, "minute", "minutes")}`
          : "";

      let seconds = "";
      if (minutes == "" && hours == "") {
        seconds = pluralize(weekObject.minutes, "second", "seconds");
      }

      weekSummary.innerHTML = `The last 7 days you spent ${days}${hours}${minutes}${seconds} in-game.`;

      renderGraph(allSessions);
    }
  });
}

function renderGraph(data) {
  let chartData = {
    labels: ["Day 1", "Day 2", "Day 3", "Day 4", "Day 5", "Day 6", "Day 7"],
    series: [[0, 0, 0, 0, 0, 0, 0]],
  };

  for (let x = 0; x < 7; x++) {
    let dayAgo = new NDate(Date.now()).removeTime().addDay(x - 6);
    chartData.labels[x] = formatDate(dayAgo.date);
  }

  if (!data || data === null) {
  } else {
    for (let x = 0; x < 7; x++) {
      let dayAgo = new NDate(Date.now()).removeTime().addDay(x - 6);

      let start = dayAgo.timestamp;
      let end = dayAgo.addDay(1).timestamp;

      var dayData = data
        .filter((s) => s.startDate >= start && s.startDate <= end)
        .map((i) => getTimeDifference(i.startDate, i.endDate));

      let hours = 0.0;
      if (dayData.length > 0) {
        let d = dayData.reduce((a, b) => a + b);
        hours = d / 3600;
      }

      chartData.series[0][x] = hours;
    }
  }

  setTimeout(function () {
    new Chartist.Bar("#weekSummaryGraph", chartData, {
      axisY: {
        offset: 45,
        labelInterpolationFnc: (value) => {
          if (value < 1) {
            return `${(value * 60).toFixed(0)}min`;
          }
          return `${value}hrs`;
        },
      },
      height: 149,
      plugins: [
        Chartist.plugins.tooltip({
          anchorToPoint: false,
          transformTooltipTextFnc: (value) => {
            return outputTimesObjectFromDifference(value * 3600);
          },
        }),
      ],
    });
  }, 200);
}

/*
function onOwAdReady() {
  if (!OwAd) {
    // TODO: Handle fallback if the OwAd-API doesn't load
    return;
  }

  overwolfAdvertiseObject = new OwAd(document.getElementById("ow_ad"));
  overwolfAdvertiseObject.addEventListener("ow_internal_rendered", () => {
    overwolfAdvertiseInitialized = true;
  });
}*/

function loadSettings() {
  db.getSettings((_settings) => {
    if (_settings) {
      if (_settings.experimentalGameTracking) {
        document.getElementById("settingsExperimentalTracking").checked = true;
      }

      if (_settings.sendPossibleGameData) {
        document.getElementById(
          "settingsAutomaticSendPossibleGame"
        ).checked = true;
      }
    }
  });
}

function downloadUpdate() {
  log("UPDATE", "User clicked the 'Update available!' text");
  eventEmitter.emit("download-update");
}

function relaunchTheApp() {
  log(
    "UPDATE",
    "User clicked the 'Pending restart!' text, relaunching the app to install new version"
  );
  eventEmitter.emit("relaunch-check");
}

var windowTitle = "Game Time Tracker";

eventEmitter.addEventListener("update-available", function (version) {
  document.getElementById(
    "titleBarName"
  ).innerHTML = `${windowTitle} - <span class="update-available" onclick="downloadUpdate(); return false;" title="An update (${version}) is available for this application, click here to update to the new version">Update available!</span>`;
});

eventEmitter.addEventListener("update-pending-restart", function (version) {
  document.getElementById(
    "titleBarName"
  ).innerHTML = `${windowTitle} - <span class="update-pending-restart" onclick="relaunchTheApp(); return false;" title="We need to restart the application to apply the new version, click here to restart">Pending restart!</span>`;
});

eventEmitter.addEventListener(
  "main-window-notification",
  function (messageObject) {
    // messageObject { class: string (info, warn, error), message: string }
    // TODO: Add notification message function
  }
);

(function () {
  loadSettings();
  loadLatestSessions();

  overwolf.windows.getCurrentWindow(function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
    document
      .getElementById("exitButton")
      .addEventListener("click", function () {
        overwolf.games.getRunningGameInfo(function (data) {
          if (!data) {
            eventEmitter.emit(
              "shutdown",
              "No running game while clicking exit button"
            );
          }
        });

        overwolf.windows.close(window.window.id, function () {});
      });

    overwolf.extensions.current.getManifest(function (app) {
      windowTitle = `Game Time Tracker - v${app.meta.version}`;
      document.getElementById("titleBarName").innerHTML = windowTitle;
    });

    document
      .getElementById("settingsExperimentalTracking")
      .addEventListener("change", function (event) {
        let experimentalEnabled = event.target.checked;
        db.setSettings(
          {
            experimentalGameTracking: experimentalEnabled,
          },
          function () {
            eventEmitter.emit("settings-changed");
          }
        );
      });

    document
      .getElementById("settingsAutomaticSendPossibleGame")
      .addEventListener("change", function (event) {
        let sendPossibleGame = event.target.checked;
        db.setSettings(
          {
            sendPossibleGameData: sendPossibleGame,
          },
          function () {
            eventEmitter.emit("settings-changed");
          }
        );
      });
  });
})();

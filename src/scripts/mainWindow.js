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

eventEmitter.addEventListener("game-launched", function () {
  activeGameTicker = setInterval(loadLatestSessions, 5000);
  loadLatestSessions();
});

eventEmitter.addEventListener("refresh-window", function (window) {
  if (window == "mainWindow") {
    loadLatestSessions();
  }
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

    let allSessionTable = document.querySelector("#summaryStats");

    let topGameTitle = document.querySelector("#topGameTitle");
    let topGameTime = document.querySelector("#topGameTime");

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

      console.log(allGamesArray);

      for (let game of allGamesArray) {
        let _game = game[1];

        let totalGameTime = _game.sessions
          .map((s) => getTimeDifference(s.startDate, s.endDate))
          .reduce((a, b) => a + b);

        let row = document.createElement("tr");
        row.innerHTML = `
        <td>${shorten(_game.gameTitle, 50)}</td>
        <td class="text-right" style="width: 60px;">${_game.startCount}</td>
        <td class="text-right" style="width: 120px;">${outputTimesObjectFromDifference(
          totalGameTime
        )}</td>`;

        allSessionTable.appendChild(row);
      }

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

      let hours = "";
      if (weekObject.hours && weekObject.hours === 1) {
        hours = `${weekObject.hours} hour and `;
      } else if (weekObject.hours > 1) {
        hours = `${weekObject.hours} hours and `;
      }

      let minutes = "";
      if (weekObject.minutes && weekObject.minutes === 1) {
        minutes = `${weekObject.minutes} minute`;
      } else if (weekObject.minutes > 1) {
        minutes = `${weekObject.minutes} minutes`;
      }

      let seconds = "";
      if (minutes == "" && hours == "") {
        if (weekObject.seconds == 1) {
          seconds = "one second";
        } else if (weekObject.seconds > 1) {
          seconds = `${weekObject.seconds} seconds`;
        }
      }

      weekSummary.innerHTML = `The last 7 days you spent ${hours}${minutes}${seconds} in-game.`;

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
    });
  }, 200);
}

(function () {
  loadLatestSessions();

  overwolf.windows.getCurrentWindow(function (window) {
    new DraggableWindow(window.window, document.getElementById("titleBar"));
    document
      .getElementById("exitButton")
      .addEventListener("click", function () {
        overwolf.games.getRunningGameInfo(function (data) {
          if (!data) {
            log("[Exit]", "No games are running, exiting application");
            eventEmitter.emit("shutdown", null);
          }
        });

        overwolf.windows.close(window.window.id, function () {});
      });

    overwolf.extensions.current.getManifest(function (app) {
      document.getElementById(
        "titleBarName"
      ).innerHTML = `Game Time Tracker - v${app.meta.version}`;
    });
  });
})();

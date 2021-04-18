/// <reference path="eventEmitter.js" />
/// <reference path="database.js" />
/// <reference path="date.js" />
/// <reference path="log.js" />
/// <reference path="utils.js" />
/// <reference path="bootstrap.min.js" />
/// <reference path="chartist.min.js" />

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

    let weekSummary = document.querySelector("#weekSummaryText");

    gameSessionTable.innerHTML = "";
    gameStarts.innerHTML = "";
    weekSummary.innerHTML = "";

    if (_rows.length === 0) {
      gameSessionTable.appendChild(
        addElement(
          `<tr><td colspan="3"><em>No played games so far</em></td></tr>`
        )
      );

      gameStarts.innerHTML = "<em>You have not played any games yet</em>";
      weekSummary.innerHTML = "No data tracked yet, play some games! :)";

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
      let sevenDaysAgo = new NDate(Date.now()).removeTime().addDay(-7);
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

      weekSummary.innerHTML = `The last 7 days you spent ${hours}${minutes} in-game.`;

      renderGraph(allSessions);
    }
  });
}

function renderGraph(data) {
  let sevenDaysAgo = new NDate(Date.now()).removeTime().addDay(-7);
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

  new Chartist.Bar("#weekSummaryGraph", chartData, {
    axisY: {
      offset: 45,
      labelInterpolationFnc: (value) => `${value}hrs`,
    },
  });
}

(function () {
  loadLatestSessions();
})();

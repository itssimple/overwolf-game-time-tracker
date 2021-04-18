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

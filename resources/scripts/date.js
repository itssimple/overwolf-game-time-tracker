/**
 *
 * @param {Number} timestamp
 */
function NDate(timestamp) {
  this.date = new Date(timestamp);
  this.timestamp = timestamp;

  /**
   *
   * @param {Number} days Use an integer, will floor it
   */
  this.addDay = function (days) {
    if (isNaN(days)) {
      throw new Error('Parameter "days" is not a number.');
    }

    this.timestamp = this.timestamp + Math.floor(days) * 86400000;

    updateDate();

    return this;
  };

  function updateDate() {
    this.date = new Date(timestamp);
  }

  return this;
}

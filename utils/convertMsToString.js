function getMinutes(sec) {
  return Math.floor(sec / 60);
}

function getSeconds(sec) {
  return Math.floor(sec % 60);
}

function computeTwoDigitNumber(value) {
  return value.toString().padStart(2, '0');
}

function convertMsToString(ms) {
  const seconds = ms / 1000;
  const min = computeTwoDigitNumber(getMinutes(seconds));
  const sec = computeTwoDigitNumber(getSeconds(seconds));
  return `${min}:${sec}`;
};

module.exports = { convertMsToString };

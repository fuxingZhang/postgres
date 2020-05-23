const map = new Map();

map.set(23, s => parseInt(s, 10));
map.set(16, s => {
  if (s === null) return s
  return s === 'TRUE' ||
    s === 't' ||
    s === 'true' ||
    s === 'y' ||
    s === 'yes' ||
    s === 'on' ||
    s === '1'
});

module.exports = map
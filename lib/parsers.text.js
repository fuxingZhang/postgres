const map = new Map();

map.set(23, parseInt);
map.set(700, parseFloat);
map.set(701, parseFloat);
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

map.set(1082, s => {
  const date = new Date(s);
  date.setTime(date.getTime() + date.getTimezoneOffset() * 60 * 1000)
  return date;
});
map.set(1114, s => new Date(s));
map.set(1184, s => new Date(s));
map.set(114, JSON.parse);
map.set(3802, JSON.parse);

module.exports = map
const map = new Map();

map.set(20, buf => BigInt(buf.toString()));
map.set(21, buf => buf.readInt16BE());
map.set(23, buf => buf.readInt32BE());
map.set(26, buf => buf.parseInt32());
map.set(700, buf => buf.readFloatBE());
map.set(701, buf => buf.readDoubleBE());
map.set(16, buf => {
  if (buf === null) return null;
  return value[0] !== 0
});
const parseDate = function (isUTC, value) {
  const rawValue = 0x100000000 * value.readInt32BE(0) + value.readUInt32BE(4);
  // discard usecs and shift from 2000 to 1970
  const date = new Date((rawValue / 1000) + 946684800000);
  if (!isUTC) {
    date.setTime(date.getTime() + date.getTimezoneOffset() * 60000);
  }
  return date
};
map.set(1114, parseDate.bind(null, false));
map.set(1184, parseDate.bind(null, true));
map.set(25, buf => buf.toString());

module.exports = map
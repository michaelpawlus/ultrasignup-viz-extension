// Shared by the extension and its tests. No network or storage access.
(function (root) {
  'use strict';
  function timeToSeconds(value) {
    if (typeof value !== 'string') return null;
    const match = /^(\d{1,5}):([0-5]\d):([0-5]\d)$/.exec(value.trim());
    return match ? Number(match[1]) * 3600 + Number(match[2]) * 60 + Number(match[3]) : null;
  }
  function secondsToTime(seconds) {
    return `${Math.floor(seconds / 3600)}:${String(Math.floor(seconds % 3600 / 60)).padStart(2, '0')}`;
  }
  function filterByDistance(results, distance) {
    if (!distance) return results;
    const normalize = value => String(value || '').toLowerCase().replace(/\s+/g, '').replace(/miler?$/, 'm');
    return results.filter(result => normalize(result.Race) === normalize(distance));
  }
  function createHistogramData(results, binSizeMinutes = 30) {
    if (!Number.isFinite(binSizeMinutes) || binSizeMinutes < 1) throw new RangeError('Bin size must be at least one minute.');
    const times = results.map(r => timeToSeconds(r.Time)).filter(t => t !== null && t > 0);
    if (!times.length) return { labels: [], data: [], starts: [], binSizeSeconds: binSizeMinutes * 60 };
    const min = times.reduce((a, b) => Math.min(a, b), Infinity);
    const max = times.reduce((a, b) => Math.max(a, b), 0);
    // At most 80 bins, even for multi-day events or malformed outliers.
    let size = binSizeMinutes * 60;
    while (Math.floor(max / size) - Math.floor(min / size) + 1 > 80) size *= 2;
    const start = Math.floor(min / size) * size;
    const length = Math.floor((max - start) / size) + 1;
    const starts = Array.from({ length }, (_, i) => start + i * size);
    const data = Array(length).fill(0);
    times.forEach(t => data[Math.floor((t - start) / size)]++);
    return { labels: starts.map(t => `${secondsToTime(t)}–${secondsToTime(t + size)}`), data, starts, binSizeSeconds: size };
  }
  function summarize(results, selectedId) {
    const times = results.map(r => timeToSeconds(r.Time)).filter(t => t > 0).sort((a, b) => a - b);
    const n = times.length;
    const median = n ? (times[Math.floor((n - 1) / 2)] + times[Math.floor(n / 2)]) / 2 : null;
    const selected = results.find(r => r.Id === selectedId);
    const time = selected ? timeToSeconds(selected.Time) : null;
    return { count: n, median, selected, time,
      ahead: time > 0 ? times.filter(t => t > time).length : null,
      tied: time > 0 ? times.filter(t => t === time).length - 1 : null,
      others: Math.max(0, n - 1) };
  }
  const api = { timeToSeconds, secondsToTime, filterByDistance, createHistogramData, summarize };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.UltraSignupLib = api;
})(typeof window !== 'undefined' ? window : null);

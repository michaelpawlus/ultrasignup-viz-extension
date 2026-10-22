// Reads only the results currently rendered by UltraSignup; never requests hidden data.
(function (root) {
  'use strict';
  const lib = typeof module !== 'undefined' && module.exports ? require('./core.js') : root.UltraSignupLib;
  function readResults(doc) {
    const table = doc.querySelector('table#list');
    const text = selector => doc.querySelector(selector)?.textContent.trim() || '';
    const value = selector => doc.querySelector(selector)?.value || '';
    const distance = text('a.event_selected_link') || 'Current distance';
    const age = value('input[name="rdioag"]:checked') || 'All';
    const division = value('input[name="rdiog"]:checked') || 'All';
    const eventType = value('[id$="_hdEventType"]');
    const distanceType = value('[id$="_hdDistanceType"]');
    const rows = table ? Array.from(table.querySelectorAll('tr.jqgrow')) : [];
    const results = [];
    let excluded = 0;
    for (const row of rows) {
      const cell = key => row.querySelector(`td[aria-describedby="list_${key}"]`)?.textContent.trim() || '';
      const status = cell('status');
      const time = cell('formattime');
      if (!['1', '6'].includes(status) || !(lib.timeToSeconds(time) > 0)) { excluded++; continue; }
      results.push({ Id: row.id, Name: `${cell('firstname')} ${cell('lastname')}`.trim() || 'Unnamed runner',
        Time: time, Age: cell('age'), AgeGroup: cell('agegroup'), Gender: cell('gender'), Place: cell('place'), Race: distance });
    }
    const restricted = Array.from(doc.querySelectorAll('.errormessage, [id$="_lblNoHostMessage"]')).some(el => /not.*(?:view|able)|not hosting|not.*registration/i.test(el.textContent));
    const unsupported = distanceType === '3' || (eventType && eventType !== '1');
    // Desktop jqGrid renders all records today. Guard future pagination/truncation
    // by reconciling the grouping counts against actual rendered records.
    const groups = table ? Array.from(table.querySelectorAll('tr.jqgroup')) : [];
    const counts = groups.map(row => / -\s*(\d[\d,]*)\s*$/.exec(row.textContent.trim()))
      .filter(Boolean).map(match => Number(match[1].replaceAll(',', '')));
    const expected = counts.length === groups.length && counts.length ? counts.reduce((a, b) => a + b, 0) : null;
    const incomplete = rows.length > 0 && (expected === null || expected !== rows.length);
    const pendingFilters = results.some(result =>
      (age !== 'All' && result.AgeGroup !== age) || (division !== 'All' && result.Gender !== division));
    return { table, results, excluded, distance, age, division, restricted, unsupported, incomplete, pendingFilters, expected, rowCount: rows.length };
  }
  if (typeof module !== 'undefined' && module.exports) module.exports = { readResults };
  if (root) root.UltraSignupScraper = { readResults };
})(typeof window !== 'undefined' ? window : null);

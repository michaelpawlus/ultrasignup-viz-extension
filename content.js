// Content script: no network requests, credentials, analytics, or persistent storage.
(function () {
  'use strict';
  if (!/^\d+$/.test(new URLSearchParams(location.search).get('did') || '')) return;
  if (document.getElementById('us-viz-container')) return;
  const lib = window.UltraSignupLib;
  let chart, container, picker, summary, comparison, status, details, canvas, chartBox;
  let selectedId = '', fingerprint = '', timer, stopped = false;
  let state;

  function element(tag, text, parent, attributes = {}) {
    const node = document.createElement(tag);
    if (text) node.textContent = text;
    Object.entries(attributes).forEach(([key, value]) => node.setAttribute(key, value));
    if (parent) parent.appendChild(node);
    return node;
  }
  function mount(table) {
    container = element('section', '', null, { id: 'us-viz-container', 'aria-labelledby': 'us-viz-title' });
    const heading = element('div', '', container, { class: 'us-viz-heading' });
    element('h2', 'Your finish, in context', heading, { id: 'us-viz-title' });
    const feedback = element('a', 'Feedback / report a problem', heading, {
      href: 'https://github.com/michaelpawlus/ultrasignup-viz-extension/issues/new/choose', target: '_blank', rel: 'noopener noreferrer' });
    feedback.title = 'Opens GitHub; submitting feedback requires a GitHub account';
    status = element('p', '', container, { role: 'status' });
    summary = element('p', '', container, { class: 'us-viz-summary' });
    const controls = element('div', '', container);
    element('label', 'Find a runner in this group', controls, { for: 'us-viz-runner' });
    picker = element('select', '', controls, { id: 'us-viz-runner' });
    picker.addEventListener('change', () => { selectedId = picker.value; renderChart(); });
    comparison = element('p', '', container, { 'aria-live': 'polite', class: 'us-viz-comparison' });
    chartBox = element('div', '', container, { class: 'us-viz-chart-box' });
    canvas = element('canvas', '', chartBox, { role: 'img', 'aria-label': 'Finish time histogram. The same counts are available in the distribution table below.' });
    details = element('details', '', container);
    element('summary', 'View distribution as a table', details);
    element('p', 'Times are elapsed hours:minutes. Each interval includes its start and excludes its end. DNF, DNS, DQ, unofficial results, and invalid or zero times are excluded. Uses results loaded on this page; change age or division with UltraSignup’s controls above.', container, { class: 'us-viz-note' });
    const anchor = table.closest('.ui-jqgrid') || table;
    anchor.parentNode.insertBefore(container, anchor);
  }
  function clearChart() {
    if (chart) { chart.destroy(); chart = null; }
    chartBox.hidden = true;
    details.hidden = true;
    comparison.textContent = '';
    summary.textContent = '';
    picker.parentNode.hidden = true;
  }
  function renderChart() {
    const stats = lib.summarize(state.results, selectedId);
    const histogram = lib.createHistogramData(state.results);
    summary.textContent = `${stats.count} ${stats.count === 1 ? 'finisher' : 'finishers'} · Median ${lib.secondsToTime(stats.median)} · ${state.excluded} other results excluded`;
    comparison.textContent = stats.selected ? `${stats.selected.Name} · ${stats.selected.Time} · Finished ahead of ${stats.ahead} of ${stats.others} other finishers in this group; tied with ${stats.tied}.` : 'Select a runner to see their finish time highlighted and compare it with this group.';
    const bin = stats.time > 0 ? Math.floor((stats.time - histogram.starts[0]) / histogram.binSizeSeconds) : -1;
    chartBox.hidden = false;
    details.hidden = false;
    picker.parentNode.hidden = false;
    const oldTable = details.querySelector('table');
    if (oldTable) oldTable.remove();
    const table = element('table', '', details);
    element('caption', 'Finish-time distribution for the selected group', table);
    const head = element('tr', '', element('thead', '', table));
    element('th', 'Elapsed time', head, { scope: 'col' });
    element('th', 'Finishers', head, { scope: 'col' });
    const body = element('tbody', '', table);
    histogram.labels.forEach((label, i) => {
      const row = element('tr', '', body);
      element('td', `${label}${i === bin ? ' (selected runner)' : ''}`, row);
      element('td', String(histogram.data[i]), row);
    });
    if (chart) { chart.destroy(); chart = null; }
    try {
      chart = new Chart(canvas, {
        type: 'bar',
        data: { labels: histogram.labels, datasets: [{ label: 'Finishers', data: histogram.data,
          backgroundColor: histogram.data.map((_, i) => i === bin ? '#bd4d18' : '#39745c'),
          borderColor: '#244d3d', borderWidth: 1 }] },
        options: { responsive: true, maintainAspectRatio: false, animation: false,
          plugins: { legend: { display: false }, tooltip: { callbacks: { label: ctx => `${ctx.parsed.y} finishers` } } },
          scales: { x: { title: { display: true, text: `Elapsed time · ${histogram.binSizeSeconds / 60}-minute intervals` }, ticks: { maxTicksLimit: 12, maxRotation: 45 } },
            y: { beginAtZero: true, title: { display: true, text: 'Finishers' }, ticks: { precision: 0 } } } }
      });
    } catch (error) {
      chartBox.hidden = true;
      details.open = true;
      status.textContent += ' Chart unavailable; use the distribution table below.';
      console.warn('UltraSignup Visualizer: chart unavailable', error);
    }
  }
  function update() {
    if (stopped) return;
    state = window.UltraSignupScraper.readResults(document);
    if (!state.table) return;
    if (!container) mount(state.table);
    // jqGrid wraps the original table after load; keep the chart outside that wrapper.
    const anchor = state.table.closest('.ui-jqgrid') || state.table;
    if (container.parentNode !== anchor.parentNode || container.nextElementSibling !== anchor) anchor.before(container);
    const next = JSON.stringify([state.results, state.excluded, state.distance, state.age, state.division, state.restricted, state.unsupported, state.incomplete, state.pendingFilters]);
    if (next === fingerprint) return;
    fingerprint = next;
    clearChart();
    if (!state.results.some(r => r.Id === selectedId)) selectedId = '';
    status.textContent = `${state.distance} · Age: ${state.age} · Division: ${state.division}`;
    if (state.unsupported) { status.textContent += ' · This event format is not supported. Finish-time charts support individual, fixed-distance races.'; return; }
    if (state.restricted) { status.textContent += ' · UltraSignup has not made full results available for this event.'; return; }
    if (state.incomplete) { status.textContent += ' · Only part of the results table is loaded. A comparison would be incomplete.'; return; }
    if (state.pendingFilters) { status.textContent += ' · Waiting for the results table to match the selected filters. If this persists, reset the site’s filters and try again.'; return; }
    if (!state.results.length) { status.textContent += ' · No finish times are available in the loaded results for this group. If results are still loading, this will update automatically.'; return; }
    picker.replaceChildren();
    element('option', 'Select a runner…', picker, { value: '' });
    [...state.results].sort((a, b) => a.Name.localeCompare(b.Name)).forEach(r => element('option', `${r.Name} · ${r.Time} · ${r.Gender}${r.Age} · #${r.Place}`, picker, { value: r.Id }));
    picker.value = selectedId;
    renderChart();
  }
  function schedule() { clearTimeout(timer); timer = setTimeout(update, 120); }
  const observer = new MutationObserver(mutations => {
    if (mutations.some(m => !container?.contains(m.target))) schedule();
  });
  const observationOptions = { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'style', 'checked'] };
  observer.observe(document.body, observationOptions);
  document.addEventListener('change', event => { if (!container?.contains(event.target)) schedule(); });
  document.addEventListener('click', event => { if (event.target.matches('input[name="rdioag"], input[name="rdiog"]')) schedule(); });
  window.addEventListener('pagehide', () => { stopped = true; clearTimeout(timer); observer.disconnect(); if (chart) { chart.destroy(); chart = null; } });
  window.addEventListener('pageshow', event => { if (event.persisted) { stopped = false; fingerprint = ''; observer.observe(document.body, observationOptions); schedule(); } });
  update();
})();

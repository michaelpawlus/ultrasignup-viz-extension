const fs = require('fs');
const path = require('path');
const lib = require('../core.js');
const { readResults } = require('../scraper.js');
function row(id, name, time, status = '1') {
  return `<tr class="jqgrow" id="${id}">${Object.entries({ firstname: name, lastname: 'Runner', formattime: time, status, age: '35', agegroup: '30-39', gender: 'F', place: id }).map(([key,value]) => `<td aria-describedby="list_${key}">${value}</td>`).join('')}</tr>`;
}
function page(rows, count = 3) {
  document.body.innerHTML = `<a class="event_selected_link">50K</a><input name="rdioag" value="All" checked type="radio"><input name="rdioag" value="30-39" type="radio"><input name="rdiog" value="All" checked type="radio"><input id="Content_hdEventType" value="1" type="hidden"><input id="Content_hdDistanceType" value="2" type="hidden"><div class="ui-jqgrid"><table id="list"><tbody><tr class="jqgroup"><td>Finishers - ${count}</td></tr>${rows}</tbody></table></div>`;
}
const rows = () => row('1','Ada','5:00:00') + row('2','Bea','6:00:00') + row('3','Cy','6:00:00');
function boot() {
  window.UltraSignupLib = lib;
  window.UltraSignupScraper = { readResults };
  window.Chart = jest.fn(function (_, config) { this.config = config; this.destroy = jest.fn(); });
  window.eval(fs.readFileSync(path.join(__dirname, '..', 'content.js'), 'utf8'));
}
function flush() { return new Promise(resolve => setTimeout(resolve, 180)); }
afterEach(() => { window.dispatchEvent(new Event('pagehide')); document.body.replaceChildren(); });
test('excludes nonfinish statuses even with numeric times', () => {
  page(rows() + row('4','DNF','6:00:00','2') + row('5','DQ','6:00:00','5'), 5);
  expect(readResults(document)).toMatchObject({ excluded:2, incomplete:false });
  expect(readResults(document).results).toHaveLength(3);
});
test('withholds comparison for truncated groups', () => {
  page(rows(), 100); boot();
  expect(document.querySelector('#us-viz-container').textContent).toContain('Only part');
  expect(window.Chart).not.toHaveBeenCalled();
});
test('withholds comparison if group completeness cannot be checked', () => {
  page(rows()); document.querySelector('.jqgroup').remove(); boot();
  expect(window.Chart).not.toHaveBeenCalled();
});
test('does not label stale rows as the newly selected division', () => {
  page(rows());
  document.querySelector('input[name="rdiog"]').value = 'M';
  boot();
  expect(document.querySelector('[role="status"]').textContent).toContain('Waiting for the results table');
  expect(window.Chart).not.toHaveBeenCalled();
});
test('clears a selection when a filter leaves no finishers', async () => {
  page(rows()); boot();
  const picker = document.querySelector('#us-viz-runner');
  picker.value = '2'; picker.dispatchEvent(new Event('change', {bubbles:true}));
  document.querySelector('#list tbody').innerHTML = '';
  await flush();
  document.querySelector('#list tbody').innerHTML = `<tr class="jqgroup"><td>Finishers - 3</td></tr>${rows()}`;
  await flush();
  expect(picker.value).toBe('');
});
test('defines ties and excludes the selected runner from the denominator', () => {
  const results = [{ Id:'a',Time:'5:00:00' },{ Id:'b',Time:'6:00:00' },{ Id:'c',Time:'6:00:00' },{ Id:'d',Time:'7:00:00' }];
  expect(lib.summarize(results,'b')).toMatchObject({ count:4, median:21600, ahead:1, tied:1, others:3 });
  expect(lib.summarize([results[0]],'a')).toMatchObject({ ahead:0, tied:0, others:0 });
});
test('waits for delayed rows, highlights runner, follows filters and clears stale selection', async () => {
  page('', 0); boot();
  expect(document.querySelector('[role="status"]').textContent).toContain('No finish times');
  document.querySelector('#list tbody').innerHTML = `<tr class="jqgroup"><td>Finishers - 3</td></tr>${rows()}`;
  await flush();
  expect(document.querySelector('.us-viz-summary').textContent).toContain('3 finishers');
  const picker = document.querySelector('#us-viz-runner');
  picker.value = '2'; picker.dispatchEvent(new Event('change', {bubbles:true}));
  expect(document.querySelector('.us-viz-comparison').textContent).toContain('ahead of 0 of 2');
  expect(document.querySelector('.us-viz-comparison').textContent).toContain('tied with 1');
  expect(window.Chart.mock.calls.at(-1)[1].data.datasets[0].backgroundColor).toContain('#bd4d18');
  document.querySelector('input[value="30-39"]').checked = true;
  document.querySelector('input[value="30-39"]').dispatchEvent(new Event('change',{bubbles:true}));
  document.querySelector('#list tbody').innerHTML = `<tr class="jqgroup"><td>Finishers - 1</td></tr>${row('1','Ada','5:00:00')}`;
  await flush();
  expect(document.querySelector('[role="status"]').textContent).toContain('Age: 30-39');
  expect(picker.value).toBe('');
  expect(document.querySelector('.us-viz-summary').textContent).toContain('1 finisher');
  expect(document.querySelectorAll('#us-viz-container')).toHaveLength(1);
  expect(document.querySelector('#us-viz-container').parentNode).toBe(document.body);
});
test('withholds fixed-time event chart', () => {
  page(rows()); document.querySelector('[id$="_hdDistanceType"]').value = '3'; boot();
  expect(document.querySelector('[role="status"]').textContent).toContain('not supported');
  expect(window.Chart).not.toHaveBeenCalled();
});
test('displays restricted-results notice', () => {
  page('');
  document.body.insertAdjacentHTML('beforeend','<div id="ContentPlaceHolder1_lblNoHostMessage" class="row"><div class="notice notice-error">You will not be able to view results; this event is not hosting registration with us.</div></div>');
  boot(); expect(document.querySelector('[role="status"]').textContent).toContain('not made full results available');
});
test('renders external runner names as text and provides accessible counts', () => {
  page(row('1','&lt;img src=x onerror=alert(1)&gt;','5:00:00'),1); boot();
  expect(document.querySelector('#us-viz-runner').textContent).toContain('<img src=x');
  expect(document.querySelector('#us-viz-container img')).toBeNull();
  expect(document.querySelector('details table').textContent).toContain('5:00');
  expect(document.querySelectorAll('details tbody tr')).toHaveLength(1);
});
test('rejects malformed times while supporting long events', () => {
  ['12:60:00','12:00:60','-1:30:00','12:30:00 DNF',42,'2:3:4'].forEach(value => expect(lib.timeToSeconds(value)).toBeNull());
  expect(lib.timeToSeconds('105:02:03')).toBe(378123);
});
test('aligns bin boundaries, counts once and caps bin count', () => {
  const hist = lib.createHistogramData([{Time:'5:00:00'},{Time:'5:29:59'},{Time:'5:30:00'}]);
  expect(hist.data).toEqual([2,1]); expect(hist.labels).toEqual(['5:00–5:30','5:30–6:00']);
  const long = lib.createHistogramData([{Time:'1:00:00'},{Time:'99999:00:00'}]);
  expect(long.data.length).toBeLessThanOrEqual(80); expect(long.data.reduce((a,b)=>a+b,0)).toBe(2);
  expect(() => lib.createHistogramData([],0)).toThrow(RangeError);
});

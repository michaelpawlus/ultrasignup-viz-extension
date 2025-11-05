/**
 * Time Conversion Tests
 * Testing timeToSeconds() and secondsToTime() functions
 */

const { timeToSeconds, secondsToTime } = require('../test-lib.js');

describe('timeToSeconds', () => {
  test('converts valid time strings to seconds', () => {
    expect(timeToSeconds('16:45:30')).toBe(16 * 3600 + 45 * 60 + 30);
    expect(timeToSeconds('00:00:00')).toBe(0);
    expect(timeToSeconds('01:00:00')).toBe(3600);
    expect(timeToSeconds('00:01:00')).toBe(60);
    expect(timeToSeconds('00:00:01')).toBe(1);
  });
  
  test('handles times over 24 hours', () => {
    expect(timeToSeconds('24:00:00')).toBe(24 * 3600);
    expect(timeToSeconds('30:15:30')).toBe(30 * 3600 + 15 * 60 + 30);
    expect(timeToSeconds('99:59:59')).toBe(99 * 3600 + 59 * 60 + 59);
  });
  
  test('returns null for invalid formats', () => {
    expect(timeToSeconds('')).toBe(null);
    expect(timeToSeconds('invalid')).toBe(null);
    expect(timeToSeconds('12:00')).toBe(null);
    expect(timeToSeconds('12:00:00:00')).toBe(null);
    expect(timeToSeconds('12:60:00')).toBe(null);
    expect(timeToSeconds('12:00:60')).toBe(null);
  });
  
  test('returns null for null or undefined input', () => {
    expect(timeToSeconds(null)).toBe(null);
    expect(timeToSeconds(undefined)).toBe(null);
  });
  
  test('handles whitespace', () => {
    expect(timeToSeconds('  16:45:30  ')).toBe(16 * 3600 + 45 * 60 + 30);
    expect(timeToSeconds('   ')).toBe(null);
  });
  
  test('handles leading zeros', () => {
    expect(timeToSeconds('01:02:03')).toBe(1 * 3600 + 2 * 60 + 3);
    expect(timeToSeconds('00:00:00')).toBe(0);
  });
});

describe('secondsToTime', () => {
  test('converts seconds to time string format', () => {
    expect(secondsToTime(0)).toBe('0:00');
    expect(secondsToTime(3600)).toBe('1:00');
    expect(secondsToTime(3660)).toBe('1:01');
    expect(secondsToTime(60330)).toBe('16:45'); // 16:45:30 rounded down
  });
  
  test('handles large values', () => {
    expect(secondsToTime(86400)).toBe('24:00'); // 24 hours
    expect(secondsToTime(359999)).toBe('99:59'); // 99:59:59 rounded down
  });
  
  test('pads minutes with leading zeros', () => {
    expect(secondsToTime(3601)).toBe('1:00');
    expect(secondsToTime(3605)).toBe('1:00');
    expect(secondsToTime(3660)).toBe('1:01');
    expect(secondsToTime(3720)).toBe('1:02');
  });
  
  test('handles edge cases', () => {
    expect(secondsToTime(1)).toBe('0:00');
    expect(secondsToTime(59)).toBe('0:00');
    expect(secondsToTime(60)).toBe('0:01');
  });
});

describe('round-trip conversion', () => {
  test('timeToSeconds and secondsToTime are consistent', () => {
    const testTimes = ['16:45:30', '00:00:00', '24:00:00', '12:30:15'];
    
    testTimes.forEach(time => {
      const seconds = timeToSeconds(time);
      const converted = secondsToTime(seconds);
      const reconverted = timeToSeconds(converted + ':00');
      
      // Should be within the same minute
      expect(Math.floor(seconds / 60)).toBe(Math.floor(reconverted / 60));
    });
  });
});


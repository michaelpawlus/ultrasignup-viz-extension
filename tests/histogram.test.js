/**
 * Histogram Generation Tests
 * Testing createHistogramData() function
 */

const { createHistogramData } = require('../test-lib.js');
const sampleData = require('./sample-data.json');

describe('createHistogramData', () => {
  test('creates histogram from valid data', () => {
    const result = createHistogramData(sampleData, 30);
    
    expect(result).toHaveProperty('labels');
    expect(result).toHaveProperty('data');
    expect(Array.isArray(result.labels)).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.labels.length).toBe(result.data.length);
  });
  
  test('bins are consistent with data', () => {
    const result = createHistogramData(sampleData, 30);
    const totalCount = result.data.reduce((sum, count) => sum + count, 0);
    
    // Should account for all valid times
    const validTimes = sampleData.filter(r => r.Time && r.Time.match(/\d+:\d+:\d+/));
    expect(totalCount).toBe(validTimes.length);
  });
  
  test('handles different bin sizes', () => {
    const result15 = createHistogramData(sampleData, 15);
    const result30 = createHistogramData(sampleData, 30);
    const result60 = createHistogramData(sampleData, 60);
    
    // Smaller bins should create more bins
    expect(result15.labels.length).toBeGreaterThan(result30.labels.length);
    expect(result30.labels.length).toBeGreaterThanOrEqual(result60.labels.length);
    
    // All should have same total count
    const total15 = result15.data.reduce((a, b) => a + b, 0);
    const total30 = result30.data.reduce((a, b) => a + b, 0);
    const total60 = result60.data.reduce((a, b) => a + b, 0);
    expect(total15).toBe(total30);
    expect(total30).toBe(total60);
  });
  
  test('handles empty data array', () => {
    const result = createHistogramData([], 30);
    
    expect(result.labels).toEqual([]);
    expect(result.data).toEqual([]);
  });
  
  test('handles single finisher', () => {
    const singleData = [{ Time: '16:30:00' }];
    const result = createHistogramData(singleData, 30);
    
    expect(result.labels.length).toBeGreaterThan(0);
    expect(result.data.reduce((a, b) => a + b, 0)).toBe(1);
  });
  
  test('ignores invalid time entries', () => {
    const mixedData = [
      { Time: '16:30:00' },
      { Time: 'invalid' },
      { Time: '' },
      { Time: '17:00:00' },
      { Time: null }
    ];
    
    const result = createHistogramData(mixedData, 30);
    const total = result.data.reduce((a, b) => a + b, 0);
    
    // Should only count the 2 valid times
    expect(total).toBe(2);
  });
  
  test('labels are in correct format', () => {
    const result = createHistogramData(sampleData, 30);
    
    result.labels.forEach(label => {
      // Should match format "HH:MM-HH:MM"
      expect(label).toMatch(/^\d+:\d{2}-\d+:\d{2}$/);
    });
  });
  
  test('bins do not overlap', () => {
    const singleData = [{ Time: '16:00:00' }, { Time: '16:29:59' }];
    const result = createHistogramData(singleData, 30);
    
    // Both times should be in the same bin (16:00-16:30)
    expect(result.data[0]).toBe(2);
  });
  
  test('handles large dataset', () => {
    // Generate 1000 finishers
    const largeData = [];
    for (let i = 0; i < 1000; i++) {
      const hours = 16 + Math.floor(i / 100);
      const minutes = (i % 60);
      const seconds = Math.floor(Math.random() * 60);
      largeData.push({
        Time: `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      });
    }
    
    const result = createHistogramData(largeData, 30);
    const total = result.data.reduce((a, b) => a + b, 0);
    
    expect(total).toBe(1000);
    expect(result.labels.length).toBeGreaterThan(0);
  });
  
  test('handles very large bin sizes', () => {
    const result = createHistogramData(sampleData, 240); // 4 hours
    
    // Should create fewer, larger bins
    expect(result.labels.length).toBeGreaterThan(0);
    expect(result.labels.length).toBeLessThan(10);
  });
  
  test('handles very small bin sizes', () => {
    const result = createHistogramData(sampleData, 5); // 5 minutes
    
    // Should create many small bins
    expect(result.labels.length).toBeGreaterThan(10);
  });
});


/**
 * Data Filtering Tests
 * Testing filterByDistance() function
 */

const { filterByDistance } = require('../test-lib.js');
const sampleData = require('./sample-data.json');

describe('filterByDistance', () => {
  test('filters by exact distance match', () => {
    const result = filterByDistance(sampleData, '100 Mile');
    
    expect(result.length).toBeGreaterThan(0);
    result.forEach(r => {
      expect(r.Race).toContain('100 Mile');
    });
  });
  
  test('filters by partial distance match', () => {
    const result = filterByDistance(sampleData, '50K');
    
    expect(result.length).toBeGreaterThan(0);
    result.forEach(r => {
      expect(r.Race).toContain('50K');
    });
  });
  
  test('returns all data when distance is null', () => {
    const result = filterByDistance(sampleData, null);
    
    expect(result.length).toBe(sampleData.length);
  });
  
  test('returns all data when distance is empty string', () => {
    const result = filterByDistance(sampleData, '');
    
    expect(result.length).toBe(sampleData.length);
  });
  
  test('returns original data when no matches found', () => {
    const result = filterByDistance(sampleData, 'NonExistent Race');
    
    // Should return all data as fallback
    expect(result.length).toBe(sampleData.length);
  });
  
  test('handles case sensitivity', () => {
    const result = filterByDistance(sampleData, '100 mile');
    
    // Should still find matches (case insensitive contains check)
    expect(result.length).toBeGreaterThan(0);
  });
  
  test('handles empty data array', () => {
    const result = filterByDistance([], '100 Mile');
    
    expect(result).toEqual([]);
  });
  
  test('handles missing Race field', () => {
    const dataWithoutRace = [
      { Time: '16:30:00', Name: 'John' },
      { Time: '17:00:00', Name: 'Jane', Race: '100 Mile' }
    ];
    
    const result = filterByDistance(dataWithoutRace, '100 Mile');
    
    // Should only return entries with matching Race field
    expect(result.length).toBeGreaterThan(0);
  });
  
  test('preserves data structure', () => {
    const result = filterByDistance(sampleData, '100 Mile');
    
    // Check that filtered results maintain all fields
    result.forEach(r => {
      expect(r).toHaveProperty('Place');
      expect(r).toHaveProperty('Name');
      expect(r).toHaveProperty('Time');
      expect(r).toHaveProperty('Race');
    });
  });
  
  test('filters correctly with multiple distances in data', () => {
    const mile100Count = sampleData.filter(r => r.Race === '100 Mile').length;
    const k50Count = sampleData.filter(r => r.Race === '50K').length;
    
    const result100 = filterByDistance(sampleData, '100 Mile');
    const result50 = filterByDistance(sampleData, '50K');
    
    expect(result100.length).toBe(mile100Count);
    expect(result50.length).toBe(k50Count);
  });
  
  test('does not modify original data', () => {
    const originalLength = sampleData.length;
    const originalFirst = { ...sampleData[0] };
    
    filterByDistance(sampleData, '100 Mile');
    
    expect(sampleData.length).toBe(originalLength);
    expect(sampleData[0]).toEqual(originalFirst);
  });
});


// Setup file for Jest tests
process.env.NODE_ENV = 'test';

// Include at least one empty test so Jest doesn't complain
// This file is used for global setup of the test environment
describe('Test environment', () => {
  it('should be set to test', () => {
    expect(process.env.NODE_ENV).toBe('test');
  });
});

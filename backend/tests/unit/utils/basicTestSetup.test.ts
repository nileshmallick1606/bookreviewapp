/**
 * Basic utility test to verify test setup
 */

describe('Basic Test Setup Verification', () => {
  it('should pass a simple test to verify Jest is working', () => {
    expect(1 + 1).toBe(2);
  });
  
  it('should correctly handle async tests', async () => {
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });
});

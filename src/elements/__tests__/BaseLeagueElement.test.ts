import { BaseLeagueElement } from '../index';

describe('BaseLeagueElement', () => {
  it('should create a new element with default values', () => {
    const element = new BaseLeagueElement({ type: 'test' });
    
    expect(element.id).toBeDefined();
    expect(element.type).toBe('test');
    expect(element.createdAt).toBeInstanceOf(Date);
    expect(element.updatedAt).toBeInstanceOf(Date);
  });

  it('should create a new element with custom id', () => {
    const customId = 'custom-id';
    const element = new BaseLeagueElement({ id: customId, type: 'test' });
    
    expect(element.id).toBe(customId);
  });

  it('should update element data', () => {
    const element = new BaseLeagueElement({ type: 'test' });
    const oldUpdatedAt = element.updatedAt;
    
    // Wait a bit to ensure the timestamps are different
    setTimeout(() => {
      element.update({ type: 'updated' });
      expect(element.type).toBe('updated');
      expect(element.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt.getTime());
    }, 1);
  });
}); 
import { getOrderProgress } from '../src/services/orderTracking';

describe('Order Tracking Progress Calculation', () => {
  describe('Status to Progress Mapping', () => {
    it('maps CREATED to 0%', () => {
      const progress = getOrderProgress('CREATED');
      expect(progress.progress).toBe(0);
      expect(progress.statusLabel).toBe('Order Created');
    });

    it('maps PREPARING to 25%', () => {
      const progress = getOrderProgress('PREPARING');
      expect(progress.progress).toBe(25);
      expect(progress.statusLabel).toBe('Preparing Your Order');
    });

    it('maps READY to 50%', () => {
      const progress = getOrderProgress('READY');
      expect(progress.progress).toBe(50);
      expect(progress.statusLabel).toBe('Ready for Pickup');
    });

    it('maps ASSIGNED to 60%', () => {
      const progress = getOrderProgress('ASSIGNED');
      expect(progress.progress).toBe(60);
      expect(progress.statusLabel).toBe('Robot Assigned');
    });

    it('maps EN_ROUTE to 80%', () => {
      const progress = getOrderProgress('EN_ROUTE');
      expect(progress.progress).toBe(80);
      expect(progress.statusLabel).toBe('On The Way');
    });

    it('maps DELIVERED to 100%', () => {
      const progress = getOrderProgress('DELIVERED');
      expect(progress.progress).toBe(100);
      expect(progress.statusLabel).toBe('Delivered');
      expect(progress.estimatedTimeToNext).toBeUndefined();
    });

    it('maps CANCELLED to 0%', () => {
      const progress = getOrderProgress('CANCELLED');
      expect(progress.progress).toBe(0);
      expect(progress.statusLabel).toBe('Cancelled');
      expect(progress.estimatedTimeToNext).toBeUndefined();
    });
  });

  describe('Status Labels', () => {
    it('provides correct status labels for all statuses', () => {
      const statuses: Array<'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED'> = [
        'CREATED',
        'PREPARING',
        'READY',
        'ASSIGNED',
        'EN_ROUTE',
        'DELIVERED',
        'CANCELLED',
      ];

      statuses.forEach((status) => {
        const progress = getOrderProgress(status);
        expect(progress.statusLabel).toBeDefined();
        expect(typeof progress.statusLabel).toBe('string');
        expect(progress.statusLabel.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Estimated Time to Next', () => {
    it('provides estimated time for CREATED', () => {
      const progress = getOrderProgress('CREATED');
      expect(progress.estimatedTimeToNext).toBeDefined();
      expect(typeof progress.estimatedTimeToNext).toBe('number');
      expect(progress.estimatedTimeToNext).toBeGreaterThan(0);
    });

    it('provides estimated time for PREPARING', () => {
      const progress = getOrderProgress('PREPARING');
      expect(progress.estimatedTimeToNext).toBeDefined();
      expect(progress.estimatedTimeToNext).toBe(10);
    });

    it('provides estimated time for READY', () => {
      const progress = getOrderProgress('READY');
      expect(progress.estimatedTimeToNext).toBeDefined();
      expect(progress.estimatedTimeToNext).toBe(5);
    });

    it('provides estimated time for ASSIGNED', () => {
      const progress = getOrderProgress('ASSIGNED');
      expect(progress.estimatedTimeToNext).toBeDefined();
      expect(progress.estimatedTimeToNext).toBe(3);
    });

    it('provides estimated time for EN_ROUTE', () => {
      const progress = getOrderProgress('EN_ROUTE');
      expect(progress.estimatedTimeToNext).toBeDefined();
      expect(progress.estimatedTimeToNext).toBe(15);
    });

    it('does not provide estimated time for DELIVERED', () => {
      const progress = getOrderProgress('DELIVERED');
      expect(progress.estimatedTimeToNext).toBeUndefined();
    });

    it('does not provide estimated time for CANCELLED', () => {
      const progress = getOrderProgress('CANCELLED');
      expect(progress.estimatedTimeToNext).toBeUndefined();
    });
  });

  describe('Progress Range', () => {
    it('ensures progress is always between 0 and 100', () => {
      const statuses: Array<'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED'> = [
        'CREATED',
        'PREPARING',
        'READY',
        'ASSIGNED',
        'EN_ROUTE',
        'DELIVERED',
        'CANCELLED',
      ];

      statuses.forEach((status) => {
        const progress = getOrderProgress(status);
        expect(progress.progress).toBeGreaterThanOrEqual(0);
        expect(progress.progress).toBeLessThanOrEqual(100);
      });
    });

    it('ensures progress increases with order progression', () => {
      const created = getOrderProgress('CREATED').progress;
      const preparing = getOrderProgress('PREPARING').progress;
      const ready = getOrderProgress('READY').progress;
      const assigned = getOrderProgress('ASSIGNED').progress;
      const enRoute = getOrderProgress('EN_ROUTE').progress;
      const delivered = getOrderProgress('DELIVERED').progress;

      expect(preparing).toBeGreaterThan(created);
      expect(ready).toBeGreaterThan(preparing);
      expect(assigned).toBeGreaterThan(ready);
      expect(enRoute).toBeGreaterThan(assigned);
      expect(delivered).toBeGreaterThan(enRoute);
    });
  });
});


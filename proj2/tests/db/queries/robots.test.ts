import * as robotQueries from '../../../src/db/queries/robots';
import { Pool } from 'pg';
import { getPool } from '../../../src/db/client';

// Mock the database client
jest.mock('../../../src/db/client', () => ({
  getPool: jest.fn(),
}));

const mockGetPool = getPool as jest.MockedFunction<typeof getPool>;

describe('Robot Database Queries', () => {
  let mockPool: jest.Mocked<Pool>;
  let mockQuery: jest.Mock;

  beforeEach(() => {
    mockQuery = jest.fn();
    mockPool = {
      query: mockQuery,
    } as unknown as jest.Mocked<Pool>;
    mockGetPool.mockReturnValue(mockPool as Pool);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getAllRobots', () => {
    it('retrieves all robots from database', async () => {
      const mockRobots = [
        {
          id: 'robot-1',
          robot_id: 'RB-01',
          status: 'IDLE',
          battery_percent: 90,
          location_lat: '35.0',
          location_lng: '-78.0',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockRobots });

      const result = await robotQueries.getAllRobots();

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM robots ORDER BY created_at DESC');
      expect(result).toHaveLength(1);
      expect(result[0].robotId).toBe('RB-01');
      expect(result[0].location).toEqual({ lat: 35.0, lng: -78.0 });
    });
  });

  describe('getRobotById', () => {
    it('retrieves robot by id', async () => {
      const mockRobot = {
        id: 'robot-1',
        robot_id: 'RB-01',
        status: 'IDLE',
        battery_percent: 90,
        location_lat: '35.0',
        location_lng: '-78.0',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockRobot] });

      const result = await robotQueries.getRobotById('robot-1');

      expect(mockQuery).toHaveBeenCalledWith('SELECT * FROM robots WHERE id = $1', ['robot-1']);
      expect(result).toBeDefined();
      expect(result?.id).toBe('robot-1');
      expect(result?.robotId).toBe('RB-01');
    });

    it('returns null when robot not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await robotQueries.getRobotById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAvailableRobots', () => {
    it('retrieves only IDLE robots with battery > 20%', async () => {
      const mockRobots = [
        {
          id: 'robot-1',
          robot_id: 'RB-01',
          status: 'IDLE',
          battery_percent: 90,
          location_lat: '35.0',
          location_lng: '-78.0',
          created_at: new Date('2024-01-01'),
          updated_at: new Date('2024-01-01'),
        },
      ];

      mockQuery.mockResolvedValue({ rows: mockRobots });

      const result = await robotQueries.getAvailableRobots();

      expect(mockQuery).toHaveBeenCalledWith(
        "SELECT * FROM robots WHERE status = 'IDLE' AND battery_percent > 20 ORDER BY battery_percent DESC",
      );
      expect(result).toHaveLength(1);
    });

    it('returns empty array when no available robots', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await robotQueries.getAvailableRobots();

      expect(result).toHaveLength(0);
    });
  });

  describe('createRobot', () => {
    it('creates a new robot', async () => {
      const mockRobot = {
        id: 'robot-1',
        robot_id: 'RB-01',
        status: 'IDLE',
        battery_percent: 90,
        location_lat: '35.0',
        location_lng: '-78.0',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-01'),
      };

      mockQuery.mockResolvedValue({ rows: [mockRobot] });

      const result = await robotQueries.createRobot('RB-01', 'IDLE', 90, { lat: 35.0, lng: -78.0 });

      expect(mockQuery).toHaveBeenCalledWith(
        'INSERT INTO robots (robot_id, status, battery_percent, location_lat, location_lng) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        ['RB-01', 'IDLE', 90, 35.0, -78.0],
      );
      expect(result.robotId).toBe('RB-01');
      expect(result.location).toEqual({ lat: 35.0, lng: -78.0 });
    });
  });

  describe('updateRobot', () => {
    it('updates robot status', async () => {
      const mockRobot = {
        id: 'robot-1',
        robot_id: 'RB-01',
        status: 'EN_ROUTE',
        battery_percent: 90,
        location_lat: '35.0',
        location_lng: '-78.0',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockRobot] });

      const result = await robotQueries.updateRobot('robot-1', { status: 'EN_ROUTE' });

      expect(result?.status).toBe('EN_ROUTE');
    });

    it('updates robot location', async () => {
      const mockRobot = {
        id: 'robot-1',
        robot_id: 'RB-01',
        status: 'IDLE',
        battery_percent: 90,
        location_lat: '35.5',
        location_lng: '-78.5',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockRobot] });

      const result = await robotQueries.updateRobot('robot-1', { location: { lat: 35.5, lng: -78.5 } });

      expect(result?.location).toEqual({ lat: 35.5, lng: -78.5 });
    });

    it('updates multiple fields', async () => {
      const mockRobot = {
        id: 'robot-1',
        robot_id: 'RB-01',
        status: 'EN_ROUTE',
        battery_percent: 85,
        location_lat: '35.5',
        location_lng: '-78.5',
        created_at: new Date('2024-01-01'),
        updated_at: new Date('2024-01-02'),
      };

      mockQuery.mockResolvedValue({ rows: [mockRobot] });

      const result = await robotQueries.updateRobot('robot-1', {
        status: 'EN_ROUTE',
        batteryPercent: 85,
        location: { lat: 35.5, lng: -78.5 },
      });

      expect(result?.status).toBe('EN_ROUTE');
      expect(result?.batteryPercent).toBe(85);
      expect(result?.location).toEqual({ lat: 35.5, lng: -78.5 });
    });

    it('returns null when robot not found', async () => {
      mockQuery.mockResolvedValue({ rows: [] });

      const result = await robotQueries.updateRobot('nonexistent', { status: 'IDLE' });

      expect(result).toBeNull();
    });
  });

  describe('deleteRobot', () => {
    it('deletes robot successfully', async () => {
      mockQuery.mockResolvedValue({ rowCount: 1 });

      const result = await robotQueries.deleteRobot('robot-1');

      expect(mockQuery).toHaveBeenCalledWith('DELETE FROM robots WHERE id = $1', ['robot-1']);
      expect(result).toBe(true);
    });

    it('returns false when robot not found', async () => {
      mockQuery.mockResolvedValue({ rowCount: 0 });

      const result = await robotQueries.deleteRobot('nonexistent');

      expect(result).toBe(false);
    });
  });
});



import { EventEmitter } from 'events';

export type TelemetryRobot = {
  id: string;
  robotId: string;
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';
  batteryPercent: number;
  location: { lat: number; lng: number };
  speed?: number; // km/h
  distanceTraveled?: number; // meters
  lastUpdate?: string;
};

type TelemetryEvent = {
  type: 'snapshot' | 'update' | 'stopped';
  robots: TelemetryRobot[];
};

class TelemetryService extends EventEmitter {
  private robots: TelemetryRobot[] = [];
  private intervalId: NodeJS.Timeout | null = null;
  private running: boolean = false;
  private lastPositions: Map<string, { lat: number; lng: number; time: number }> = new Map();
  private totalDistance: Map<string, number> = new Map();

  initializeFleetIfEmpty(): void {
    if (this.robots.length > 0) return;
    const now = Date.now();
    this.robots = Array.from({ length: 5 }).map((_, idx) => {
      const robotId = `RB-SIM-${idx + 1}`;
      const location = { lat: 35.772 + Math.random() * 0.01, lng: -78.674 + Math.random() * 0.01 };
      this.lastPositions.set(robotId, { ...location, time: now });
      this.totalDistance.set(robotId, 0);
      return {
        id: `sim-${idx + 1}`,
        robotId,
        status: 'IDLE' as const,
        batteryPercent: 1 + Math.floor(Math.random() * 99),
        location,
        speed: 0,
        distanceTraveled: 0,
        lastUpdate: new Date(now).toISOString(),
      };
    });
  }

  start(): void {
    if (this.running) return;
    this.initializeFleetIfEmpty();
    this.running = true;
    this.emitSnapshot();
    this.intervalId = setInterval(() => this.tick(), 2000);
  }

  stop(): void {
    if (this.intervalId) clearInterval(this.intervalId);
    this.intervalId = null;
    this.running = false;
  }

  getSnapshot(): TelemetryRobot[] {
    this.initializeFleetIfEmpty();
    return this.robots.map((r) => ({ ...r, location: { ...r.location } }));
  }

  issueStop(robotId: string): void {
    this.initializeFleetIfEmpty();
    const robot = this.robots.find((r) => r.id === robotId || r.robotId === robotId);
    if (!robot) return;
    robot.status = 'OFFLINE';
    this.emitEvent('stopped');
  }

  /**
   * Update telemetry robot status by index (0-4) to sync with database robot assignments
   */
  updateRobotStatusByIndex(index: number, status: TelemetryRobot['status']): void {
    this.initializeFleetIfEmpty();
    if (index >= 0 && index < this.robots.length) {
      this.robots[index].status = status;
      this.robots[index].lastUpdate = new Date().toISOString();
      this.emitEvent('update');
    }
  }

  /**
   * Sync database robot states to telemetry robots
   * Maps first 5 database robots to telemetry robots by index
   */
  syncWithDatabaseRobots(databaseRobots: Array<{ status: TelemetryRobot['status'] }>): void {
    this.initializeFleetIfEmpty();
    let updated = false;
    for (let i = 0; i < Math.min(this.robots.length, databaseRobots.length); i++) {
      if (this.robots[i].status !== databaseRobots[i].status) {
        this.robots[i].status = databaseRobots[i].status;
        this.robots[i].lastUpdate = new Date().toISOString();
        updated = true;
      }
    }
    if (updated) {
      this.emitEvent('update');
    }
  }

  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    // Haversine formula for distance in meters
    const R = 6371000; // Earth radius in meters
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private tick(): void {
    const now = Date.now();
    const timeDelta = 2; // seconds (update interval)

    // Random walk and battery drain for EN_ROUTE/ASSIGNED; minor drift otherwise
    this.robots = this.robots.map((r) => {
      if (r.status === 'OFFLINE' || r.status === 'MAINTENANCE') {
        return { ...r, speed: 0, lastUpdate: new Date(now).toISOString() };
      }

      const moveScale = r.status === 'EN_ROUTE' || r.status === 'ASSIGNED' ? 0.0005 : 0.0001;
      const dLat = (Math.random() - 0.5) * moveScale;
      const dLng = (Math.random() - 0.5) * moveScale;
      const newLocation = { lat: r.location.lat + dLat, lng: r.location.lng + dLng };
      const newBattery = Math.max(0, r.batteryPercent - (r.status === 'EN_ROUTE' ? 1 : Math.random() < 0.3 ? 1 : 0));
      const newStatus = newBattery === 0 ? 'OFFLINE' : r.status;

      // Calculate speed and distance
      const lastPos = this.lastPositions.get(r.robotId);
      let speed = 0;
      let distanceTraveled = this.totalDistance.get(r.robotId) || 0;

      if (lastPos) {
        const distance = this.calculateDistance(lastPos.lat, lastPos.lng, newLocation.lat, newLocation.lng);
        distanceTraveled += distance;
        speed = (distance / timeDelta) * 3.6; // Convert m/s to km/h
      }

      this.lastPositions.set(r.robotId, { ...newLocation, time: now });
      this.totalDistance.set(r.robotId, distanceTraveled);

      return {
        ...r,
        status: newStatus,
        batteryPercent: newBattery,
        location: newLocation,
        speed: Math.round(speed * 10) / 10, // Round to 1 decimal
        distanceTraveled: Math.round(distanceTraveled),
        lastUpdate: new Date(now).toISOString(),
      };
    });

    // Randomly toggle one IDLE robot to EN_ROUTE to show motion (but don't override ASSIGNED robots)
    // Only change robots that are truly IDLE, not those that might be synced from database
    if (Math.random() < 0.3) {
      const candidates = this.robots.filter((r) => r.status === 'IDLE');
      if (candidates.length > 0) {
        const pick = candidates[Math.floor(Math.random() * candidates.length)];
        pick.status = 'EN_ROUTE';
      }
    }
    this.emitEvent('update');
  }

  private emitSnapshot(): void {
    this.emit('telemetry', { type: 'snapshot', robots: this.getSnapshot() } as TelemetryEvent);
  }

  private emitEvent(type: TelemetryEvent['type']): void {
    this.emit('telemetry', { type, robots: this.getSnapshot() } as TelemetryEvent);
  }
}

export const telemetryService = new TelemetryService();

export function maybeStartTelemetryFromEnv(): void {
  if (process.env.ENABLE_TELEMETRY_SIM === '1') {
    telemetryService.start();
  }
}

export type { TelemetryEvent };



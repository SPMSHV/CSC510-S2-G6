import { useEffect, useState } from 'react';
import Header from '../components/Header';

type Robot = {
  id: string;
  robotId: string;
  status: 'IDLE' | 'ASSIGNED' | 'EN_ROUTE' | 'CHARGING' | 'MAINTENANCE' | 'OFFLINE';
  batteryPercent: number;
  location: { lat: number; lng: number };
  speed?: number;
  distanceTraveled?: number;
  lastUpdate?: string;
};

const getStatusColor = (status: Robot['status']) => {
  switch (status) {
    case 'IDLE':
      return 'bg-gray-100 text-gray-800';
    case 'ASSIGNED':
      return 'bg-blue-100 text-blue-800';
    case 'EN_ROUTE':
      return 'bg-green-100 text-green-800';
    case 'CHARGING':
      return 'bg-yellow-100 text-yellow-800';
    case 'MAINTENANCE':
      return 'bg-orange-100 text-orange-800';
    case 'OFFLINE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusIcon = (status: Robot['status']) => {
  switch (status) {
    case 'IDLE':
      return '⏸️';
    case 'ASSIGNED':
      return '📍';
    case 'EN_ROUTE':
      return '🚀';
    case 'CHARGING':
      return '🔋';
    case 'MAINTENANCE':
      return '🔧';
    case 'OFFLINE':
      return '❌';
    default:
      return '🤖';
  }
};

export default function FleetDashboardPage() {
  const [robots, setRobots] = useState<Robot[]>([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let es: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout;

    const connect = () => {
      setError(null);
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const streamUrl = `${API_BASE_URL}/telemetry/stream`;
      es = new EventSource(streamUrl);
      
      es.onopen = () => {
        setConnected(true);
        setError(null);
      };

      es.addEventListener('telemetry', (evt) => {
        try {
          const data = JSON.parse((evt as MessageEvent).data) as Robot[];
          setRobots(data);
          setConnected(true);
          setError(null);
        } catch (err) {
          setError('Failed to parse telemetry data');
        }
      });

      es.onerror = (err) => {
        setConnected(false);
        const errorMessage = es?.readyState === EventSource.CONNECTING 
          ? 'Connecting to telemetry stream...' 
          : es?.readyState === EventSource.CLOSED
          ? 'Connection closed. Retrying...'
          : 'Failed to connect to telemetry stream. Make sure the backend server is running.';
        setError(errorMessage);
        es?.close();
        reconnectTimeout = setTimeout(() => {
          connect();
        }, 2000);
      };
    };

    connect();
    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      es?.close();
    };
  }, []);

  const stopRobot = async (id: string) => {
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${API_BASE_URL}/telemetry/robots/${id}/stop`, { method: 'POST' });
      if (!response.ok) {
        setError(`Failed to stop robot: ${response.statusText}`);
      }
    } catch (err) {
      setError(`Failed to send stop command: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  if (robots.length === 0 && !error) {
    return (
      <div>
        <Header />
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="text-4xl mb-4">🤖</div>
              <div className="text-lg text-gray-600">Loading fleet telemetry...</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Fleet Dashboard</h1>
            <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${connected ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                {connected ? 'Connected' : 'Disconnected'}
              </div>
            </div>
          </div>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm mb-4">{error}</div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {robots.map((r) => (
            <div key={r.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-4 sm:p-6">
              {/* Robot Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getStatusIcon(r.status)}</span>
                  <div className="font-semibold text-lg">{r.robotId}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded font-medium ${getStatusColor(r.status)}`}>
                  {r.status}
                </span>
              </div>

              {/* Battery */}
              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">Battery</span>
                  <span className={`text-sm font-semibold ${r.batteryPercent > 50 ? 'text-green-600' : r.batteryPercent > 20 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {r.batteryPercent}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all ${r.batteryPercent > 50 ? 'bg-green-500' : r.batteryPercent > 20 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${r.batteryPercent}%` }}
                  />
                </div>
              </div>

              {/* Location */}
              <div className="mb-3 text-sm text-gray-600">
                <div className="font-medium text-gray-700 mb-1">Location</div>
                <div className="font-mono text-xs">
                  {r.location.lat.toFixed(5)}, {r.location.lng.toFixed(5)}
                </div>
              </div>

              {/* Speed and Distance */}
              {(r.speed !== undefined || r.distanceTraveled !== undefined) && (
                <div className="grid grid-cols-2 gap-3 mb-3 text-sm">
                  {r.speed !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Speed</div>
                      <div className="font-semibold text-gray-900">{r.speed.toFixed(1)} km/h</div>
                    </div>
                  )}
                  {r.distanceTraveled !== undefined && (
                    <div>
                      <div className="text-gray-500 text-xs mb-1">Distance</div>
                      <div className="font-semibold text-gray-900">
                        {r.distanceTraveled >= 1000 ? `${(r.distanceTraveled / 1000).toFixed(2)} km` : `${r.distanceTraveled} m`}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Last Update */}
              {r.lastUpdate && (
                <div className="text-xs text-gray-400 mb-3">
                  Updated: {new Date(r.lastUpdate).toLocaleTimeString()}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-100">
                <button
                  onClick={() => stopRobot(r.id)}
                  className="flex-1 px-3 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={r.status === 'OFFLINE'}
                  title={r.status === 'OFFLINE' ? 'Robot is already offline' : 'Send stop command'}
                >
                  {r.status === 'OFFLINE' ? 'Already Offline' : 'Stop Robot'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



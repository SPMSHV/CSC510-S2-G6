import type { Robot } from '../types';

interface RobotInfoProps {
  robot: Robot | null;
  estimatedDeliveryTime?: number;
}

export default function RobotInfo({ robot, estimatedDeliveryTime }: RobotInfoProps) {
  if (!robot) {
    return null;
  }

  const getBatteryColor = (percent: number) => {
    if (percent >= 50) return 'bg-green-500';
    if (percent >= 20) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getStatusColor = (status: Robot['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return 'bg-blue-100 text-blue-800';
      case 'EN_ROUTE':
        return 'bg-primary-100 text-primary-800';
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

  const getStatusLabel = (status: Robot['status']) => {
    switch (status) {
      case 'ASSIGNED':
        return 'Assigned';
      case 'EN_ROUTE':
        return 'On The Way';
      case 'CHARGING':
        return 'Charging';
      case 'MAINTENANCE':
        return 'Maintenance';
      case 'OFFLINE':
        return 'Offline';
      default:
        return 'Idle';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center gap-4">
        {/* Robot Icon */}
        <div className="flex-shrink-0">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full flex items-center justify-center">
            <span className="text-3xl">🤖</span>
          </div>
        </div>

        {/* Robot Info */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-semibold text-gray-900">Robot {robot.robotId}</h3>
            <span
              className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(robot.status)}`}
            >
              {getStatusLabel(robot.status)}
            </span>
          </div>

          {/* Battery Indicator */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm text-gray-600">Battery:</span>
              <span className="text-sm font-medium text-gray-900">{robot.batteryPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${getBatteryColor(robot.batteryPercent)}`}
                style={{ width: `${robot.batteryPercent}%` }}
              />
            </div>
          </div>

          {/* Estimated Delivery Time */}
          {estimatedDeliveryTime && robot.status === 'EN_ROUTE' && (
            <div className="text-sm text-gray-600">
              <span className="font-medium">Estimated arrival:</span>{' '}
              {estimatedDeliveryTime} minutes
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


import type { Order } from '../types';

interface VendorOrderCardProps {
  order: Order;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => Promise<void>;
  onViewDetails: (order: Order) => void;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'CREATED':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'PREPARING':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'READY':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-800 border-purple-200';
    case 'EN_ROUTE':
      return 'bg-indigo-100 text-indigo-800 border-indigo-200';
    case 'DELIVERED':
      return 'bg-gray-100 text-gray-800 border-gray-200';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800 border-red-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const getStatusIcon = (status: Order['status']) => {
  switch (status) {
    case 'CREATED':
      return '🆕';
    case 'PREPARING':
      return '👨‍🍳';
    case 'READY':
      return '✅';
    case 'ASSIGNED':
      return '🤖';
    case 'EN_ROUTE':
      return '🚀';
    case 'DELIVERED':
      return '✓';
    case 'CANCELLED':
      return '❌';
    default:
      return '📦';
  }
};

export default function VendorOrderCard({ order, onStatusUpdate, onViewDetails }: VendorOrderCardProps) {
  const orderDate = new Date(order.createdAt);
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  const getNextStatus = (): Order['status'] | null => {
    switch (order.status) {
      case 'CREATED':
        return 'PREPARING';
      case 'PREPARING':
        return 'READY';
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus();
  const canTransition = nextStatus !== null;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 border-l-4 border-primary-500">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">{getStatusIcon(order.status)}</span>
            <h3 className="text-lg font-semibold text-gray-900">Order #{order.id.slice(0, 8)}</h3>
          </div>
          <p className="text-xs text-gray-500">
            {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
          </p>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(order.status)}`}>
          {order.status}
        </span>
      </div>

      {/* Order Summary */}
      <div className="mb-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Items:</span>
          <span className="font-medium text-gray-900">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Total:</span>
          <span className="font-bold text-gray-900">${order.total.toFixed(2)}</span>
        </div>
        <div className="flex items-start gap-2 text-sm">
          <span className="text-gray-600">📍</span>
          <span className="text-gray-700 flex-1">{order.deliveryLocation}</span>
        </div>
      </div>

      {/* Robot Assignment Indicator */}
      {order.robotId && (
        <div className="mb-4 bg-primary-50 border border-primary-200 rounded-lg p-2">
          <div className="flex items-center gap-2 text-sm">
            <span>🤖</span>
            <span className="text-primary-800 font-medium">Robot Assigned</span>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <button
          onClick={() => onViewDetails(order)}
          className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          View Details
        </button>
        {canTransition && (
          <button
            onClick={() => nextStatus && onStatusUpdate(order.id, nextStatus)}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
          >
            → {nextStatus}
          </button>
        )}
      </div>
    </div>
  );
}


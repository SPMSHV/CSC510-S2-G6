import type { Order } from '../types';

interface OrderDetailsModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate: (orderId: string, newStatus: Order['status']) => Promise<void>;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'CREATED':
      return 'bg-blue-100 text-blue-800';
    case 'PREPARING':
      return 'bg-yellow-100 text-yellow-800';
    case 'READY':
      return 'bg-green-100 text-green-800';
    case 'ASSIGNED':
      return 'bg-purple-100 text-purple-800';
    case 'EN_ROUTE':
      return 'bg-indigo-100 text-indigo-800';
    case 'DELIVERED':
      return 'bg-gray-100 text-gray-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export default function OrderDetailsModal({ order, isOpen, onClose, onStatusUpdate }: OrderDetailsModalProps) {
  if (!isOpen) return null;

  const orderDate = new Date(order.createdAt);
  const updatedDate = new Date(order.updatedAt);

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

  const handleStatusUpdate = async () => {
    if (nextStatus) {
      await onStatusUpdate(order.id, nextStatus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Order Details</h2>
              <p className="text-sm text-gray-500 mt-1">Order #{order.id.slice(0, 8)}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Status Badge */}
          <div className="mb-6">
            <span className={`px-4 py-2 text-sm font-medium rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>

          {/* Order Items */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Items</h3>
            <div className="space-y-3">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{item.name}</div>
                    <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-2xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Information</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <span className="text-xl">📍</span>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{order.deliveryLocation}</div>
                  {order.deliveryLocationLat && order.deliveryLocationLng && (
                    <div className="text-sm text-gray-500 mt-1">
                      Coordinates: {order.deliveryLocationLat.toFixed(5)}, {order.deliveryLocationLng.toFixed(5)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Robot Assignment (if applicable) */}
          {order.robotId && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Robot Assignment</h3>
              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <div className="font-medium text-primary-900">Robot Assigned</div>
                    <div className="text-sm text-primary-700">Robot ID: {order.robotId.slice(0, 8)}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mb-6 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-gray-500">Created At</div>
              <div className="font-medium text-gray-900">
                {orderDate.toLocaleDateString()} {orderDate.toLocaleTimeString()}
              </div>
            </div>
            <div>
              <div className="text-gray-500">Last Updated</div>
              <div className="font-medium text-gray-900">
                {updatedDate.toLocaleDateString()} {updatedDate.toLocaleTimeString()}
              </div>
            </div>
          </div>

          {/* Actions */}
          {canTransition && (
            <div className="pt-6 border-t">
              <button
                onClick={handleStatusUpdate}
                className="w-full px-6 py-3 text-base font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
              >
                Update Status: {order.status} → {nextStatus}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


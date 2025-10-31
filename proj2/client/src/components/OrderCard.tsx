import { useNavigate } from 'react-router-dom';
import type { Order } from '../types';

interface OrderCardProps {
  order: Order;
}

const getStatusColor = (status: Order['status']) => {
  switch (status) {
    case 'CREATED':
      return 'bg-blue-100 text-blue-800';
    case 'PREPARING':
      return 'bg-yellow-100 text-yellow-800';
    case 'READY':
      return 'bg-purple-100 text-purple-800';
    case 'ASSIGNED':
      return 'bg-indigo-100 text-indigo-800';
    case 'EN_ROUTE':
      return 'bg-primary-100 text-primary-800';
    case 'DELIVERED':
      return 'bg-green-100 text-green-800';
    case 'CANCELLED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getStatusLabel = (status: Order['status']) => {
  switch (status) {
    case 'CREATED':
      return 'Created';
    case 'PREPARING':
      return 'Preparing';
    case 'READY':
      return 'Ready';
    case 'ASSIGNED':
      return 'Robot Assigned';
    case 'EN_ROUTE':
      return 'On The Way';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    default:
      return status;
  }
};

export default function OrderCard({ order }: OrderCardProps) {
  const navigate = useNavigate();
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const orderDate = new Date(order.createdAt);

  const handleClick = () => {
    navigate(`/orders/${order.id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">Order #{order.id.slice(0, 8)}</h3>
          <p className="text-sm text-gray-500">
            {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}
        >
          {getStatusLabel(order.status)}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="text-sm text-gray-600">
          <span className="font-medium">Items:</span> {itemCount} item{itemCount !== 1 ? 's' : ''}
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">Delivery to:</span> {order.deliveryLocation}
        </div>
        {order.robotId && (
          <div className="text-sm text-gray-600">
            <span className="font-medium">Robot:</span> Assigned
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t">
        <span className="text-lg font-bold text-gray-900">${order.total.toFixed(2)}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          className="text-primary-600 hover:text-primary-700 font-medium text-sm"
        >
          View Details →
        </button>
      </div>
    </div>
  );
}


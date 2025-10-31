import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getOrderTracking } from '../lib/api';
import type { OrderTrackingInfo } from '../types';
import Header from '../components/Header';
import OrderProgressBar from '../components/OrderProgressBar';
import RobotInfo from '../components/RobotInfo';

export default function OrderTrackingPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [trackingInfo, setTrackingInfo] = useState<OrderTrackingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/');
      return;
    }

    if (!id) {
      navigate('/orders');
      return;
    }
  }, [isAuthenticated, authLoading, id, navigate]);

  useEffect(() => {
    if (!id) return;

    const fetchTrackingInfo = async () => {
      try {
        setError(null);
        const data = await getOrderTracking(id);
        setTrackingInfo(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load order tracking');
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingInfo();
  }, [id]);

  // Set up polling - refresh every 10 seconds if order is not completed
  useEffect(() => {
    if (!id) return;
    if (!trackingInfo) return;
    if (trackingInfo.order.status === 'DELIVERED' || trackingInfo.order.status === 'CANCELLED') {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const data = await getOrderTracking(id);
        setTrackingInfo(data);
      } catch (err) {
        // Silently fail polling errors, don't show error state
        console.error('Failed to poll order tracking:', err);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [id, trackingInfo?.order.status]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading order tracking...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <svg
                className="h-5 w-5 text-red-400"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-red-800">Error loading order</h3>
                <p className="mt-1 text-sm text-red-700">{error || 'Order not found'}</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/orders')}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { order, progress, robot, estimatedDeliveryTime } = trackingInfo;
  const orderDate = new Date(order.createdAt);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/orders')}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900 transition-colors"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Orders
        </button>

        {/* Order Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Order #{order.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-500">
                Placed on {orderDate.toLocaleDateString()} at {orderDate.toLocaleTimeString()}
              </p>
            </div>
            <span
              className={`px-3 py-1 text-sm font-medium rounded-full ${
                order.status === 'DELIVERED'
                  ? 'bg-green-100 text-green-800'
                  : order.status === 'CANCELLED'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-primary-100 text-primary-800'
              }`}
            >
              {progress.statusLabel}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Progress</h2>
          <OrderProgressBar progress={progress} />
        </div>

        {/* Robot Info */}
        {robot && (
          <div className="mb-6">
            <RobotInfo robot={robot} estimatedDeliveryTime={estimatedDeliveryTime} />
          </div>
        )}

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Details</h2>

          {/* Items */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Items</h3>
            <div className="space-y-2">
              {order.items.map((item, index) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.name} × {item.quantity}
                  </span>
                  <span className="font-medium text-gray-900">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t pt-4 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-gray-900">Total</span>
              <span className="text-xl font-bold text-gray-900">${order.total.toFixed(2)}</span>
            </div>
          </div>

          {/* Delivery Location */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Delivery Location</h3>
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-gray-400 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span className="text-gray-900">{order.deliveryLocation}</span>
            </div>
          </div>
        </div>

        {/* Estimated Delivery Time */}
        {estimatedDeliveryTime && order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <svg
                className="w-5 h-5 text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm font-medium text-primary-900">
                Estimated delivery in {estimatedDeliveryTime} minutes
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


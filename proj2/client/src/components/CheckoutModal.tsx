import { useState } from 'react';
import type { FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../lib/api';
import type { CartItem } from '../context/CartContext';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  items: CartItem[];
  restaurantId: string;
  vendorId: string;
  total: number;
}

export default function CheckoutModal({
  isOpen,
  onClose,
  onSuccess,
  items,
  restaurantId: _restaurantId,
  vendorId,
  total,
}: CheckoutModalProps) {
  const { user } = useAuth();
  const [deliveryLocation, setDeliveryLocation] = useState('');
  const [deliveryLocationLat, setDeliveryLocationLat] = useState<number | undefined>(undefined);
  const [deliveryLocationLng, setDeliveryLocationLng] = useState<number | undefined>(undefined);
  const [useDefaultCoords, setUseDefaultCoords] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Default coordinates for NC State University campus (for testing)
  const DEFAULT_LAT = 35.7871;
  const DEFAULT_LNG = -78.6701;

  if (!isOpen) return null;

  if (!user) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Login Required</h2>
          <p className="text-gray-600 mb-4">Please log in to place an order.</p>
          <button
            onClick={onClose}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!deliveryLocation.trim()) {
      setError('Please enter a delivery location');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const orderItems = items.map((item) => ({
        name: item.menuItem.name,
        quantity: item.quantity,
        price: item.menuItem.price,
      }));

      await createOrder({
        userId: user.id,
        vendorId,
        items: orderItems,
        deliveryLocation: deliveryLocation.trim(),
        deliveryLocationLat: useDefaultCoords ? DEFAULT_LAT : deliveryLocationLat,
        deliveryLocationLng: useDefaultCoords ? DEFAULT_LNG : deliveryLocationLng,
      });

      // Show success message before closing
      alert('Order placed successfully! Your order is being prepared.');
      
      onSuccess();
      setDeliveryLocation('');
      setDeliveryLocationLat(undefined);
      setDeliveryLocationLng(undefined);
      setUseDefaultCoords(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">Place Order</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Close"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Order Summary</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <div key={item.menuItem.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">
                    {item.menuItem.name} × {item.quantity}
                  </span>
                  <span className="font-medium">
                    ${(item.menuItem.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t flex justify-between items-center font-bold text-lg">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label htmlFor="deliveryLocation" className="block text-sm font-medium text-gray-700 mb-1">
                Delivery Location *
              </label>
              <input
                id="deliveryLocation"
                type="text"
                value={deliveryLocation}
                onChange={(e) => setDeliveryLocation(e.target.value)}
                required
                placeholder="e.g., Engineering Building, Room 201"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">
                Enter the building and room number where you'd like your order delivered
              </p>
            </div>

            {/* Coordinates Section */}
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  type="checkbox"
                  id="useDefaultCoords"
                  checked={useDefaultCoords}
                  onChange={(e) => {
                    setUseDefaultCoords(e.target.checked);
                    if (e.target.checked) {
                      setDeliveryLocationLat(undefined);
                      setDeliveryLocationLng(undefined);
                    }
                  }}
                  className="mr-2 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="useDefaultCoords" className="text-sm font-medium text-gray-700">
                  Use default coordinates (NC State Campus)
                </label>
              </div>
              
              {!useDefaultCoords && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label htmlFor="deliveryLat" className="block text-xs font-medium text-gray-700 mb-1">
                      Latitude
                    </label>
                    <input
                      id="deliveryLat"
                      type="number"
                      step="any"
                      value={deliveryLocationLat ?? ''}
                      onChange={(e) => setDeliveryLocationLat(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="35.7871"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                  <div>
                    <label htmlFor="deliveryLng" className="block text-xs font-medium text-gray-700 mb-1">
                      Longitude
                    </label>
                    <input
                      id="deliveryLng"
                      type="number"
                      step="any"
                      value={deliveryLocationLng ?? ''}
                      onChange={(e) => setDeliveryLocationLng(e.target.value ? parseFloat(e.target.value) : undefined)}
                      placeholder="-78.6701"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm"
                    />
                  </div>
                </div>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {useDefaultCoords 
                  ? `Using default coordinates: ${DEFAULT_LAT}, ${DEFAULT_LNG} (NC State Campus)`
                  : 'Enter custom coordinates or use default for testing'}
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}


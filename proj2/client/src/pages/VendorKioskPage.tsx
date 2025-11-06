import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getVendorOrders, updateOrderStatus } from '../lib/api';
import type { Order } from '../types';
import Header from '../components/Header';
import VendorOrderCard from '../components/VendorOrderCard';
import OrderDetailsModal from '../components/OrderDetailsModal';

type OrderStatusFilter = 'ALL' | 'CREATED' | 'PREPARING' | 'READY' | 'ASSIGNED' | 'EN_ROUTE' | 'DELIVERED' | 'CANCELLED';

export default function VendorKioskPage() {
  const navigate = useNavigate();
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<OrderStatusFilter>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && (!isAuthenticated || (user?.role !== 'VENDOR' && user?.role !== 'ADMIN'))) {
      navigate('/');
      return;
    }
  }, [isAuthenticated, authLoading, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || (user?.role !== 'VENDOR' && user?.role !== 'ADMIN')) {
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getVendorOrders();
        setOrders(data);
        setFilteredOrders(data);
        // Log for debugging
        if (data.length === 0) {
          console.log('No orders found for vendor. Make sure you have orders assigned to your vendor account.');
          console.log('Vendor user ID:', user?.id);
        } else {
          console.log(`Loaded ${data.length} orders for vendor`);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load orders';
        setError(errorMessage);
        console.error('Error fetching vendor orders:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();

    // Poll for new orders every 10 seconds
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, user]);

  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter((order) => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      // Refresh orders after status update
      const updatedOrders = await getVendorOrders();
      setOrders(updatedOrders);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update order status');
    }
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setIsDetailsModalOpen(true);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading orders...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error && orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <h3 className="text-sm font-medium text-red-800">Error loading orders</h3>
            <p className="mt-1 text-sm text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const statusCounts = {
    ALL: orders.length,
    CREATED: orders.filter((o) => o.status === 'CREATED').length,
    PREPARING: orders.filter((o) => o.status === 'PREPARING').length,
    READY: orders.filter((o) => o.status === 'READY').length,
    ASSIGNED: orders.filter((o) => o.status === 'ASSIGNED').length,
    EN_ROUTE: orders.filter((o) => o.status === 'EN_ROUTE').length,
    DELIVERED: orders.filter((o) => o.status === 'DELIVERED').length,
    CANCELLED: orders.filter((o) => o.status === 'CANCELLED').length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Vendor Kiosk</h1>
          <p className="text-gray-600">Manage and track your restaurant orders</p>
        </div>

        {/* Status Filter Tabs */}
        <div className="mb-6 bg-white rounded-lg shadow-sm p-2">
          <div className="flex flex-wrap gap-2">
            {(['ALL', 'CREATED', 'PREPARING', 'READY', 'ASSIGNED', 'EN_ROUTE', 'DELIVERED'] as OrderStatusFilter[]).map(
              (status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {status} {statusCounts[status] > 0 && `(${statusCounts[status]})`}
                </button>
              )
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">{error}</p>
          </div>
        )}

        {/* Orders Grid */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600 mb-4">
              {statusFilter === 'ALL' ? 'You don\'t have any orders yet.' : `No orders with status "${statusFilter}"`}
            </p>
            {statusFilter === 'ALL' && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-left max-w-2xl mx-auto">
                <h4 className="font-semibold text-blue-900 mb-2">💡 To see orders:</h4>
                <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
                  <li>Make sure you're logged in as a vendor account</li>
                  <li>Orders must be created with your vendor user ID as the vendorId</li>
                  <li>If using seeded data, log in with one of the seeded vendor accounts:
                    <ul className="ml-4 mt-1 space-y-0.5 list-disc list-inside text-blue-700">
                      <li>pizza@campusbot.edu (password: vendor123)</li>
                      <li>cafe@campusbot.edu (password: vendor123)</li>
                      <li>burger@campusbot.edu (password: vendor123)</li>
                    </ul>
                  </li>
                  <li>Or create a test order as a student from a restaurant that uses your vendor account</li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOrders.map((order) => (
              <VendorOrderCard
                key={order.id}
                order={order}
                onStatusUpdate={handleStatusUpdate}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        )}
      </main>

      {/* Order Details Modal */}
      {selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsModalOpen}
          onClose={() => {
            setIsDetailsModalOpen(false);
            setSelectedOrder(null);
          }}
          onStatusUpdate={handleStatusUpdate}
        />
      )}
    </div>
  );
}


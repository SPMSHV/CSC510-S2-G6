import type { MenuItem } from '../types';
import { useCart } from '../context/CartContext';

interface MenuItemCardProps {
  menuItem: MenuItem;
  restaurantId: string;
}

export default function MenuItemCard({ menuItem, restaurantId }: MenuItemCardProps) {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart(menuItem, restaurantId, 1);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{menuItem.name}</h3>
          {menuItem.description && (
            <p className="text-sm text-gray-600 mt-1">{menuItem.description}</p>
          )}
        </div>
        <div className="ml-4">
          <span className="text-lg font-bold text-gray-900">
            ${menuItem.price.toFixed(2)}
          </span>
        </div>
      </div>
      
      {menuItem.category && (
        <div className="mb-3">
          <span className="inline-block px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded">
            {menuItem.category}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between mt-3">
        <div className="flex items-center">
          {menuItem.available ? (
            <span className="text-sm text-green-600 font-medium">Available</span>
          ) : (
            <span className="text-sm text-red-600 font-medium">Unavailable</span>
          )}
        </div>
        <button
          onClick={handleAddToCart}
          disabled={!menuItem.available}
          className="px-4 py-2 bg-primary-600 text-white text-sm font-medium rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}



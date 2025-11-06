import { Link } from 'react-router-dom';
import type { Restaurant } from '../types';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link
      to={`/restaurant/${restaurant.id}`}
      className="block bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      aria-label={`View menu for ${restaurant.name}`}
    >
      <div className="aspect-video bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center" aria-hidden="true">
        <div className="text-white text-4xl font-bold">
          {restaurant.name.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1" aria-label={`Restaurant: ${restaurant.name}`}>{restaurant.name}</h3>
        {restaurant.description && (
          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{restaurant.description}</p>
        )}
        {restaurant.location && (
          <div className="flex items-center text-xs text-gray-500">
            <svg
              className="w-4 h-4 mr-1"
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
            <span>Available on campus</span>
          </div>
        )}
      </div>
    </Link>
  );
}


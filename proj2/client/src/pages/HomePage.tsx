import { useState, useEffect } from 'react';
import { getRestaurants } from '../lib/api';
import type { Restaurant } from '../types';
import SearchBar from '../components/SearchBar';
import RestaurantCard from '../components/RestaurantCard';
import Header from '../components/Header';

export default function HomePage() {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [filteredRestaurants, setFilteredRestaurants] = useState<Restaurant[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getRestaurants();
        setRestaurants(data);
        setFilteredRestaurants(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRestaurants(restaurants);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = restaurants.filter(
      (restaurant) =>
        restaurant.name.toLowerCase().includes(query) ||
        restaurant.description?.toLowerCase().includes(query)
    );
    setFilteredRestaurants(filtered);
  }, [searchQuery, restaurants]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading restaurants...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const retryFetch = () => {
    setError(null);
    setLoading(true);
    getRestaurants()
      .then((data) => {
        setRestaurants(data);
        setFilteredRestaurants(data);
        setError(null);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load restaurants');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex">
              <div className="flex-shrink-0">
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
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-red-800">Error loading restaurants</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p className="mb-3">{error}</p>
                  <div className="mt-4 bg-red-100 rounded p-3 text-xs">
                    <p className="font-semibold mb-1">Troubleshooting:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Make sure the backend server is running on port 3000</li>
                      <li>Check that the API is accessible at: <code className="bg-red-200 px-1 rounded">http://localhost:3000/api</code></li>
                      <li>Verify the backend server has CORS enabled</li>
                      <li>Check the browser console for more details</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    onClick={retryFetch}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    Retry
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8" role="main" aria-label="Restaurant browsing">
        {/* Search Bar */}
        <div className="mb-6">
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>

        {/* Results Header */}
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900" id="restaurants-heading">
            {searchQuery ? `Search Results (${filteredRestaurants.length})` : 'Available Restaurants'}
          </h2>
          {searchQuery && filteredRestaurants.length === 0 && (
            <p className="mt-2 text-gray-600" role="status" aria-live="polite">
              No restaurants found matching your search.
            </p>
          )}
        </div>

        {/* Restaurant Grid */}
        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list" aria-labelledby="restaurants-heading">
            {filteredRestaurants.map((restaurant) => (
              <div key={restaurant.id} role="listitem">
                <RestaurantCard restaurant={restaurant} />
              </div>
            ))}
          </div>
        ) : !loading && !searchQuery ? (
          <div className="text-center py-12" role="status" aria-live="polite">
            <p className="text-gray-600">No restaurants available at this time.</p>
          </div>
        ) : null}
      </main>
    </div>
  );
}


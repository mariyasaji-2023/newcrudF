import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import resImage from '/images/res4.jpg';
import dishImage from '/images/dish2.jpg';

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

// Cache keys - defined locally
const CACHE_KEYS = {
  TOTAL_RESTAURANTS: 'totalRestaurants',
  TOTAL_DISHES: 'totalDishes',
};

// Cache duration in milliseconds (5 minutes)
const CACHE_DURATION = 15 * 60 * 1000;

const Home = () => {
  const navigate = useNavigate();
  const [data, setData] = useState({ totalRestaurants: 0, totalDishes: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force refresh

  // Function to check if cache is valid
  const isCacheValid = (key) => {
    const timestamp = localStorage.getItem(`${key}_timestamp`);
    if (!timestamp) return false;
    return (Date.now() - parseInt(timestamp)) < CACHE_DURATION;
  };

  // Function to get data from cache
  const getFromCache = (key) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error('Error reading from cache:', error);
      return null;
    }
  };

  // Function to set data in cache
  const setInCache = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error setting cache:', error);
    }
  };

  // Manual refresh function
  const handleRefresh = () => {
    // Clear the relevant caches
    localStorage.removeItem(CACHE_KEYS.TOTAL_RESTAURANTS);
    localStorage.removeItem(`${CACHE_KEYS.TOTAL_RESTAURANTS}_timestamp`);
    localStorage.removeItem(CACHE_KEYS.TOTAL_DISHES);
    localStorage.removeItem(`${CACHE_KEYS.TOTAL_DISHES}_timestamp`);
    
    // Force a refresh by updating state
    setRefreshKey(prev => prev + 1);
  };

  // Navigation handlers
  const handleRestaurantClick = () => {
    navigate('/restaurants');
  };

  const handleDishClick = () => {
    // You can implement this if you want to navigate to a dish listing page
    // For now, we'll just log a message
    console.log('Dish card clicked');
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
      // Create an AbortController for cleanup
      const controller = new AbortController();
      const signal = controller.signal;
      
      try {
        let restaurantsCount = 0;
        let dishesCount = 0;
        
        // Check if we have valid restaurant count in cache
        if (isCacheValid(CACHE_KEYS.TOTAL_RESTAURANTS)) {
          restaurantsCount = getFromCache(CACHE_KEYS.TOTAL_RESTAURANTS) || 0;
        } else {
          // Fetch from API if not in cache
          const restaurantsResponse = await fetch(`${baseUrl}/api/restaurants/totalRestaurants`, { signal });
          
          if (!restaurantsResponse.ok) {
            throw new Error(`Failed to fetch restaurants: ${restaurantsResponse.statusText}`);
          }
          
          const restaurantsData = await restaurantsResponse.json();
          restaurantsCount = restaurantsData.totalRestaurants ?? 0;
          
          // Cache the result
          setInCache(CACHE_KEYS.TOTAL_RESTAURANTS, restaurantsCount);
        }
        
        // Check if we have valid dish count in cache
        if (isCacheValid(CACHE_KEYS.TOTAL_DISHES)) {
          dishesCount = getFromCache(CACHE_KEYS.TOTAL_DISHES) || 0;
        } else {
          // Fetch from API if not in cache
          const dishesResponse = await fetch(`${baseUrl}/api/restaurants/totalDishes`, { signal });
          
          if (!dishesResponse.ok) {
            throw new Error(`Failed to fetch dishes: ${dishesResponse.statusText}`);
          }
          
          const dishesData = await dishesResponse.json();
          dishesCount = dishesData.totalDishes ?? 0;
          
          // Cache the result
          setInCache(CACHE_KEYS.TOTAL_DISHES, dishesCount);
        }
        
        // Update the state with our data
        setData({
          totalRestaurants: restaurantsCount,
          totalDishes: dishesCount,
        });
        
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error fetching data:', err);
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
      
      return () => {
        // Clean up by aborting any in-flight requests
        controller.abort();
      };
    };

    fetchData();
  }, [refreshKey]); // Add refreshKey to dependencies to trigger refresh

  // Listen for storage events (when cache is updated in another tab)
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (
        event.key === CACHE_KEYS.TOTAL_RESTAURANTS ||
        event.key === CACHE_KEYS.TOTAL_DISHES ||
        event.key?.endsWith('_timestamp')
      ) {
        // Force refresh when cache is updated in another tab
        setRefreshKey(prev => prev + 1);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Skeleton loading card component
  const SkeletonCard = () => (
    <div className="bg-white rounded-2xl shadow-xl border-2 border-gray-200 overflow-hidden relative animate-pulse">
      <div className="p-6 flex flex-col items-center text-center">
        <div className="h-8 w-40 bg-gray-200 rounded mb-4"></div>
        <div className="w-full h-48 lg:h-60 bg-gray-200 rounded-xl mb-4"></div>
        <div className="bg-gray-100 rounded-xl p-4 mt-4 w-full">
          <div className="h-5 w-24 bg-gray-200 rounded mx-auto"></div>
          <div className="h-12 w-16 bg-gray-200 rounded mx-auto mt-2"></div>
        </div>
        <div className="h-4 w-32 bg-gray-200 rounded mt-2 mx-auto"></div>
      </div>
    </div>
  );

  // Memoize card data to avoid unnecessary re-renders
  const cardData = useMemo(() => [
    {
      title: 'Restaurants',
      image: resImage,
      count: data.totalRestaurants,
      bgClass: 'bg-green-50',
      textColor: 'text-green-900',
      borderClass: 'border-green-100',
      gradientClass: 'from-green-100 via-white to-green-100',
      onClick: handleRestaurantClick,
    },
    {
      title: 'Dishes',
      image: dishImage,
      count: data.totalDishes,
      bgClass: 'bg-red-50',
      textColor: 'text-red-900',
      borderClass: 'border-red-100',
      gradientClass: 'from-red-100 via-white to-red-100',
      onClick: handleDishClick,
    },
  ], [data.totalRestaurants, data.totalDishes]);

  if (loading && !data.totalRestaurants && !data.totalDishes) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto mb-8">
          <button
            onClick={() => navigate('/categories')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
          >
            Manage Restaurant Categories
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto mb-8 flex justify-between items-center">
        <button
          onClick={() => navigate('/categories')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition duration-300 ease-in-out transform hover:scale-105 flex items-center justify-center gap-2"
        >
          Manage Restaurant Categories
        </button>
        
        {/* Refresh button */}
        <button
          onClick={handleRefresh}
          className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium py-2 px-4 rounded-lg shadow transition duration-300 ease-in-out flex items-center gap-2"
          disabled={loading}
        >
          {loading ? (
            <>
              <svg className="animate-spin h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Loading...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              <span>Refresh</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="max-w-6xl mx-auto mb-8 bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {loading && !data.totalRestaurants && !data.totalDishes ? (
          <>
            <SkeletonCard />
            <SkeletonCard />
          </>
        ) : (
          cardData.map(({ title, image, count, bgClass, textColor, borderClass, gradientClass, onClick }, index) => (
            <div
              key={index}
              className={`transform transition duration-500 hover:scale-105 ${
                index % 2 === 0 ? 'hover:rotate-1' : 'hover:-rotate-1'
              } hover:shadow-2xl bg-white rounded-2xl shadow-xl border-2 ${borderClass} overflow-hidden relative cursor-pointer`}
              onClick={onClick}
            >
              <div
                className={`absolute inset-0 bg-gradient-to-r ${gradientClass} opacity-20`}
              ></div>
              <div className="relative z-10 p-6 flex flex-col items-center text-center">
                <h1 className={`text-4xl font-extrabold ${textColor} mb-4 tracking-tight`}>
                  {title}
                </h1>

                <div className="w-full mb-4 overflow-hidden rounded-xl shadow-lg transform transition duration-300 hover:scale-110 relative group">
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity flex items-center justify-center">
                    <div className="text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity text-lg">
                      {title === 'Restaurants' ? 'View All Restaurants' : ''}
                    </div>
                  </div>
                  <img
                    className="w-full h-48 lg:h-60 object-cover"
                    src={image}
                    alt={title}
                    loading="lazy"
                    width="400"
                    height="300"
                  />
                </div>

                <div className={`${bgClass} rounded-xl p-4 mt-4 shadow-inner`}>
                  <h2 className={`text-lg font-semibold ${textColor}`}>Total {title}</h2>
                  <h3 className={`text-6xl font-black ${textColor} mt-2`}>
                    {count}
                  </h3>
                </div>

                <p className="text-gray-500 mt-2 italic">(added till now)</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default React.memo(Home);
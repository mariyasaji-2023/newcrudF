import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { MdAddCircleOutline, MdClear, MdArrowUpward } from "react-icons/md";
import { AlertCircle } from 'lucide-react';
import DishCard from "../components/DishCard";
import AddDishPopup from "../components/AddorEditDishPopup";
import SearchDish from "../components/SearchDish";
import Pagination from "../components/Pagination"

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

// Create axios instance with request caching
const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' }
});

// Create a more sophisticated cache with proper invalidation
const apiCache = {
  cache: new Map(),
  CACHE_DURATION: 5 * 60 * 1000, // 5 minutes

  // Generate consistent cache keys
  getCacheKey(config) {
    const params = config.params ? JSON.stringify(config.params) : '';
    return `${config.method?.toLowerCase() || 'get'}-${config.url}-${params}`;
  },

  // Get cached response if valid
  get(config) {
    const key = this.getCacheKey(config);
    const cachedItem = this.cache.get(key);

    if (cachedItem && (Date.now() - cachedItem.timestamp < this.CACHE_DURATION)) {
      return cachedItem.data;
    }

    return null;
  },

  // Store response in cache
  set(config, data) {
    const key = this.getCacheKey(config);
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  },

  // Clear related cache entries
  invalidateRelated(url) {
    // Clear all cache entries that match the base URL path
    // This helps when modifying data to ensure fresh data on next fetch
    const basePath = url.split('?')[0];

    for (const key of this.cache.keys()) {
      if (key.includes(basePath)) {
        this.cache.delete(key);
      }
    }
  },
  
  // Clear the entire cache
  clearAll() {
    this.cache.clear();
  }
};

// Apply improved caching to axios
api.interceptors.request.use(config => {
  // For non-GET requests, we'll add a timestamp to the URL to bypass cache
  if (config.method?.toLowerCase() !== 'get') {
    // Add a timestamp to the URL as a query parameter
    const separator = config.url.includes('?') ? '&' : '?';
    config.url = `${config.url}${separator}_t=${Date.now()}`;
    
    // Also pre-emptively invalidate any related GET caches
    apiCache.invalidateRelated(config.url);
  }
  
  // Only apply caching to GET requests
  if (config.method?.toLowerCase() === 'get') {
    const cachedResponse = apiCache.get(config);

    if (cachedResponse) {
      config.adapter = () => {
        return Promise.resolve({
          data: cachedResponse,
          status: 200,
          statusText: 'OK',
          headers: {},
          config,
          request: {}
        });
      };
    }
  }

  return config;
});

api.interceptors.response.use(response => {
  const config = response.config;

  // Cache GET responses
  if (config.method?.toLowerCase() === 'get') {
    apiCache.set(config, response.data);
  } else {
    // For non-GET requests, invalidate related caches
    apiCache.invalidateRelated(config.url);
  }

  return response;
});

// Helper function moved outside component
const isValidUrl = (string) => {
  try {
    return string.startsWith('http://') || string.startsWith('https://');
  } catch (error) {
    return false;
  }
};

// Export the api and apiCache for use in other components
export { api, apiCache };

const RestaurantDishes = () => {
  const { restaurantId } = useParams();

  // All state declarations must come before any hooks
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [dishCount, setDishCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [missingUrlCount, setMissingUrlCount] = useState(0);
  const [fetchTrigger, setFetchTrigger] = useState(0); // Used to trigger refetches
  const [currentPage, setCurrentPage] = useState(1);
  const [dishesPerPage] = useState(20); // Adjust based on your needs
  const [totalPages, setTotalPages] = useState(1); // Add this new state variable
  const [totalDishes, setTotalDishes] = useState(0); // For tracking total dish count
  const [hasMore, setHasMore] = useState(true);

  // Force refresh function - completely clears cache and refetches
  const forceRefresh = useCallback(() => {
    // Clear the entire cache
    apiCache.clearAll();
    
    // Reset to first page
    setCurrentPage(1);
    
    // Trigger refetch
    setFetchTrigger(prev => prev + 1);
  }, []);
  
  // Fetch dish count with cache invalidation
  const fetchDishCount = useCallback(async () => {
    try {
      // Invalidate the dishCount cache to ensure fresh data
      apiCache.invalidateRelated(`/api/restaurants/dishCount/${restaurantId}`);
      
      const countResponse = await api.get(
        `/api/restaurants/dishCount/${restaurantId}`
      );
      setDishCount(countResponse.data.dishCount || 0);
    } catch (err) {
      console.error("Error fetching dish count:", err);
    }
  }, [restaurantId]);

  // Modify the fetchRestaurantData function to use pagination
  const fetchRestaurantData = useCallback(async (page = 1, forceRefresh = false) => {
    if (!restaurantId) return;
    
    setLoading(true);
    try {
      // If forceRefresh is true, invalidate the cache more aggressively
      if (forceRefresh) {
        apiCache.clearAll();
      } else {
        // Otherwise just invalidate related caches
        apiCache.invalidateRelated(`/api/restaurants/allDishes/${restaurantId}`);
      }
      
      // Add a cache-busting parameter when forceRefresh is true
      const timestamp = Date.now();
      const endpoint = forceRefresh 
        ? `/api/restaurants/allDishes/${restaurantId}?_nocache=${timestamp}` 
        : `/api/restaurants/allDishes/${restaurantId}`;
      
      // Use the regular axios instead of the cached api for force refresh
      const dishesResponse = forceRefresh
        ? await axios.get(`${baseUrl}${endpoint}`, { params: { page, limit: dishesPerPage } })
        : await api.get(endpoint, { params: { page, limit: dishesPerPage } });
  
      const responseData = dishesResponse.data;
      
      // Always replace dishes with the current page results
      setDishes(responseData.dishes || []);
      
      // Update categories structure
      setCategories(responseData.categories || []);
      
      setRestaurantName(
        responseData.restaurant?.name || `Restaurant ${restaurantId}`
      );
      
      // Update pagination info
      if (responseData.pagination) {
        setTotalDishes(responseData.pagination.totalDishes);
        setTotalPages(responseData.pagination.totalPages);
      } else if (responseData.totalDishes) {
        // Fallback for direct properties
        setTotalDishes(responseData.totalDishes);
        setTotalPages(Math.ceil(responseData.totalDishes / dishesPerPage));
      }
      
      // Check if we have more dishes to load
      setHasMore(page < Math.ceil(responseData.totalDishes / dishesPerPage));
      
      // Only fetch dish count if it wasn't included in the response
      if (!responseData.dishCount) {
        await fetchDishCount();
      } else {
        setDishCount(responseData.dishCount);
      }
    } catch (err) {
      console.error("Error fetching restaurant data:", err);
      setError("Failed to load restaurant details. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [restaurantId, fetchDishCount, dishesPerPage, baseUrl]);

  // Handle page change
  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    fetchRestaurantData(page);
    // Optionally scroll to top when changing pages
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [fetchRestaurantData]);

  // Add a function to load more dishes
  const loadMoreDishes = () => {
    if (!loading && hasMore) {
      const nextPage = currentPage + 1;
      setCurrentPage(nextPage);
      fetchRestaurantData(nextPage);
    }
  };
  
  // Search with debounce to prevent excessive API calls
  const debouncedSearch = useCallback(
    (() => {
      let timeoutId = null;
      return (query) => {
        if (timeoutId) clearTimeout(timeoutId);

        if (!query.trim()) {
          setSearchResults(null);
          return;
        }

        timeoutId = setTimeout(async () => {
          try {
            const normalizedQuery = query.trim().toLowerCase();
            // Invalidate search cache to ensure fresh results
            apiCache.invalidateRelated(`/api/restaurants/searchDish/${restaurantId}`);
            
            const response = await api.get(
              `/api/restaurants/searchDish/${restaurantId}?query=${normalizedQuery}`
            );
            setSearchResults(response.data.results.length === 0 ? [] : response.data.results);
          } catch (error) {
            console.error("Error searching dishes:", error);
            setSearchResults([]);
          }
        }, 300); // 300ms debounce
      };
    })(),
    [restaurantId]
  );

  const handleSearch = useCallback((query) => {
    setSearchQuery(query);
    debouncedSearch(query);
  }, [debouncedSearch]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults(null);
  }, []);

  const togglePopup = useCallback(() => {
    setIsPopupVisible(prev => !prev);
  }, []);
  
  // Additional helper function to ensure popup is closed
  const closeAddDishPopup = useCallback(() => {
    setIsPopupVisible(false);
  }, []);
  
  // Improved handleAddDish to force refresh
  
const handleAddDish = useCallback(async (newDish) => {
  // Close popup first (although this should already be handled in AddDishPopup)
  setIsPopupVisible(false);
  
  // Show loading state
  setLoading(true);
  
  try {
    // Force a complete cache invalidation for dish-related endpoints
    apiCache.clearAll();
    
    // Reset to first page to see newly added dish
    setCurrentPage(1);
    
    // Immediately update the UI with the new dish if provided
    if (newDish) {
      // Add the new dish to the current state to show it immediately
      setDishes(prevDishes => [newDish, ...prevDishes]);
      
      // Update the dish count
      setDishCount(prevCount => prevCount + 1);
      
      // Also update the categories structure if needed
      if (newDish.categoryId) {
        // Make a deep copy of the current categories
        const updatedCategories = JSON.parse(JSON.stringify(categories));
        
        // Find if the category exists
        const categoryIndex = updatedCategories.findIndex(
          cat => cat.categoryId === newDish.categoryId
        );
        
        if (categoryIndex >= 0) {
          // Category exists, update it
          const category = updatedCategories[categoryIndex];
          
          if (newDish.subCategoryId) {
            // Check if subcategory exists
            const subCategoryIndex = category.subCategories.findIndex(
              subCat => subCat.subCategoryId === newDish.subCategoryId
            );
            
            if (subCategoryIndex >= 0) {
              // Don't need to update anything as categories structure is already correct
            }
          }
          
          // Update the categories state
          setCategories(updatedCategories);
        }
      }
    }
    
    // Then trigger a background refresh to get updated data
    await fetchRestaurantData(1, true); // Force a full refresh
    
    // Re-fetch the dish count to reflect the change
    await fetchDishCount();
  } catch (err) {
    console.error("Error refreshing data after adding dish:", err);
  } finally {
    setLoading(false);
  }
}, [fetchRestaurantData, fetchDishCount, categories]);


  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Memoized dish organization
  const organizedDishes = useMemo(() => {
    if (!dishes.length || !categories.length) return [];

    // Create a map for faster lookups
    const dishMap = new Map();
    dishes.forEach(dish => {
      const categoryKey = dish.categoryId || 'uncategorized';
      const subCategoryKey = dish.subCategoryId || 'no-subcategory';

      if (!dishMap.has(categoryKey)) {
        dishMap.set(categoryKey, new Map());
      }

      const categoryMap = dishMap.get(categoryKey);
      if (!categoryMap.has(subCategoryKey)) {
        categoryMap.set(subCategoryKey, []);
      }

      categoryMap.get(subCategoryKey).push(dish);
    });

    return categories.map((category) => ({
      categoryName: category.categoryName,
      dishes: dishMap.get(category.categoryId)?.get('no-subcategory') || [],
      subCategories: category.subCategories.map((subCategory) => ({
        subCategoryName: subCategory.subCategoryName,
        dishes: dishMap.get(category.categoryId)?.get(subCategory.subCategoryId) || [],
      })),
    }));
  }, [dishes, categories]);

  // Calculate missing URLs in a single pass for efficiency
  const missingUrlsCount = useMemo(() => {
    if (!dishes.length) return 0;

    return dishes.reduce((acc, dish) => {
      return acc + (!dish.servingInfos?.[0]?.servingInfo?.Url ? 1 : 0);
    }, 0);
  }, [dishes]);

  // Update missing URL count when dishes change
  useEffect(() => {
    fetchRestaurantData(currentPage);
  }, [fetchRestaurantData, fetchTrigger, currentPage]);

  // Use passive listeners for better scroll performance
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollToTop(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // DishCard list component - extracted for better performance
  const DishList = React.memo(({ dishes, categoryName, subCategoryName, restaurantId }) => {
    return dishes.map((dish) => (
      <DishCard
        key={dish._id}
        dish={dish}
        categoryName={categoryName}
        subCategoryName={subCategoryName}
        restaurantId={restaurantId}
        onDishUpdate={forceRefresh} // Use forceRefresh instead of setFetchTrigger
      />
    ));
  });

  // Loading and error states
  if (loading && dishes.length === 0) return <p className="text-center text-xl">Loading dishes...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        <div className="w-full md:w-1/3 relative">
          <SearchDish
            value={searchQuery}
            onSearch={handleSearch}
          />
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={handleClearSearch}
            >
              <MdClear className="text-xl" />
            </button>
          )}
        </div>

        <h2 className="text-2xl font-bold text-center mx-4">
          Dishes for {restaurantName}
        </h2>

        <div className="w-full md:w-1/3 flex justify-end">
          <button
            onClick={togglePopup}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center group"
          >
            <MdAddCircleOutline className="text-2xl" />
            <span className="ml-2">Add Dish</span>
          </button>
        </div>
      </div>

      <div className="w-full flex justify-end px-12 items-center space-x-4">
        <span className="text-lg font-semibold pt-4 text-gray-800">Total Dishes:</span>
        <span className="text-2xl pt-4 font-extrabold text-green-600">
          {dishCount}
        </span>
      </div>

      {searchResults === null ? (
        <React.Fragment>
          {organizedDishes.map((category) => (
            <div key={category.categoryName} className="mb-6">
              {category.dishes.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    <DishList
                      dishes={category.dishes}
                      categoryName={category.categoryName}
                      subCategoryName={null}
                      restaurantId={restaurantId}
                    />
                  </div>
                </div>
              )}
              {category.subCategories.map((subCategory) => (
                subCategory.dishes.length > 0 && (
                  <div key={subCategory.subCategoryName} className="mt-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                      <DishList
                        dishes={subCategory.dishes}
                        categoryName={category.categoryName}
                        subCategoryName={subCategory.subCategoryName}
                        restaurantId={restaurantId}
                      />
                    </div>
                  </div>
                )
              ))}
            </div>
          ))}
        </React.Fragment>
      ) : searchResults.length === 0 ? (
        <p>No dishes found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-6">
          <DishList
            dishes={searchResults}
            categoryName={null}
            subCategoryName={null}
            restaurantId={restaurantId}
          />
        </div>
      )}

      {!searchResults && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          disabled={loading}
        />
      )}
      

      {isPopupVisible && (
  <AddDishPopup
    mode="add"
    closePopup={closeAddDishPopup}  // Use the dedicated close function
    updateDishList={handleAddDish}
    restaurantId={restaurantId}
  />
)}

      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 z-40 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
        >
          <MdArrowUpward className="text-2xl" />
        </button>
      )}

      {missingUrlCount > 0 && (
        <button className="fixed bottom-4 left-4 z-40 bg-red-500 hover:bg-red-600 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          <span className="font-bold">{missingUrlCount}</span>
        </button>
      )}
    </div>
  );
};

export default React.memo(RestaurantDishes);
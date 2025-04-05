import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { CiEdit } from "react-icons/ci";
import { MdOutlineAddBusiness, MdDelete } from "react-icons/md";
import axios from "axios";
import SearchRestaurant from "../components/SearchRestaurant";
import AddorEditRestaurantPopup from "../components/AddorEditRestaurantPopup";
import DeleteRestaurantPopup from "../components/DeleteRestaurantPopup";
const baseUrl = import.meta.env.VITE_APP_BASE_URL;

// Moved helper function outside component to avoid recreation on each render
const isValidUrl = (string) => {
  try {
    return string.startsWith('http://') || string.startsWith('https://');
  } catch (error) {
    return false;
  }
};

// Create a reusable Image component with error handling
const RestaurantImage = ({ logo, restaurantName }) => {
  const [imgSrc, setImgSrc] = useState(
    isValidUrl(logo) ? logo : `${baseUrl}/public${logo}`
  );

  return (
    <img
      className="rounded-t-xl w-full h-40 object-cover"
      src={imgSrc}
      alt={restaurantName}
      onError={() => setImgSrc('/default-restaurant.png')}
    />
  );
};

const RestaurantCard = React.memo(({ restaurant, onEdit, onDelete }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div className="bg-slate-100 rounded-xl mb-4 shadow-xl hover:shadow-2xl transform transition-all duration-500 hover:scale-105 overflow-hidden">
      <div className="relative">
        <Link to={`/restaurant/${restaurant._id}`}>
          <RestaurantImage 
            logo={restaurant.logo} 
            restaurantName={restaurant.restaurantName} 
          />
        </Link>
        <button
          className="absolute top-2 right-2 p-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition duration-300 transform hover:scale-110"
          onClick={() => onEdit(restaurant)}
        >
          <CiEdit className="text-lg" />
        </button>
        <button
          className="absolute top-2 left-2 p-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition duration-300 transform hover:scale-110"
          onClick={() => onDelete(restaurant)}
        >
          <MdDelete className="text-lg" />
        </button>
      </div>
      <div className="p-4 space-y-2">
        <h1 className="mt-2 font-bold text-xl text-center hover:text-green-600 transition duration-300">
          <Link to={`/restaurant/${restaurant._id}`}>
            {restaurant.restaurantName}
          </Link>
        </h1>
        <p className="mt-1 text-xs text-center text-gray-500">
          Created At : {formatDate(restaurant.createdAt)}
        </p>
        <p className="mt-1 text-xs text-center text-gray-500">
          Updated At : {formatDate(restaurant.updatedAt)}
        </p>
      </div>
    </div>
  );
});

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalRestaurants, setTotalRestaurants] = useState(0);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [mode, setMode] = useState("add");
  
  // Cache instance of axios to avoid recreating on each render
  const api = useMemo(() => axios.create({
    baseURL: baseUrl,
    headers: { 'Content-Type': 'application/json' }
  }), []);

  // Memoize fetchRestaurants to avoid recreation on each render
  const fetchRestaurants = useCallback(async (page = 1, query = debouncedQuery, forceRefresh = false) => {
    setLoading(true);
    try {
      // Add timestamp to URL to prevent caching when forceRefresh is true
      const cacheParam = forceRefresh ? `&t=${new Date().getTime()}` : '';
      
      const response = await api.get(
        `/api/restaurants/allRestaurants?page=${page}&search=${query}${cacheParam}`
      );
      const {
        restaurants: fetchedRestaurants,
        totalPages: fetchedTotalPages,
        totalRestaurants: fetchedTotalRestaurants,
      } = response.data;
  
      setRestaurants(fetchedRestaurants);
      setTotalPages(fetchedTotalPages);
      setTotalRestaurants(fetchedTotalRestaurants);
    } catch (err) {
      console.error("Error fetching restaurants:", err);
      setError(err.message);
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, [api, debouncedQuery]);

  // Handle search debouncing
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset to page 1 when search query changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedQuery]);

  // Fetch restaurants when page or debounced query changes
  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [fetchRestaurants, currentPage, debouncedQuery]);

  // Memoized handlers to avoid recreation on each render
  const handlePageChange = useCallback((newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  }, [totalPages]);

  const handleEditClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    setMode("edit");
    setShowPopup(true);
  }, []);

  const handleAddClick = useCallback(() => {
    setMode("add");
    setSelectedRestaurant(null);
    setShowPopup(true);
  }, []);

  const handleDeleteClick = useCallback((restaurant) => {
    setSelectedRestaurant(restaurant);
    setMode("delete");
    setShowPopup(true);
  }, []);

  const closePopup = useCallback(() => {
    setShowPopup(false);
    setSelectedRestaurant(null);
  }, []);

 const updateRestaurantList = useCallback(() => {
  // Reset to page 1 after CRUD operations
  setCurrentPage(1);
  // Force refresh by passing true to fetchRestaurants
  fetchRestaurants(1, debouncedQuery, true);
}, [fetchRestaurants, debouncedQuery]);

  const paginationControls = useMemo(() => (
    <div className="flex justify-center items-center space-x-4 mb-6 mt-6">
      <button
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`px-6 py-3 font-bold rounded-lg shadow-lg transform transition-all duration-300 ${
          currentPage === 1
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:shadow-2xl hover:scale-105"
        }`}
      >
        Previous
      </button>
      <span className="px-4 py-2 font-semibold text-lg bg-white rounded-lg shadow-md border border-gray-200">
        Page {currentPage} of {totalPages}
      </span>
      <button
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`px-6 py-3 font-bold rounded-lg shadow-lg transform transition-all duration-300 ${
          currentPage === totalPages
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-gradient-to-r from-green-400 to-teal-500 text-white hover:shadow-2xl hover:scale-105"
        }`}
      >
        Next
      </button>
    </div>
  ), [currentPage, handlePageChange, totalPages]);

  // Use window.requestAnimationFrame for smoother UI rendering
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mx-8 mt-6 bg-white p-6 rounded-2xl shadow-lg">
        <div className="w-full md:w-1/3">
          <SearchRestaurant onSearch={setSearchQuery} />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center flex-grow">
          ALL RESTAURANTS
        </h1>

        <div className="w-full md:w-1/3 flex justify-end">
          <button
            onClick={handleAddClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center"
          >
            <MdOutlineAddBusiness className="text-2xl" />
          </button>
        </div>
      </div>

      <div className="w-full flex justify-end px-12 items-center space-x-4">
        <span className="text-lg font-semibold pt-4 text-gray-800">Total Restaurants:</span>
        <span className="text-2xl pt-4 font-extrabold text-green-600">
          {totalRestaurants}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 mx-8">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {restaurants.length > 0
          ? restaurants.map((restaurant) => (
              <RestaurantCard
                key={restaurant._id}
                restaurant={restaurant}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))
          : !loading && <p>No restaurants available</p>}
      </div>

      {paginationControls}

      {showPopup &&
        (mode === "delete" ? (
          <DeleteRestaurantPopup
            restaurant={selectedRestaurant}
            closePopup={closePopup}
            updateRestaurantList={updateRestaurantList}
          />
        ) : (
          <AddorEditRestaurantPopup
            restaurant={selectedRestaurant}
            mode={mode}
            closePopup={closePopup}
            updateRestaurantList={updateRestaurantList}
          />
        ))}
    </div>
  );
};

export default Restaurants;
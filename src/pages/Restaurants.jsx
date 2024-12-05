import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CiEdit } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import { MdDelete } from "react-icons/md";
import axios from 'axios';
import AddorEditRestaurantPopup from '../components/AddorEditRestaurantPopup';
import DeleteRestaurantPopup from '../components/DeleteRestaurantPopup';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [showPopup, setShowPopup] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [mode, setMode] = useState('add'); // 'add', 'edit', or 'delete'

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/restaurants/allRestaurants');

        console.log('Raw response:', response.data);

        // Ensure restaurants is an array
        const restaurantsArray = Array.isArray(response.data.restaurants)
          ? response.data.restaurants
          : response.data || [];

        console.log('Restaurants array:', restaurantsArray);

        // Sort restaurants by the most recently updated or added first
        const sortedRestaurants = restaurantsArray.sort((a, b) => {
          // Compare updatedAt first, if they're the same, compare createdAt
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });

        console.log('Sorted restaurants:', sortedRestaurants);

        setRestaurants(sortedRestaurants);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching restaurants:', err);
        setError(err.message);
        setLoading(false);
        setRestaurants([]);
      }
    };

    fetchRestaurants();
  }, []);

  const handleEditClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMode('edit');
    setShowPopup(true);
  };

  const handleAddClick = () => {
    setMode('add');
    setSelectedRestaurant(null);
    setShowPopup(true);
  };

  const handleDeleteClick = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setMode('delete');
    setShowPopup(true);
  };

  const closePopup = () => {
    setShowPopup(false);
    setSelectedRestaurant(null);
  };

  const updateRestaurantList = (updatedRestaurant) => {
    if (mode === 'edit') {
      // Update the specific restaurant in the list
      setRestaurants((prevRestaurants) =>
        prevRestaurants.map((restaurant) =>
          restaurant._id === updatedRestaurant._id ? updatedRestaurant : restaurant
        ).sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        })
      );
    } else if (mode === 'add') {
      // Append the new restaurant to the list and re-sort
      setRestaurants((prevRestaurants) => {
        const updatedRestaurants = [updatedRestaurant, ...prevRestaurants];
        return updatedRestaurants.sort((a, b) => {
          const dateA = new Date(a.updatedAt || a.createdAt);
          const dateB = new Date(b.updatedAt || b.createdAt);
          return dateB - dateA;
        });
      });
    } else if (mode === 'delete') {
      // Remove the restaurant from the list based on its ID
      setRestaurants((prevRestaurants) =>
        prevRestaurants.filter((restaurant) => restaurant._id !== selectedRestaurant._id)
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  return (
    <div>
      <div className="flex justify-between mx-8 mt-6 items-center">
        <input
          type="text"
          className="focus:outline-none p-4 rounded-full shadow-md text-lg w-1/3 bg-gray-100 placeholder-gray-500 focus:ring-2 focus:ring-green-500 transition-all duration-300"
          placeholder="Search Restaurants ..."
        />
        <h1 className="text-4xl font-bold">ALL RESTAURANTS</h1>
        <button
          onClick={handleAddClick}
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105"
        >
          <MdOutlineAddBusiness />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 mx-8">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-xl mb-4 shadow-xl hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105 overflow-hidden">
              <div className="relative">
                <Link to={`/restaurant/${restaurant._id}`}>
                  <img
                    className="rounded-t-xl w-full h-40 object-cover"
                    src={`http://localhost:3001/public${restaurant.logo}`}
                    alt={restaurant.name}
                  />
                </Link>
                <button
                  className="absolute top-2 right-2 p-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition duration-300 transform hover:scale-110"
                  onClick={() => handleEditClick(restaurant)}
                >
                  <CiEdit />
                </button>
                <button
                  className="absolute top-2 left-2 p-2 bg-red-700 text-white rounded-full hover:bg-red-800 transition duration-300 transform hover:scale-110"
                  onClick={() => handleDeleteClick(restaurant)}
                >
                  <MdDelete />
                </button>
              </div>
              <div className="p-4 space-y-2">
                <h1 className="mt-2 font-bold text-xl text-center hover:text-green-600 transition duration-300">
                  <Link to={`/restaurant/${restaurant._id}`}>{restaurant.restaurantName}</Link>
                </h1>
                <p className="mt-1 text-xs text-center text-gray-500">Created At : {formatDate(restaurant.createdAt)}</p>
                <p className="mt-1 text-xs text-center text-gray-500">Updated At : {formatDate(restaurant.updatedAt)}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>No restaurants available</p>
        )}
      </div>

      {showPopup && (
        mode === 'delete' ? (
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
        )
      )}
    </div>
  );
};

export default Restaurants;
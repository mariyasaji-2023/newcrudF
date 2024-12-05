import React, { useState, useEffect } from 'react';
import { CiEdit } from "react-icons/ci";
import { MdOutlineAddBusiness } from "react-icons/md";
import axios from 'axios';
import PopupComponent from '../components/PopupComponent';

const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showPopup, setShowPopup] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [mode, setMode] = useState('add'); // 'add' or 'edit'

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/restaurants/allRestaurants');
        setRestaurants(response.data.restaurants || []);
        setLoading(false);
      } catch (err) {
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

  const closePopup = () => {
    setShowPopup(false);
    setSelectedRestaurant(null);
  };

  // Function to update the restaurant list after add/edit
  const updateRestaurantList = (newRestaurant) => {
    if (mode === 'edit') {
      // Update the specific restaurant in the list
      setRestaurants((prevRestaurants) =>
        prevRestaurants.map((restaurant) =>
          restaurant._id === newRestaurant._id ? newRestaurant : restaurant
        )
      );
    } else if (mode === 'add') {
      // Append the new restaurant to the list
      setRestaurants((prevRestaurants) => [...prevRestaurants, newRestaurant]);
    }
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
          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105">
          <MdOutlineAddBusiness />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-6 mx-8">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-white rounded-lg shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:scale-105">
              <div className="relative">
                <img
                  className="rounded-t-lg w-full h-40 object-cover"
                  src={`http://localhost:3001/public${restaurant.logo}`}
                  alt={restaurant.name}
                />
                <button
                  className="absolute top-2 right-2 p-2 bg-green-700 text-white rounded-full hover:bg-green-800 transition duration-300"
                  onClick={() => handleEditClick(restaurant)}
                >
                  <CiEdit />
                </button>
              </div>
              <div className="p-4">
                <h2 className="font-semibold text-xl text-gray-800">
                  {restaurant.restaurantName}
                </h2>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>No restaurants available</p>
        )}
      </div>

      {showPopup && (
        <PopupComponent 
          restaurant={selectedRestaurant} 
          mode={mode} 
          closePopup={closePopup}
          updateRestaurantList={updateRestaurantList} // Pass the update function
        />
      )}
    </div>
  );
};

export default Restaurants;
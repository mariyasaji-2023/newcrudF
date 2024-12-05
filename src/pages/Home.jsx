import React, { useState, useEffect } from 'react';
import res from '/images/res4.jpg';
import dish from '/images/dish2.jpg';
import MessagePopup from '../components/MessagePopup';

const Home = () => {
  const [totalRestaurants, setTotalRestaurants] = useState(0);
  const [totalDishes, setTotalDishes] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTotalRestaurants = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/restaurants/totalRestaurants', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.totalRestaurants !== undefined) {
          setTotalRestaurants(data.totalRestaurants);
        } else {
          setError('No restaurant count found');
        }
      } catch (error) {
        setError(error.message);
        setTotalRestaurants(0);
      }
    };

    const fetchTotalDishes = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/restaurants/totalDishes', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.totalDishes !== undefined) {
          setTotalDishes(data.totalDishes);
        } else {
          setError('No dish count found');
        }
      } catch (error) {
        setError(error.message);
        setTotalDishes(0);
      }
    };

    fetchTotalRestaurants();
    fetchTotalDishes();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 mt-6 gap-8">
      <MessagePopup />

      {/* Restaurants Section */}
      <div className="mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Restaurants</h1>
          <img className="max-h-48 lg:max-h-60 w-full object-cover rounded-lg my-4" src={res} alt="Restaurant" />
          <h2 className="text-lg font-bold text-gray-700 mt-6">Total</h2>
          <h3 className="text-6xl font-extrabold text-green-800 mt-2">{totalRestaurants}</h3>
          {error && <div className="text-red-500 mt-2">Error: {error}</div>}
          <p className="font-medium text-gray-500 mt-2">(restaurants added till now)</p>
        </div>
      </div>

      {/* Dishes Section */}
      <div className="mx-auto bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-between">
        <div className="flex flex-col items-center text-center">
          <h1 className="text-4xl font-extrabold text-gray-800">Dishes</h1>
          <img className="max-h-48 lg:max-h-60 w-full object-cover rounded-lg my-4" src={dish} alt="Dish" />
          <h2 className="text-lg font-bold text-gray-700 mt-6">Total</h2>
          <h3 className="text-6xl font-extrabold text-red-800 mt-2">{totalDishes}</h3>
          <p className="font-medium text-gray-500 mt-2">(dishes added till now)</p>
        </div>
      </div>
    </div>
  );
};

export default Home;

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
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-12 px-4 sm:px-6 lg:px-8">
      <MessagePopup />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
        {/* Restaurants Section */}
        <div className="transform transition duration-500 hover:scale-105 hover:rotate-1 hover:shadow-2xl 
          bg-white rounded-2xl shadow-xl border-2 border-gray-100 
          overflow-hidden relative perspective-1000 hover:translate-y-[-10px]">
          <div className="absolute inset-0 bg-gradient-to-r from-green-100 via-white to-green-100 opacity-20"></div>
          
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold text-green-900 mb-4 tracking-tight">
              Restaurants
            </h1>
            
            <div className="w-full mb-4 overflow-hidden rounded-xl shadow-lg transform transition duration-300 hover:scale-110">
              <img 
                className="w-full h-48 lg:h-60 object-cover" 
                src={res} 
                alt="Restaurant" 
              />
            </div>
            
            <div className="bg-green-50 rounded-xl p-4 mt-4 shadow-inner">
              <h2 className="text-lg font-semibold text-green-800">Total Restaurants</h2>
              <h3 className="text-6xl font-black text-green-900 mt-2">
                {totalRestaurants}
              </h3>
            </div>
            
            {error && (
              <div className="text-red-500 mt-2 bg-red-50 p-2 rounded-lg">
                Error: {error}
              </div>
            )}
            
            <p className="text-gray-500 mt-2 italic">
              (restaurants added till now)
            </p>
          </div>
        </div>

        {/* Dishes Section */}
        <div className="transform transition duration-500 hover:scale-105 hover:-rotate-1 hover:shadow-2xl 
          bg-white rounded-2xl shadow-xl border-2 border-gray-100 
          overflow-hidden relative perspective-1000 hover:translate-y-[-10px]">
          <div className="absolute inset-0 bg-gradient-to-r from-red-100 via-white to-red-100 opacity-20"></div>
          
          <div className="relative z-10 p-6 flex flex-col items-center text-center">
            <h1 className="text-4xl font-extrabold text-red-900 mb-4 tracking-tight">
              Dishes
            </h1>
            
            <div className="w-full mb-4 overflow-hidden rounded-xl shadow-lg transform transition duration-300 hover:scale-110">
              <img 
                className="w-full h-48 lg:h-60 object-cover" 
                src={dish} 
                alt="Dish" 
              />
            </div>
            
            <div className="bg-red-50 rounded-xl p-4 mt-4 shadow-inner">
              <h2 className="text-lg font-semibold text-red-800">Total Dishes</h2>
              <h3 className="text-6xl font-black text-red-900 mt-2">
                {totalDishes}
              </h3>
            </div>
            
            <p className="text-gray-500 mt-2 italic">
              (dishes added till now)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
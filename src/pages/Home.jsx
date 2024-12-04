import React, { useState, useEffect } from 'react';
import res from '/images/res4.jpg';
import dish from '/images/dish2.jpg';

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
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          // If the server response is not OK (status is not in the 200-299 range)
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Full response data:', data);

        // Check if totalRestaurants exists in the response
        if (data && data.totalRestaurants !== undefined) {
          setTotalRestaurants(data.totalRestaurants);
        } else {
          console.error('No totalRestaurants found in response');
          setError('No restaurant count found');
        }
      } catch (error) {
        console.error('Detailed error fetching total restaurants:', error);
        setError(error.message);
        setTotalRestaurants(0);
      }
    };
    // Fetch total number of dishes
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
        console.error('Error fetching total dishes:', error);
        setError(error.message);
        setTotalDishes(0);
      }
    };

    fetchTotalRestaurants();
    fetchTotalDishes();
  }, []);


  return (
    <div className="grid lg:grid-cols-2  mt-3 ">
      <div className="mx-auto lg:mx-12  bg-white">
        <div>
          <div className="flex font-extrabold text-4xl lg:m-4 items-center justify-center">
            <h1>Restaurants</h1>
          </div>
          <div>
            <img className="max-h-40 lg:max-h-60 w-screen px-10  overflow-hidden" src={res} alt="" />
          </div>
          <div className='flex items-center justify-center mt-6' >
            <h2 className='text-lg font-bold'>Total</h2>
          </div>
          <div className='flex items-center justify-center font-extrabold text-green-900 text-6xl'>
            <h3>{totalRestaurants}</h3>
          </div>
          {error && (
            <div className="text-red-500">
              Error: {error}
            </div>
          )}
          <div className='flex items-center justify-center font-medium mb-3'>
            <p>(restaurants added till now)</p>
          </div>
        </div>
      </div>
      {/* Second column remains unchanged */}
      <div className="mx-auto lg:mx-12  bg-white">
        <div>
          <div className="flex font-extrabold text-4xl lg:m-4 items-center justify-center">
            <h1>Dishes</h1>
          </div>
          <div className='rounded-md'> 
            <img className="max-h-40 lg:max-h-60 w-screen px-10  overflow-hidden" src={dish} alt="" />
          </div>
          <div className='flex items-center justify-center mt-6'>
            <h2 className='text-lg font-bold'>Total</h2>
          </div>
          <div className='flex items-center justify-center font-extrabold  text-red-900  text-6xl '>
            <h3>{totalDishes}</h3>
          </div>
          <div className='flex items-center justify-center font-medium mb-3 '>
            <p>(dishes added till now)</p>
          </div>
        </div>
      </div>
    </div>
  )
};

export default Home;
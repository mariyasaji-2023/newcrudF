import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import res from '/images/res3.jpg';
import { CiEdit } from "react-icons/ci";


const Restaurants = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/restaurants/allRestaurants');
        setRestaurants(response.data.restaurants || []); // Use the correct key 'restaurants'
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
        setRestaurants([]); // Fallback to an empty array
      }
    };

    fetchRestaurants();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(); // You can format the date as per your requirements
  };

  return (
    <div>
      <div className="flex justify-between mx-8 mt-6">
        <input
          type="text"
          className="focus:outline-none p-2 rounded"
          placeholder="Search Restaurants ..."
        />
        <h1 className="text-4xl font-bold">ALL RESTAURANTS</h1>
        <button className="bg-green-500 font-semibold rounded text-white py-2 px-4">+ Add Restaurant</button>
      </div>
      <div className="grid grid-cols-4 mt-6 mx-2 gap-4">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {Array.isArray(restaurants) && restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <div key={restaurant._id} className="bg-slate-200 p-3">
              <div className='min-w-10 relative '>
                <img className='rounded aspect-square  w-screen' src={`http://localhost:3001/public${restaurant.logo}`} alt={restaurant.name} />
              </div>
              <div className='bg-slate-700 rounded text-white p-2 mt-1'>
                <div>
                <p className='mt-2  text-xs  flex justify-start'>Created At : {formatDate(restaurant.createdAt)}</p>
                </div>
                
               <div className='flex justify-between'>
               <h1 className='mt-2 font-bold  '>
                  <Link to={`/restaurant/${restaurant._id}`}>{restaurant.restaurantName}</Link>
                </h1>
               <button className=' '><CiEdit /> </button>
               </div>
                
                <p className='mt-1  text-xs flex justify-end'>Updated At : {formatDate(restaurant.updatedAt)}</p>
              </div>
            </div>
          ))
        ) : (
          !loading && <p>No restaurants available</p>
        )}
      </div>
    </div>
  );
};

export default Restaurants;

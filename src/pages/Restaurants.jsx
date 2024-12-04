import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'; // Import Axios
import res from '/images/res3.jpg';

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
              <div className='min-w-10 '>
              <img className='rounded' src={res} alt={restaurant.name} />
              </div>
              <div className='bg-green-500 rounded text-white p-2 mt-1'>
              <h1 className='mt-2 font-bold  flex justify-center'>
                <Link to={`/restaurant/${restaurant._id}`}>{restaurant.name}</Link>
              </h1>
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

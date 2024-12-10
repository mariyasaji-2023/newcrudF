import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom'; // Add this to get the URL params
import axios from 'axios';
import DishCard from '../components/DishCard';

const RestaurantDishes = () => {
  const { restaurantId } = useParams(); // Get restaurantId from the URL params
  console.log('restaurantId:', restaurantId);

  const [dishes, setDishes] = useState([]); // Initialize dishes as an empty array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch dishes for a particular restaurant
  useEffect(() => {
    const fetchDishes = async () => {
      if (!restaurantId) {
        setError('Invalid restaurant ID');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`http://localhost:3001/api/restaurants/allDishes/${restaurantId}`);
        setDishes(response.data.dishes || []);
      } catch (err) {
        setError('Error fetching dishes');
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  if (loading) {
    return <p className="text-center text-xl">Loading dishes...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">Dishes for This Restaurant</h2>

      {dishes.length === 0 ? (
        <p className="text-center">No dishes found for this restaurant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RestaurantDishes;

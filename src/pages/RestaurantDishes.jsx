import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DishCard from "../components/DishCard";
import AddDishPopup from "../components/AddorEditDishPopup";

const RestaurantDishes = () => {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  // Fetch dishes and categories for a particular restaurant
  useEffect(() => {
    const fetchDishes = async () => {
      if (!restaurantId) {
        setError("Invalid restaurant ID");
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
        );
        setDishes(response.data.dishes || []);
        setCategories(response.data.categories || []);
        setRestaurantName(response.data.restaurant.name || "Restaurant Name");
      } catch (err) {
        setError("Error fetching dishes");
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  const handleAddDish = (newDish) => {
    setDishes((prevDishes) => [...prevDishes, newDish]);
  };

  const togglePopup = () => {
    setIsPopupVisible((prevState) => !prevState);
  };

  if (loading) {
    return <p className="text-center text-xl">Loading dishes...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Dishes for {restaurantName}
      </h2>

      {dishes.length === 0 ? (
        <p className="text-center">No dishes found for this restaurant.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dishes.map((dish) => (
            <DishCard key={dish._id} dish={dish} />
          ))}
        </div>
      )}

      <button
        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md"
        onClick={togglePopup}
      >
        Add Dish
      </button>

      {isPopupVisible && (
        <AddDishPopup
          mode="add"
          closePopup={togglePopup}
          updateDishList={handleAddDish}
          restaurantId={restaurantId}
        />
      )}

      <div className="categories mt-6 space-y-6">
        {categories.length === 0 ? (
          <p className="text-center text-gray-500">
            No categories available for this restaurant.
          </p>
        ) : (
          categories.map((category) => (
            <div
              key={category.categoryId}
              className="category p-4 bg-white shadow-lg rounded-lg hover:shadow-xl transition-shadow"
            >
              <h2 className="text-2xl font-semibold text-gray-800">
                {category.categoryName}
              </h2>

              <div className="subcategories mt-4 space-y-4">
                {category.subCategories && category.subCategories.length > 0 ? (
                  category.subCategories.map((subCategory) => (
                    <div
                      key={subCategory.subCategoryId}
                      className="subcategory p-4 bg-gray-50 border-l-4 border-gray-300 shadow-sm rounded-md hover:bg-gray-100"
                    >
                      <h3 className="text-xl font-medium text-gray-700">
                        {subCategory.subCategoryName}
                      </h3>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500">No subcategories available.</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RestaurantDishes;

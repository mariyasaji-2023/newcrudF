import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DishCard from "../components/DishCard";
import AddDishPopup from "../components/AddorEditDishPopup";
import { MdAddCircleOutline } from "react-icons/md";
import SearchDish from "../components/SearchDish";

const RestaurantDishes = () => {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");

  // Fetch dishes and categories for a particular restaurant
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
        );

        // Debugging logs
        console.log("Full response:", response.data);
        console.log("Restaurant object:", response.data.restaurant);
        console.log("Restaurant name:", response.data.restaurant?.name);

        setDishes(response.data.dishes || []);
        setCategories(response.data.categories || []);
        setRestaurantName(
          response.data.restaurant?.name || `Restaurant ${restaurantId}`
        );
      } catch (err) {
        setError("Failed to load restaurant details. Please try again.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchDishes();
  }, [restaurantId]);

  const handleAddDish = async (newDish) => {
    setDishes((prevDishes) => [...prevDishes, newDish]); // Add the new dish directly to the state

    try {
      // Optionally, refetch dishes and categories from the backend to get the latest state
      const response = await axios.get(
        `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
      );
      setDishes(response.data.dishes || []);
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error fetching dishes after adding:", err);
    }
  };

  const togglePopup = () => {
    setIsPopupVisible((prevState) => !prevState);
  };

  const handleAddDishClick = () => {
    setIsPopupVisible(true);
  };

  if (loading) {
    return <p className="text-center text-xl">Loading dishes...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  // Organize dishes by category and subcategory, and filter based on debounced query
  const filteredDishes = debouncedQuery
    ? dishes.filter((dish) =>
        dish.name?.toLowerCase().includes(debouncedQuery.toLowerCase())
      )
    : dishes;

  const organizedDishes = categories.map((category) => ({
    categoryName: category.categoryName,
    subCategories: category.subCategories.map((subCategory) => ({
      subCategoryName: subCategory.subCategoryName,
      dishes: filteredDishes.filter(
        (dish) => dish.subCategoryId === subCategory.subCategoryId
      ),
    })),
    dishes: filteredDishes.filter(
      (dish) => dish.categoryId === category.categoryId && !dish.subCategoryId
    ),
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="sticky top-0 z-10 bg-white shadow-md p-4 flex items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-1/3">
          <SearchDish onSearch={setDebouncedQuery} />
        </div>

        {/* Center Heading */}
        <h2 className="text-2xl font-bold text-center mx-4">
          Dishes for {restaurantName}
        </h2>

        {/* Add Dish Button */}
        <div className="w-full md:w-1/3 flex justify-end">
          <button
            onClick={handleAddDishClick}
            className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center group"
          >
            <MdAddCircleOutline className="text-2xl transition-transform duration-300" />
            <span className="ml-2">Add Dish</span>
          </button>
        </div>
      </div>

      {/* Dishes Section */}
      {organizedDishes.map((category) => (
        <div key={category.categoryName} className="mb-6">
          {/* Render category dishes */}
          {category.dishes.length > 0 && (
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                {category.dishes.map((dish) => (
                  <DishCard
                    key={dish._id}
                    dish={dish}
                    categoryName={category.categoryName}
                    subCategoryName={null}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Render subcategories */}
          {category.subCategories.map((subCategory) => (
            <div key={subCategory.subCategoryName} className="mt-6">
              {subCategory.dishes.length > 0 && (
                <div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
                    {subCategory.dishes.map((dish) => (
                      <DishCard
                        key={dish._id}
                        dish={dish}
                        categoryName={category.categoryName}
                        subCategoryName={subCategory.subCategoryName}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      ))}

      {isPopupVisible && (
        <AddDishPopup
          mode="add"
          closePopup={togglePopup}
          updateDishList={handleAddDish}
          restaurantId={restaurantId}
        />
      )}
    </div>
  );
};

export default RestaurantDishes;

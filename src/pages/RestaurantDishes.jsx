import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import DishCard from "../components/DishCard";
import AddDishPopup from "../components/AddorEditDishPopup";
import { MdAddCircleOutline, MdClear, MdArrowUpward } from "react-icons/md";
import SearchDish from "../components/SearchDish";

const RestaurantDishes = () => {
  const { restaurantId } = useParams();
  const [dishes, setDishes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurantName, setRestaurantName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [showScrollToTop, setShowScrollToTop] = useState(false);

  // Fetch dishes and categories for a particular restaurant
  useEffect(() => {
    const fetchDishes = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
        );

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

  // Handle scroll event to show/hide the scroll-to-top button
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollToTop(true);
      } else {
        setShowScrollToTop(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to top function
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle Search Query and Fetch from Backend
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }

    try {
      const normalizedQuery = query.trim().toLowerCase();
      const response = await axios.get(
        `http://localhost:3001/api/restaurants/searchDish/${restaurantId}?query=${normalizedQuery}`
      );
      if (response.data.results.length === 0) {
        setSearchResults([]);
      } else {
        setSearchResults(response.data.results);
      }
    } catch (error) {
      console.error("Error searching dishes:", error);
      setSearchResults([]);
    }
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
    window.location.reload();
  };

  const handleAddDish = async (newDish) => {
    try {
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

  // Organize dishes by category and subcategory
  const organizedDishes = categories.map((category) => ({
    categoryName: category.categoryName,
    subCategories: category.subCategories.map((subCategory) => ({
      subCategoryName: subCategory.subCategoryName,
      dishes: dishes.filter(
        (dish) => dish.subCategoryId === subCategory.subCategoryId
      ),
    })),
    dishes: dishes.filter(
      (dish) => dish.categoryId === category.categoryId && !dish.subCategoryId
    ),
  }));

  return (
    <div className="container mx-auto p-6">
      <div className="bg-white shadow-md p-4 flex items-center justify-between">
        {/* Search */}
        <div className="w-full md:w-1/3 relative">
          <SearchDish
            value={searchQuery}
            onSearch={(query) => {
              setSearchQuery(query);
              handleSearch(query);
            }}
          />
          {/* Clear search icon */}
          {searchQuery && (
            <button
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              onClick={handleClearSearch}
            >
              <MdClear className="text-xl" />
            </button>
          )}
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
      {searchResults === null ? (
        organizedDishes.map((category) => (
          <div key={category.categoryName} className="mb-6">
            {category.dishes.length > 0 && (
              <div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
                  {category.dishes.map((dish) => (
                    <DishCard
                      key={dish._id}
                      dish={dish}
                      categoryName={category.categoryName}
                      subCategoryName={null}
                      restaurantId={restaurantId}
                      setDishes={setDishes}
                      setCategories={setCategories}
                    />
                  ))}
                </div>
              </div>
            )}
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
                          restaurantId={restaurantId}
                          setDishes={setDishes}
                          setCategories={setCategories}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))
      ) : searchResults.length === 0 ? (
        <p>No dishes found matching your search.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 mt-4 lg:grid-cols-3 gap-6">
          {searchResults.map((dish) => (
            <DishCard
              key={dish._id}
              dish={dish}
              categoryName={dish.categoryName}
              subCategoryName={dish.subCategoryName}
              restaurantId={restaurantId}
              setDishes={setDishes}
              setCategories={setCategories}
            />
          ))}
        </div>
      )}

      {isPopupVisible && (
        <AddDishPopup
          mode="add"
          closePopup={togglePopup}
          updateDishList={handleAddDish}
          restaurantId={restaurantId}
        />
      )}

      {/* Scroll to Top Button */}
      {showScrollToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-4 z-40 right-4 bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full shadow-lg transition-transform transform hover:scale-110"
        >
          <MdArrowUpward className="text-2xl" />
        </button>
      )}
    </div>
  );
};

export default RestaurantDishes;

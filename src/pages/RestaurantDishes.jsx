import React, { useState } from "react";
import { MdAddCircleOutline, MdEdit } from "react-icons/md"; // Icons for adding and editing
import SearchRestaurant from "../components/SearchRestaurant";
import AddorEditDishPopup from "../components/AddorEditDishPopup"; // Importing the AddorEditDishPopup component
import axios from "axios";

const RestaurantDishes = ({ restaurantName, restaurantId }) => {
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [mode, setMode] = useState("add"); // "add" or "edit"
  const [selectedDish, setSelectedDish] = useState(null);
  const [categoryId, setCategoryId] = useState(null); // You can dynamically set this based on the category selected

  const handleAddDishClick = () => {
    setMode("add");
    setSelectedDish(null); // Reset the selected dish for adding a new one
    setIsPopupOpen(true);
  };

  const handleEditDishClick = (dishId) => {
    setMode("edit");
    setSelectedDish(dishId); // Set the selected dish based on the clicked dish
    setIsPopupOpen(true);
  };

  const handleAddCategoryClick = () => {
    console.log("Add Category Clicked");
  };

  // Close the popup
  const closePopup = () => {
    setIsPopupOpen(false);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0 mx-8 mt-6 bg-white p-6 rounded-2xl shadow-lg">
        <div className="w-full md:w-1/3">
          <SearchRestaurant onSearch={setDebouncedQuery} />
        </div>

        <h1 className="text-4xl font-extrabold text-gray-800 tracking-tight text-center flex-grow">
          {restaurantName || "All DISHES"}
        </h1>

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

      {/* Main Content Section */}
      <div className="flex flex-col md:flex-row mt-6 mx-8 gap-6">
        {/* Add Category Section (Left Column) */}
        <div className="md:w-1/4 bg-white p-6 rounded-2xl shadow-lg border border-gray-300">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">
            Add Categories
          </h2>
          <div className="flex flex-col space-y-4">
            {/* Add Category Form */}
            <div className="flex flex-col space-y-3">
              <input
                type="text"
                placeholder="Category Name"
                className="p-3 w-full border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleAddCategoryClick}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl flex items-center justify-center"
              >
                <MdAddCircleOutline className="text-2xl" />
                <span className="ml-2">Add</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dish Cards Section (Right Column) */}
        <div className="flex-grow grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {/* Example Dish Card */}
          {[1, 2, 3, 4, 5, 6, 7, 8].map((dish, index) => (
            <div
              key={index}
              className="relative bg-slate-100 p-4 rounded-xl shadow-md hover:shadow-lg transition-transform duration-300"
            >
              {/* Edit Icon */}
              <button
                onClick={() => handleEditDishClick(dish)}
                className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition duration-300 transform hover:scale-110"
              >
                <MdEdit />
              </button>

              {/* Dish Info */}
              <h3 className="font-bold text-lg text-gray-800">Dish Name</h3>
              <p className="text-gray-600 text-sm mt-1">
                Short description of the dish.
              </p>
              <div className="text-sm text-gray-500 mt-4">
                <p>Calories: 200 kCal</p>
                <p>Protein: 10 g</p>
                <p>Carbs: 15 g</p>
                <p>Fat: 8 g</p>
              </div>
              <div className="text-xs text-gray-400 mt-4">
                <p>Created: 2024-12-01</p>
                <p>Updated: 2024-12-06</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Show the Add or Edit Dish Popup */}
      {isPopupOpen && (
        <AddorEditDishPopup
          mode={mode}
          closePopup={closePopup}
          updateDishList={(newDish) => console.log("Updated Dish List", newDish)}
          categoryId={categoryId} // Pass the actual categoryId here
          restaurantId={restaurantId}
          dish={selectedDish} // Pass the dish data if editing
        />
      )}
    </div>
  );
};

export default RestaurantDishes;

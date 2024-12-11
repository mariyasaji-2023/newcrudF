import React, { useState } from "react";
import { MdEdit, MdClose } from "react-icons/md"; // Edit and Close icons

const DishCard = ({ dish, categoryName, subCategoryName }) => {
  const {
    dishName,
    description,
    servingInfo,
    nutritionFacts,
    createdAt,
    updatedAt,
  } = dish;

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const handleCardClick = () => {
    setIsPopupOpen(true);
  };

  const closePopup = () => {
    setIsPopupOpen(false);
  };

  // Handle click outside of the popup to close it
  const handleOutsideClick = (e) => {
    if (e.target.id === "popup-overlay") {
      closePopup();
    }
  };

  return (
    <>
      {/* Dish Card - Initially Displaying Summary Information */}
      <div
        onClick={handleCardClick}
        className="relative bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer max-w-xs"
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-xl text-gray-800">
            {dishName || "Dish Name"}
          </h3>
          <button className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform duration-300 transform hover:scale-110">
            <MdEdit />
          </button>
        </div>

        {/* Display Category and Subcategory */}
        <div className="text-sm text-gray-600 mb-2">
          <p>
            <strong>Category:</strong> {categoryName || "N/A"}
          </p>
          <p>
            <strong>Subcategory:</strong> {subCategoryName || "N/A"}
          </p>
        </div>

        {/* Nutrition Facts with Bold Titles */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Calories</p>
            <p className="text-lg">
              {nutritionFacts?.calories.value || "200 kCal"}
            </p>
          </div>
          <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Protein</p>
            <p className="text-lg">{nutritionFacts?.protein.value || "10 g"}</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Carbs</p>
            <p className="text-lg">{nutritionFacts?.carbs.value || "15 g"}</p>
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Fat</p>
            <p className="text-lg">{nutritionFacts?.totalFat.value || "8 g"}</p>
          </div>
        </div>

        {/* Created and Updated Timestamps */}
        <div className="text-xs text-gray-400 mt-4">
          <p>Created: {createdAt || "N/A"}</p>
          <p>Updated: {updatedAt || "N/A"}</p>
        </div>
      </div>

      {/* Popup - Display Full Dish Details */}
      {isPopupOpen && (
        <div
          id="popup-overlay"
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg relative">
            <button
              onClick={closePopup}
              className="absolute top-2 right-2 text-gray-600 hover:text-gray-800 transition-all duration-300"
            >
              <MdClose className="text-2xl" />
            </button>

            {/* Dish Details */}
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">
              {dishName || "Dish Name"}
            </h2>

            {/* Category and Subcategory */}
            <div className="text-sm text-gray-600 mb-4">
              <p>
                <strong>Category:</strong> {categoryName || "N/A"}
              </p>
              <p>
                <strong>Subcategory:</strong> {subCategoryName || "N/A"}
              </p>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 mb-4">
              {description || "No description available."}
            </p>

            {/* Serving Info */}
            <div className="mb-4">
              <p className="text-gray-700">
                <strong>Serving Size:</strong> {servingInfo?.size}{" "}
                {servingInfo?.unit}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DishCard;

import React, { useState } from "react";
import { MdEdit, MdDelete } from "react-icons/md";
import DeleteDishPopup from "./DeleteDishPopup"; 
import axios from "axios"; 
const DishCard = ({
  dish = {},
  categoryName = "N/A",
  subCategoryName = "N/A",
  restaurantId,
  setDishes, // Ensure this is passed as a prop
  setCategories, // Ensure this is passed as a prop
}) => {
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showModal, setShowModal] = useState(false); // State for showing modal

  const {
    dishName = "Dish Name",
    description = "No description provided",
    servingInfos = [],
    createdAt,
    updatedAt,
  } = dish;

  const [selectedServingInfo, setSelectedServingInfo] = useState(
    servingInfos[0]?.servingInfo || null
  );

  const handleServingSizeChange = (servingInfo) => {
    setSelectedServingInfo(servingInfo.servingInfo);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    const options = {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return date.toLocaleString("en-US", options);
  };

  const handleDeleteClick = () => setShowDeletePopup(true);
  const closePopup = () => setShowDeletePopup(false);
  const updateDishList = async (deletedDishId) => {
    try {
      // Refetch dishes and categories from the backend
      const response = await axios.get(
        `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
      );
      console.log(restaurantId); // Log restaurantId to make sure it's correct

      // Optionally, remove the deleted dish from the state if it's still in the list
      const updatedDishes = response.data.dishes.filter(
        (dish) => dish._id !== deletedDishId
      );
      console.log(response.data);
      setDishes(updatedDishes || []);
      setCategories(response.data.categories || []);
    } catch (err) {
      console.error("Error refreshing dishes after delete:", err);
    }
  };

  const openModal = () => setShowModal(true);
  const closeModal = () => setShowModal(false);

  const truncateDescription = (text, wordLimit = 150) => {
    const words = text.split(" ");
    if (words.length > wordLimit) {
      return words.slice(0, wordLimit).join(" ") + "...";
    }
    return text;
  };

  const limitedDescription = truncateDescription(description);

  if (!servingInfos.length) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <p>No serving information available for this dish.</p>
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative bg-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer max-w-xs"
        onClick={openModal} // Open modal on dish name click
      >
        {/* Dish Name and Actions */}
        <div className="flex justify-between items-center mb-3">
          <h3
            className="font-semibold text-xl text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap"
            title={dishName}
          >
            <strong>{dishName}</strong>
          </h3>
          <div className="flex space-x-2">
            <button
              className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform duration-300 transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent onClick
                console.log("Edit clicked");
                // Add edit logic here if needed
              }}
            >
              <MdEdit />
            </button>
            <button
              className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-transform duration-300 transform hover:scale-110"
              onClick={(e) => {
                e.stopPropagation(); // Prevent parent onClick
                handleDeleteClick(); // Trigger delete popup
              }}
            >
              <MdDelete />
            </button>
          </div>
        </div>

        {/* Category and Subcategory */}
        <div className="text-sm flex justify-between text-gray-600">
          <p>
            <strong>Category:</strong>
          </p>
          <p>
            <strong>{categoryName}</strong>
          </p>
        </div>
        <div className="text-sm flex justify-between text-gray-600 mb-2">
          <p>
            <strong>Subcategory:</strong>
          </p>
          <p>
            <strong>{subCategoryName}</strong>
          </p>
        </div>

        {/* Serving Sizes Selection */}
        <div className="flex justify-start space-x-2 mb-4">
          {servingInfos.map((info, index) => (
            <button
              key={index}
              onClick={() => handleServingSizeChange(info)}
              className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                selectedServingInfo?.size === info.servingInfo.size
                  ? "bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800 hover:bg-blue-200"
              }`}
              title={info.servingInfo.size}
            >
              {info.servingInfo.size.slice(0, 5)}
            </button>
          ))}
        </div>

        {/* Nutritional Facts */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Calories</p>
            <p className="text-lg">
              {selectedServingInfo?.nutritionFacts?.calories?.value || "N/A"}{" "}
              {selectedServingInfo?.nutritionFacts?.calories?.unit || ""}
            </p>
          </div>
          <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Protein</p>
            <p className="text-lg">
              {selectedServingInfo?.nutritionFacts?.protein?.value || "N/A"}{" "}
              {selectedServingInfo?.nutritionFacts?.protein?.unit || ""}
            </p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Carbs</p>
            <p className="text-lg">
              {selectedServingInfo?.nutritionFacts?.carbs?.value || "N/A"}{" "}
              {selectedServingInfo?.nutritionFacts?.carbs?.unit || ""}
            </p>
          </div>
          <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-md text-center">
            <p className="text-sm font-semibold">Fat</p>
            <p className="text-lg">
              {selectedServingInfo?.nutritionFacts?.totalFat?.value || "N/A"}{" "}
              {selectedServingInfo?.nutritionFacts?.totalFat?.unit || ""}
            </p>
          </div>
        </div>

        {/* Price */}
        <div className="text-sm bg-indigo-600 mx-10 shadow-lg text-center rounded-sm py-1 text-white mt-2">
          <strong>Price: ${selectedServingInfo?.price || "N/A"}</strong>
        </div>

        {/* Dates */}
        <div className="text-xs flex text-gray-400 mt-1 justify-between">
          <p>
            <strong>Created At:</strong> {formatDate(createdAt)}
          </p>
          <p>
            <strong>Updated At:</strong> {formatDate(updatedAt)}
          </p>
        </div>

        {/* Delete Popup */}
        {showDeletePopup && (
          <DeleteDishPopup
            restaurantId={restaurantId}
            dish={dish} // Make sure this contains the _id
            closePopup={closePopup}
            updateDishList={updateDishList}
          />
        )}
      </div>

      {/* Modal with detailed dish info */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-lg max-w-lg w-full">
            {/* Dish Name */}
            <h3 className="text-2xl font-bold mb-4">{dishName}</h3>

            {/* Full Description */}
            <div
              className="mb-4 text-gray-700 overflow-y-auto max-h-60"
              style={{ wordBreak: "break-word" }}
            >
              {limitedDescription.split("\n").map((line, index) => (
                <p key={index} className="mb-1">
                  {line}
                </p>
              ))}
            </div>

            {/* Category and Subcategory */}
            <div className="text-sm flex justify-between text-gray-600 mb-2">
              <p>
                <strong>Category:</strong>
              </p>
              <p>
                <strong>{categoryName}</strong>
              </p>
            </div>
            <div className="text-sm flex justify-between text-gray-600 mb-2">
              <p>
                <strong>Subcategory:</strong>
              </p>
              <p>
                <strong>{subCategoryName}</strong>
              </p>
            </div>

            {/* Serving Sizes */}
            <div className="flex justify-start space-x-2 mb-4">
              {servingInfos.map((info, index) => (
                <button
                  key={index}
                  onClick={() => handleServingSizeChange(info)}
                  className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${
                    selectedServingInfo?.size === info.servingInfo.size
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-800 hover:bg-blue-200"
                  }`}
                  title={info.servingInfo.size}
                >
                  {info.servingInfo.size.slice(0, 5)}
                </button>
              ))}
            </div>

            {/* Nutritional Facts */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md text-center">
                <p className="text-sm font-semibold">Calories</p>
                <p className="text-lg">
                  {selectedServingInfo?.nutritionFacts?.calories?.value ||
                    "N/A"}{" "}
                  {selectedServingInfo?.nutritionFacts?.calories?.unit || ""}
                </p>
              </div>
              <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-md text-center">
                <p className="text-sm font-semibold">Protein</p>
                <p className="text-lg">
                  {selectedServingInfo?.nutritionFacts?.protein?.value || "N/A"}{" "}
                  {selectedServingInfo?.nutritionFacts?.protein?.unit || ""}
                </p>
              </div>
              <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-md text-center">
                <p className="text-sm font-semibold">Carbs</p>
                <p className="text-lg">
                  {selectedServingInfo?.nutritionFacts?.carbs?.value || "N/A"}{" "}
                  {selectedServingInfo?.nutritionFacts?.carbs?.unit || ""}
                </p>
              </div>
              <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-md text-center">
                <p className="text-sm font-semibold">Fat</p>
                <p className="text-lg">
                  {selectedServingInfo?.nutritionFacts?.totalFat?.value ||
                    "N/A"}{" "}
                  {selectedServingInfo?.nutritionFacts?.totalFat?.unit || ""}
                </p>
              </div>
            </div>

            {/* Display the Price */}
            <div className="text-sm bg-indigo-600 mx-10 shadow-lg text-center rounded-sm py-1 text-white mt-2">
              <strong>Price: ${selectedServingInfo?.price || "N/A"}</strong>
            </div>

            <button
              onClick={closeModal}
              className="mt-4 p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DishCard;

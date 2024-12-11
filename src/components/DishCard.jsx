import React, { useState } from "react";
import { MdEdit } from "react-icons/md";

const DishCard = ({ dish, categoryName, subCategoryName }) => {
  const {
    dishName,
    description,
    servingInfos,
    createdAt,
    updatedAt,
  } = dish;

  // State to track the currently selected serving size
  const [selectedServingInfo, setSelectedServingInfo] = useState(
    servingInfos[0]?.servingInfo || null
  );

  // Handler for changing serving size
  const handleServingSizeChange = (servingInfo) => {
    setSelectedServingInfo(servingInfo.servingInfo);
  };

  // If no serving infos, return a placeholder or null
  if (!servingInfos || servingInfos.length === 0) {
    return <div>No serving information available</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";

    const date = new Date(dateString);
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');

    return `${month}/${day}/${year} ${hours}:${minutes}`;
  };

  return (
    <div className="relative bg-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer max-w-xs">

      <div className="flex justify-between items-center mb-3">
        <h3 className="font-semibold text-xl text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap" title={dishName || "Dish Name"}>
          <strong>{dishName || "Dish Name"}</strong>
        </h3>
        <button className="absolute top-2 right-2 p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform duration-300 transform hover:scale-110">
          <MdEdit />
        </button>
      </div>


      {/* Category and Subcategory */}
      <div className="text-sm flex justify-between text-gray-600">
        <p>
          <strong>Category :</strong>
        </p>
        <p>
          <strong>{categoryName || "N/A"}</strong>
        </p>
      </div>
      <div className="text-sm flex justify-between text-gray-600 mb-2">
        <p>
          <strong>Subcategory :</strong>
        </p>
        <p>
          <strong>{subCategoryName || "N/A"}</strong>
        </p>
      </div>

      {/* Serving Sizes Selection */}
      <div className="flex justify-start space-x-2 mb-4">
        {servingInfos.map((info, index) => (
          <button
            key={index}
            onClick={() => handleServingSizeChange(info)}
            className={`px-3 py-1 rounded-full text-sm transition-colors duration-300 ${selectedServingInfo?.size === info.servingInfo.size
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-blue-200"
              }`}
            title={info.servingInfo.size}  // Tooltip showing full serving size
          >
            {info.servingInfo.size.slice(0, 5)}  {/* Show only first 5 characters */}
          </button>
        ))}
      </div>



      {/* Nutritional Facts */}
      <div className="grid grid-cols-2 gap-2 mt-4">
        <div className="bg-blue-100 text-blue-800 p-3 rounded-lg shadow-md text-center">
          <p className="text-sm font-semibold">Calories</p>
          <p className="text-lg">
            {selectedServingInfo?.nutritionFacts?.calories?.value || "N/A"} {" "}
            {selectedServingInfo?.nutritionFacts?.calories?.unit || ""}
          </p>
        </div>
        <div className="bg-green-100 text-green-800 p-3 rounded-lg shadow-md text-center">
          <p className="text-sm font-semibold">Protein</p>
          <p className="text-lg">
            {selectedServingInfo?.nutritionFacts?.protein?.value || "N/A"} {" "}
            {selectedServingInfo?.nutritionFacts?.protein?.unit || ""}
          </p>
        </div>
        <div className="bg-yellow-100 text-yellow-800 p-3 rounded-lg shadow-md text-center">
          <p className="text-sm font-semibold">Carbs</p>
          <p className="text-lg">
            {selectedServingInfo?.nutritionFacts?.carbs?.value || "N/A"} {" "}
            {selectedServingInfo?.nutritionFacts?.carbs?.unit || ""}
          </p>
        </div>
        <div className="bg-red-100 text-red-800 p-3 rounded-lg shadow-md text-center">
          <p className="text-sm font-semibold">Fat</p>
          <p className="text-lg">
            {selectedServingInfo?.nutritionFacts?.totalFat?.value || "N/A"} {" "}
            {selectedServingInfo?.nutritionFacts?.totalFat?.unit || ""}
          </p>
        </div>
      </div>
      <div className="text-sm bg-indigo-600 mx-10 shadow-lg text-center rounded-sm py-1 text-white mt-2 flex justify-center">
        <p >
          <strong>Price : $ {selectedServingInfo?.price || "N/A"} {" "}</strong>
        </p>
      </div>
      <div className="text-xs flex text-gray-400 mt-1 space-x-2 justify-between">
        <p> <strong>createdAt :</strong></p>
        <p> <strong>: updatedAt</strong></p>
      </div>
      <div className="text-xs flex text-gray-400 mt-1 space-x-2 justify-between">
        <p> <strong>{formatDate(createdAt)}</strong></p>
        <p> <strong>{formatDate(updatedAt)}</strong></p>
      </div>

    </div>
  );
};

export default DishCard;
// Update the DishCard.jsx component with better default image handling

import React, { useState } from "react";
import { MdEdit, MdDelete, MdNoPhotography } from "react-icons/md";
import { Flame, ImageOff } from 'lucide-react';
import AddorEditDishPopup from "./AddorEditDishPopup";
import DeleteDishPopup from "./DeleteDishPopup";
import NutritionModal from "./NutritionModal";
import { api, apiCache } from "../pages/RestaurantDishes"; // Import api and apiCache

const DishCard = ({ dish, categoryName, subCategoryName, restaurantId, onDishUpdate }) => {
  const [isEditPopupVisible, setIsEditPopupVisible] = useState(false);
  const [isDeletePopupVisible, setIsDeletePopupVisible] = useState(false);
  const [isNutritionModalVisible, setIsNutritionModalVisible] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [selectedServingInfo, setSelectedServingInfo] = useState(
    dish.servingInfos?.[0]?.servingInfo || null
  );

  // Set selected serving info when dish changes
  React.useEffect(() => {
    setSelectedServingInfo(dish.servingInfos?.[0]?.servingInfo || null);
    setImageError(false); // Reset image error state when dish changes
  }, [dish]);

  // Function to handle dish update with proper cache invalidation
  const handleDishUpdate = async () => {
    try {
      // First, clear the entire cache to ensure complete refresh
      apiCache.clearAll();
      
      // Call parent's update function - this should trigger a full refetch
      if (onDishUpdate) {
        await onDishUpdate();
      }
      
      // Close any open popups
      setIsEditPopupVisible(false);
      setIsDeletePopupVisible(false);
    } catch (error) {
      console.error("Error updating dish data:", error);
    }
  };

  // Helper to check if URL is valid
  const isValidUrl = (url) => {
    return url && (url.startsWith("http://") || url.startsWith("https://"));
  };

  // Generate a placeholder background if no image is available
  const getPlaceholderStyle = () => {
    // Use the dish name to create a consistent color
    const hash = dish.dishName.split('').reduce((acc, char) => char.charCodeAt(0) + acc, 0);
    const hue = hash % 360;
    
    return {
      backgroundColor: `hsl(${hue}, 70%, 85%)`,
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      width: '100%',
      height: '100%',
      color: `hsl(${hue}, 70%, 30%)`,
      fontSize: '1rem',
      textAlign: 'center',
      padding: '1rem'
    };
  };

  // Helper to get image URL or default
  const getImageUrl = () => {
    if (!selectedServingInfo || !selectedServingInfo.Url || !isValidUrl(selectedServingInfo.Url)) {
      return null; // Return null to use placeholder
    }
    
    return selectedServingInfo.Url;
  };

  // Format price with currency symbol
  const formatPrice = (price) => {
    return price ? `$${parseFloat(price).toFixed(2)}` : "N/A";
  };

  // Handle serving size change
  const handleServingSizeChange = (servingInfo) => {
    setSelectedServingInfo(servingInfo.servingInfo);
    setImageError(false); // Reset error state when changing serving size
  };

  // Handle image load error
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <div className="relative h-48 overflow-hidden">
        {getImageUrl() && !imageError ? (
          <img
            src={getImageUrl()}
            alt={dish.dishName}
            className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
            onError={handleImageError}
          />
        ) : (
          <div style={getPlaceholderStyle()}>
            <ImageOff className="w-10 h-10 mb-2" />
            <div>
              <p className="font-semibold">{dish.dishName}</p>
              <p className="text-xs mt-1">No image available</p>
            </div>
          </div>
        )}
        
        <div className="absolute top-0 right-0 p-2 flex space-x-2">
          <button
            onClick={() => setIsEditPopupVisible(true)}
            className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors"
            title="Edit dish"
          >
            <MdEdit />
          </button>
          <button
            onClick={() => setIsDeletePopupVisible(true)}
            className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            title="Delete dish"
          >
            <MdDelete />
          </button>
        </div>
      </div>

      <div className="p-4 flex-grow">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
          {dish.dishName}
        </h3>
        
        {dish.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-3">
            {dish.description}
          </p>
        )}

        {/* Serving Sizes Selection */}
        {dish.servingInfos && dish.servingInfos.length > 1 && (
          <div className="grid grid-cols-3 gap-2 justify-between space-x-2 mb-4">
            {dish.servingInfos.map((info, index) => (
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
        )}

        <div className="mt-auto">
          <div className="flex justify-between items-center">
            {selectedServingInfo && (
              <p className="text-lg font-bold text-green-600">
                {formatPrice(selectedServingInfo.price)}
              </p>
            )}
            
            <button
              onClick={() => setIsNutritionModalVisible(true)}
              className="flex items-center text-sm text-orange-600 hover:text-orange-800 transition-colors"
              title="View nutrition info"
            >
              <Flame className="h-4 w-4 mr-1" />
              <span>Nutrition</span>
            </button>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {categoryName && (
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2">
                {categoryName}
              </span>
            )}
            {subCategoryName && (
              <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                {subCategoryName}
              </span>
            )}
          </div>
        </div>
      </div>

      {isEditPopupVisible && (
        <AddorEditDishPopup
          mode="edit"
          dish={dish}
          closePopup={() => setIsEditPopupVisible(false)}
          updateDishList={handleDishUpdate}
          restaurantId={restaurantId}
        />
      )}

      {isDeletePopupVisible && (
        <DeleteDishPopup
          dish={dish}
          restaurantId={restaurantId}
          closePopup={() => setIsDeletePopupVisible(false)}
          onDeleteSuccess={handleDishUpdate}
        />
      )}

      <NutritionModal
        isOpen={isNutritionModalVisible}
        onClose={() => setIsNutritionModalVisible(false)}
        selectedServingInfo={selectedServingInfo}
      />
    </div>
  );
};

export default React.memo(DishCard);
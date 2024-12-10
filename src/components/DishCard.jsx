import React from 'react';

const DishCard = ({ dish }) => {
  const {
    dishName,
    description,
    servingInfo,
    nutritionFacts,
    category,
    subCategory
  } = dish;

  return (
    <div className="dish-card p-6 bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300">
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{dishName}</h3>
      <p className="text-sm text-gray-600 mb-4">{description || "No description available."}</p>
      
      <div className="serving-info mb-4">
        <p className="text-gray-700">
          <strong>Serving Size:</strong> {servingInfo.size} {servingInfo.unit}
        </p>
      </div>

      <div className="nutrition-facts mb-4">
        <p className="text-gray-700"><strong>Calories:</strong> {nutritionFacts.calories.value} {nutritionFacts.calories.unit}</p>
        <p className="text-gray-700"><strong>Protein:</strong> {nutritionFacts.protein.value} {nutritionFacts.protein.unit}</p>
        <p className="text-gray-700"><strong>Carbs:</strong> {nutritionFacts.carbs.value} {nutritionFacts.carbs.unit}</p>
        <p className="text-gray-700"><strong>Total Fat:</strong> {nutritionFacts.totalFat.value} {nutritionFacts.totalFat.unit}</p>
      </div>

      <div className="category-info">
        {category && <p className="text-sm text-gray-500"><strong>Category:</strong> {category}</p>}
        {subCategory && <p className="text-sm text-gray-500"><strong>Subcategory:</strong> {subCategory}</p>}
      </div>
    </div>
  );
};

export default DishCard;

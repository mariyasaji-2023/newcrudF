import React from 'react';
import { XCircle } from 'lucide-react';

const NutritionModal = ({ isOpen, onClose, selectedServingInfo }) => {
  if (!isOpen) return null;

  // Extract nutrition facts from the serving info
  const nutritionFacts = selectedServingInfo?.nutritionFacts || {};

  // Check if nutrition information exists
  const hasNutritionInfo = nutritionFacts && Object.keys(nutritionFacts).length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden transform transition-all">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-gray-900">Nutrition Facts</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <XCircle className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          {hasNutritionInfo ? (
            <div>
              <div className="mb-4">
                <div className={`text-sm ${selectedServingInfo?.Url ? 'bg-indigo-600' : 'bg-orange-500'} shadow-lg text-center rounded-sm py-2 text-white`}>
                  <strong>Serving Size: {selectedServingInfo?.size || "N/A"}</strong>
                </div>
              </div>
              
              <table className="w-full border-collapse">
                <tbody>
                  {nutritionFacts.calories && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Calories</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.calories.value || "N/A"} {nutritionFacts.calories.unit || "cal"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.protein && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Protein</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.protein.value || "N/A"} {nutritionFacts.protein.unit || "g"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.carbs && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Carbohydrates</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.carbs.value || "N/A"} {nutritionFacts.carbs.unit || "g"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.totalFat && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Total Fat</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.totalFat.value || "N/A"} {nutritionFacts.totalFat.unit || "g"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.fiber && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Fiber</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.fiber.value || "N/A"} {nutritionFacts.fiber.unit || "g"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.sugar && (
                    <tr className="border-b">
                      <td className="py-3 font-bold">Sugar</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.sugar.value || "N/A"} {nutritionFacts.sugar.unit || "g"}
                      </td>
                    </tr>
                  )}
                  
                  {nutritionFacts.sodium && (
                    <tr>
                      <td className="py-3 font-bold">Sodium</td>
                      <td className="py-3 text-right">
                        {nutritionFacts.sodium.value || "N/A"} {nutritionFacts.sodium.unit || "mg"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
              
              {selectedServingInfo && (
                <div className="mt-4 text-center">
                  <div className={`text-sm ${selectedServingInfo.Url ? 'bg-indigo-600' : 'bg-orange-500'} shadow-lg rounded-sm py-2 text-white`}>
                    <strong>Price: ${selectedServingInfo.price || "N/A"}</strong>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                Nutrition information is not available for this dish.
              </p>
            </div>
          )}
        </div>
        
        <div className="bg-gray-50 px-4 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg px-4 py-2 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default NutritionModal;
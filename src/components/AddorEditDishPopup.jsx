import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md"; // Close Icon
import axios from "axios";

const AddorEditDishPopup = ({
  mode,
  closePopup,
  updateDishList,
  restaurantId,
  dish,
  categoryId,
}) => {
  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");

  // Set values if editing an existing dish
  useEffect(() => {
    if (mode === "edit" && dish) {
      setDishName(dish.name);
      setDescription(dish.description);
      setCalories(dish.calories);
      setProtein(dish.protein);
      setCarbs(dish.carbs);
      setFat(dish.fat);
    }
  }, [mode, dish]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dishData = {
      name: dishName,
      description,
      calories,
      protein,
      carbs,
      fat,
      restaurantId,
      categoryId,
    };

    try {
      if (mode === "add") {
        // Add new dish
        const response = await axios.put(`/createdish/${categoryId}`, dishData);
        updateDishList(response.data);
      } else {
        // Edit existing dish
        const response = await axios.put(`/editDish/${dish.id}`, dishData);
        updateDishList(response.data);
      }
      closePopup();
    } catch (error) {
      console.error("Error saving dish:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            {mode === "add" ? "Add Dish" : "Edit Dish"}
          </h2>
          <button
            onClick={closePopup}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            <MdClose />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium" htmlFor="dishName">
              Dish Name
            </label>
            <input
              type="text"
              id="dishName"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-gray-700 font-medium" htmlFor="description">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium" htmlFor="calories">
                Calories (kCal)
              </label>
              <input
                type="number"
                id="calories"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium" htmlFor="protein">
                Protein (g)
              </label>
              <input
                type="number"
                id="protein"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium" htmlFor="carbs">
                Carbs (g)
              </label>
              <input
                type="number"
                id="carbs"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-gray-700 font-medium" htmlFor="fat">
                Fat (g)
              </label>
              <input
                type="number"
                id="fat"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full p-3 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full px-6 py-3 shadow-lg transform transition-all duration-300 hover:scale-105"
            >
              {mode === "add" ? "Add Dish" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddorEditDishPopup;

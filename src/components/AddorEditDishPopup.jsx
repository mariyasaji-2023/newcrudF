import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import axios from "axios";

const AddDishPopup = ({
  mode = "add",
  closePopup,
  updateDishList,
  restaurantId,
  dish,
}) => {
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [selectedSubCategoryId, setSelectedSubCategoryId] = useState("");
  const [newSubCategory, setNewSubCategory] = useState("");

  const [dishName, setDishName] = useState(dish?.name || "");
  const [description, setDescription] = useState(dish?.description || "");
  const [calories, setCalories] = useState(dish?.calories || "");
  const [protein, setProtein] = useState(dish?.protein || "");
  const [carbs, setCarbs] = useState(dish?.carbs || "");
  const [fat, setFat] = useState(dish?.fat || "");
  const [servingSize, setServingSize] = useState(dish?.servingSize || "");
  const [servingUnit, setServingUnit] = useState(dish?.servingUnit || "g");

  const [caloriesUnit] = useState("kcal");
  const [proteinUnit] = useState("g");
  const [carbsUnit] = useState("g");
  const [fatUnit] = useState("g");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(
          `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
        );
        const fetchedCategories = response.data.categories || [];
        setCategories(fetchedCategories);

        if (mode === "edit" && dish?.categoryId) {
          const selectedCategory = fetchedCategories.find(
            (cat) => cat.categoryId === dish.categoryId
          );
          if (selectedCategory) {
            setSubCategories(selectedCategory.subCategories || []);
            setSelectedCategoryId(dish.categoryId);
            setSelectedSubCategoryId(dish.subCategoryId || "");
          }
        }
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [restaurantId, mode, dish]);

  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (cat) => cat.categoryId === selectedCategoryId
      );
      setSubCategories(selectedCategory?.subCategories || []);
      setSelectedSubCategoryId("");
    }
  }, [selectedCategoryId, categories]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createCategory/${restaurantId}`,
        { categoryName: newCategory }
      );

      const updatedCategories = response.data.categories;
      setCategories(updatedCategories);
      setNewCategory(""); // Clear the input field after successful addition

      // Select the newly added category
      const newlyAddedCategory = updatedCategories.find(
        (cat) => cat.categoryName === newCategory
      );
      if (newlyAddedCategory) {
        setSelectedCategoryId(newlyAddedCategory.categoryId); // Select the new category
        setSubCategories(newlyAddedCategory.subCategories || []); // Set subcategories if available
        setSelectedSubCategoryId(""); // Reset subcategory selection
      }

    } catch (error) {
      console.error("Error adding category:", error.response?.data || error.message);
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategory.trim() || !selectedCategoryId) return;

    // Ensure the category ID is valid before sending the request
    const selectedCategory = categories.find(
      (cat) => cat.categoryId === selectedCategoryId
    );
    if (!selectedCategory) {
      console.error("Category not found");
      return;
    }

    try {
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createSubcategory/${restaurantId}/${selectedCategoryId}`,
        { subCategoryName: newSubCategory }
      );

      // Update the subcategories list after adding a new subcategory
      setSubCategories((prev) => [...prev, response.data.subCategory]);
      setNewSubCategory(""); // Clear the input field after successful addition

      // Optionally, refresh the categories list
      const updatedCategoriesResponse = await axios.get(
        `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
      );
      setCategories(updatedCategoriesResponse.data.categories || []);

    } catch (error) {
      console.error("Error adding subcategory:", error.response?.data || error.message);
    }
  };






  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the dish data as per the controller requirements
    const dishData = {
      dishName: dishName,
      description: description,
      servingInfo: {
        size: servingSize,
        unit: servingUnit
      },
      nutritionFacts: {
        calories: calories,
        protein: protein,
        carbs: carbs,
        totalFat: fat
      }
    };

    try {
      // Use PUT request to create a dish
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createDish/${selectedCategoryId}/${selectedSubCategoryId || ''}`, // Use the categoryId and subCategoryId
        dishData
      );

      // Call the updateDishList function from RestaurantDishes
      updateDishList(response.data.dish); // Add the new dish to the dish list

      closePopup(); // Close the popup after successful submission
    } catch (error) {
      console.error("Error adding dish:", error.response?.data || error.message);
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">
              {mode === "add" ? "Add Dish" : "Edit Dish"}
            </h2>
            <button onClick={closePopup} className="text-gray-500 text-2xl">
              <MdClose />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Dish Name *</label>
              <input
                type="text"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium">Category *</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>
                  ))}

                </select>
                <input
                  type="text"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="New Category"
                  className="p-2 border rounded-md"
                />
                <button
                  type="button"
                  onClick={handleAddCategory}
                  className="p-2 bg-green-500 text-white rounded-md"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Subcategory (Only If there any)</label>
              <div className="flex items-center gap-2">


                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  disabled={!selectedCategoryId}
                >
                  <option value="">
                    {selectedCategoryId ? "Select Subcategory" : "Select a category first"}
                  </option>
                  {categories.map((cat) => (
                    <option key={`${cat.categoryId}-${cat.categoryName}`} value={cat.categoryId}>
                      {cat.categoryName}
                    </option>

                  ))}

                </select>

                <input
                  type="text"
                  value={newSubCategory}
                  onChange={(e) => setNewSubCategory(e.target.value)}
                  placeholder="New Subcategory"
                  className="p-2 border rounded-md"
                  disabled={!selectedCategoryId}
                />
                <button
                  type="button"
                  onClick={handleAddSubCategory}
                  className="p-2 bg-green-500 text-white rounded-md"
                  disabled={!selectedCategoryId}
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Calories ({caloriesUnit})</label>
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Protein ({proteinUnit})</label>
                <input
                  type="number"
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Carbs ({carbsUnit})</label>
                <input
                  type="number"
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Fat ({fatUnit})</label>
                <input
                  type="number"
                  value={fat}
                  onChange={(e) => setFat(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Serving Size</label>
                <input
                  type="number"
                  value={servingSize}
                  onChange={(e) => setServingSize(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Serving Unit</label>
                <input
                  type="text"
                  value={servingUnit}
                  onChange={(e) => setServingUnit(e.target.value)}
                  className="w-full p-2 border rounded-md"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="w-full bg-blue-500 text-white py-2 rounded-md"
              >
                {mode === "add" ? "Add Dish" : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDishPopup;
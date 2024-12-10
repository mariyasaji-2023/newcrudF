import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import axios from "axios";

const AddDishPopup = ({
  mode,
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

  const [dishName, setDishName] = useState("");
  const [description, setDescription] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [servingSize, setServingSize] = useState("");
  const [servingUnit, setServingUnit] = useState("");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/api/allDishes/${restaurantId}`);
        setCategories(response.data.categories || []);
      } catch (error) {
        console.error("Error fetching categories:", error);
      }
    };

    fetchCategories();
  }, [restaurantId]);

  useEffect(() => {
    if (mode === "edit" && dish) {
      setDishName(dish.dishName);
      setDescription(dish.description || "");
      setCalories(dish.nutritionFacts?.calories?.value || "");
      setProtein(dish.nutritionFacts?.protein?.value || "");
      setCarbs(dish.nutritionFacts?.carbs?.value || "");
      setFat(dish.nutritionFacts?.totalFat?.value || "");
      setServingSize(dish.servingInfo?.size || "");
      setServingUnit(dish.servingInfo?.unit || "");
      setSelectedCategoryId(dish.categoryId || "");
      setSelectedSubCategoryId(dish.subCategoryId || "");
    }
  }, [mode, dish]);

  const handleAddCategory = async () => {
    if (newCategory.trim()) {
      try {
        const response = await axios.put(
          `http://localhost:3001/api/createCategory/${restaurantId}`,
          { categoryName: newCategory }
        );
        const addedCategory = response.data;
        setCategories([...categories, addedCategory]);  // Add the new category to the list
        setSelectedCategoryId(addedCategory._id);  // Set the selected category to the newly added category
        setNewCategory("");  // Clear the input for category
      } catch (error) {
        console.error("Error adding new category:", error);
      }
    }
  };

  const handleAddSubCategory = async () => {
    if (newSubCategory.trim() && selectedCategoryId) {
      try {
        const response = await axios.put(
          `http://localhost:3001/api/createSubcategory/${restaurantId}/${selectedCategoryId}`,
          { subCategoryName: newSubCategory }
        );
        const addedSubCategory = response.data;
        // Add new subcategory to the selected category
        const updatedCategories = categories.map((category) => {
          if (category._id === selectedCategoryId) {
            category.subCategories.push(addedSubCategory);
          }
          return category;
        });
        setCategories(updatedCategories);  // Update the categories with new subcategory
        setSubCategories([...subCategories, addedSubCategory]);  // Update subcategories for the dropdown
        setSelectedSubCategoryId(addedSubCategory._id);  // Set the newly added subcategory as selected
        setNewSubCategory("");  // Clear the input for subcategory
      } catch (error) {
        console.error("Error adding new subcategory:", error);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dishData = {
      dishName,
      description,
      servingInfo: { size: parseFloat(servingSize), unit: servingUnit },
      nutritionFacts: {
        calories: { value: parseFloat(calories), unit: "kcal" },
        protein: { value: parseFloat(protein), unit: "g" },
        carbs: { value: parseFloat(carbs), unit: "g" },
        totalFat: { value: parseFloat(fat), unit: "g" },
      },
    };

    try {
      const url =
        selectedSubCategoryId
          ? `http://localhost:3001/api/createDish/${selectedCategoryId}/${selectedSubCategoryId}`
          : `http://localhost:3001/api/createDish/${selectedCategoryId}`;

      const response = await axios.put(url, dishData);
      updateDishList(response.data.dish);
      closePopup();
    } catch (error) {
      console.error("Error saving dish:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {mode === "add" ? "Add Dish" : "Edit Dish"}
          </h2>
          <button onClick={closePopup} className="text-gray-500 text-2xl">
            <MdClose />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Dish Information */}
          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">Dish Name *</label>
            <input
              type="text"
              value={dishName}
              onChange={(e) => setDishName(e.target.value)}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-2">
            <label className="text-sm font-medium">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>

            {/* Category and Subcategory */}
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
                  <option key={cat._id} value={cat._id}>
                    {cat.categoryName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="Add New Category"
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
            <label className="block text-sm font-medium">Subcategory</label>
            <div className="flex items-center gap-2">
              <select
                value={selectedSubCategoryId}
                onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                className="flex-grow p-2 border rounded-md"
              >
                <option value="">Select Subcategory</option>
                {subCategories.map((subCat) => (
                  <option key={subCat._id} value={subCat._id}>
                    {subCat.subCategoryName}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={newSubCategory}
                onChange={(e) => setNewSubCategory(e.target.value)}
                placeholder="Add Subcategory"
                className="p-2 border rounded-md"
              />
              <button
                type="button"
                onClick={handleAddSubCategory}
                className="p-2 bg-green-500 text-white rounded-md"
              >
                Add
              </button>
            </div>
          </div>

          {/* Nutrition Facts */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Calories *</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Protein (g) *</label>
              <input
                type="number"
                value={protein}
                onChange={(e) => setProtein(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Carbs (g) *</label>
              <input
                type="number"
                value={carbs}
                onChange={(e) => setCarbs(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Fat (g) *</label>
              <input
                type="number"
                value={fat}
                onChange={(e) => setFat(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Serving Info */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm font-medium">Serving Size *</label>
              <input
                type="number"
                value={servingSize}
                onChange={(e) => setServingSize(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Unit *</label>
              <input
                type="text"
                value={servingUnit}
                onChange={(e) => setServingUnit(e.target.value)}
                className="w-full p-2 border rounded-md"
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end mt-4">
            <button type="submit" className="px-6 py-2 bg-blue-500 text-white rounded-md">
              {mode === "add" ? "Add Dish" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddDishPopup;

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

  const [dishName, setDishName] = useState(dish?.dishName || "");
  const [description, setDescription] = useState(dish?.description || "");
  const [servingInfos, setServingInfos] = useState([]);
  const [backendMessage, setBackendMessage] = useState(""); // Added backend message state

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
        setBackendMessage("Error fetching categories.");
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
      setBackendMessage("Error adding category.");
    }
  };

  const handleAddSubCategory = async () => {
    if (!newSubCategory.trim() || !selectedCategoryId) return;

    try {
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createSubcategory/${restaurantId}/${selectedCategoryId}`,
        { subCategoryName: newSubCategory }
      );

      // Update the subcategories list after adding a new subcategory
      setSubCategories((prev) => [...prev, response.data.subCategory]);
      setNewSubCategory(""); // Clear the input field after successful addition
    } catch (error) {
      console.error("Error adding subcategory:", error.response?.data || error.message);
      setBackendMessage("Error adding subcategory.");
    }
  };

  const handleAddServingInfo = () => {
    setServingInfos((prev) => [
      ...prev,
      {
        size: "",
        price: "",
        nutritionFacts: {
          calories: "",
          caloriesUnit: "",
          protein: "",
          proteinUnit: "",
          carbs: "",
          carbsUnit: "",
          totalFat: "",
          fatUnit: "",
        },
      },
    ]);
  };

  const handleRemoveServingInfo = (index) => {
    const updatedServingInfos = servingInfos.filter((_, i) => i !== index);
    setServingInfos(updatedServingInfos);
  };

  const handleChangeServingInfo = (index, field, value) => {
    // Handle only numeric input for number fields
    if (field === "size" || field === "price" || field.includes("nutritionFacts")) {
      if (value === "" || /^[0-9]+(\.[0-9]+)?$/.test(value)) {
        const updatedServingInfos = [...servingInfos];
        const keys = field.split(".");
        let temp = updatedServingInfos[index];
        keys.forEach((key, i) => {
          if (i === keys.length - 1) {
            temp[key] = value;
          } else {
            temp = temp[key];
          }
        });
        setServingInfos(updatedServingInfos);
      }
    } else {
      // Handle all other inputs normally
      const updatedServingInfos = [...servingInfos];
      updatedServingInfos[index][field] = value;
      setServingInfos(updatedServingInfos);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBackendMessage(""); // Clear previous messages

    const dishData = {
      dishName: dishName,
      description: description,
      categoryId: selectedCategoryId,
      subCategoryId: selectedSubCategoryId,
      servingInfos: servingInfos.map((info) => ({
        size: info.size,
        price: info.price,
        nutritionFacts: {
          calories: info.nutritionFacts.calories,
          caloriesUnit: info.nutritionFacts.caloriesUnit,
          protein: info.nutritionFacts.protein,
          proteinUnit: info.nutritionFacts.proteinUnit,
          carbs: info.nutritionFacts.carbs,
          carbsUnit: info.nutritionFacts.carbsUnit,
          totalFat: info.nutritionFacts.totalFat,
          fatUnit: info.nutritionFacts.fatUnit,
        },
      })),
    };

    try {
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createDish/${selectedCategoryId}/${selectedSubCategoryId || ""}`,
        dishData
      );

      updateDishList(response.data.dish); // Add the new dish to the list
      closePopup(); // Close the popup after successful submission
    } catch (error) {
      console.error("Error adding dish:", error.response?.data || error.message);
      setBackendMessage("Error adding dish.");
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
            {/* Dish Name */}
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

            {/* Description */}
            <div>
              <label className="block text-sm font-medium">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-2 border rounded-md"
              />
            </div>

            {/* Category */}
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

            {/* Subcategory */}
            <div>
              <label className="block text-sm font-medium">Subcategory</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  disabled={!selectedCategoryId}
                >
                  <option value="">Select Subcategory</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.subCategoryId} value={subCat.subCategoryId}>
                      {subCat.subCategoryName}
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

            {/* Serving Info */}
            {servingInfos.map((servingInfo, index) => (
              <div key={index} className="space-y-4 border p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Serving {index + 1}</h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveServingInfo(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium">Serving Size</label>
                  <input
                    type="text"
                    value={servingInfo.size}
                    min="0"
                    onChange={(e) =>
                      handleChangeServingInfo(index, "size", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Price</label>
                  <input
                    type="number"
                    value={servingInfo.price}
                    min="0"
                    onChange={(e) =>
                      handleChangeServingInfo(index, "price", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium">Nutrition Facts</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">Calories</label>
                      <input
                        type="number"
                        value={servingInfo.nutritionFacts.calories}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.calories", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unit</label>
                      <input
                        type="text"
                        value={servingInfo.nutritionFacts.caloriesUnit}
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.caloriesUnit", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. kcal"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Protein</label>
                      <input
                        type="number"
                        value={servingInfo.nutritionFacts.protein}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.protein", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unit</label>
                      <input
                        type="text"
                        value={servingInfo.nutritionFacts.proteinUnit}
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.proteinUnit", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. g"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Carbs</label>
                      <input
                        type="number"
                        value={servingInfo.nutritionFacts.carbs}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.carbs", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unit</label>
                      <input
                        type="text"
                        value={servingInfo.nutritionFacts.carbsUnit}
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.carbsUnit", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. g"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Fat</label>
                      <input
                        type="number"
                        value={servingInfo.nutritionFacts.totalFat}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.totalFat", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium">Unit</label>
                      <input
                        type="text"
                        value={servingInfo.nutritionFacts.fatUnit}
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.fatUnit", e.target.value)
                        }
                        className="w-full p-2 border rounded-md"
                        placeholder="e.g. g"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Backend Message Display */}
          {backendMessage && (
            <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
              {backendMessage}
            </div>
          )}

            <div className="flex justify-between items-center">
              <button
                type="button"
                onClick={handleAddServingInfo}
                className="p-2 bg-blue-500 text-white rounded-md"
              >
                Add Serving Info
              </button>
              <button
                type="submit"
                className="p-2 bg-green-500 text-white rounded-md"
              >
                {mode === "add" ? "Add Dish" : "Update Dish"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddDishPopup;

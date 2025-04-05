import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import axios from "axios";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

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
  const [backendMessage, setBackendMessage] = useState("");

  // Define fetchCategoriesWithCacheBusting function
  const fetchCategoriesWithCacheBusting = async () => {
    try {
      const response = await axios.get(
        `${baseUrl}/api/restaurants/allDishes/${restaurantId}?_nocache=${Date.now()}`
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

  // 1. Initialize form data from dish (if in edit mode)
  useEffect(() => {
    if (mode === "edit" && dish) {
      setDishName(dish.dishName || "");
      setDescription(dish.description || "");
      setSelectedCategoryId(dish.categoryId || "");
      setSelectedSubCategoryId(dish.subCategoryId || "");

      const transformedServingInfos =
        dish.servingInfos?.map((info) => ({
          size: info.servingInfo?.size || "",
          Url: info.servingInfo?.Url || "",
          nutritionFacts: {
            calories: info.servingInfo?.nutritionFacts?.calories?.value || "",
            protein: info.servingInfo?.nutritionFacts?.protein?.value || "",
            carbs: info.servingInfo?.nutritionFacts?.carbs?.value || "",
            totalFat: info.servingInfo?.nutritionFacts?.totalFat?.value || "",
          },
        })) || [];
      setServingInfos(transformedServingInfos);
    }
  }, [mode, dish]);

  // 2. Fetch categories when component mounts or restaurantId/mode/dish changes
  useEffect(() => {
    fetchCategoriesWithCacheBusting();
  }, [restaurantId, mode, dish]);

  // 3. Update subcategories when selected category changes
  useEffect(() => {
    if (selectedCategoryId) {
      const selectedCategory = categories.find(
        (cat) => cat.categoryId === selectedCategoryId
      );
      setSubCategories(selectedCategory?.subCategories || []);
      if (mode !== "edit") {
        // Only reset subcategory when not in edit mode
        setSelectedSubCategoryId("");
      }
    }
  }, [selectedCategoryId, categories, mode]);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
  
    try {
      setBackendMessage("Adding category...");
      
      // Add a cache-busting parameter to the request
      const response = await axios.put(
        `${baseUrl}/api/restaurants/createCategory/${restaurantId}?_nocache=${Date.now()}`,
        { categoryName: newCategory }
      );
      
      // Check if the response includes the newly created category
      const newCategoryData = response.data.category;
      
      // Fetch the updated categories directly with a cache-busting parameter
      const updatedCategoriesResponse = await axios.get(
        `${baseUrl}/api/restaurants/allDishes/${restaurantId}?_nocache=${Date.now()}`
      );
      const updatedCategories = updatedCategoriesResponse.data.categories || [];
      
      // Update the categories in state
      setCategories(updatedCategories);
      
      // Clear the input
      setNewCategory("");
      
      // Find the newly created category in the updated list
      const newlyAddedCategory = updatedCategories.find(
        (cat) => cat.categoryName === newCategory
      );
      
      if (newlyAddedCategory) {
        // Select the newly added category
        setSelectedCategoryId(newlyAddedCategory.categoryId);
        // Clear any subcategories since we've changed categories
        setSubCategories(newlyAddedCategory.subCategories || []);
        setSelectedSubCategoryId("");
      }
      
      setBackendMessage(""); // Clear any message
    } catch (error) {
      console.error(
        "Error adding category:",
        error.response?.data || error.message
      );
      setBackendMessage("Error adding category.");
    }
  };
 
  const handleAddSubCategory = async () => {
    if (!newSubCategory.trim() || !selectedCategoryId) return;

    try {
      setBackendMessage("Adding subcategory...");
      
      // Add the new subcategory with a cache-busting parameter
      await axios.put(
        `${baseUrl}/api/restaurants/createSubcategory/${restaurantId}/${selectedCategoryId}?_nocache=${Date.now()}`,
        { subCategoryName: newSubCategory }
      );

      // Fetch the updated categories with a cache-busting parameter
      const updatedCategoriesResponse = await axios.get(
        `${baseUrl}/api/restaurants/allDishes/${restaurantId}?_nocache=${Date.now()}`
      );
      const updatedCategories = updatedCategoriesResponse.data.categories || [];

      // Update the categories in state
      setCategories(updatedCategories);
      
      // Find the updated category
      const updatedCategory = updatedCategories.find(
        (cat) => cat.categoryId === selectedCategoryId
      );
      
      if (updatedCategory) {
        // Update subcategories
        setSubCategories(updatedCategory.subCategories || []);

        // Find the newly added subcategory and select it
        const newlyAddedSubCategory = updatedCategory.subCategories.find(
          (subCat) => subCat.subCategoryName === newSubCategory
        );
        
        if (newlyAddedSubCategory) {
          setSelectedSubCategoryId(newlyAddedSubCategory.subCategoryId);
        }
      }

      setNewSubCategory(""); // Clear the input
      setBackendMessage(""); // Clear any message
    } catch (error) {
      console.error(
        "Error adding subcategory:",
        error.response?.data || error.message
      );
      setBackendMessage("Error adding subcategory.");
    }
  };

  const handleAddServingInfo = () => {
    setServingInfos((prev) => [
      ...prev,
      {
        size: "",
        Url: "",
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
    const updatedServingInfos = [...servingInfos];
    const keys = field.split(".");
    let temp = updatedServingInfos[index];
  
    // No validation for "price" field
    if (field === "Url" || field.includes("Url")) {
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          temp[key] = value; // Allow any text value for price
        } else {
          temp = temp[key];
        }
      });
      setServingInfos(updatedServingInfos);
    } else {
      keys.forEach((key, i) => {
        if (i === keys.length - 1) {
          temp[key] = value;
        } else {
          temp = temp[key];
        }
      });
      setServingInfos(updatedServingInfos);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted!");
    setBackendMessage("");
  
    const dishData = {
      dishName: dishName,
      description: description,
      originalCategoryId: dish?.categoryId || "", 
      originalSubCategoryId: dish?.subCategoryId || "",
      servingInfos: servingInfos.map((info) => ({
        size: info.size,
        Url: info.Url,
        nutritionFacts: {
          calories: info.nutritionFacts.calories,
          protein: info.nutritionFacts.protein,
          carbs: info.nutritionFacts.carbs,
          totalFat: info.nutritionFacts.totalFat,
        },
      })),
    };
  
    try {
      let response;
      if (mode === "edit") {
        response = await axios.put(
          `${baseUrl}/api/restaurants/editDish/${dish._id}/${selectedCategoryId}/${selectedSubCategoryId || ""}?_nocache=${Date.now()}`,
          dishData
        );
      } else {
        response = await axios.put(
          `${baseUrl}/api/restaurants/createDish/${selectedCategoryId}/${selectedSubCategoryId || ""}?_nocache=${Date.now()}`,
          dishData
        );
      }
  
      // First close the popup immediately
      closePopup();
      
      // Then pass the complete dish object back to the parent component
      // Include additional category information for immediate UI update
      const dishWithCategoryInfo = {
        ...response.data.dish,
        // Ensure these fields are populated for UI organization
        categoryId: selectedCategoryId,
        subCategoryId: selectedSubCategoryId || ""
      };
      
      // Call parent update function after a short delay to ensure popup is closed
      setTimeout(() => {
        updateDishList(dishWithCategoryInfo);
      }, 10);
      
    } catch (error) {
      console.error(
        "Error saving dish:",
        error.response?.data || error.message
      );
      setBackendMessage(
        error.response?.data?.message ||
        `Error ${mode === "edit" ? "updating" : "adding"} dish. ${error.response?.data?.details || ""}`
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold ml-40">
              {mode === "add" ? "Add Dish" : "Edit Dish"}
            </h2>
            <button onClick={closePopup} className="text-gray-500 text-2xl">
              <MdClose />
            </button>
          </div>
          <div className="mb-2 flex justify-center">
            <p>
              Fields marked with an asterisk <strong>(*)</strong> are mandatory.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dish Name */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <strong>Dish Name</strong> (*)
              </label>
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
              <label className="block text-sm font-medium mb-1">
                <strong>Description</strong>
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value.slice(0,1000))}
                maxLength="1000"
                className="w-full p-2 border rounded-md"
              />
              <small>{description.length}/1000 characters</small>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1">
                <strong>Category</strong> (*)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  required
                >
                  <option value="">
                    <strong>Select Category</strong>
                  </option>
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
              <label className="block text-sm font-medium mb-1">
                <strong>Subcategory</strong> (only if one exists)
              </label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  disabled={!selectedCategoryId}
                >
                  <option value="">
                    <strong>Select Subcategory</strong>
                  </option>
                  {subCategories.map((subCat) => (
                    <option
                      key={subCat.subCategoryId}
                      value={subCat.subCategoryId}
                    >
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
                  <h4 className="font-medium">
                    <strong>Serving {index + 1}</strong>
                  </h4>
                  <button
                    type="button"
                    onClick={() => handleRemoveServingInfo(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    Remove
                  </button>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">
                    <strong>Serving Size</strong> (*)
                  </label>
                  <input
                    type="text"
                    value={servingInfo.size}
                    onChange={(e) =>
                      handleChangeServingInfo(index, "size", e.target.value)
                    }
                    className="w-full p-2 border rounded-md no-spinner"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    <strong>Url </strong>
                  </label>
                  <input
                    type="text"
                    value={servingInfo.Url}
                    onChange={(e) =>
                      handleChangeServingInfo(index, "Url", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium">
                    <strong>Nutrition Facts</strong>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium">
                        <strong>Calories in cal</strong> (*)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={servingInfo.nutritionFacts.calories}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(
                            index,
                            "nutritionFacts.calories",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        <strong>Protein in g</strong> (*)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={servingInfo.nutritionFacts.protein}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(
                            index,
                            "nutritionFacts.protein",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        <strong>Carbohydrates (Carbs) in g</strong> (*)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={servingInfo.nutritionFacts.carbs}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(
                            index,
                            "nutritionFacts.carbs",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium">
                        <strong>Total Fat in g</strong> (*)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={servingInfo.nutritionFacts.totalFat}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(
                            index,
                            "nutritionFacts.totalFat",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        required
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Add serving info if none exists */}
            {servingInfos.length === 0 && (
              <div className="bg-blue-50 p-4 rounded-md text-center">
                <p className="text-blue-600 mb-2">At least one serving info is required</p>
                <button
                  type="button"
                  onClick={handleAddServingInfo}
                  className="p-2 bg-blue-500 text-white rounded-md"
                >
                  Add Serving Info
                </button>
              </div>
            )}

            {/* Backend Message Display */}
            {backendMessage && (
              <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                {backendMessage}
              </div>
            )}

            <div className="flex justify-between items-center">
              {servingInfos.length > 0 && (
                <button
                  type="button"
                  onClick={handleAddServingInfo}
                  className="p-2 bg-blue-500 text-white rounded-md"
                >
                  Add Serving Info
                </button>
              )}
              <button
                type="submit"
                className="p-2 bg-green-500 text-white rounded-md"
                disabled={servingInfos.length === 0}
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
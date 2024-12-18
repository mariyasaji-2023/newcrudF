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
            setSelectedCategoryId(dish.categoryId); // Correctly setting categoryId
            setSelectedSubCategoryId(dish.subCategoryId || "");
          }
          console.log("Selected Category ID:", selectedCategoryId);

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

      // Fetch the updated list of categories after adding a new one
      const updatedCategoriesResponse = await axios.get(
        `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
      );
      const updatedCategories = updatedCategoriesResponse.data.categories || [];
      setCategories(updatedCategories);

      // Clear the input field after successful addition
      setNewCategory("");

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
      // Make the API call to create the new subcategory
      const response = await axios.put(
        `http://localhost:3001/api/restaurants/createSubcategory/${restaurantId}/${selectedCategoryId}`,
        { subCategoryName: newSubCategory }
      );

      // Fetch the updated subcategories from the backend after adding the new subcategory
      const updatedCategoriesResponse = await axios.get(
        `http://localhost:3001/api/restaurants/allDishes/${restaurantId}`
      );
      const updatedCategories = updatedCategoriesResponse.data.categories || [];

      // Find the category with the selected category ID and update the subcategories list
      const updatedCategory = updatedCategories.find(
        (cat) => cat.categoryId === selectedCategoryId
      );
      if (updatedCategory) {
        setSubCategories(updatedCategory.subCategories || []);
      }

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
    const updatedServingInfos = [...servingInfos];
    const keys = field.split(".");
    let temp = updatedServingInfos[index];
  
    // Allow float validation for 'price' or any numeric field
    const isFloat = (val) => val === "" || /^[0-9]+(\.[0-9]*)?$/.test(val);
  
    if (field === "price" || field.includes("price")) {
      if (isFloat(value)) {
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
      // Handle other fields normally
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

      // If backend provides a message, show it, otherwise use a default error message
      setBackendMessage(error.response?.data?.message || "Error adding dish.");
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
            <p>"Fields marked with an asterisk <strong>(*)</strong> are mandatory."</p>
          </div>


          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Dish Name */}
            <div>
              <label className="block text-sm font-medium mb-1"><strong>Dish Name</strong> (*)</label>
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
                onChange={(e) => setDescription(e.target.value.slice(0, 150))}
                maxLength="150"
                className="w-full p-2 border rounded-md"
              />
              <small>{description.length}/150 characters</small>
            </div>


            {/* Category */}
            <div>
              <label className="block text-sm font-medium mb-1"><strong>Category</strong> (*)</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedCategoryId}
                  onChange={(e) => setSelectedCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  required
                >
                  <option value=""><strong>Select Category</strong></option>
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
              <label className="block text-sm font-medium mb-1"><strong>Subcategory</strong> (only if one exists)</label>
              <div className="flex items-center gap-2">
                <select
                  value={selectedSubCategoryId}
                  onChange={(e) => setSelectedSubCategoryId(e.target.value)}
                  className="flex-grow p-2 border rounded-md"
                  disabled={!selectedCategoryId}
                >
                  <option value=""><strong>Select Subcategory</strong></option>
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
                  <h4 className="font-medium"><strong> Serving {index + 1}</strong></h4>
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
                    onChange={(e) => handleChangeServingInfo(index, "size", e.target.value)}
                    className="w-full p-2 border rounded-md no-spinner"
                  />
                </div>


                <div>
                  <label className="block text-sm font-medium mb-1"><strong>Price in $</strong></label>
                  <input
                    type="number"
                    step="0.01" 
                    value={servingInfo.price}
                    min="0"
                    onChange={(e) =>
                      handleChangeServingInfo(index, "price", e.target.value)
                    }
                    className="w-full p-2 border rounded-md no-spinner"
                  />
                </div>

                <div>
                  <label className="block text-sm mb-1 font-medium"><strong>Nutrition Facts</strong></label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium"><strong>Calories in kcal</strong> (*)</label>
                      <input
                        type="number"
                        step="0.01" 
                        value={servingInfo.nutritionFacts.calories}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.calories", e.target.value)
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium"><strong>Protein in g</strong> (*)</label>
                      <input
                        type="number"
                        step="0.01" 
                        value={servingInfo.nutritionFacts.protein}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.protein", e.target.value)
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium"><strong>Carbohydrates (Carbs) in g</strong> (*)</label>
                      <input
                        type="number"
                        step="0.01" 
                        value={servingInfo.nutritionFacts.carbs}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.carbs", e.target.value)
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium"><strong>Total Fat in g</strong> (*)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={servingInfo.nutritionFacts.totalFat}
                        min="0"
                        onChange={(e) =>
                          handleChangeServingInfo(index, "nutritionFacts.totalFat", e.target.value)
                        }
                        className="w-full p-2 border rounded-md no-spinner"
                        
                        
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

import React, { useState, useEffect } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

const AddorEditRestaurantPopup = ({
  restaurant = null,  // Provide default value
  mode = "add",      // Provide default value
  closePopup,
  updateRestaurantList,
}) => {
  // Initialize state immediately with all possible values
  const initialState = {
    restaurantName: restaurant?.restaurantName || "",
    logoUrl: (restaurant?.logo && restaurant.logo.startsWith('http')) ? restaurant.logo : "",
    logoFile: null,
    uploadType: (restaurant?.logo && restaurant.logo.startsWith('http')) ? 'url' : 'file',
    error: ""
  };

  const [formState, setFormState] = useState(initialState);

  // Update state when restaurant prop changes
  useEffect(() => {
    if (restaurant) {
      setFormState({
        restaurantName: restaurant.restaurantName || "",
        logoUrl: (restaurant.logo && restaurant.logo.startsWith('http')) ? restaurant.logo : "",
        logoFile: null,
        uploadType: (restaurant.logo && restaurant.logo.startsWith('http')) ? 'url' : 'file',
        error: ""
      });
    }
  }, [restaurant]);

// In AddorEditRestaurantPopup.jsx

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!formState.restaurantName.trim()) {
    setFormState(prev => ({ ...prev, error: "Restaurant name is required." }));
    return;
  }

  if (formState.uploadType === 'url' && formState.logoUrl && !isValidUrl(formState.logoUrl)) {
    setFormState(prev => ({ ...prev, error: "Please enter a valid URL for the logo." }));
    return;
  }

  try {
    const formData = new FormData();
    formData.append("restaurantName", formState.restaurantName.trim());

    if (formState.uploadType === 'url' && formState.logoUrl) {
      formData.append("logo", formState.logoUrl.trim());
    } else if (formState.logoFile) {
      formData.append("logo", formState.logoFile);
    }

    const config = {
      headers: { "Content-Type": "multipart/form-data" },
    };

    let response;
    if (mode === "edit" && restaurant?._id) {
      response = await axios.put(
        `${baseUrl}/api/restaurants/editRestaurant/${restaurant._id}`,
        formData,
        config
      );
    } else {
      response = await axios.post(
        `${baseUrl}/api/restaurants/createRestaurant`,
        formData,
        config
      );
    }

    // Call updateRestaurantList without passing the response data
    // Let the parent component handle the refresh
    updateRestaurantList();
    closePopup();
  } catch (err) {
    handleError(err);
  }
};


  const handleError = (err) => {
    const errorMessage = err.response?.data?.message || 
                        (err.response?.status === 404 ? "Resource not found." : 
                        (err.request ? "Network error. Please check your internet connection." : 
                        err.message || "An unexpected error occurred."));
    
    setFormState(prev => ({ ...prev, error: errorMessage }));
    console.error("Error submitting the restaurant:", err);
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    
    if (!file) {
      setFormState(prev => ({ ...prev, logoFile: null, error: "" }));
      return;
    }

    const allowedTypes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setFormState(prev => ({
        ...prev,
        logoFile: null,
        error: "Only .png, .jpg, .jpeg, and .webp files are allowed."
      }));
    } else {
      setFormState(prev => ({
        ...prev,
        logoFile: file,
        error: ""
      }));
    }
  };

  const handleUploadTypeChange = (e) => {
    const newType = e.target.value;
    setFormState(prev => ({
      ...prev,
      uploadType: newType,
      logoUrl: newType === 'file' ? '' : prev.logoUrl,
      logoFile: newType === 'url' ? null : prev.logoFile,
      error: ""
    }));
  };

  const isValidUrl = (string) => {
    try {
      return Boolean(string && (string.startsWith('http://') || string.startsWith('https://')));
    } catch (error) {
      return false;
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">
          {mode === "edit" ? "Edit" : "Add"} Restaurant
        </h2>

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="restaurantName" className="block text-gray-700">
              Restaurant Name
            </label>
            <input
              type="text"
              id="restaurantName"
              className="w-full p-2 mt-2 border rounded-lg"
              value={formState.restaurantName}
              onChange={(e) => setFormState(prev => ({ 
                ...prev, 
                restaurantName: e.target.value 
              }))}
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2">Logo Upload Type</label>
            <div className="flex space-x-4 mb-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadType"
                  value="url"
                  checked={formState.uploadType === 'url'}
                  onChange={handleUploadTypeChange}
                  className="mr-2"
                />
                URL
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadType"
                  value="file"
                  checked={formState.uploadType === 'file'}
                  onChange={handleUploadTypeChange}
                  className="mr-2"
                />
                File Upload
              </label>
            </div>

            {formState.uploadType === 'url' ? (
              <input
                type="url"
                id="logoUrl"
                name="logoUrl"
                className="w-full p-2 mt-2 border rounded-lg"
                value={formState.logoUrl}
                onChange={(e) => setFormState(prev => ({ 
                  ...prev, 
                  logoUrl: e.target.value 
                }))}
                placeholder="https://example.com/logo.png"
              />
            ) : (
              <input
                type="file"
                id="logo"
                name="logo"
                className="w-full p-2 mt-2 border rounded-lg"
                accept=".png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
              />
            )}
          </div>

          {formState.error && (
            <p className="text-red-500 mb-4">{formState.error}</p>
          )}

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              onClick={closePopup}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700"
            >
              {mode === "edit" ? "Save Changes" : "Add Restaurant"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddorEditRestaurantPopup;
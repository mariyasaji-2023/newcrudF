import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, Edit, Trash2, X } from 'lucide-react';
import axios from 'axios';
const baseUrl = import.meta.env.VITE_APP_BASE_URL;

const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, categoryName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Delete Category</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-6">
          <p className="text-gray-600">
            Are you sure you want to delete the category "{categoryName}"? This action cannot be undone.
          </p>
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const EditCategoryModal = ({ category, isOpen, onClose, onUpdate }) => {
  const [categoryName, setCategoryName] = useState(category?.categoryName || '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await onUpdate(category._id, categoryName);
      onClose();
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Category</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
              Category Name
            </label>
            <input
              type="text"
              id="categoryName"
              value={categoryName}
              onChange={(e) => setCategoryName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
          <div className="flex justify-end space-x-3">
            
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const RestaurantCategories = () => {
  const [expandedRestaurant, setExpandedRestaurant] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      setLoading(true);
      const response = await axios.get('${baseUrl}/api/restaurants/Categories', {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      
      if (Array.isArray(response.data)) {
        setRestaurants(response.data);
      } else {
        setError('Unexpected data format received');
        setRestaurants([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load restaurants');
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCategory = async (categoryId, newName) => {
    try {
      const response = await axios.put(`${baseUrl}/api/restaurants/updateCategory`, {
        categoryId,
        name: newName
      });
      
      if (response.data) {
        const updatedRestaurants = restaurants.map(restaurant => ({
          ...restaurant,
          categories: restaurant.categories.map(category => 
            category._id === categoryId
              ? { ...category, categoryName: newName }
              : category
          )
        }));
        setRestaurants(updatedRestaurants);
      }
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await axios.delete(`${baseUrl}/api/restaurants/delete/${categoryId}`);
      
      // Update local state to remove the deleted category
      const updatedRestaurants = restaurants.map(restaurant => ({
        ...restaurant,
        categories: restaurant.categories.filter(category => category._id !== categoryId)
      }));
      
      setRestaurants(updatedRestaurants);
      setDeletingCategory(null); // Close the confirmation modal
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-600">{error}</div>
      </div>
    );
  }

  const restaurantsArray = Array.isArray(restaurants) ? restaurants : [];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">Restaurant Admin</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4 md:mb-0">
              Restaurant Categories
            </h1>
          </div>
        </div>

        <div className="space-y-6">
          {restaurantsArray.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-6 text-center">
              <p className="text-gray-500">No restaurants found</p>
            </div>
          ) : (
            restaurantsArray.map(restaurant => (
              <div key={restaurant._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div 
                  className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setExpandedRestaurant(expandedRestaurant === restaurant._id ? null : restaurant._id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {expandedRestaurant === restaurant._id ? 
                        <ChevronDown className="w-6 h-6 text-gray-500" /> : 
                        <ChevronRight className="w-6 h-6 text-gray-500" />
                      }
                      <h2 className="text-xl font-bold text-gray-800">{restaurant.restaurantName}</h2>
                    </div>
                    <span className="text-sm font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {restaurant.categories?.length || 0} Categories
                    </span>
                  </div>
                </div>

                {expandedRestaurant === restaurant._id && (
                  <div className="border-t border-gray-100">
                    <div className="p-6 space-y-6">
                      {(restaurant.categories || []).map(category => (
                        <div key={category._id} className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <h3 className="text-lg font-semibold text-gray-700">{category.categoryName}</h3>
                              <div className="flex space-x-2">
                                <button 
                                  className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  onClick={() => setEditingCategory(category)}
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button 
                                  className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  onClick={() => setDeletingCategory(category)}
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pl-6">
                            {(category.subCategories || []).map(subcategory => (
                              <div
                                key={subcategory._id}
                                className="bg-gray-50 rounded-lg p-4 flex items-center justify-between group hover:bg-gray-100 transition-all duration-200"
                              >
                                <span className="text-gray-700">{subcategory.subCategoryName}</span>
                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                  <button 
                                    className="p-1.5 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition-colors"
                                  >
                                    <Edit className="w-3 h-3" />
                                  </button>
                                  <button 
                                    className="p-1.5 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      <EditCategoryModal
        category={editingCategory}
        isOpen={!!editingCategory}
        onClose={() => setEditingCategory(null)}
        onUpdate={handleUpdateCategory}
      />

      <DeleteConfirmationModal
        isOpen={!!deletingCategory}
        onClose={() => setDeletingCategory(null)}
        onConfirm={() => handleDeleteCategory(deletingCategory?._id)}
        categoryName={deletingCategory?.categoryName}
      />
    </div>
  );
};

export default RestaurantCategories;
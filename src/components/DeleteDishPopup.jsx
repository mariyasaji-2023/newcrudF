import React, { useState } from 'react';

const DeleteDishPopup = ({ restaurantId, dish, closePopup, updateDishList }) => {
  const [deleteInput, setDeleteInput] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate delete input
    if (!deleteInput) {
      setError('Delete ID is required.');
      return;
    }

    // Clear previous errors
    setError('');

    try {
      const response = await fetch(`http://localhost:3001/api/restaurants/deleteDish/${restaurantId}/${dish._id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deleteId: deleteInput })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete dish');
      }

      // Update dish list and close popup
      updateDishList(dish._id);
      closePopup();
    } catch (err) {
      console.error('Error deleting the dish:', err);
      setError(err.message || 'An unexpected error occurred.');
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-8 rounded-lg shadow-lg w-96">
        <h2 className="text-2xl font-semibold mb-4">Delete Dish</h2>
        <h3 className="text-xl mb-4">{dish.dishName}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deleteId" className="block text-gray-700">Only Admin can delete</label>
            <input
              type="text"
              id="deleteId"
              className="w-full p-2 mt-2 border rounded-lg"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Enter delete ID"
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between">
            <button 
              type="button" 
              className="bg-gray-500 text-white py-2 px-4 rounded-lg" 
              onClick={closePopup}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-red-600 text-white py-2 px-4 rounded-lg"
            >
              Delete Dish
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteDishPopup;

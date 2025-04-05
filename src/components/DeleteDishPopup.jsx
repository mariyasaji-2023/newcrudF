import React, { useState } from "react";
import axios from "axios";

const baseUrl = import.meta.env.VITE_APP_BASE_URL;

// Create api reference using the same axios instance with cache invalidation
const api = axios.create({
  baseURL: baseUrl,
  headers: { 'Content-Type': 'application/json' }
});

const DeleteDishPopup = ({
  restaurantId,
  dish,
  closePopup,
  onDeleteSuccess,
}) => {
  const [deleteInput, setDeleteInput] = useState("");
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deleteInput) {
      setError("Delete ID is required.");
      return;
    }

    setIsDeleting(true);

    try {
      // Use axios instead of fetch for consistency
      const response = await api.delete(
        `/api/restaurants/deleteDish/${restaurantId}/${dish._id}`,
        {
          data: { deleteId: deleteInput }
        }
      );

      // Directly call onDeleteSuccess to refresh the data
      await onDeleteSuccess();
      closePopup();
    } catch (err) {
      console.error("Error deleting the dish:", err);
      setError(
        err.response?.data?.message || 
        "Failed to delete dish. Please check your delete ID."
      );
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-sm w-full">
        <h2 className="text-2xl font-semibold mb-4">Delete Dish</h2>
        <h3 className="text-xl mb-4">{dish.dishName}</h3>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="deleteId" className="block text-gray-700">
              Only Admin can delete
            </label>
            <input
              type="text"
              id="deleteId"
              className="w-full p-2 mt-2 border rounded-lg"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              placeholder="Enter delete ID"
              disabled={isDeleting}
            />
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          <div className="flex justify-between">
            <button
              type="button"
              className="bg-gray-500 text-white py-2 px-4 rounded-lg hover:bg-gray-600"
              onClick={closePopup}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`${
                isDeleting ? "bg-red-400" : "bg-red-600 hover:bg-red-700"
              } text-white py-2 px-4 rounded-lg transition-colors`}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Dish"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeleteDishPopup;
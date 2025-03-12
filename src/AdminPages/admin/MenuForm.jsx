import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { API_BASE_URL, SELF_URL } from "../../config";
import { FiTrash } from "react-icons/fi";

const MenuForm = () => {
  const [menuItems, setMenuItems] = useState([]);
  const storedSlug = localStorage.getItem("restaurantSlug");

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/menu`, {
          credentials: "include",
        }); 
        if (response.ok) {
          const data = await response.json();
          setMenuItems(data);
        }
      } catch (error) {
        console.error("Error fetching menu:", error);
        toast.error("Error loading menu");
      }
    };

    fetchMenu();
  }, []);

  const addMenuItem = () => {
    setMenuItems([
      ...menuItems,
      {
        itemName: "",
        itemDescription: "",
        itemAvailable: true,
        itemCost: "",
        itemCategory: "",
        itemImage: null,
      },
    ]);
  };

  const handleInputChange = (index, field, value) => {
    const newItems = [...menuItems];
    newItems[index][field] = value;
    setMenuItems(newItems);
  };

  const handleImageUpload = (index, file) => {
    const newItems = [...menuItems];
    newItems[index].itemImage = file;
    setMenuItems(newItems);
  };

  const toggleAvailability = (index) => {
    const newItems = [...menuItems];
    newItems[index].itemAvailable = !newItems[index].itemAvailable;
    setMenuItems(newItems);
  };

  const deleteItem = (index) => {
    setMenuItems(menuItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    const imageFiles = [];

    menuItems.forEach((item, index) => {
      formData.append(`items[${index}][itemName]`, item.itemName.trim());
      formData.append(`items[${index}][itemDescription]`, item.itemDescription.trim());
      formData.append(`items[${index}][itemAvailable]`, item.itemAvailable);
      formData.append(`items[${index}][itemCost]`, parseFloat(item.itemCost) || 0);
      formData.append(`items[${index}][itemCategory]`, item.itemCategory.trim());
      // Include existing image URL if no new image is uploaded
      if (item.itemImage instanceof File) {
        imageFiles.push(item.itemImage);
      } else if (item.itemImage) {
        formData.append(`items[${index}][itemImage]`, item.itemImage);
      }
    });

    imageFiles.forEach((file) => formData.append("itemImages", file));

    try {
      console.log(formData);
      const response = await fetch(`${API_BASE_URL}/api/menu`, {
        method: "POST",
        credentials: "include", // Include session authentication
        body: formData,
      });

      if (response.ok) {
        toast.success("Menu saved successfully!");
      } else {
        toast.error("Failed to save menu.");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Error saving menu.");
    }
  };

  return (
    <div className="menu-container">
      <h2>Restaurant Menu</h2>
      <button className="submit-button" onClick={() => window.open(`${SELF_URL}/${storedSlug}/menu`, "_blank")}>Preview Menu</button>
      <form onSubmit={handleSubmit} encType="multipart/form-data">
        <table className="menu-table">
          <thead>
            <tr>
              <th>Item Name</th>
              <th>Description</th>
              <th>Available</th>
              <th>Cost</th>
              <th>Category</th>
              <th>Image Upload</th>
              <th>Image Preview</th>
              <th>Remove</th>
            </tr>
          </thead>
          <tbody>
            {menuItems.map((item, index) => (
              <tr key={index}>
                <td>
                  <input
                    type="text"
                    value={item.itemName}
                    onChange={(e) =>
                      handleInputChange(index, "itemName", e.target.value)
                    }
                    required
                  />
                </td>
                <td>
                  <textarea
                    value={item.itemDescription}
                    onChange={(e) =>
                      handleInputChange(
                        index,
                        "itemDescription",
                        e.target.value
                      )
                    }
                    required
                  />
                </td>
                <td>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={item.itemAvailable}
                      onChange={() => toggleAvailability(index)}
                    />
                    <span className="slider round"></span>
                  </label>
                </td>
                <td>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.itemCost}
                    onChange={(e) =>
                      handleInputChange(index, "itemCost", e.target.value)
                    }
                    required
                  />
                </td>
                <td>
                  <input
                    type="text"
                    value={item.itemCategory}
                    onChange={(e) =>
                      handleInputChange(index, "itemCategory", e.target.value)
                    }
                    required
                  />
                </td>
                <td>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      handleImageUpload(index, e.target.files[0])
                    }
                    required={!item.itemImage}
                  />
                </td>
                <td>
                  {item.itemImage && (
                    <img
                      src={
                        item.itemImage instanceof File
                          ? URL.createObjectURL(item.itemImage)
                          : `${API_BASE_URL}${item.itemImage}`
                      }
                      alt="Preview"
                      width="50"
                    />
                  )}
                </td>
                <td>
                  <FiTrash className="trash" size={24} color="red" onClick={() => deleteItem(index)}/>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <button type="button" onClick={addMenuItem} className="add-button">
          ADD ITEM
        </button>
        <button type="submit" className="submit-button">
          SAVE MENU
        </button>
      </form>
    </div>
  );
};

export default MenuForm;
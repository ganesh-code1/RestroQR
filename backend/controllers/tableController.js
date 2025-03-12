import Table from "../Models/Table.js";

export const getAllTables = async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const tables = await Table.find({ restaurantId }).sort({ tableId: 1 });
    res.json(tables);
  } catch (error) {
    console.error("Error fetching tables:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const addTable = async (req, res) => {
  try {
    const { tableId, peopleCount } = req.body;
    const restaurantId = req.session.uid;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const newTable = new Table({
      restaurantId,
      tableId,
      peopleCount,
    });
    await newTable.save();
    res.status(201).json({ message: "Table added successfully", table: newTable });
  } catch (error) {
    console.error("Error adding table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateTable = async (req, res) => {
  try {
    const { tableId, peopleCount } = req.body;
    const restaurantId = req.session.uid;
    const tableObjectId = req.params.tableId;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const updatedTable = await Table.findByIdAndUpdate(
      tableObjectId,
      { tableId, peopleCount },
      { new: true }
    );
    if (!updatedTable) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.json({ message: "Table updated successfully", table: updatedTable });
  } catch (error) {
    console.error("Error updating table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteTable = async (req, res) => {
  try {
    const restaurantId = req.session.uid;
    const tableObjectId = req.params.tableId;
    if (!restaurantId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const deletedTable = await Table.findByIdAndDelete(tableObjectId);
    if (!deletedTable) {
      return res.status(404).json({ message: "Table not found" });
    }
    res.json({ message: "Table deleted successfully" });
  } catch (error) {
    console.error("Error deleting table:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

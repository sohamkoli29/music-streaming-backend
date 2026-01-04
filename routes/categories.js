const express = require("express");
const { db } = require("../config/firebaseClient");
const { collection, getDocs, query, where, orderBy } = require("firebase/firestore");
const router = express.Router();

// GET all categories
router.get("/", async (req, res) => {
  try {
    const { type } = req.query; // 'music' or 'podcast'
    
    let categoriesQuery;
    
    if (type) {
      // Filter by type, sort in JavaScript
      categoriesQuery = query(
        collection(db, "categories"),
        where("type", "==", type)
      );
    } else {
      // Get all categories with sorting
      categoriesQuery = query(
        collection(db, "categories"),
        orderBy("name")
      );
    }
    
    const snapshot = await getDocs(categoriesQuery);
    
    let categories = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in JavaScript if filtered by type
    if (type) {
      categories.sort((a, b) => a.name.localeCompare(b.name));
    }
    
    res.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    res.status(500).json({ error: "Failed to fetch categories" });
  }
});

module.exports = router;
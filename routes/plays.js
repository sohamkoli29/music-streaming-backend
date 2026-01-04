// routes/plays.js
const express = require("express");
const { db } = require("../config/firebaseClient");
const { doc, updateDoc, increment } = require("firebase/firestore");
const router = express.Router();

// Increment play count for a track
router.post("/:type/:id", async (req, res) => {
  try {
    const { type, id } = req.params; // type: 'tracks' or 'podcasts'
    
    console.log(`▶️ Incrementing play count for ${type}:`, id);
    
    const docRef = doc(db, type, id);
    await updateDoc(docRef, {
      plays: increment(1)
    });
    
    console.log(`✅ Play count incremented for ${type}:`, id);
    
    res.json({ 
      success: true,
      message: "Play count updated"
    });
  } catch (error) {
    console.error("❌ Error updating play count:", error);
    res.status(500).json({ error: "Failed to update play count" });
  }
});

module.exports = router;
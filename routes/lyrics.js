// routes/lyrics.js
const express = require("express");
const { db } = require("../config/firebaseClient");
const { collection, doc, getDoc, setDoc, deleteDoc, serverTimestamp } = require("firebase/firestore");
const router = express.Router();

// GET lyrics for a track
router.get("/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log("📖 Fetching lyrics for track:", trackId);
    
    const lyricsRef = doc(db, "lyrics", trackId);
    const lyricsDoc = await getDoc(lyricsRef);
    
    if (!lyricsDoc.exists()) {
      console.log("❌ Lyrics not found for track:", trackId);
      return res.status(404).json({ error: "Lyrics not found" });
    }
    
    console.log("✅ Lyrics found for track:", trackId);
    
    const data = lyricsDoc.data();
    res.json({ 
      trackId,
      lyrics: data.lrc,
      language: data.language || "en"
    });
  } catch (error) {
    console.error("❌ Error fetching lyrics:", error);
    res.status(500).json({ 
      error: "Failed to fetch lyrics", 
      details: error.message 
    });
  }
});

// POST/UPDATE lyrics for a track
router.post("/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    const { lyrics, language = "en" } = req.body;
    
    console.log("💾 Saving lyrics for track:", trackId);
    console.log("📝 Lyrics length:", lyrics?.length || 0);
    
    if (!lyrics) {
      console.log("❌ No lyrics provided");
      return res.status(400).json({ error: "Lyrics content is required" });
    }
    
    const lyricsRef = doc(db, "lyrics", trackId);
    await setDoc(lyricsRef, {
      lrc: lyrics,
      language,
      trackId,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log("✅ Lyrics saved successfully for track:", trackId);
    
    res.json({ 
      success: true,
      trackId,
      message: "Lyrics saved successfully"
    });
  } catch (error) {
    console.error("❌ Error saving lyrics:", error);
    console.error("Error details:", error.message);
    res.status(500).json({ 
      error: "Failed to save lyrics", 
      details: error.message 
    });
  }
});

// DELETE lyrics for a track
router.delete("/:trackId", async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log("🗑️ Deleting lyrics for track:", trackId);
    
    const lyricsRef = doc(db, "lyrics", trackId);
    await deleteDoc(lyricsRef);
    
    console.log("✅ Lyrics deleted for track:", trackId);
    
    res.json({ 
      success: true,
      message: "Lyrics deleted successfully"
    });
  } catch (error) {
    console.error("❌ Error deleting lyrics:", error);
    res.status(500).json({ 
      error: "Failed to delete lyrics", 
      details: error.message 
    });
  }
});

module.exports = router;
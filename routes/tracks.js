const express = require("express");
const { db } = require("../config/firebaseClient");
const { collection, getDocs, getDoc, doc, query, where, orderBy } = require("firebase/firestore");
const router = express.Router();

// GET all tracks
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    
    let tracksQuery;
    
    if (category) {
      // When filtering by category, skip orderBy to avoid index requirement
      tracksQuery = query(
        collection(db, "tracks"),
        where("categoryId", "==", category)
      );
    } else {
      // When getting all tracks, use orderBy
      tracksQuery = query(
        collection(db, "tracks"),
        orderBy("createdAt", "desc")
      );
    }
    
    const snapshot = await getDocs(tracksQuery);
    
    let tracks = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in JavaScript if filtered by category
    if (category && tracks.length > 0) {
      tracks.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    }
    
    res.json({ tracks });
  } catch (error) {
    console.error("Error fetching tracks:", error);
    res.status(500).json({ error: "Failed to fetch tracks" });
  }
});

// GET single track
router.get("/:id", async (req, res) => {
  try {
    const docRef = doc(db, "tracks", req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Track not found" });
    }
    
    res.json({ track: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    console.error("Error fetching track:", error);
    res.status(500).json({ error: "Failed to fetch track" });
  }
});

module.exports = router;
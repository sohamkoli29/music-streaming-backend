const express = require("express");
const { db } = require("../config/firebaseClient");
const { collection, getDocs, getDoc, doc, query, where, orderBy } = require("firebase/firestore");
const router = express.Router();

// GET all podcasts
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    
    let podcastsQuery;
    
    if (category) {
      // When filtering by category, skip orderBy to avoid index requirement
      podcastsQuery = query(
        collection(db, "podcasts"),
        where("categoryId", "==", category)
      );
    } else {
      // When getting all podcasts, use orderBy
      podcastsQuery = query(
        collection(db, "podcasts"),
        orderBy("createdAt", "desc")
      );
    }
    
    const snapshot = await getDocs(podcastsQuery);
    
    let podcasts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    // Sort in JavaScript if filtered by category
    if (category && podcasts.length > 0) {
      podcasts.sort((a, b) => {
        const dateA = a.createdAt?.toDate?.() || new Date(0);
        const dateB = b.createdAt?.toDate?.() || new Date(0);
        return dateB - dateA;
      });
    }
    
    res.json({ podcasts });
  } catch (error) {
    console.error("Error fetching podcasts:", error);
    res.status(500).json({ error: "Failed to fetch podcasts" });
  }
});

// GET single podcast
router.get("/:id", async (req, res) => {
  try {
    const docRef = doc(db, "podcasts", req.params.id);
    const docSnap = await getDoc(docRef);
    
    if (!docSnap.exists()) {
      return res.status(404).json({ error: "Podcast not found" });
    }
    
    res.json({ podcast: { id: docSnap.id, ...docSnap.data() } });
  } catch (error) {
    console.error("Error fetching podcast:", error);
    res.status(500).json({ error: "Failed to fetch podcast" });
  }
});

module.exports = router;
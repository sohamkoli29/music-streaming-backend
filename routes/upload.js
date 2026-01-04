const express = require("express");
const multer = require("multer");
const cloudinary = require("../config/cloudinary");
const { db } = require("../config/firebaseClient");
const { collection, addDoc, serverTimestamp } = require("firebase/firestore");
const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
});

// Helper function to upload to Cloudinary
const uploadToCloudinary = (buffer, folder, resourceType = "auto") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: folder,
        resource_type: resourceType,
      },
      (error, result) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      }
    );

    uploadStream.end(buffer);
  });
};

// Upload endpoint
router.post(
  "/",
  upload.fields([
    { name: "audioFile", maxCount: 1 },
    { name: "coverFile", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const { title, artist, host, album, description, categoryId, episodeNumber, type } =
        req.body;
      const audioFile = req.files["audioFile"]?.[0];
      const coverFile = req.files["coverFile"]?.[0];

      if (!audioFile) {
        return res.status(400).json({ error: "Audio file is required" });
      }

      console.log("📤 Starting upload to Cloudinary...");

      // Upload audio file
      console.log("🎵 Uploading audio...");
      const audioResult = await uploadToCloudinary(
        audioFile.buffer,
        "wavesync/audio",
        "video" // Use 'video' for audio files
      );
      console.log("✅ Audio uploaded:", audioResult.secure_url);
      
      // Get duration from Cloudinary response (in seconds)
      const duration = Math.round(audioResult.duration || 0);
      console.log("⏱️ Duration detected:", duration, "seconds");

      // Upload cover image
      let coverUrl = "https://via.placeholder.com/300";
      if (coverFile) {
        console.log("🖼️ Uploading cover...");
        const coverResult = await uploadToCloudinary(
          coverFile.buffer,
          "wavesync/covers",
          "image"
        );
        coverUrl = coverResult.secure_url;
        console.log("✅ Cover uploaded:", coverUrl);
      }

      // Prepare data
      const contentData = {
        title,
        audioUrl: audioResult.secure_url,
        coverUrl,
        duration: duration, // Use actual duration from Cloudinary
        categoryId,
        createdAt: serverTimestamp(),
        plays: 0,
      };

      if (type === "track") {
        contentData.artist = artist;
        contentData.album = album || "";
      } else {
        contentData.host = host;
        contentData.description = description;
        contentData.episodeNumber = parseInt(episodeNumber) || 1;
      }

      // Add to Firestore
      const collectionName = type === "track" ? "tracks" : "podcasts";
      const docRef = await addDoc(collection(db, collectionName), contentData);

      console.log("✅ Content saved to Firestore:", docRef.id);
      console.log("📊 Duration:", duration, "seconds");

      res.json({
        success: true,
        id: docRef.id,
        audioUrl: audioResult.secure_url,
        coverUrl,
        duration: duration,
      });
    } catch (error) {
      console.error("❌ Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  }
);

module.exports = router;
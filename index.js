const express = require("express");
const cors = require("cors");
require("dotenv").config();

// Import routes
const tracksRouter = require("./routes/tracks");
const podcastsRouter = require("./routes/podcasts");
const categoriesRouter = require("./routes/categories");
const uploadRouter = require("./routes/upload");
const lyricsRouter = require("./routes/lyrics");
const playsRouter = require("./routes/plays");
const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

app.use(cors(corsOptions));

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.json({ 
    status: "Backend running ✅",
    endpoints: [
      "GET /tracks",
      "GET /tracks/:id",
      "GET /podcasts",
      "GET /podcasts/:id",
      "GET /categories",
      "POST /upload",
      "GET /lyrics/:trackId",      // NEW
      "POST /lyrics/:trackId",     // NEW
      "DELETE /lyrics/:trackId",
      "POST /plays/:type/:id"   
    ]
  });
});

app.use("/tracks", tracksRouter);
app.use("/podcasts", podcastsRouter);
app.use("/categories", categoriesRouter);
app.use("/upload", uploadRouter);
app.use("/lyrics", lyricsRouter);
app.use("/plays", playsRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📍 http://localhost:${PORT}`);
});
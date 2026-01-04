require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const { db } = require("../config/firebaseClient");
const { collection, setDoc, doc, Timestamp } = require("firebase/firestore");

const musicCategories = [
  { id: "rock", name: "Rock", type: "music" },
  { id: "pop", name: "Pop", type: "music" },
  { id: "hip-hop", name: "Hip Hop", type: "music" },
  { id: "jazz", name: "Jazz", type: "music" },
  { id: "classical", name: "Classical", type: "music" },
  { id: "electronic", name: "Electronic", type: "music" },
  { id: "country", name: "Country", type: "music" },
  { id: "r-b", name: "R&B", type: "music" },
  { id: "indie", name: "Indie", type: "music" },
  { id: "metal", name: "Metal", type: "music" },
  { id: "reggae", name: "Reggae", type: "music" },
  { id: "blues", name: "Blues", type: "music" },
  { id: "folk", name: "Folk", type: "music" },
  { id: "soul", name: "Soul", type: "music" },
  { id: "punk", name: "Punk", type: "music" },
  { id: "disco", name: "Disco", type: "music" },
  { id: "bollywood", name: "Bollywood", type: "music" },
  { id: "k-pop", name: "K-Pop", type: "music" },
  { id: "latin", name: "Latin", type: "music" },
  { id: "ambient", name: "Ambient", type: "music" },
];

const podcastCategories = [
  { id: "tech", name: "Technology", type: "podcast" },
  { id: "comedy", name: "Comedy", type: "podcast" },
  { id: "business", name: "Business", type: "podcast" },
  { id: "education", name: "Education", type: "podcast" },
  { id: "health", name: "Health & Wellness", type: "podcast" },
  { id: "sports", name: "Sports", type: "podcast" },
  { id: "news", name: "News & Politics", type: "podcast" },
  { id: "true-crime", name: "True Crime", type: "podcast" },
  { id: "history", name: "History", type: "podcast" },
  { id: "science", name: "Science", type: "podcast" },
  { id: "arts", name: "Arts & Culture", type: "podcast" },
  { id: "lifestyle", name: "Lifestyle", type: "podcast" },
  { id: "self-improvement", name: "Self Improvement", type: "podcast" },
  { id: "entertainment", name: "Entertainment", type: "podcast" },
  { id: "finance", name: "Finance", type: "podcast" },
  { id: "gaming", name: "Gaming", type: "podcast" },
  { id: "food", name: "Food & Cooking", type: "podcast" },
  { id: "travel", name: "Travel", type: "podcast" },
  { id: "spirituality", name: "Spirituality", type: "podcast" },
  { id: "relationships", name: "Relationships", type: "podcast" },
];

async function seedCategories() {
  try {
    console.log("🌱 Starting to seed categories...\n");

    // Seed music categories
    console.log("🎵 Adding music categories...");
    for (const category of musicCategories) {
      await setDoc(doc(db, "categories", category.id), {
        name: category.name,
        type: category.type,
        coverUrl: "https://via.placeholder.com/300",
        createdAt: Timestamp.now(),
      });
      console.log(`  ✅ ${category.name}`);
    }

    // Seed podcast categories
    console.log("\n🎙️ Adding podcast categories...");
    for (const category of podcastCategories) {
      await setDoc(doc(db, "categories", category.id), {
        name: category.name,
        type: category.type,
        coverUrl: "https://via.placeholder.com/300",
        createdAt: Timestamp.now(),
      });
      console.log(`  ✅ ${category.name}`);
    }

    console.log("\n✅ All categories added successfully!");
    console.log(`📊 Total: ${musicCategories.length} music + ${podcastCategories.length} podcast categories`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
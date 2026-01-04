const { db } = require("../config/firebaseClient");
const { collection, addDoc, setDoc, doc, serverTimestamp } = require("firebase/firestore");

async function seedData() {
  try {
    console.log("🌱 Starting to seed data...");

    // Add categories
    console.log("📁 Creating categories...");
    
    await setDoc(doc(db, "categories", "rock"), {
      name: "Rock",
      type: "music",
      coverUrl: "https://via.placeholder.com/300",
      createdAt: serverTimestamp()
    });
    console.log("✅ Rock category added");

    await setDoc(doc(db, "categories", "pop"), {
      name: "Pop",
      type: "music",
      coverUrl: "https://via.placeholder.com/300",
      createdAt: serverTimestamp()
    });
    console.log("✅ Pop category added");

    await setDoc(doc(db, "categories", "tech"), {
      name: "Technology",
      type: "podcast",
      coverUrl: "https://via.placeholder.com/300",
      createdAt: serverTimestamp()
    });
    console.log("✅ Tech category added");

    await setDoc(doc(db, "categories", "comedy"), {
      name: "Comedy",
      type: "podcast",
      coverUrl: "https://via.placeholder.com/300",
      createdAt: serverTimestamp()
    });
    console.log("✅ Comedy category added");

    // Add sample tracks
    console.log("🎵 Creating tracks...");
    
    await addDoc(collection(db, "tracks"), {
      title: "Summer Vibes",
      artist: "The Rockers",
      album: "Greatest Hits",
      duration: 240,
      coverUrl: "https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Summer+Vibes",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
      categoryId: "rock",
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Track 1 added");

    await addDoc(collection(db, "tracks"), {
      title: "Midnight Dreams",
      artist: "Pop Stars",
      album: "Dreams Collection",
      duration: 210,
      coverUrl: "https://via.placeholder.com/300/4ECDC4/FFFFFF?text=Midnight+Dreams",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
      categoryId: "pop",
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Track 2 added");

    await addDoc(collection(db, "tracks"), {
      title: "Electric Soul",
      artist: "The Rockers",
      album: "Electric",
      duration: 195,
      coverUrl: "https://via.placeholder.com/300/95E1D3/FFFFFF?text=Electric+Soul",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3",
      categoryId: "rock",
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Track 3 added");

    // Add sample podcasts
    console.log("🎙️ Creating podcasts...");
    
    await addDoc(collection(db, "podcasts"), {
      title: "AI Revolution Episode 1",
      host: "John Tech",
      description: "Exploring the future of artificial intelligence",
      duration: 1800,
      coverUrl: "https://via.placeholder.com/300/F38181/FFFFFF?text=AI+Revolution",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3",
      categoryId: "tech",
      episodeNumber: 1,
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Podcast 1 added");

    await addDoc(collection(db, "podcasts"), {
      title: "Startup Stories Ep. 5",
      host: "Sarah Entrepreneur",
      description: "Behind the scenes of successful tech startups",
      duration: 2400,
      coverUrl: "https://via.placeholder.com/300/AA96DA/FFFFFF?text=Startup+Stories",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3",
      categoryId: "tech",
      episodeNumber: 5,
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Podcast 2 added");

    await addDoc(collection(db, "podcasts"), {
      title: "Comedy Hour: Life Hacks",
      host: "Mike Funny",
      description: "Hilarious take on everyday life situations",
      duration: 1200,
      coverUrl: "https://via.placeholder.com/300/FCBAD3/FFFFFF?text=Comedy+Hour",
      audioUrl: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3",
      categoryId: "comedy",
      episodeNumber: 12,
      createdAt: serverTimestamp(),
      plays: 0
    });
    console.log("✅ Podcast 3 added");

    console.log("\n✅ All sample data added successfully!");
    console.log("📊 Summary:");
    console.log("   - 4 categories");
    console.log("   - 3 tracks");
    console.log("   - 3 podcasts");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
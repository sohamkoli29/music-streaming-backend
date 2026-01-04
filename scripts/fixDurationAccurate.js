// scripts/fixDurationAccurate.js
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const { db } = require("../config/firebaseClient");
const { collection, getDocs, doc, updateDoc } = require("firebase/firestore");
const mm = require("music-metadata");
const axios = require("axios");

/**
 * Get audio duration in INTEGER SECONDS ONLY (no milliseconds, no decimals)
 */
async function getAudioDuration(url) {
  try {
    console.log(`⏱️ Fetching duration for: ${url}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    // Fetch headers
    const headResponse = await axios.head(url, {
      signal: controller.signal,
      timeout: 10000,
    });

    const contentLength = headResponse.headers["content-length"];
    const contentType = headResponse.headers["content-type"];

    console.log(`   Content-Type: ${contentType || "Unknown"}`);
    console.log(
      `   File Size: ${
        contentLength
          ? (contentLength / (1024 * 1024)).toFixed(2) + " MB"
          : "Unknown"
      }`
    );

    // Fetch first 1MB for metadata
    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
      signal: controller.signal,
      timeout: 30000,
      headers: { Range: "bytes=0-1048576" },
    });

    const metadata = await mm.parseStream(response.data, {
      mimeType: contentType || "audio/mpeg",
      size: contentLength ? parseInt(contentLength) : undefined,
    });

    clearTimeout(timeoutId);

    if (!metadata.format.duration) {
      throw new Error("No duration found in metadata");
    }

    const totalSeconds = Math.floor(metadata.format.duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    console.log(`   Duration: ${totalSeconds}s (${minutes}:${seconds
      .toString()
      .padStart(2, "0")})`);

    return { totalSeconds, minutes, seconds };
  } catch (error) {
    console.error(`   Error: ${error.message}`);

    if (url.includes("cloudinary.com")) {
      return await tryCloudinaryDuration(url);
    }

    return null;
  }
}

/**
 * Cloudinary fallback (still integer seconds only)
 */
async function tryCloudinaryDuration(url) {
  try {
    console.log("   Trying Cloudinary fallback...");

    const response = await axios({
      method: "get",
      url,
      responseType: "stream",
      timeout: 45000,
    });

    return new Promise((resolve, reject) => {
      const chunks = [];
      let totalBytes = 0;

      response.data.on("data", (chunk) => {
        chunks.push(chunk);
        totalBytes += chunk.length;

        if (totalBytes > 5 * 1024 * 1024) {
          response.data.destroy();
          reject(new Error("File too large"));
        }
      });

      response.data.on("end", async () => {
        try {
          const buffer = Buffer.concat(chunks);
          const metadata = await mm.parseBuffer(buffer, {
            mimeType: "audio/mpeg",
            size: buffer.length,
          });

          if (!metadata.format.duration) {
            return reject(new Error("No duration"));
          }

          const totalSeconds = Math.floor(metadata.format.duration);
          resolve({
            totalSeconds,
            minutes: Math.floor(totalSeconds / 60),
            seconds: totalSeconds % 60,
          });
        } catch (err) {
          reject(err);
        }
      });

      response.data.on("error", reject);
    });
  } catch (error) {
    console.error(`   Cloudinary failed: ${error.message}`);
    return null;
  }
}

async function fixDurations() {
  try {
    console.log("🔧 Starting CLEAN duration fix (NO milliseconds)\n");

    /* ---------------- TRACKS ---------------- */
    const tracksSnapshot = await getDocs(collection(db, "tracks"));
    const tracks = tracksSnapshot.docs;

    let fixedTracks = 0,
      skippedTracks = 0,
      failedTracks = 0;

    for (let i = 0; i < tracks.length; i++) {
      const snap = tracks[i];
      const data = snap.data();

      const needsFix =
        !data.duration || data.duration === 0 || data.duration === 180;

      if (!needsFix || !data.audioUrl) {
        skippedTracks++;
        continue;
      }

      console.log(`\n🎵 [${i + 1}/${tracks.length}] ${data.title}`);

      const durationInfo = await getAudioDuration(data.audioUrl);

      if (!durationInfo) {
        failedTracks++;
        continue;
      }

      await updateDoc(doc(db, "tracks", snap.id), {
        duration: durationInfo.totalSeconds,
        durationFormatted: `${durationInfo.minutes}:${durationInfo.seconds
          .toString()
          .padStart(2, "0")}`,
        durationMinutes: durationInfo.minutes,
        durationSeconds: durationInfo.seconds,
        hasAccurateDuration: true,
        lastDurationCheck: new Date().toISOString(),
      });

      console.log(`✅ Updated: ${durationInfo.totalSeconds}s`);
      fixedTracks++;

      await new Promise((r) => setTimeout(r, 800));
    }

    /* ---------------- PODCASTS ---------------- */
    const podcastsSnapshot = await getDocs(collection(db, "podcasts"));
    const podcasts = podcastsSnapshot.docs;

    let fixedPodcasts = 0,
      skippedPodcasts = 0,
      failedPodcasts = 0;

    for (let i = 0; i < podcasts.length; i++) {
      const snap = podcasts[i];
      const data = snap.data();

      const needsFix =
        !data.duration || data.duration === 0 || data.duration === 180;

      if (!needsFix || !data.audioUrl) {
        skippedPodcasts++;
        continue;
      }

      console.log(`\n🎙️ [${i + 1}/${podcasts.length}] ${data.title}`);

      const durationInfo = await getAudioDuration(data.audioUrl);

      if (!durationInfo) {
        failedPodcasts++;
        continue;
      }

      await updateDoc(doc(db, "podcasts", snap.id), {
        duration: durationInfo.totalSeconds,
        durationFormatted: `${durationInfo.minutes}:${durationInfo.seconds
          .toString()
          .padStart(2, "0")}`,
        durationMinutes: durationInfo.minutes,
        durationSeconds: durationInfo.seconds,
        hasAccurateDuration: true,
        lastDurationCheck: new Date().toISOString(),
      });

      console.log(`✅ Updated: ${durationInfo.totalSeconds}s`);
      fixedPodcasts++;

      await new Promise((r) => setTimeout(r, 800));
    }

    /* ---------------- SUMMARY ---------------- */
    console.log("\n================ SUMMARY ================");
    console.log(`Tracks fixed: ${fixedTracks}`);
    console.log(`Tracks skipped: ${skippedTracks}`);
    console.log(`Tracks failed: ${failedTracks}`);
    console.log(`Podcasts fixed: ${fixedPodcasts}`);
    console.log(`Podcasts skipped: ${skippedPodcasts}`);
    console.log(`Podcasts failed: ${failedPodcasts}`);
    console.log("=========================================\n");

    process.exit(0);
  } catch (err) {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  }
}

console.log(`
📦 REQUIRED:
npm install music-metadata axios

ℹ️  Durations are stored as INTEGER SECONDS ONLY
`);

fixDurations();

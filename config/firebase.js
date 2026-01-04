const admin = require("firebase-admin");
const path = require("path");

// Load service account key
const serviceAccount = require(path.join(__dirname, "../serviceAccountKey.json"));

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${serviceAccount.project_id}.firebasestorage.app`
});

const storage = admin.storage();

console.log("✅ Firebase Admin initialized successfully");
console.log("📦 Project ID:", serviceAccount.project_id);
console.log("🗄️ Storage Bucket:", storage.bucket().name);

module.exports = { admin, storage };
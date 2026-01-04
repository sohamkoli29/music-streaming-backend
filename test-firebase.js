const admin = require("firebase-admin");
const fs = require("fs");
const path = require("path");

console.log("🔍 Testing Firebase Admin Setup...\n");

// Check if file exists
const keyPath = path.join(__dirname, "serviceAccountKey.json");
console.log("📁 Looking for key at:", keyPath);

if (!fs.existsSync(keyPath)) {
  console.error("❌ serviceAccountKey.json not found!");
  process.exit(1);
}

console.log("✅ Service account file exists\n");

// Load and validate key
try {
  const serviceAccount = require(keyPath);
  
  console.log("📋 Service Account Details:");
  console.log("   Project ID:", serviceAccount.project_id);
  console.log("   Client Email:", serviceAccount.client_email);
  console.log("   Private Key ID:", serviceAccount.private_key_id?.substring(0, 20) + "...");
  
  // Check for required fields
  const requiredFields = ['type', 'project_id', 'private_key_id', 'private_key', 'client_email'];
  const missingFields = requiredFields.filter(field => !serviceAccount[field]);
  
  if (missingFields.length > 0) {
    console.error("\n❌ Missing required fields:", missingFields);
    process.exit(1);
  }
  
  console.log("✅ All required fields present\n");
  
  // Try to initialize Firebase
  console.log("🔧 Attempting to initialize Firebase Admin...");
  
  if (admin.apps.length === 0) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: `https://${serviceAccount.project_id}.firebaseio.com`
    });
  }
  
  console.log("✅ Firebase Admin initialized\n");
  
  // Test Firestore connection
  console.log("🔗 Testing Firestore connection...");
  const db = admin.firestore();
  
  // Try to write a test document
  db.collection("_test").doc("test").set({
    test: true,
    timestamp: new Date()
  })
  .then(() => {
    console.log("✅ Firestore write test successful!");
    return db.collection("_test").doc("test").delete();
  })
  .then(() => {
    console.log("✅ Firestore delete test successful!");
    console.log("\n🎉 All tests passed! Firebase is working correctly.");
    process.exit(0);
  })
  .catch(error => {
    console.error("\n❌ Firestore test failed:", error.message);
    console.error("\n🔍 Error details:", error);
    process.exit(1);
  });
  
} catch (error) {
  console.error("\n❌ Error loading service account:", error.message);
  process.exit(1);
}
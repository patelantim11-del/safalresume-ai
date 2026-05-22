const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("Testing MongoDB connection...");
console.log("URI:", uri.replace(/:[^:]*@/, ":***@"));

const options = {
  retryWrites: true,
  tls: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

const client = new MongoClient(uri, options);

async function testConnection() {
  try {
    console.log("\n1. Connecting to MongoDB...");
    await client.connect();
    console.log("✅ Connected successfully!");

    console.log("\n2. Listing databases...");
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log(
      "✅ Databases:",
      dbs.databases.map((db) => db.name),
    );

    console.log("\n3. Checking collections in admin db...");
    const adminDb = client.db("admin");
    const collections = await adminDb.listCollections().toArray();
    console.log(
      "✅ Collections:",
      collections.map((c) => c.name),
    );

    console.log("\n✅ All tests passed!");
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);
    console.error("Stack trace:");
    console.error(error.stack);

    if (error.message.includes("TLS")) {
      console.error("\n⚠️  TLS/SSL Issue detected. This usually means:");
      console.error(
        "  - Network Access IP whitelist is not configured in Atlas",
      );
      console.error("  - Firewall/ISP is blocking the connection");
      console.error("  - Certificate validation is failing");
    }
  } finally {
    await client.close();
    console.log("\n✅ Connection closed.");
  }
}

testConnection();

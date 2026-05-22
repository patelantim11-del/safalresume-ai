const { MongoClient } = require("mongodb");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("❌ MONGODB_URI not found in .env.local");
  process.exit(1);
}

console.log("Testing MongoDB connection with TLS disabled...");
console.log("URI:", uri.replace(/:[^:]*@/, ":***@"));

const options = {
  retryWrites: true,
  tls: false,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

const client = new MongoClient(uri, options);

async function testConnection() {
  try {
    console.log("\n1. Attempting connection with TLS=false...");
    await client.connect();
    console.log("✅ Connected successfully!");

    console.log("\n2. Listing databases...");
    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log(
      "✅ Databases:",
      dbs.databases.map((db) => db.name),
    );

    console.log("\n✅ Connection test passed!");
  } catch (error) {
    console.error("\n❌ Connection failed!");
    console.error("Error name:", error.name);
    console.error("Error code:", error.code);
    console.error("Error message:", error.message);

    if (error.message.includes("Network")) {
      console.error("\n⚠️  Network connectivity issue.");
    } else if (error.message.includes("ECONNREFUSED")) {
      console.error("\n⚠️  Connection refused - MongoDB service not running");
    } else if (error.message.includes("ENOTFOUND")) {
      console.error("\n⚠️  DNS resolution failed");
    } else {
      console.error("\n⚠️  Other connection issue");
    }
  } finally {
    await client.close();
    console.log("\n✅ Connection closed.");
  }
}

testConnection();

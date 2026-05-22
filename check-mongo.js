const fs = require("fs");
const { MongoClient } = require("mongodb");
const env = fs
  .readFileSync(".env.local", "utf8")
  .split(/\r?\n/)
  .filter(Boolean)
  .reduce((out, line) => {
    const idx = line.indexOf("=");
    if (idx < 0) return out;
    out[line.slice(0, idx)] = line.slice(idx + 1);
    return out;
  }, {});
const uri = env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI missing or empty");
  process.exit(1);
}
(async () => {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const dbName = client.db().databaseName;
    console.log("CONNECTED", dbName);
    const admin = client.db().admin();
    const info = await admin.serverStatus();
    console.log("MONGODB_VERSION", info.version);
  } catch (error) {
    console.error("ERROR", error.message || error);
    process.exit(1);
  } finally {
    await client.close();
  }
})();

import { MongoClient, type MongoClientOptions } from "mongodb";

const uri = process.env.MONGODB_URI;
const options: MongoClientOptions = {
  retryWrites: true,
  tls: true,
  maxPoolSize: 10,
  serverSelectionTimeoutMS: 5000,
};

declare global {
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let cachedClientPromise: Promise<MongoClient> | undefined;

function createClientPromise() {
  console.log(
    "[MongoDB] MONGODB_URI exists:",
    !!process.env.MONGODB_URI,
    "NODE_ENV:",
    process.env.NODE_ENV,
    "VERCEL_ENV:",
    process.env.VERCEL_ENV,
    "NEXT_RUNTIME:",
    process.env.NEXT_RUNTIME,
  );

  if (!uri) {
    throw new Error("MONGODB_URI environment variable is required.");
  }

  console.log(
    "[MongoDB] Connecting to cluster:",
    uri.split("@")[1] || "unknown",
  );
  const client = new MongoClient(uri, options);

  return client
    .connect()
    .then((connectedClient) => {
      console.log("[MongoDB] Connected successfully.");
      return connectedClient;
    })
    .catch((error) => {
      console.error("[MongoDB] Connection error:", {
        code: error.code,
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
      throw error;
    });
}

export function connectToDatabase() {
  if (!cachedClientPromise) {
    if (process.env.NODE_ENV === "development") {
      cachedClientPromise = global._mongoClientPromise || createClientPromise();
      global._mongoClientPromise = cachedClientPromise;
    } else {
      cachedClientPromise = createClientPromise();
    }
  }

  return cachedClientPromise;
}

const { MongoClient } = require("mongodb");
const variants = [
  {
    name: "encoded_with_brackets",
    uri: "mongodb+srv://patelantim11_db_user:%3Cad44anish%40%3E@cluster0.kbnqcoh.mongodb.net/?appName=Cluster0",
  },
  {
    name: "encoded_without_brackets",
    uri: "mongodb+srv://patelantim11_db_user:ad44anish%40@cluster0.kbnqcoh.mongodb.net/?appName=Cluster0",
  },
  {
    name: "encoded_with_brackets_tls_insecure",
    uri: "mongodb+srv://patelantim11_db_user:%3Cad44anish%40%3E@cluster0.kbnqcoh.mongodb.net/?appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true",
  },
  {
    name: "encoded_without_brackets_tls_insecure",
    uri: "mongodb+srv://patelantim11_db_user:ad44anish%40@cluster0.kbnqcoh.mongodb.net/?appName=Cluster0&tls=true&tlsAllowInvalidCertificates=true",
  },
  {
    name: "encoded_without_brackets_retry",
    uri: "mongodb+srv://patelantim11_db_user:ad44anish%40@cluster0.kbnqcoh.mongodb.net/?retryWrites=true&w=majority",
  },
];

async function test(uri) {
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    const info = await client.db().admin().serverStatus();
    return { ok: true, version: info.version };
  } catch (err) {
    return { ok: false, message: err.message };
  } finally {
    try {
      await client.close();
    } catch {}
  }
}

(async () => {
  for (const variant of variants) {
    console.log("---", variant.name, "---");
    const result = await test(variant.uri);
    console.log(result);
  }
})();

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: ".env.local" });

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("❌ MONGODB_URI not set in .env.local");
  process.exit(1);
}

const client = new MongoClient(uri);
let db = null;

const testResults = {
  connection: null,
  authentication: null,
  userSignup: null,
  userLogin: null,
  resumeSave: null,
  resumeRetrieve: null,
};

async function test() {
  try {
    // === 1. TEST CONNECTION ===
    console.log("\n=== 1. MONGODB CONNECTION ===");
    try {
      await client.connect();
      db = client.db("ai_resume_builder");

      // Verify connection by pinging the admin
      const adminDb = client.db("admin");
      const pingResult = await adminDb.command({ ping: 1 });
      console.log("✅ Connected to MongoDB Atlas");
      console.log("   Ping response:", pingResult);
      testResults.connection = { ok: true, message: "Connected successfully" };
    } catch (err) {
      console.error("❌ Connection failed:", err.message);
      testResults.connection = { ok: false, message: err.message };
      return;
    }

    // === 2. TEST AUTHENTICATION ===
    console.log("\n=== 2. DATABASE AUTHENTICATION ===");
    try {
      const collections = await db.listCollections().toArray();
      console.log("✅ Authenticated successfully");
      console.log(
        `   Found ${collections.length} collections:`,
        collections.map((c) => c.name),
      );
      testResults.authentication = {
        ok: true,
        message: "Authenticated successfully",
      };
    } catch (err) {
      console.error("❌ Authentication failed:", err.message);
      testResults.authentication = { ok: false, message: err.message };
      return;
    }

    // === 3. TEST USER SIGNUP ===
    console.log("\n=== 3. USER SIGNUP ===");
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = "TestPassword123!";

    try {
      const usersCollection = db.collection("users");

      // Hash password
      const hashedPassword = await bcrypt.hash(testPassword, 10);

      // Create user
      const signupResult = await usersCollection.insertOne({
        email: testEmail,
        password: hashedPassword,
        createdAt: new Date(),
      });

      console.log("✅ User signup successful");
      console.log(`   Email: ${testEmail}`);
      console.log(`   User ID: ${signupResult.insertedId}`);
      testResults.userSignup = {
        ok: true,
        message: "Signup successful",
        userId: signupResult.insertedId.toString(),
        email: testEmail,
      };
    } catch (err) {
      console.error("❌ User signup failed:", err.message);
      testResults.userSignup = { ok: false, message: err.message };
    }

    // === 4. TEST USER LOGIN ===
    console.log("\n=== 4. USER LOGIN ===");
    if (testResults.userSignup.ok) {
      try {
        const usersCollection = db.collection("users");
        const user = await usersCollection.findOne({ email: testEmail });

        if (!user) {
          throw new Error("User not found after signup");
        }

        const passwordMatch = await bcrypt.compare(testPassword, user.password);
        if (!passwordMatch) {
          throw new Error("Password does not match");
        }

        console.log("✅ User login successful");
        console.log(`   User found: ${user._id}`);
        console.log(`   Password verified`);
        testResults.userLogin = {
          ok: true,
          message: "Login successful",
          userId: user._id.toString(),
        };
      } catch (err) {
        console.error("❌ User login failed:", err.message);
        testResults.userLogin = { ok: false, message: err.message };
      }
    } else {
      console.log("⊘ Skipping login test (signup failed)");
      testResults.userLogin = { ok: false, message: "Signup failed" };
    }

    // === 5. TEST RESUME SAVE ===
    console.log("\n=== 5. RESUME SAVE ===");
    if (testResults.userSignup.ok) {
      try {
        const resumesCollection = db.collection("resumes");
        const testResume = {
          userId: testResults.userSignup.userId,
          personalInfo: {
            fullName: "Test User",
            email: testEmail,
            phone: "1234567890",
            location: "Test City",
          },
          summary: "A test professional summary",
          experience: [
            {
              company: "Test Company",
              position: "Test Position",
              startDate: "2020-01",
              endDate: "2021-12",
              description: "Test work experience",
            },
          ],
          education: [
            {
              institution: "Test University",
              degree: "Bachelor",
              field: "Test Field",
              graduationDate: "2020-05",
            },
          ],
          skills: ["JavaScript", "MongoDB", "React"],
          certifications: [],
          achievements: [],
          languages: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const saveResult = await resumesCollection.insertOne(testResume);
        console.log("✅ Resume save successful");
        console.log(`   Resume ID: ${saveResult.insertedId}`);
        testResults.resumeSave = {
          ok: true,
          message: "Resume saved",
          resumeId: saveResult.insertedId.toString(),
        };
      } catch (err) {
        console.error("❌ Resume save failed:", err.message);
        testResults.resumeSave = { ok: false, message: err.message };
      }
    } else {
      console.log("⊘ Skipping resume save (signup failed)");
      testResults.resumeSave = { ok: false, message: "Signup failed" };
    }

    // === 6. TEST RESUME RETRIEVAL ===
    console.log("\n=== 6. RESUME RETRIEVAL ===");
    if (testResults.resumeSave.ok) {
      try {
        const resumesCollection = db.collection("resumes");
        const resume = await resumesCollection.findOne({
          userId: testResults.userSignup.userId,
        });

        if (!resume) {
          throw new Error("Resume not found after save");
        }

        console.log("✅ Resume retrieval successful");
        console.log(`   Resume ID: ${resume._id}`);
        console.log(`   Name: ${resume.personalInfo.fullName}`);
        console.log(`   Skills: ${resume.skills.join(", ")}`);
        testResults.resumeRetrieve = {
          ok: true,
          message: "Resume retrieved successfully",
          resumeId: resume._id.toString(),
        };
      } catch (err) {
        console.error("❌ Resume retrieval failed:", err.message);
        testResults.resumeRetrieve = { ok: false, message: err.message };
      }
    } else {
      console.log("⊘ Skipping resume retrieval (save failed)");
      testResults.resumeRetrieve = { ok: false, message: "Save failed" };
    }

    // === SUMMARY ===
    console.log("\n=== TEST SUMMARY ===");
    console.log(JSON.stringify(testResults, null, 2));

    const allPassed = Object.values(testResults).every((r) => r && r.ok);
    if (allPassed) {
      console.log("\n✅ ALL TESTS PASSED");
      process.exit(0);
    } else {
      console.log("\n⚠️  SOME TESTS FAILED");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    process.exit(1);
  } finally {
    await client.close();
  }
}

test();

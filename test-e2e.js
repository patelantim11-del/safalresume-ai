const http = require("http");

const BASE_URL = "http://localhost:3001";
let authToken = null;

function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    if (authToken) {
      options.headers["Cookie"] = `resume-auth=${authToken}`;
    }

    const req = http.request(options, (res) => {
      let responseData = "";
      res.on("data", (chunk) => {
        responseData += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(responseData);
          resolve({
            status: res.statusCode,
            data: parsed,
            headers: res.headers,
          });
        } catch {
          resolve({
            status: res.statusCode,
            data: responseData,
            headers: res.headers,
          });
        }
      });
    });

    req.on("error", (e) => {
      reject(e);
    });

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log(
    "\n=== E2E TEST: SIGNUP => LOGIN => RESUME SAVE => RESUME GET ===\n",
  );

  try {
    // 1. SIGNUP
    console.log("1. Testing Signup...");
    const signupData = {
      fullName: "E2E Test User",
      email: `e2e_test_${Date.now()}@example.com`,
      password: "TestPassword123!",
    };

    const signupResp = await makeRequest(
      "POST",
      "/api/auth/signup",
      signupData,
    );
    console.log(`   Status: ${signupResp.status}`);

    if (signupResp.status !== 201) {
      console.error("   ❌ Signup failed:", signupResp.data);
      process.exit(1);
    }

    console.log("   ✅ Signup successful");
    console.log(`   User ID: ${signupResp.data.user?.id}`);

    // Extract auth token from Set-Cookie header
    if (signupResp.headers["set-cookie"]) {
      const cookies = signupResp.headers["set-cookie"];
      const match = cookies[0]?.match(/resume-auth=([^;]+)/);
      if (match) {
        authToken = match[1];
        console.log(`   Auth token obtained`);
      }
    }

    // 2. LOGIN
    console.log("\n2. Testing Login...");
    const loginData = {
      email: signupData.email,
      password: signupData.password,
    };

    const loginResp = await makeRequest("POST", "/api/auth/login", loginData);
    console.log(`   Status: ${loginResp.status}`);

    if (loginResp.status !== 200) {
      console.error("   ❌ Login failed:", loginResp.data);
      process.exit(1);
    }

    console.log("   ✅ Login successful");
    console.log(`   User: ${loginResp.data.user?.email}`);

    // 3. SAVE RESUME
    console.log("\n3. Testing Resume Save...");
    const resumeData = {
      title: "My Test Resume",
      template: "modern",
      personalInfo: {
        fullName: "E2E Test User",
        email: signupData.email,
        phone: "1234567890",
        location: "Test City",
        jobTitle: "Software Engineer",
        website: "https://example.com",
        summary: "Test summary",
      },
      experience: [
        {
          id: "1",
          company: "Test Corp",
          position: "Engineer",
          location: "NYC",
          startDate: "2020-01",
          endDate: "2022-12",
          current: false,
          description: "Worked on test projects",
        },
      ],
      education: [
        {
          id: "1",
          school: "Test University",
          degree: "Bachelor",
          field: "Computer Science",
          location: "Boston",
          startDate: "2016-09",
          endDate: "2020-05",
        },
      ],
      skills: [
        { id: "1", name: "JavaScript", level: "Advanced" },
        { id: "2", name: "MongoDB", level: "Advanced" },
        { id: "3", name: "React", level: "Intermediate" },
      ],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      socialLinks: [],
    };

    const saveResp = await makeRequest("POST", "/api/resumes", resumeData);
    console.log(`   Status: ${saveResp.status}`);

    if (saveResp.status !== 201) {
      console.error("   ❌ Resume save failed:", saveResp.data);
      process.exit(1);
    }

    console.log("   ✅ Resume saved");
    const resumeId = saveResp.data.resume?.id;
    console.log(`   Resume ID: ${resumeId}`);

    // 4. GET RESUMES
    console.log("\n4. Testing Resume Retrieval...");
    const getResp = await makeRequest("GET", "/api/resumes");
    console.log(`   Status: ${getResp.status}`);

    if (getResp.status !== 200) {
      console.error("   ❌ Resume retrieval failed:", getResp.data);
      process.exit(1);
    }

    console.log("   ✅ Resumes retrieved");
    console.log(`   Total resumes: ${getResp.data.resumes?.length}`);
    if (getResp.data.resumes?.length > 0) {
      console.log(`   First resume title: ${getResp.data.resumes[0].title}`);
    }

    console.log("\n=== ✅ ALL E2E TESTS PASSED ===\n");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

runTests();

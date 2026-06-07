const http = require("http");

async function test() {
  const data = JSON.stringify({
    html: "<div><h1>PDF Test</h1><p>Hello</p></div>",
  });

  const options = {
    hostname: "localhost",
    port: 3001,
    path: "/api/export-pdf",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Content-Length": Buffer.byteLength(data),
    },
  };

  const req = http.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    const chunks = [];
    res.on("data", (chunk) => chunks.push(chunk));
    res.on("end", () => {
      const body = Buffer.concat(chunks);
      const contentType = res.headers["content-type"] || "";
      console.log("content-type:", contentType);
      if (contentType.includes("application/json")) {
        try {
          console.log("body:", body.toString("utf8"));
        } catch (e) {
          console.error("json parse error", e);
        }
      } else {
        console.log("Received binary response,", body.length, "bytes");
      }
    });
  });

  req.on("error", (error) => {
    console.error(error);
  });

  req.write(data);
  req.end();
}

test();

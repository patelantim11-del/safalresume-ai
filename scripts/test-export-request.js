const fs = require("fs");
(async () => {
  try {
    const res = await fetch("http://localhost:3002/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        html: `<html><body><h1 style="font-family:Arial">Hello PDF</h1><p>Line 2</p><p style="page-break-before:always">Page 2</p></body></html>`,
      }),
    });
    console.log("status", res.status);
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync("tmp-test.pdf", buf);
    console.log("wrote", buf.length);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();

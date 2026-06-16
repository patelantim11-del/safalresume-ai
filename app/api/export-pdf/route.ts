export const runtime = "nodejs";
export const maxDuration = 60;

import { buildFullHtml, renderPrintableResumeHtml } from "@/lib/printTemplates";
// Note: responses are returned as `Response` with application/pdf headers.

async function launchChromiumWithFallback(timeoutMs = 30000) {
  const launchPromise = (async () => {
    // Only use puppeteer-core + @sparticuz/chromium. Try sparticuz first (Vercel),
    // then fall back to a local Chrome/Chromium binary when running on localhost.
    const puppeteer = await import("puppeteer-core");

    // Helper: try to locate a locally installed Chrome binary for dev.
    const fs = await import("fs");
    const os = await import("os");
    function findLocalChrome(): string | undefined {
      const envPath = process.env.CHROME_PATH || process.env.CHROME_BIN;
      if (envPath && fs.existsSync(envPath)) return envPath;

      const platform = os.platform();
      const candidates: string[] = [];
      if (platform === "win32") {
        candidates.push(
          "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
          "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe",
        );
      } else if (platform === "darwin") {
        candidates.push(
          "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
        );
      } else {
        candidates.push(
          "/usr/bin/google-chrome-stable",
          "/usr/bin/google-chrome",
          "/usr/bin/chromium-browser",
          "/usr/bin/chromium",
        );
      }

      for (const p of candidates) {
        try {
          if (fs.existsSync(p)) return p;
        } catch {}
      }
      return undefined;
    }

    try {
      const chromium = (await import("@sparticuz/chromium")).default;

      // Prefer the sparticuz executable when available (Vercel). If it returns
      // a path use it; otherwise try to find a local Chrome for development.
      let execPath: string | undefined;
      try {
        execPath = await chromium.executablePath();
        console.log("/api/export-pdf chromium executablePath:", execPath);
      } catch (epErr) {
        console.warn("/api/export-pdf chromium.executablePath error:", epErr);
        execPath = undefined;
      }
      if (!execPath) {
        execPath = findLocalChrome();
        console.log("/api/export-pdf using local chrome path:", execPath);
      }

      const launchOpts: any = {
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        headless: "shell",
      };
      if (execPath) launchOpts.executablePath = execPath;

      console.log("/api/export-pdf launching chromium with:", {
        executablePath: launchOpts.executablePath,
        headless: launchOpts.headless,
        args: Array.isArray(launchOpts.args)
          ? launchOpts.args.slice(0, 5)
          : launchOpts.args,
      });

      const browser = await puppeteer.launch(launchOpts as any);
      console.log("/api/export-pdf chromium launched");
      return browser;
    } catch {
      // If sparticuz isn't available, still attempt to launch using a local chrome
      // binary with puppeteer-core (useful for local development).
      const local = findLocalChrome();
      if (local) {
        return await puppeteer.launch({
          executablePath: local,
          headless: true,
        } as any);
      }

      // No suitable runtime found
      throw new Error("No suitable puppeteer runtime available");
    }
  })();

  const timeout = new Promise((_, rej) =>
    setTimeout(() => rej(new Error("Chromium launch timed out")), timeoutMs),
  );

  return Promise.race([launchPromise, timeout]);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let htmlBody = "";
    if (body?.html) {
      htmlBody = body.html;
    } else if (body?.data) {
      htmlBody = renderPrintableResumeHtml(body.data);
    } else {
      return new Response(Buffer.from("Missing payload (html or data)"), {
        status: 400,
        headers: { "Content-Type": "application/pdf" },
      });
    }

    const fullHtml = buildFullHtml(htmlBody);

    // Launch browser with the safe fallback helper (with timeout)
    let browser: any = null;
    try {
      browser = await launchChromiumWithFallback(30000);
    } catch (launchErr) {
      console.error("/api/export-pdf launch error:", launchErr);
      return new Response(Buffer.from("PDF generation runtime not available"), {
        status: 500,
        headers: { "Content-Type": "application/pdf" },
      });
    }

    let pdfBuffer: Buffer | null = null;
    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "networkidle0" });
      await page.emulateMediaType("screen");

      console.log("/api/export-pdf generating PDF (page.pdf)...");
      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      });
      console.log(
        "/api/export-pdf page.pdf completed, bytes=",
        pdfBuffer?.length,
      );
    } finally {
      try {
        if (browser) await browser.close();
      } catch (closeErr) {
        console.warn("/api/export-pdf browser close failed:", closeErr);
      }
    }

    if (!pdfBuffer) {
      return new Response(Buffer.from("PDF generation failed"), {
        status: 500,
        headers: { "Content-Type": "application/pdf" },
      });
    }

    // Return Buffer as body (cast to BodyInit for Node runtime)
    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="resume.pdf"`,
      },
    });
  } catch (err) {
    console.error("/api/export-pdf error:", err);
    return new Response(Buffer.from("PDF generation failed"), {
      status: 500,
      headers: { "Content-Type": "application/pdf" },
    });
  }
}

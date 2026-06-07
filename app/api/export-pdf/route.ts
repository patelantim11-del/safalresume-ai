export const runtime = "nodejs";

import { buildFullHtml, renderPrintableResumeHtml } from "@/lib/printTemplates";
import { NextResponse } from "next/server";

async function launchChromiumWithFallback(timeoutMs = 30000) {
  const launchPromise = (async () => {
    try {
      const puppeteer = await import("puppeteer-core");
      try {
        const chromium = await import("@sparticuz/chromium");
        return await puppeteer.launch({
          args: chromium.args,
          defaultViewport: chromium.defaultViewport,
          executablePath: await chromium.executablePath(),
          headless: chromium.headless,
        } as any);
      } catch {
        // fall back to full puppeteer if available
        try {
          const full = await import("puppeteer");
          return await full.launch({ headless: true } as any);
        } catch {
          // last resort use puppeteer-core default launcher
          return await puppeteer.launch({ headless: true } as any);
        }
      }
    } catch {
      // No puppeteer available
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
      return NextResponse.json(
        { error: "Missing payload (html or data)" },
        { status: 400 },
      );
    }

    const fullHtml = buildFullHtml(htmlBody);

    // Launch browser with the safe fallback helper (with timeout)
    let browser: any = null;
    try {
      browser = await launchChromiumWithFallback(30000);
    } catch (launchErr) {
      console.error("/api/export-pdf launch error:", launchErr);
      return NextResponse.json(
        { error: "PDF generation runtime not available" },
        { status: 500 },
      );
    }

    let pdfBuffer: Buffer | null = null;
    try {
      const page = await browser.newPage();
      await page.setContent(fullHtml, { waitUntil: "networkidle0" });
      await page.emulateMediaType("screen");

      pdfBuffer = await page.pdf({
        format: "A4",
        printBackground: true,
        margin: { top: "10mm", bottom: "10mm", left: "10mm", right: "10mm" },
      });
    } finally {
      try {
        if (browser) await browser.close();
      } catch (closeErr) {
        console.warn("/api/export-pdf browser close failed:", closeErr);
      }
    }

    if (!pdfBuffer) {
      return NextResponse.json(
        { error: "PDF generation failed" },
        { status: 500 },
      );
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
    return NextResponse.json(
      { error: "PDF generation failed" },
      { status: 500 },
    );
  }
}

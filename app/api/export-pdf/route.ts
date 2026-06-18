export const runtime = "nodejs";
export const maxDuration = 60;
export const dynamic = "force-dynamic";

import { buildFullHtml, renderPrintableResumeHtml } from "@/lib/printTemplates";
import chromium from "@sparticuz/chromium";
import { NextResponse } from "next/server";
import puppeteer from "puppeteer-core";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let html = "";

    if (body.html) {
      html = body.html;
    } else if (body.data) {
      html = renderPrintableResumeHtml(body.data);
    } else {
      return NextResponse.json(
        { error: "Missing html or data" },
        { status: 400 },
      );
    }

    try {
      chromium.setGraphicsMode = false;

      const execPath = await chromium.executablePath();
      console.log("/api/export-pdf chromium.executablePath ->", execPath);

      if (!execPath) {
        console.error(
          "/api/export-pdf: @sparticuz/chromium did not return an executablePath",
        );
        return NextResponse.json(
          { error: "PDF generation runtime not available" },
          { status: 500 },
        );
      }

      const headless = "shell" as const;
      const launchOpts = {
        args: await puppeteer.defaultArgs({
          args: chromium.args,
          headless,
        }),
        defaultViewport: {
          width: 1280,
          height: 1800,
          deviceScaleFactor: 1,
        },
        executablePath: execPath,
        headless,
      };

      console.log("/api/export-pdf launching chromium with options:", {
        executablePath: launchOpts.executablePath,
        headless: launchOpts.headless,
        args: Array.isArray(launchOpts.args)
          ? launchOpts.args.slice(0, 8)
          : launchOpts.args,
      });

      const browser = await puppeteer.launch(launchOpts);
      console.log("/api/export-pdf chromium launched");

      let pdf: Uint8Array | null = null;
      let page: Awaited<ReturnType<typeof browser.newPage>> | null = null;
      try {
        page = await browser.newPage();
        await page.setContent(buildFullHtml(html), {
          waitUntil: "domcontentloaded",
        });
        await page.waitForNetworkIdle({ idleTime: 500, timeout: 5_000 }).catch(() => {
          console.warn("/api/export-pdf network idle wait timed out; continuing");
        });
        await page.emulateMediaType("screen");

        console.log("/api/export-pdf generating PDF (page.pdf)");
        pdf = await page.pdf({
          format: "A4",
          printBackground: true,
          margin: {
            top: "10mm",
            bottom: "10mm",
            left: "10mm",
            right: "10mm",
          },
        });
        console.log("/api/export-pdf page.pdf completed, bytes=", pdf?.length);
      } finally {
        try {
          if (page) await page.close();
        } catch (e) {
          console.warn("/api/export-pdf failed to close page:", e);
        }
        try {
          await browser.close();
        } catch (e) {
          console.warn("/api/export-pdf failed to close browser:", e);
        }
      }

      if (!pdf) {
        console.error("/api/export-pdf: PDF buffer is empty after page.pdf");
        return NextResponse.json(
          { error: "PDF generation failed" },
          { status: 500 },
        );
      }

      return new Response(Buffer.from(pdf), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": 'attachment; filename="resume.pdf"',
        },
      });
    } catch (launchErr) {
      console.error("/api/export-pdf launch error:", launchErr);
      return NextResponse.json(
        {
          error: "PDF generation runtime not available",
          details: String(launchErr),
        },
        { status: 500 },
      );
    }
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      {
        error: "PDF generation failed",
      },
      {
        status: 500,
      },
    );
  }
}

export async function exportPreviewPdf(
  data: any | null = null,
  filename = "resume.pdf",
) {
  if (typeof window === "undefined") return;

  function showOverlay(text: string) {
    let ov = document.getElementById("export-overlay") as HTMLElement | null;
    if (!ov) {
      ov = document.createElement("div");
      ov.id = "export-overlay";
      ov.style.position = "fixed";
      ov.style.left = "0";
      ov.style.top = "0";
      ov.style.right = "0";
      ov.style.padding = "12px 8px";
      ov.style.zIndex = "999999";
      ov.style.background = "rgba(0,0,0,0.6)";
      ov.style.color = "#fff";
      ov.style.textAlign = "center";
      ov.textContent = text || "Preparing PDF...";
      document.body.appendChild(ov);
    } else {
      ov.textContent = text || ov.textContent;
      ov.style.display = "block";
    }
  }

  function hideOverlay() {
    const ov = document.getElementById("export-overlay");
    if (ov && ov.parentNode) ov.parentNode.removeChild(ov);
  }

  showOverlay("Preparing PDF...");

  try {
    let payload: any = {};
    if (data) {
      payload = { data };
    } else {
      const foundEl =
        document.getElementById("resume-preview") ||
        document.querySelector(
          ".resume-document, .resume-preview-panel, [data-resume-preview]",
        );
      if (!foundEl) {
        hideOverlay();
        alert("PDF export failed: resume preview not found.");
        return;
      }
      payload = { html: (foundEl as HTMLElement).outerHTML };
    }

    const resp = await fetch("/api/export-pdf", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const txt = await resp.text();
      hideOverlay();
      alert("PDF generation failed: " + txt);
      throw new Error("PDF generation failed: " + txt);
    }

    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename || "resume.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    hideOverlay();
  } catch (err) {
    hideOverlay();
    console.error("exportPreviewPdf error:", err);
    alert("PDF export failed. See console for details.");
    throw err;
  }
}

// (client-side export now sends data/html to server API for PDF generation)

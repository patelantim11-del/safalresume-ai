export function sanitizeText(s: any) {
  if (s == null) return "";
  return String(s);
}

export function renderPrintableResumeHtml(values: any) {
  const p = values?.personalInfo || {};
  const exp = Array.isArray(values?.experience) ? values.experience : [];
  const edu = Array.isArray(values?.education) ? values.education : [];
  const skills = Array.isArray(values?.skills) ? values.skills : [];

  const header = `
    <div style="padding:18px 24px 12px;border-bottom:1px solid #eee;">
      <h1 style="margin:0;font-size:22px;color:#000;font-weight:700;">${sanitizeText(
        p.fullName || "Your Name",
      )}</h1>
      <div style="margin-top:6px;color:#111;font-size:12px;">
        ${sanitizeText(p.jobTitle || "Job Title")} | ${sanitizeText(
          p.email || "email@example.com",
        )} | ${sanitizeText(p.phone || "")}
      </div>
    </div>
  `;

  const summary = `
    <section style="padding:18px 24px;border-bottom:1px solid #f3f3f3;">
      <h2 style="margin:0 0 6px 0;font-size:13px;color:#000;font-weight:700;">Summary</h2>
      <p style="margin:0;color:#111;font-size:12px;line-height:1.45;">${sanitizeText(
        p.summary || "",
      )}</p>
    </section>
  `;

  const experienceHtml = `
    <section style="padding:18px 24px;border-bottom:1px solid #f3f3f3;">
      <h2 style="margin:0 0 12px 0;font-size:13px;color:#000;font-weight:700;">Experience</h2>
      ${exp
        .map(
          (e: any) => `
        <div style="margin-bottom:10px;">
          <div style="font-weight:600;color:#000;font-size:12px;">${sanitizeText(
            e.position || "",
          )} - ${sanitizeText(e.company || "")}</div>
          <div style="font-size:11px;color:#333;margin-top:2px;">${sanitizeText(
            e.startDate || "",
          )} - ${sanitizeText(e.current ? "Present" : e.endDate || "")}</div>
          <div style="margin-top:6px;color:#111;font-size:12px;line-height:1.45;">${sanitizeText(
            e.description || "",
          )}</div>
        </div>
      `,
        )
        .join("")}
    </section>
  `;

  const educationHtml = `
    <section style="padding:18px 24px;border-bottom:1px solid #f3f3f3;">
      <h2 style="margin:0 0 12px 0;font-size:13px;color:#000;font-weight:700;">Education</h2>
      ${edu
        .map(
          (ed: any) => `
        <div style="margin-bottom:10px;">
          <div style="font-weight:600;color:#000;font-size:12px;">${sanitizeText(
            ed.school || "",
          )} — ${sanitizeText(ed.degree || "")}</div>
          <div style="font-size:11px;color:#333;margin-top:2px;">${sanitizeText(
            ed.startDate || "",
          )} - ${sanitizeText(ed.endDate || "")}</div>
        </div>
      `,
        )
        .join("")}
    </section>
  `;

  const skillsHtml = `
    <section style="padding:18px 24px;">
      <h2 style="margin:0 0 12px 0;font-size:13px;color:#000;font-weight:700;">Skills</h2>
      <div style="display:flex;flex-wrap:wrap;gap:8px;">
        ${skills
          .map(
            (s: any) =>
              `<span style="font-size:11px;color:#111;background:#f3f3f3;padding:6px 8px;border-radius:6px;">${sanitizeText(
                s.name || "",
              )}</span>`,
          )
          .join("")}
      </div>
    </section>
  `;

  return `
    <div style="width:210mm;min-height:297mm;background:#fff;color:#000;font-family:Arial,Helvetica,sans-serif;font-size:12px;">
      ${header}
      ${summary}
      ${experienceHtml}
      ${educationHtml}
      ${skillsHtml}
    </div>
  `;
}

export function buildFullHtml(bodyHtml: string) {
  // Collect inline styles from the app will be merged at runtime by puppeteer when possible.
  // Keep minimal print CSS to enforce A4 and margins.
  const printCss = `<style>@media print { body { margin: 0; padding: 0; } .no-print { display: none !important; } @page { size: A4; margin: 10mm; } }</style>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>Resume</title>${printCss}</head><body>${bodyHtml}</body></html>`;
}

const templateCatalog = {
  ats: ["#0f172a", "#e2e8f0", "#ffffff", "#f8fafc", "classic"],
  corporate: ["#1d4ed8", "#dbeafe", "#ffffff", "#f8fafc", "band"],
  executive: ["#334155", "#e2e8f0", "#ffffff", "#f1f5f9", "split"],
  modern: ["#0891b2", "#cffafe", "#ffffff", "#ecfeff", "sidebar"],
  fresher: ["#059669", "#d1fae5", "#ffffff", "#f0fdf4", "band"],
  professional: ["#2563eb", "#dbeafe", "#ffffff", "#f8fafc", "classic"],
  minimal: ["#171717", "#eeeeee", "#ffffff", "#fafafa", "classic"],
  aurora: ["#7c3aed", "#ede9fe", "#ffffff", "#faf5ff", "sidebar"],
  atlas: ["#0f766e", "#ccfbf1", "#ffffff", "#f0fdfa", "split"],
  brio: ["#be123c", "#ffe4e6", "#ffffff", "#fff1f2", "band"],
  canvas: ["#ca8a04", "#fef3c7", "#ffffff", "#fffbeb", "split"],
  clarity: ["#0284c7", "#e0f2fe", "#ffffff", "#f0f9ff", "classic"],
  crest: ["#4338ca", "#e0e7ff", "#ffffff", "#eef2ff", "sidebar"],
  ember: ["#c2410c", "#ffedd5", "#ffffff", "#fff7ed", "band"],
  folio: ["#525252", "#f5f5f5", "#ffffff", "#fafafa", "split"],
  graphite: ["#111827", "#e5e7eb", "#ffffff", "#f3f4f6", "sidebar"],
  halo: ["#9333ea", "#f3e8ff", "#ffffff", "#faf5ff", "band"],
  ivory: ["#a16207", "#fef9c3", "#ffffff", "#fefce8", "classic"],
  keystone: ["#1e40af", "#dbeafe", "#ffffff", "#eff6ff", "split"],
  lattice: ["#047857", "#d1fae5", "#ffffff", "#ecfdf5", "sidebar"],
  meridian: ["#7f1d1d", "#fee2e2", "#ffffff", "#fef2f2", "band"],
  nova: ["#0369a1", "#e0f2fe", "#ffffff", "#f0f9ff", "sidebar"],
  onyx: ["#27272a", "#e4e4e7", "#ffffff", "#f4f4f5", "split"],
  pinnacle: ["#155e75", "#cffafe", "#ffffff", "#ecfeff", "band"],
  quartz: ["#6d28d9", "#ede9fe", "#ffffff", "#f5f3ff", "classic"],
  ripple: ["#0e7490", "#cffafe", "#ffffff", "#ecfeff", "split"],
  summit: ["#365314", "#ecfccb", "#ffffff", "#f7fee7", "sidebar"],
  verve: ["#be185d", "#fce7f3", "#ffffff", "#fdf2f8", "band"],
} as const;

function esc(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function clean(value: unknown) {
  return String(value ?? "").trim();
}

function listItems(items: unknown[] | undefined, key = "value") {
  if (!Array.isArray(items)) return "";
  return items
    .filter((item: any) => clean(item?.[key]))
    .map((item: any) => `<li>${esc(item?.[key])}</li>`)
    .join("");
}

function chips(items: unknown[] | undefined) {
  if (!Array.isArray(items)) return "";
  return items
    .filter((item: any) => clean(item?.name))
    .map((item: any) => `<span class="resume-chip">${esc(item.name)}</span>`)
    .join("");
}

function section(title: string, body: string) {
  if (!clean(body.replace(/<[^>]+>/g, ""))) return "";
  return `<section class="resume-section"><h2>${esc(title)}</h2>${body}</section>`;
}

function timeline(items: unknown[] | undefined, type: "experience" | "education" | "projects") {
  if (!Array.isArray(items)) return "";
  return items
    .map((item: any) => {
      const title =
        type === "experience"
          ? item.position
          : type === "education"
            ? item.degree || item.field
            : item.name;
      const subtitle =
        type === "experience"
          ? item.company
          : type === "education"
            ? item.school
            : item.link;
      const meta =
        type === "projects"
          ? ""
          : `${clean(item.startDate)} - ${item.current ? "Present" : clean(item.endDate)}${clean(item.location) ? ` | ${clean(item.location)}` : ""}`;
      const body = type === "education" ? item.field : item.description;
      if (!clean(title) && !clean(subtitle) && !clean(body)) return "";
      return `<div class="resume-timeline-item"><span class="resume-dot"></span><div><h3>${esc(title)}</h3>${clean(subtitle) ? `<p class="resume-subtitle">${esc(subtitle)}</p>` : ""}${clean(meta) ? `<p class="resume-meta">${esc(meta)}</p>` : ""}${clean(body) ? `<p class="resume-body-copy">${esc(body)}</p>` : ""}</div></div>`;
    })
    .join("");
}

export function renderPrintableResumeHtml(values: any) {
  const p = values?.personalInfo || {};
  const templateId = clean(values?.template) as keyof typeof templateCatalog;
  const tone = templateCatalog[templateId] ?? templateCatalog.professional;
  const [accent, accentSoft, paper, rail, layout] = tone;
  const contact = [
    p.email,
    p.phone,
    p.location,
    p.website,
    p.linkedin,
    p.github,
  ].filter(clean);
  const sections = [
    section("Profile", clean(p.summary) ? `<p>${esc(p.summary)}</p>` : ""),
    section("Experience", timeline(values?.experience, "experience")),
    section("Skills", chips(values?.skills) ? `<div class="resume-chip-grid">${chips(values?.skills)}</div>` : ""),
    section("Education", timeline(values?.education, "education")),
    section("Projects", timeline(values?.projects, "projects")),
    section("Certifications", `<ul class="resume-list">${listItems(values?.certifications)}</ul>`),
    section("Languages", `<ul class="resume-list">${listItems(values?.languages)}</ul>`),
    section("Achievements", `<ul class="resume-list">${listItems(values?.achievements)}</ul>`),
    section("Interests", `<ul class="resume-list">${listItems(values?.interests)}</ul>`),
  ].join("");

  return `
    <article class="resume-document resume-${esc(layout)}" style="--resume-accent:${esc(accent)};--resume-accent-soft:${esc(accentSoft)};--resume-paper:${esc(paper)};--resume-rail:${esc(rail)};">
      <header class="resume-hero">
        <div>
          <p class="resume-role">${esc(p.jobTitle || "Professional Title")}</p>
          <h1>${esc(p.fullName || "Your Name")}</h1>
          <div class="resume-contact">${contact.map((item) => `<span>${esc(item)}</span>`).join("")}</div>
        </div>
        ${clean(p.photoUrl) ? `<img class="resume-photo" src="${esc(p.photoUrl)}" alt="">` : ""}
      </header>
      <main class="resume-content">${sections}</main>
    </article>
  `;
}

export function buildFullHtml(bodyHtml: string) {
  const css = `
    <style>
      @page { size: A4; margin: 0; }
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; color: #111827; font-family: Inter, Arial, Helvetica, sans-serif; }
      .no-print { display: none !important; }
      .resume-document { width: 210mm; min-height: 297mm; background: var(--resume-paper); color: #111827; overflow: hidden; }
      .resume-hero { display: flex; justify-content: space-between; gap: 18px; padding: 18mm 18mm 10mm; background: var(--resume-rail); border-bottom: 1px solid #e5e7eb; }
      .resume-band .resume-hero { background: var(--resume-accent); color: #fff; }
      .resume-sidebar .resume-hero { border-left: 18mm solid var(--resume-accent); }
      .resume-split .resume-hero { background: linear-gradient(90deg, var(--resume-rail) 0 34%, #fff 34% 100%); }
      .resume-role { margin: 0 0 5px; color: var(--resume-accent); font-size: 10px; font-weight: 800; letter-spacing: .16em; text-transform: uppercase; }
      .resume-band .resume-role { color: #fff; opacity: .86; }
      h1 { margin: 0; font-size: 31px; line-height: 1.05; letter-spacing: 0; }
      .resume-contact { display: flex; flex-wrap: wrap; gap: 6px 12px; margin-top: 9px; font-size: 10px; color: #475569; }
      .resume-band .resume-contact { color: rgba(255,255,255,.86); }
      .resume-photo { width: 28mm; height: 28mm; border-radius: 8px; object-fit: cover; border: 3px solid #fff; }
      .resume-content { padding: 10mm 18mm 16mm; column-gap: 10mm; }
      .resume-sidebar .resume-content, .resume-split .resume-content { columns: 2; }
      .resume-section { break-inside: avoid; page-break-inside: avoid; margin: 0 0 7mm; }
      .resume-section h2 { margin: 0 0 4mm; padding-bottom: 2mm; border-bottom: 1px solid #e5e7eb; color: var(--resume-accent); font-size: 11px; font-weight: 900; letter-spacing: .14em; text-transform: uppercase; }
      .resume-section p { margin: 0; color: #334155; font-size: 11px; line-height: 1.55; }
      .resume-timeline-item { position: relative; display: grid; grid-template-columns: 10px 1fr; gap: 8px; margin-bottom: 5mm; break-inside: avoid; page-break-inside: avoid; }
      .resume-dot { width: 7px; height: 7px; margin-top: 4px; border-radius: 99px; background: var(--resume-accent); }
      .resume-timeline-item h3 { margin: 0; color: #111827; font-size: 12px; line-height: 1.3; }
      .resume-subtitle { margin-top: 1px !important; color: #111827 !important; font-weight: 700; }
      .resume-meta { margin-top: 2px !important; color: #64748b !important; font-size: 9.5px !important; }
      .resume-body-copy { margin-top: 3px !important; }
      .resume-chip-grid { display: flex; flex-wrap: wrap; gap: 6px; }
      .resume-chip { display: inline-flex; border-radius: 6px; background: var(--resume-accent-soft); color: var(--resume-accent); padding: 4px 7px; font-size: 10px; font-weight: 800; }
      .resume-list { margin: 0; padding-left: 16px; color: #334155; font-size: 11px; line-height: 1.5; }
      .resume-list li { margin-bottom: 2px; break-inside: avoid; page-break-inside: avoid; }
    </style>
  `;
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Resume</title>${css}</head><body>${bodyHtml}</body></html>`;
}

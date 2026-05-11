/** Escape text for insertion into HTML documents */
function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Full standalone HTML page — same visual as in-app preview.
 * Saved as .html so the browser download bar shows a file that opens to this layout.
 */
export function buildTaxCertificateHtmlDocument({ taxpayerName, taxReference, dateOfIssue }) {
  const name = escapeHtml(taxpayerName || "Company");
  const ref = escapeHtml(taxReference || "1234567890");
  const date = escapeHtml(dateOfIssue || "—");
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>SARS Tax Compliance Status</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px;
      background: #2a2d3a;
      font-family: ui-sans-serif, system-ui, sans-serif;
    }
    .wrap {
      width: 100%;
      max-width: 28rem;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .sheet {
      width: 100%;
      background: #e8eaed;
      border: 2px dashed #5c5f66;
      border-radius: 2px;
      padding: 2rem 2rem 2.5rem;
      position: relative;
      overflow: hidden;
    }
    .icon-wrap {
      display: flex;
      justify-content: center;
      margin-bottom: 0.75rem;
    }
    h1 {
      margin: 0 0 1.5rem;
      text-align: center;
      font-family: Georgia, "Times New Roman", serif;
      font-size: 1.35rem;
      font-weight: 700;
      color: #1e3a5f;
      letter-spacing: 0.02em;
    }
    .row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      gap: 1rem;
      padding: 0.5rem 0;
      border-bottom: 1px solid #c5cad3;
      font-family: ui-monospace, "Cascadia Code", monospace;
      font-size: 0.75rem;
      color: #3d4450;
    }
    .row:last-of-type {
      border-bottom: 1px solid #c5cad3;
    }
    .row .lbl { flex-shrink: 0; }
    .row .val { text-align: right; word-break: break-word; }
    .row.status .val {
      font-weight: 700;
      color: #16a34a;
      font-size: 0.8rem;
    }
    .stamp {
      position: absolute;
      right: 1rem;
      bottom: 1rem;
      transform: rotate(-14deg);
      border: 2px solid #dc2626;
      color: #dc2626;
      font-weight: 700;
      font-size: 0.65rem;
      letter-spacing: 0.06em;
      padding: 0.35rem 0.5rem;
      text-transform: uppercase;
      background: rgba(255,255,255,0.35);
    }
    .note {
      margin-top: 1rem;
      text-align: center;
      font-size: 0.8rem;
      font-style: italic;
      color: #9ca3af;
      max-width: 28rem;
      line-height: 1.45;
    }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="sheet">
      <div class="icon-wrap" aria-hidden="true">
        <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="4" y="2" width="28" height="40" rx="2" fill="#e9d5ff" stroke="#a78bfa" stroke-width="1.5"/>
          <path d="M10 12h16M10 18h16M10 24h12" stroke="#7c3aed" stroke-width="1.2" stroke-linecap="round"/>
        </svg>
      </div>
      <h1>SARS TAX COMPLIANCE STATUS</h1>
      <div class="row"><span class="lbl">Taxpayer Name:</span><span class="val">${name}</span></div>
      <div class="row"><span class="lbl">Tax Reference Number:</span><span class="val">${ref}</span></div>
      <div class="row"><span class="lbl">Date of Issue:</span><span class="val">${date}</span></div>
      <div class="row status"><span class="lbl">Status:</span><span class="val">COMPLIANT</span></div>
      <div class="stamp">EXAMPLE CERTIFICATE</div>
    </div>
    <p class="note">(Note: External image resources are currently blocked by browser security. This is a local rendering of the certificate structure.)</p>
  </div>
</body>
</html>`;
}

export function isTaxCertificateDocument(doc) {
  if (!doc?.name) return false;
  return /tax/i.test(doc.name);
}

export function getCertificateDownloadBasename(doc) {
  const base = (doc?.name || "tax_certificate").replace(/\.[^.]+$/i, "");
  return base.replace(/[^a-z0-9_-]+/gi, "_").slice(0, 80) || "tax_certificate";
}

/** Opens a new tab with the same certificate layout (HTML blob). */
export function openTaxCertificateInNewTab({ taxpayerName, taxReference, dateOfIssue }) {
  const html = buildTaxCertificateHtmlDocument({ taxpayerName, taxReference, dateOfIssue });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const win = window.open(url, "_blank", "noopener,noreferrer");
  if (!win) {
    URL.revokeObjectURL(url);
    return false;
  }
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  return true;
}

/** Triggers a real file download in the browser download bar; opening the file shows the same certificate. */
export function downloadTaxCertificateFile({ taxpayerName, taxReference, dateOfIssue, downloadBasename }) {
  const html = buildTaxCertificateHtmlDocument({ taxpayerName, taxReference, dateOfIssue });
  const blob = new Blob([html], { type: "text/html;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${downloadBasename || "tax_certificate"}_certificate.html`;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

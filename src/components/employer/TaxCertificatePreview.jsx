/**
 * Local rendering of SARS tax compliance certificate (matches employer portfolio preview).
 */
export default function TaxCertificatePreview({ taxpayerName, taxReference = "1234567890", dateOfIssue }) {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col items-center">
      <div className="relative w-full overflow-hidden border-2 border-dashed border-[#5c5f66] bg-[#e8eaed] px-8 py-10">
        <div className="mb-3 flex justify-center" aria-hidden>
          <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="4" y="2" width="28" height="40" rx="2" fill="#e9d5ff" stroke="#a78bfa" strokeWidth="1.5" />
            <path d="M10 12h16M10 18h16M10 24h12" stroke="#7c3aed" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="mb-6 text-center font-serif text-xl font-bold leading-snug tracking-wide text-[#1e3a5f]">
          SARS TAX COMPLIANCE STATUS
        </h3>
        <div className="flex flex-col gap-0 font-mono text-xs text-[#3d4450]">
          <div className="flex justify-between gap-4 border-b border-[#c5cad3] py-2">
            <span className="shrink-0">Taxpayer Name:</span>
            <span className="min-w-0 text-right break-words text-[#3d4450]">{taxpayerName || "—"}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#c5cad3] py-2">
            <span className="shrink-0">Tax Reference Number:</span>
            <span className="text-right">{taxReference}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#c5cad3] py-2">
            <span className="shrink-0">Date of Issue:</span>
            <span className="text-right">{dateOfIssue || "—"}</span>
          </div>
          <div className="flex justify-between gap-4 border-b border-[#c5cad3] py-2 font-bold">
            <span className="shrink-0 font-mono font-bold text-[#3d4450]">Status:</span>
            <span className="text-right font-mono text-sm font-bold text-green-600">COMPLIANT</span>
          </div>
        </div>
        <div
          className="pointer-events-none absolute bottom-4 right-4 rotate-[-14deg] border-2 border-red-600 bg-white/35 px-2 py-1 text-[0.65rem] font-bold uppercase tracking-wider text-red-600"
          aria-hidden
        >
          EXAMPLE CERTIFICATE
        </div>
      </div>
      <p className="mt-4 text-center font-sans text-sm italic text-text-secondary">
        (Note: External image resources are currently blocked by browser security. This is a local rendering of the
        certificate structure.)
      </p>
    </div>
  );
}

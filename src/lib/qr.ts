import QRCode from "qrcode";

/** Public URL a scanned ticket QR points to (the check-in validation target). */
export function ticketUrl(qrToken: string): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return `${base.replace(/\/$/, "")}/ticket/${qrToken}`;
}

/** PNG data URL for embedding a QR inline (web + PDF). */
export async function qrDataUrl(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    errorCorrectionLevel: "M",
    margin: 1,
    scale: 6,
    color: { dark: "#1F2933", light: "#FFFFFF" },
  });
}
